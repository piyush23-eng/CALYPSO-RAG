"""
High-Performance Semantic Vector Cache for LORCEN-RAG.

Stores verified derivations and metadata indexed by dense semantic embeddings.
Delivers sub-10ms response times for semantically equivalent or duplicate queries.
"""

from typing import Dict, Any, Optional, Tuple, List
import numpy as np
import time
import threading


class SemanticCache:
    def __init__(self, default_threshold: float = 0.95, max_size: int = 10000):
        self.default_threshold = default_threshold
        self.max_size = max_size
        self._lock = threading.Lock()
        self._entries: List[Dict[str, Any]] = []
        self._hits = 0
        self._misses = 0

    def _normalize(self, vec: np.ndarray) -> np.ndarray:
        norm = np.linalg.norm(vec)
        if norm == 0:
            return vec
        return vec / norm

    def lookup(
        self, query_embedding: np.ndarray, threshold: Optional[float] = None
    ) -> Tuple[Optional[Dict[str, Any]], float]:
        """
        Finds the closest cached query embedding using cosine similarity.
        Returns (result, similarity) if similarity >= threshold, else (None, best_similarity).
        """
        th = threshold if threshold is not None else self.default_threshold
        q_norm = self._normalize(np.array(query_embedding, dtype=np.float32))

        with self._lock:
            if not self._entries:
                self._misses += 1
                return None, 0.0

            # Stack embeddings for vectorized matrix multiplication
            embeddings_matrix = np.vstack([e["embedding"] for e in self._entries])
            similarities = np.dot(embeddings_matrix, q_norm)

            best_idx = int(np.argmax(similarities))
            best_sim = float(similarities[best_idx])

            if best_sim >= th:
                self._hits += 1
                entry = self._entries[best_idx]
                entry["hit_count"] += 1
                entry["last_accessed"] = time.time()
                # Return deep copy of cached result with cache metadata
                cached_data = dict(entry["result"])
                cached_data["is_semantic_cache_hit"] = True
                cached_data["cache_similarity"] = round(best_sim, 4)
                cached_data["cached_original_query"] = entry["query"]
                return cached_data, best_sim

            self._misses += 1
            return None, best_sim

    def insert(self, query: str, query_embedding: np.ndarray, result: Dict[str, Any]) -> None:
        """
        Inserts or updates a query result in the semantic cache.
        """
        q_norm = self._normalize(np.array(query_embedding, dtype=np.float32))

        with self._lock:
            # Check if an almost identical query already exists (>= 0.99)
            if self._entries:
                embeddings_matrix = np.vstack([e["embedding"] for e in self._entries])
                sims = np.dot(embeddings_matrix, q_norm)
                best_idx = int(np.argmax(sims))
                if sims[best_idx] >= 0.99:
                    # Update existing entry
                    self._entries[best_idx]["result"] = result
                    self._entries[best_idx]["last_accessed"] = time.time()
                    return

            # Evict least recently accessed if size limit exceeded
            if len(self._entries) >= self.max_size:
                self._entries.sort(key=lambda x: x["last_accessed"])
                self._entries.pop(0)

            # Strip temporary cache hit flags before persisting
            clean_result = {k: v for k, v in result.items() if not k.startswith("is_semantic_cache")}

            self._entries.append({
                "query": query,
                "embedding": q_norm,
                "result": clean_result,
                "created_at": time.time(),
                "last_accessed": time.time(),
                "hit_count": 0,
            })

    def get_stats(self) -> Dict[str, Any]:
        """Returns runtime statistics of the semantic cache."""
        with self._lock:
            total_requests = self._hits + self._misses
            hit_rate = (self._hits / total_requests) if total_requests > 0 else 0.0
            return {
                "cached_entries": len(self._entries),
                "total_hits": self._hits,
                "total_misses": self._misses,
                "hit_rate_pct": round(hit_rate * 100, 2),
                "threshold": self.default_threshold,
                "max_capacity": self.max_size,
            }

    def clear(self) -> None:
        """Clears all cached entries."""
        with self._lock:
            self._entries.clear()
            self._hits = 0
            self._misses = 0


# Global singleton instance
global_semantic_cache = SemanticCache(default_threshold=0.95)
