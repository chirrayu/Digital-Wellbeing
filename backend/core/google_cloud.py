import os
from typing import Any, Dict, List

from google.cloud import storage, vision, aiplatform
from google.api_core.exceptions import GoogleAPIError

from core.config import settings
from core.logging_config import get_logger

log = get_logger("core.google_cloud")


def upload_file_to_gcs(local_path: str, destination_blob_name: str) -> str:
    """Upload a local file to Google Cloud Storage and return the GCS URI."""
    if not settings.GCS_BUCKET_NAME:
        raise ValueError("GCS_BUCKET_NAME is not configured.")

    client = storage.Client()
    bucket = client.bucket(settings.GCS_BUCKET_NAME)
    blob = bucket.blob(destination_blob_name)
    blob.upload_from_filename(local_path)
    uri = f"gs://{bucket.name}/{destination_blob_name}"
    log.info("Uploaded %s to %s", local_path, uri)
    return uri


def analyze_image_labels(image_gcs_uri: str, max_results: int = 10) -> List[str]:
    """Run Google Cloud Vision label detection against an image in GCS."""
    client = vision.ImageAnnotatorClient()
    image = vision.Image()
    image.source.image_uri = image_gcs_uri
    response = client.label_detection(image=image, max_results=max_results)

    if response.error.message:
        raise GoogleAPIError(response.error.message)

    labels = [annotation.description for annotation in response.label_annotations]
    log.info("Vision labels for %s: %s", image_gcs_uri, labels)
    return labels


def predict_vertex_ai(endpoint_id: str, instances: List[Dict[str, Any]]) -> List[Any]:
    """Call Vertex AI endpoint for prediction and return the raw predictions."""
    if not settings.GCP_PROJECT or not settings.GCP_REGION or not endpoint_id:
        raise ValueError("Vertex AI settings are not configured.")

    client = aiplatform.gapic.PredictionServiceClient()
    endpoint_path = client.endpoint_path(
        project=settings.GCP_PROJECT,
        location=settings.GCP_REGION,
        endpoint=endpoint_id,
    )

    response = client.predict(
        endpoint=endpoint_path,
        instances=instances,
    )

    predictions = [prediction for prediction in response.predictions]
    log.info("Vertex AI prediction response: %s", predictions)
    return predictions
