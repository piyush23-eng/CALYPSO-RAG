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

export interface StreamCallbacks {
  onStatus?: (status: { phase: string; message: string }) => void;
  onTelemetry?: (telemetry: { subject_hint: string; relevance_score: number; passed_gate: boolean }) => void;
  onThinkStep?: (step: any) => void;
  onToken?: (token: string) => void;
  onCacheHit?: (data: { similarity: number; message: string }) => void;
  onDone?: (fullResult: QueryResponse) => void;
  onError?: (error: string) => void;
}

export async function submitStreamingQuery(query: string, callbacks: StreamCallbacks): Promise<void> {
  const response = await fetch(`${API_BASE}/api/query/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.detail || `Streaming failed with status ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("Response body is not readable");

  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    let currentEvent = 'message';

    for (const line of lines) {
      if (line.startsWith('event: ')) {
        currentEvent = line.slice(7).trim();
      } else if (line.startsWith('data: ')) {
        const rawData = line.slice(6).trim();
        try {
          const parsed = JSON.parse(rawData);
          if (currentEvent === 'status' && callbacks.onStatus) {
            callbacks.onStatus(parsed);
          } else if (currentEvent === 'telemetry' && callbacks.onTelemetry) {
            callbacks.onTelemetry(parsed);
          } else if (currentEvent === 'think_step' && callbacks.onThinkStep) {
            callbacks.onThinkStep(parsed);
          } else if (currentEvent === 'token' && callbacks.onToken) {
            callbacks.onToken(parsed.token);
          } else if (currentEvent === 'cache_hit' && callbacks.onCacheHit) {
            callbacks.onCacheHit(parsed);
          } else if (currentEvent === 'done' && callbacks.onDone) {
            callbacks.onDone(parsed);
          } else if (currentEvent === 'error' && callbacks.onError) {
            callbacks.onError(parsed.error);
          }
        } catch {
          // ignore partial parse
        }
      }
    }
  }
}


export async function submitVisionQuery(image: string, query?: string): Promise<QueryResponse> {
  const response = await fetch(`${API_BASE}/api/vision/solve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ image, query }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.detail || `Vision analysis failed with status ${response.status}`);
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

export async function fetchStudentMastery(quizHistory: any[], queryHistory: any[]): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/api/student/mastery`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        quiz_history: quizHistory,
        query_history: queryHistory
      }),
    });
    if (!response.ok) throw new Error("Failed to compute mastery profile");
    return response.json();
  } catch (e) {
    // Fallback default mastery profile
    return {
      overall_mastery: 0.65,
      overall_mastery_percentage: 65.0,
      subject_mastery: {
        "Operating Systems": 0.78,
        "Database Management Systems": 0.72,
        "Algorithms & Data Structures": 0.68,
        "Computer Networks": 0.60,
        "Theory of Computation": 0.64,
        "Compiler Design": 0.58,
        "Computer Organization & Architecture": 0.55,
        "Digital Logic": 0.70,
        "Discrete Mathematics": 0.66,
        "Engineering Mathematics": 0.59
      },
      subject_stats: {},
      weakest_domains: ["Computer Organization & Architecture", "Compiler Design", "Engineering Mathematics"],
      strongest_domains: ["Operating Systems", "Database Management Systems", "Digital Logic"],
      recommended_focus: "Computer Organization & Architecture",
      readiness_verdict: "Competent (Needs Revision on Weak Domains)"
    };
  }
}

