export interface Citation {
  sentence: string;
  chunk_id: string;
  source_file: string;
  topic: string;
  similarity_score: number;
}

export interface Chunk {
  chunk_id: string;
  source_file: string;
  topic: string;
  subtopic: string;
  content: string;
  rerank_score?: number;
  rrf_score?: number;
  bm25_score?: number;
  dense_score?: number;
}

export interface RetrievalItem {
  chunk_id: string;
  source_file: string;
  topic: string;
  subtopic: string;
  rrf_score: number;
  bm25_score?: number;
  dense_score?: number;
}

export interface QueryResponse {
  query: string;
  reformulated_query: string;
  subject_hint?: string;
  final_answer: string;
  citations: Citation[];
  rerank_results: Chunk[];
  retrieval_results: RetrievalItem[];
  relevance_score: number;
  reformulation_count: number;
  passed_gate: boolean;
  is_low_confidence: boolean;
  telemetry: {
    confidence?: number;
    citation_coverage?: number;
    latency_ms?: number;
  };
}

export interface ModelStat {
  name: string;
  tag: string;
  precision: number;
  recall: number;
  faithfulness: number;
  relevance: number;
  overall: number;
}

export interface EvaluationData {
  models: ModelStat[];
  ragas_summary: {
    mean_context_precision: number;
    mean_context_recall: number;
    mean_faithfulness: number;
    mean_answer_relevance: number;
    mean_overall_score: number;
    total_eval_samples: number;
    detailed_results: Array<{
      question_id: string;
      subject: string;
      question: string;
      context_precision: number;
      context_recall: number;
      faithfulness: number;
      answer_relevance: number;
      passed_relevance_gate: boolean;
    }>;
  };
}
