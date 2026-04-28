def notify_violation(request):
    """HTTP Cloud Function to receive violation webhook events."""
    event = request.get_json(silent=True)
    if not event:
        return ("Invalid JSON payload.", 400)

    # Example payload fields: content_id, detection_id, platform, source_url, similarity_score
    content_id = event.get("content_id")
    platform = event.get("platform")
    similarity_score = event.get("similarity_score")

    message = (
        f"Violation received for content={content_id} on platform={platform} "
        f"with score={similarity_score}."
    )

    return {"status": "ok", "message": message}
