import type { QueryResponse, EvaluationData } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined' && window.location.port === '5173'
    ? 'http://localhost:8000'
    : ''
);

export async function submitQuery(query: string): Promise<QueryResponse> {
  const response = await fetch(`${API_BASE}/api/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.detail || `Query failed with status ${response.status}`);
  }

  return response.json();
}

export async function getTopics(): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE}/api/topics`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.topics || [];
  } catch {
    return [
      "Virtual Memory & Paging",
      "Effective Memory Access Time (EMAT)",
      "Strict 2-Phase Locking (2PL)",
      "Conflict Serializability",
      "Floyd's Heap Construction",
      "Master Theorem",
      "TCP Congestion Control",
      "Sliding Window (GBN / SR)",
      "Relational Normal Forms (3NF / BCNF)",
      "B+ Tree Indexing",
      "Chomsky Hierarchy",
      "LR(1) Parsing Conflicts"
    ];
  }
}

export async function getEvaluationData(): Promise<EvaluationData> {
  const response = await fetch(`${API_BASE}/api/evaluation`);
  if (!response.ok) {
    throw new Error('Failed to fetch evaluation metrics');
  }
  return response.json();
}
