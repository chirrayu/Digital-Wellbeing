import base64
import os
from google.cloud import storage


def upload_to_gcs(request):
    """HTTP Cloud Function to upload an incoming file to Google Cloud Storage."""
    bucket_name = os.environ.get("GCS_BUCKET_NAME")
    if not bucket_name:
        return ("Missing GCS_BUCKET_NAME environment variable.", 500)

    request_data = request.get_json(silent=True)
    if not request_data or "filename" not in request_data or "content" not in request_data:
        return ("Request must include filename and content fields.", 400)

    filename = request_data["filename"]
    content_bytes = base64.b64decode(request_data["content"])

    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(filename)
    blob.upload_from_string(content_bytes)

    return {"status": "success", "gcs_uri": f"gs://{bucket_name}/{filename}"}
