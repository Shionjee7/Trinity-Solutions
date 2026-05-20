# Deploying Trinity Solutions on Proxmox

Everything runs on your Proxmox server. The only outbound network call is to the
Anthropic Claude API for PDF extraction.

```
Internet ──► Cloudflare (free proxy / HTTPS) ──► your public IP
                                                       │
                                          ┌────────────▼────────────┐
                                          │   Proxmox host           │
                                          │                          │
                                          │  ┌─────────────────┐    │
                                          │  │  Caddy (proxy)  │    │
                                          │  │  port 80 / 443  │    │
                                          │  └──────┬──────────┘    │
                                          │         │               │
                                          │  ┌──────▼──────┐        │
                                          │  │ CT 101      │        │
                                          │  │ Next.js :3000│       │
                                          │  └─────────────┘        │
                                          │                          │
                                          │  ┌─────────────┐        │
                                          │  │ CT 102      │        │
                                          │  │ PocketBase  │        │
                                          │  │ :8090       │        │
                                          │  └─────────────┘        │
                                          └─────────────────────────┘
```

---

## 1. Create LXC containers on Proxmox

In the Proxmox web UI (or via `pct`), create two unprivileged Debian 12 containers.

### Container 101 — Next.js app

```bash
pct create 101 local:vztmpl/debian-12-standard_12.7-1_amd64.tar.zst \
  --hostname nextjs \
  --memory 1024 \
  --cores 2 \
  --rootfs local-lvm:8 \
  --net0 name=eth0,bridge=vmbr0,ip=dhcp \
  --unprivileged 1 \
  --start 1
```

### Container 102 — PocketBase

```bash
pct create 102 local:vztmpl/debian-12-standard_12.7-1_amd64.tar.zst \
  --hostname pocketbase \
  --memory 512 \
  --cores 1 \
  --rootfs local-lvm:8 \
  --net0 name=eth0,bridge=vmbr0,ip=dhcp \
  --unprivileged 1 \
  --start 1
```

Note the IP addresses assigned to each container. You can find them with:

```bash
pct exec 101 -- ip -4 addr show eth0
pct exec 102 -- ip -4 addr show eth0
```

---

## 2. Container 102 — Install PocketBase

```bash
pct enter 102
```

```bash
apt update && apt install -y wget unzip

# Check https://github.com/pocketbase/pocketbase/releases for the latest version
PB_VERSION=0.22.20
wget "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip"
unzip pocketbase_${PB_VERSION}_linux_amd64.zip -d /opt/pocketbase
chmod +x /opt/pocketbase/pocketbase
```

### Create a systemd service

```bash
cat > /etc/systemd/system/pocketbase.service << 'EOF'
[Unit]
Description=PocketBase
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/pocketbase
ExecStart=/opt/pocketbase/pocketbase serve --http=0.0.0.0:8090
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now pocketbase
```

### Create the admin account and collection

Open a browser to `http://<CT102-IP>:8090/_/` and:

1. Create your superuser account — use the email and password you'll put in `PB_ADMIN_EMAIL` / `PB_ADMIN_PASSWORD` (e.g. `admin@trinity.local` / `trinity2026`).
2. Go to **Collections → New collection** and create a collection named `submissions` with these fields:

| Field name       | Type       | Options                          |
|------------------|------------|----------------------------------|
| `first_name`     | Text       | required                         |
| `last_name`      | Text       | required                         |
| `email`          | Email      | required                         |
| `phone`          | Text       | required                         |
| `insurance_type` | Select     | options: `auto`, `home`, `both`  |
| `status`         | Select     | options: `pending`, `processing`, `complete` |
| `policy_file`    | File       | max 10 MB, allowed types: `application/pdf` |
| `extracted_data` | JSON       |                                  |
| `submitted_at`   | Date       |                                  |

3. Under **Collections → submissions → API rules**, set all rules to `@request.auth.id != ""` (admin-auth only) so the public cannot read records directly.

---

## 3. Container 101 — Install Node.js 20 and the Next.js app

```bash
pct enter 101
```

```bash
apt update && apt install -y curl git

# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

node -v   # should print v20.x.x
```

### Copy the app into the container

From your development machine:

