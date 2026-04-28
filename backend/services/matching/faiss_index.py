"""
FAISS-based similarity index for perceptual hashes.

Each 16-char hex hash (64-bit) is expanded into a 64-dim float32 vector
of 0s and 1s so that L2 distance ≈ Hamming distance.
"""

import faiss
import numpy as np
from core.logging_config import get_logger
from core.config import settings

log = get_logger("matching.faiss")


class SimilarityIndex:
    def __init__(self, dimension: int = 64):
        self.dimension = dimension
        self.index = faiss.IndexFlatL2(self.dimension)
        self._id_map: dict[int, str] = {}  # faiss row → content_id
        self._next_id: int = 0

    # ── helpers ──────────────────────────────────────────────────
    @staticmethod
    def _hex_to_vec(hex_str: str) -> np.ndarray:
        hex_str = hex_str.strip()
        if len(hex_str) != 16:
            raise ValueError(f"Expected 16-char hex, got {len(hex_str)}: {hex_str}")
        bits = bin(int(hex_str, 16))[2:].zfill(64)
        return np.array([float(b) for b in bits], dtype=np.float32)

    # ── public API ──────────────────────────────────────────────
    def add(self, content_id: str, hex_hash: str) -> bool:
        try:
            vec = self._hex_to_vec(hex_hash).reshape(1, -1)
            self.index.add(vec)
            self._id_map[self._next_id] = content_id
            self._next_id += 1
            log.info(
                "Indexed content_id=%s  (total vectors: %d)",
                content_id,
                self.index.ntotal,
            )
            return True
        except Exception as exc:
            log.exception("Failed to index %s: %s", content_id, exc)
            return False

    def search(self, hex_hash: str, top_k: int = 1) -> dict | None:
        """
        Returns {"matched_content_id", "distance", "similarity_score"}
        or None if nothing is close enough.
        """
        if self.index.ntotal == 0:
            return None

        try:
            vec = self._hex_to_vec(hex_hash).reshape(1, -1)
            distances, indices = self.index.search(vec, top_k)

            dist = float(distances[0][0])
            idx = int(indices[0][0])

            if idx == -1:
                return None

            # Convert L2 distance to a 0-100 similarity score
            similarity = max(0.0, 100.0 - (dist / 64.0 * 100.0))

            if dist <= settings.FAISS_MATCH_THRESHOLD:
                return {
                    "matched_content_id": self._id_map[idx],
                    "distance": dist,
                    "similarity_score": round(similarity, 2),
                }
            return None

        except Exception as exc:
            log.exception("Search failed: %s", exc)
            return None


# ── Global singleton — lives inside this worker process only ────
faiss_index = SimilarityIndex()
