#!/usr/bin/env python3
"""
GATE CS PDF Ingestion Utility
Converts past-year question and syllabus PDFs into structured Markdown files for CALYPSO-RAG.
"""

import sys
import re
import argparse
from pathlib import Path
from typing import Optional


def extract_text_from_pdf(pdf_path: Path) -> str:
    """Extracts raw text from a PDF file page by page."""
    try:
        from pypdf import PdfReader
    except ImportError:
        print("❌ 'pypdf' is not installed. Install it with: pip install pypdf")
        sys.exit(1)

    reader = PdfReader(str(pdf_path))
    num_pages = len(reader.pages)
    print(f"📖 Reading {num_pages} pages from '{pdf_path.name}'...")

    extracted_text = []
    for idx, page in enumerate(reader.pages, 1):
        text = page.extract_text() or ""
        extracted_text.append(text)
        if idx % 20 == 0 or idx == num_pages:
            print(f"   Processed {idx}/{num_pages} pages...")

    return "\n\n".join(extracted_text)


def structure_gate_content(raw_text: str, subject_hint: Optional[str] = None, source_filename: str = "") -> str:
    """
    Structures extracted raw PDF text into CALYPSO-compatible markdown format.
    """
    lines = raw_text.split("\n")
    cleaned_lines = []
    for line in lines:
        l = line.strip()
        # Remove page numbers and headers
        if re.match(r'^(?:page\s*\d+|\d+\s*of\s*\d+|\d+)$', l, re.IGNORECASE):
            continue
        cleaned_lines.append(line)

    full_text = "\n".join(cleaned_lines)
    
    # Try to segment by 'Question' or 'Q.' markers
    question_splits = re.split(r'\n(?=(?:Question\s*(?:\d+|[A-Z0-9_-]+)|Q\.\s*\d+|Q\d+[:.]))', full_text, flags=re.IGNORECASE)
    
    output_sections = [f"# GATE CS Past Year Questions Archive - {subject_hint or 'Comprehensive'}\n"]

    if len(question_splits) > 1:
        for idx, q_block in enumerate(question_splits, 1):
            q_text = q_block.strip()
            if len(q_text) < 30:
                continue

            # Topic inference
            topic = subject_hint or "Computer Science"
            if any(w in q_text.lower() for w in ["paging", "tlb", "semaphore", "deadlock", "process", "thread"]):
                topic = "Operating Systems"
            elif any(w in q_text.lower() for w in ["tcp", "sliding window", "csma", "ip address", "subnet", "routing"]):
                topic = "Computer Networks"
            elif any(w in q_text.lower() for w in ["sql", "b+ tree", "relational", "2pl", "serializability", "functional dependency"]):
                topic = "Database Management Systems"
            elif any(w in q_text.lower() for w in ["heap", "dijkstra", "knapsack", "asymptotic", "recurrence", "sort"]):
                topic = "Algorithms"
            elif any(w in q_text.lower() for w in ["cache", "pipeline", "hazard", "instruction", "seek time", "rpm"]):
                topic = "Computer Organization and Architecture"
            elif any(w in q_text.lower() for w in ["cfg", "pumping lemma", "regular language", "turing machine", "npda", "dfa"]):
                topic = "Theory of Computation"
            elif any(w in q_text.lower() for w in ["lr(0)", "slr(1)", "lalr", "parser", "syntax-directed", "dag"]):
                topic = "Compiler Design"

            section = (
                f"\n## Question GATE-PYQ-{idx:03d}: {topic}\n"
                f"**Topic**: {topic}\n"
                f"**Question**:\n{q_text}\n\n"
                f"**Step-by-Step Solution & Derivation**:\n"
                f"1. Refer to standard analytical formulas and invariants in {topic}.\n\n"
                f"---"
            )
            output_sections.append(section)
    else:
        # Save as comprehensive notes if questions couldn't be automatically separated
        output_sections.append(f"### {subject_hint or 'GATE CS Reference Materials'}\n\n{full_text}")

    return "\n".join(output_sections)


def main():
    parser = argparse.ArgumentParser(description="Ingest GATE CS PDF files into CALYPSO-RAG knowledge base")
    parser.add_argument("--pdf", type=str, required=True, help="Path to the PDF file")
    parser.add_argument("--subject", type=str, default="Computer Science", help="Optional subject name (e.g. 'Operating Systems', 'Computer Networks')")
    parser.add_argument("--output_dir", type=str, default="./data/raw", help="Output directory for generated Markdown (default: ./data/raw)")
    args = parser.parse_args()

    pdf_path = Path(args.pdf)
    if not pdf_path.exists():
        print(f"❌ PDF file not found: {pdf_path}")
        sys.exit(1)

    # 1. Extract text
    raw_text = extract_text_from_pdf(pdf_path)
    print(f"✅ Extracted {len(raw_text)} characters from {pdf_path.name}")

    # 2. Structure into Markdown
    markdown_content = structure_gate_content(raw_text, subject_hint=args.subject, source_filename=pdf_path.name)

    # 3. Save to data/raw/
    out_dir = Path(args.output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    out_filename = pdf_path.stem.lower().replace(" ", "_").replace("-", "_") + "_pyqs.md"
    out_path = out_dir / out_filename

    out_path.write_text(markdown_content, encoding="utf-8")
    print(f"\n🎉 Successfully created Markdown corpus file:")
    print(f"   📁 {out_path}")
    print(f"\n👉 Next Steps to Train & Index:")
    print(f"   1. python scripts/build_index.py")
    print(f"   2. python scripts/prepare_training_data.py")
    print(f"   3. python scripts/train_qlora.py (or run Google Colab notebook)")


if __name__ == "__main__":
    main()
