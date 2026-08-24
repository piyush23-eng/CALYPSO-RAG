import json
import re
from pathlib import Path
from typing import List, Dict, Any

def extract_qa_pairs_from_markdown(file_path: Path) -> List[Dict[str, Any]]:
    """
    Parses structured GATE PYQ and syllabus markdown files and converts them
    into instruction-tuning dataset records with Alpaca/ChatML format.
    """
    content = file_path.read_text(encoding="utf-8")
    # Split questions by '## Question '
    sections = re.split(r'\n## Question\s+', content)
    pairs = []
    
    for sec in sections[1:]: # Skip header
        lines = sec.strip().split('\n')
        header_line = lines[0]
        full_text = sec
        
        # Extract Topic
        topic_match = re.search(r'\*\*Topic\*\*:\s*([^\n]+)', full_text)
        topic = topic_match.group(1).strip() if topic_match else "Computer Science"
        
        # Extract Question
        q_match = re.search(r'\*\*Question\*\*:\s*\n(.*?)(?=\*\*Key Technical Concepts|\*\*Step-by-Step|\*\*Answer and Reasoning|\Z)', full_text, re.DOTALL)
        question_text = q_match.group(1).strip() if q_match else ""
        
        # Extract Derivation / Solution
        sol_match = re.search(r'(\*\*Step-by-Step Solution & Derivation\*\*:\s*\n.*|\*\*Answer and Reasoning\*\*:\s*\n.*)', full_text, re.DOTALL)
        solution_text = sol_match.group(1).strip() if sol_match else ""
        
        if not question_text or not solution_text:
            continue
            
        # Format as high-quality mathematical instruction sample
        alpaca_entry = {
            "instruction": f"You are an expert GATE Computer Science reasoning model. Solve this {topic} problem with complete step-by-step mathematical derivation, boundary analysis, and final answer.",
            "input": question_text,
            "output": solution_text,
            "metadata": {
                "source_file": file_path.name,
                "topic": topic
            }
        }
        pairs.append(alpaca_entry)
        
    return pairs

def main():
    raw_dir = Path("./data/raw")
    output_train_path = Path("./data/train_gate_cs_dataset.jsonl")
    
    all_pairs = []
    for md_file in sorted(raw_dir.glob("*.md")):
        pairs = extract_qa_pairs_from_markdown(md_file)
        print(f"Extracted {len(pairs)} QA training pairs from {md_file.name}")
        all_pairs.extend(pairs)
        
    output_train_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_train_path, "w", encoding="utf-8") as f:
        for p in all_pairs:
            f.write(json.dumps(p, ensure_ascii=False) + "\n")
            
    print(f"\n✅ Total Training Samples Created: {len(all_pairs)}")
    print(f"✅ Saved to: {output_train_path}")

if __name__ == "__main__":
    main()
