# Google Cloud Functions Samples

This folder contains examples for deploying serverless logic to Google Cloud Functions.

## gcs_upload.py

`upload_to_gcs` is an HTTP function that accepts JSON with `filename` and base64-encoded `content`, uploads the file to Cloud Storage, and returns a `gs://` URI.

## violation_notification.py

`notify_violation` is an HTTP function example that can receive event payloads from your application or a notification pipeline.

## Deployment

Use `gcloud functions deploy` with the Python runtime:

```bash
gcloud functions deploy upload_to_gcs \
  --runtime python310 \
  --trigger-http \
  --allow-unauthenticated \
  --set-env-vars GCS_BUCKET_NAME=your-bucket-name
```

```bash
gcloud functions deploy notify_violation \
  --runtime python310 \
  --trigger-http \
  --allow-unauthenticated
```