```bash
# Option A — git clone (recommended)
git clone https://github.com/YOUR_ORG/Trinity-Solutions /opt/trinity

# Option B — rsync from local
rsync -av --exclude=node_modules --exclude=.next \
  /path/to/Trinity-Solutions/ root@<CT101-IP>:/opt/trinity/
```

### Configure environment variables

```bash
cp /opt/trinity/.env.local.example /opt/trinity/.env.local
nano /opt/trinity/.env.local
```

Fill in the real values:

```
NEXT_PUBLIC_PB_URL=https://api.taj-biz.com
NEXT_INTERNAL_URL=http://localhost:3000
PB_ADMIN_EMAIL=admin@trinity.local
PB_ADMIN_PASSWORD=trinity2026
ADMIN_PASSWORD=trinity2026
JWT_SECRET=<generate with: openssl rand -hex 32>
ANTHROPIC_API_KEY=sk-ant-...
```

### Build and test

```bash
cd /opt/trinity
npm install
npm run build
npm start          # verify it listens on :3000
```

### Create a systemd service

```bash
cat > /etc/systemd/system/trinity.service << 'EOF'
[Unit]
Description=Trinity Solutions Next.js
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/trinity
EnvironmentFile=/opt/trinity/.env.local
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now trinity
```

---

## 4. Install Caddy on Container 101 (reverse proxy + automatic TLS)

Caddy handles HTTPS automatically with Let's Encrypt. Because Cloudflare is in
front, you can use the HTTP-01 challenge as long as Cloudflare has "Full (strict)"
SSL mode enabled in its dashboard.

```bash
# Still inside CT 101
apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
  | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
  | tee /etc/apt/sources.list.d/caddy-stable.list
apt update && apt install -y caddy
```

### Caddyfile

```bash
cat > /etc/caddy/Caddyfile << 'EOF'
taj-biz.com {
    reverse_proxy localhost:3000
}

api.taj-biz.com {
    reverse_proxy <CT102-IP>:8090
}
EOF
```

Replace `<CT102-IP>` with the actual IP of Container 102 (e.g. `10.0.0.102`).

```bash
systemctl enable --now caddy
caddy reload --config /etc/caddy/Caddyfile
```

---

## 5. DNS — point your domains at Proxmox

In Cloudflare's dashboard for `taj-biz.com`:

| Type | Name  | Content              | Proxy  |
|------|-------|----------------------|--------|
| A    | @     | `<your-public-IP>`   | Proxied (orange cloud) |
| A    | api   | `<your-public-IP>`   | Proxied (orange cloud) |

Set SSL/TLS mode to **Full (strict)** so Cloudflare verifies your Caddy cert.

Make sure your router/firewall forwards **ports 80 and 443** to the IP of
Container 101 (where Caddy lives).

---

## 6. Verify the deployment

```bash
# From any machine
curl -I https://taj-biz.com            # should return 200
curl https://api.taj-biz.com/api/health  # PocketBase health endpoint

# Inside CT 101
systemctl status trinity
systemctl status caddy

# Inside CT 102
systemctl status pocketbase
journalctl -u pocketbase -f
```

---

## Updating the app

```bash
pct enter 101
cd /opt/trinity
git pull
npm install
npm run build
systemctl restart trinity
```

---

## Environment variable reference

| Variable            | Where used              | Example value                        |
|---------------------|-------------------------|--------------------------------------|
| `NEXT_PUBLIC_PB_URL`| Server + browser        | `https://api.taj-biz.com`            |
| `NEXT_INTERNAL_URL` | Server-to-server calls  | `http://localhost:3000`              |
| `PB_ADMIN_EMAIL`    | API routes → PocketBase | `admin@trinity.local`                |
| `PB_ADMIN_PASSWORD` | API routes → PocketBase | `trinity2026`                        |
| `ADMIN_PASSWORD`    | /admin portal login     | `trinity2026`                        |
| `JWT_SECRET`        | Admin session tokens    | 32+ random hex chars                 |
| `ANTHROPIC_API_KEY` | PDF extraction (Claude) | `sk-ant-...`                         |

All variables live in `/opt/trinity/.env.local` on Container 101. The
`EnvironmentFile=` directive in the systemd unit injects them automatically.
