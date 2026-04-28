"""
Media fingerprint processor.

- Images → single perceptual hash
- Videos → extract keyframes via OpenCV (1 fps), hash each frame
"""

import cv2
import imagehash
from PIL import Image

from core.logging_config import get_logger

log = get_logger("fingerprint.processor")


def extract_hashes(file_path: str, is_video: bool = False) -> list[str]:
    """
    Return a list of hex perceptual-hash strings for the given file.
    For videos we sample 1 frame per second; for images we hash once.
    """

    if not is_video:
        img = Image.open(file_path)
        h = str(imagehash.average_hash(img))
        log.info("Hashed image → %s", h)
        return [h]

    # ── Video path ──────────────────────────────────────────────
    cap = cv2.VideoCapture(file_path)
    if not cap.isOpened():
        raise ValueError(f"Cannot open video: {file_path}")

    fps = cap.get(cv2.CAP_PROP_FPS) or 30
    interval = max(int(fps), 1)  # 1 frame per second

    hashes: list[str] = []
    idx = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        if idx % interval == 0:
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            pil = Image.fromarray(rgb)
            h = str(imagehash.average_hash(pil))
            hashes.append(h)
        idx += 1

    cap.release()
    log.info("Extracted %d hashes from video (%d total frames)", len(hashes), idx)
    return hashes
