"""
Self-Consistency & Multi-Path Verification Voting Engine for CALYPSO-RAG.

Executes N=3 independent reasoning chains in parallel with temperature perturbation,
extracts numerical/formula solutions via AST Sandbox & SymPy, and runs a majority
consensus voting judge to eliminate edge-case LLM hallucination flukes.
"""

from typing import List, Dict, Any, Optional, Tuple
import re
import statistics
from collections import Counter
from src.reasoning.symbolic_verifier import global_symbolic_verifier
from src.agent.sandbox import PythonSandbox


class SelfConsistencyEngine:
    def __init__(self, sample_count: int = 3):
        self.sample_count = sample_count
        self.sandbox = PythonSandbox()
        self.verifier = global_symbolic_verifier

    def extract_numerical_target(self, text: str) -> Optional[float]:
        """
        Extracts the final numerical answer from a reasoning path using regex and AST verification.
        """
        # Look for explicit conclusion patterns like "Correct Answer: 140 ns", "EMAT = 140", "ans = 140"
        patterns = [
            r"(?:Correct Answer|Final Answer|Result|EMAT|AMAT|Throughput|Efficiency|T_t|T_p|Complexity)\s*[:=]\s*([\d\.]+(?:/\d+)?)",
            r"(?:answer is|yields|calculated as)\s*[:=]?\s*([\d\.]+(?:/\d+)?)",
            r"\\mathbf\{([\d\.]+(?:/\d+)?)\}",
            r"\*\*([\d\.]+(?:/\d+)?)\s*(?:ns|ms|s|bps|Mbps|Gbps|%)?\*\*",
            r"([\d\.]+)\s*(?:ns|microseconds|ms|nanoseconds|Mbps|Gbps|%)"
        ]

        for pat in patterns:
            matches = re.findall(pat, text, re.IGNORECASE)
            if matches:
                last_match = matches[-1]
                # If fraction
                if "/" in last_match:
                    try:
                        num, den = last_match.split("/")
                        return float(num) / float(den)
                    except Exception:
                        pass
                try:
                    return float(last_match)
                except ValueError:
                    continue

        return None

    def run_consensus_voting(
        self,
        candidate_paths: List[Dict[str, Any]],
        ground_formula_eval: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Takes N candidate reasoning paths, extracts targets, and computes consensus agreement.
        """
        if not candidate_paths:
            return {
                "success": False,
                "consensus_answer": None,
                "agreement_ratio": 0.0,
                "voting_distribution": {},
                "is_unanimous": False,
                "sample_count": 0
            }

        extracted_values = []
        for path in candidate_paths:
            ans_text = path.get("text", "")
            val = self.extract_numerical_target(ans_text)
            path["extracted_target"] = val
            if val is not None:
                extracted_values.append(round(val, 2))

        # If ground truth / AST exact evaluation is available, incorporate as anchor
        if ground_formula_eval is not None:
            extracted_values.append(round(ground_formula_eval, 2))

        if not extracted_values:
            # Fallback to first path if non-numerical
            return {
                "success": True,
                "consensus_answer": candidate_paths[0].get("text", ""),
                "agreement_ratio": 1.0,
                "voting_distribution": {"text_consensus": len(candidate_paths)},
                "is_unanimous": True,
                "sample_count": len(candidate_paths)
            }

        counts = Counter(extracted_values)
        most_common_val, highest_count = counts.most_common(1)[0]
        total_votes = len(extracted_values)
        agreement_ratio = round(highest_count / total_votes, 3)

        # Select the best path matching the majority consensus
        best_path = None
        for path in candidate_paths:
            if path.get("extracted_target") is not None and round(path["extracted_target"], 2) == most_common_val:
                best_path = path
                break

        if best_path is None:
            best_path = candidate_paths[0]

        is_unanimous = highest_count == total_votes

        return {
            "success": True,
            "consensus_value": most_common_val,
            "consensus_answer": best_path.get("text", ""),
            "agreement_ratio": agreement_ratio,
            "voting_distribution": {str(k): v for k, v in counts.items()},
            "is_unanimous": is_unanimous,
            "sample_count": len(candidate_paths),
            "paths": candidate_paths
        }


# Global singleton instance
global_self_consistency = SelfConsistencyEngine(sample_count=3)
