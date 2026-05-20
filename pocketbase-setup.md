# PocketBase Setup Guide

Create the following collection manually in the PocketBase Admin UI at `http://<your-pb-host>:8090/_/`.

---

## Collection: `submissions`

Go to **Collections → New collection**, choose **Base collection**, name it `submissions`.

### Fields

| Field name       | Type   | Options / Notes                                      |
|------------------|--------|------------------------------------------------------|
| `first_name`     | Text   | Required                                             |
| `last_name`      | Text   | Required                                             |
| `email`          | Email  | Required                                             |
| `phone`          | Text   | Required                                             |
| `insurance_type` | Text   | Values: `auto`, `home`, `both`                       |
| `status`         | Text   | Values: `pending`, `processing`, `complete`          |
| `policy_file`    | File   | Max size: 10 MB · Allowed type: `application/pdf`    |
| `extracted_data` | JSON   |                                                      |
| `submitted_at`   | Date   | Can be left blank — use `created` as the timestamp   |

> Note: PocketBase automatically adds `id`, `created`, and `updated` to every record.

### API Rules

Set all API rules (List, View, Create, Update, Delete) to require admin authentication.
In the PocketBase UI, under **Collections → submissions → API rules**, set each rule to:

```
@request.auth.id != ""
```

This prevents unauthenticated public access to the submissions data.

---

## PocketBase Admin Account

When you first visit `http://<host>:8090/_/`, PocketBase will prompt you to create a superuser account.

Use the same credentials you put in your `.env.local`:
- **Email**: value of `PB_ADMIN_EMAIL` (e.g. `admin@trinity.local`)
- **Password**: value of `PB_ADMIN_PASSWORD` (e.g. `trinity2026`)

The Next.js API routes authenticate as this admin to read/write submissions.

---

## File Storage

PocketBase stores uploaded PDFs on disk at `/opt/pocketbase/pb_data/storage/`.
No additional configuration is required — files are served via the PocketBase API automatically.

To retrieve a file URL in code:
```ts
const pb = createPocketBase();
const url = pb.files.getURL(record, record.policy_file);
```
