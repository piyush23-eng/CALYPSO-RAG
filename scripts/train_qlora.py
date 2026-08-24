#!/usr/bin/env python3
"""
CALYPSO-RAG: Production QLoRA Fine-Tuning Pipeline for GATE CS
Target Base Model: Qwen/Qwen2.5-1.5B-Instruct
Technique: 4-Bit NormalFloat (NF4) Double Quantization with PEFT/LoRA (Rank=16, Alpha=32)

Usage:
    python scripts/train_qlora.py --data_path data/train_gate_cs_dataset.jsonl --output_dir models/calypso_gate_qlora
"""

import os
import sys
import argparse

# Guard against broken multimodal / outdated optional packages in Google Colab
sys.modules['torchvision'] = None
sys.modules['torchvision.io'] = None
sys.modules['torchvision.ops'] = None
sys.modules['torchvision.transforms'] = None
sys.modules['torchaudio'] = None
sys.modules['torchaudio._extension'] = None
sys.modules['torchaudio._extension.utils'] = None
sys.modules['torchao'] = None

import torch

try:
    import accelerate
except ImportError:
    pass

from datasets import load_dataset
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    BitsAndBytesConfig,
)

try:
    from trl import SFTConfig, SFTTrainer
    TrainingConfigClass = SFTConfig
except (ImportError, Exception):
    try:
        from transformers import TrainingArguments as TrainingConfigClass
    except ImportError:
        from transformers.training_args import TrainingArguments as TrainingConfigClass
    from trl import SFTTrainer

from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training


def train_gate_model(
    base_model_name: str = "Qwen/Qwen2.5-1.5B-Instruct",
    data_path: str = "./data/train_gate_cs_dataset.jsonl",
    output_dir: str = "./models/calypso_gate_qlora",
    num_epochs: int = 4,
    batch_size: int = 2,
    gradient_accumulation_steps: int = 4,
    learning_rate: float = 2e-4,
    lora_r: int = 16,
    lora_alpha: int = 32
):
    print(f"🚀 Starting CALYPSO QLoRA Fine-Tuning on Base Model: {base_model_name}")
    print(f"📁 Dataset: {data_path}")
    print(f"🎯 Output Adapter: {output_dir}")

    # 1. 4-Bit Quantization Configuration (BitsAndBytes)
    use_cuda = torch.cuda.is_available()
    compute_dtype = torch.bfloat16 if (use_cuda and torch.cuda.is_bf16_supported()) else torch.float16

    if use_cuda:
        bnb_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_quant_type="nf4",
            bnb_4bit_compute_dtype=compute_dtype,
            bnb_4bit_use_double_quant=True
        )
    else:
        bnb_config = None
        print("⚠️ CUDA GPU not detected. Running in CPU/MPS fallback mode for development verification.")

    # 2. Tokenizer
    tokenizer = AutoTokenizer.from_pretrained(base_model_name, trust_remote_code=True)
    tokenizer.pad_token = tokenizer.eos_token
    tokenizer.padding_side = "right"

    # 3. Model Loading
    device_map = "auto" if use_cuda else None
    model = AutoModelForCausalLM.from_pretrained(
        base_model_name,
        quantization_config=bnb_config,
        device_map=device_map,
        torch_dtype=compute_dtype if use_cuda else torch.float32,
        trust_remote_code=True
    )

    if use_cuda:
        model = prepare_model_for_kbit_training(model)

    # 4. LoRA Adapter Configuration
    peft_config = LoraConfig(
        r=lora_r,
        lora_alpha=lora_alpha,
        lora_dropout=0.05,
        bias="none",
        task_type="CAUSAL_LM",
        target_modules=[
            "q_proj", "k_proj", "v_proj", "o_proj",
            "gate_proj", "up_proj", "down_proj"
        ]
    )
    model = get_peft_model(model, peft_config)
    model.print_trainable_parameters()

    # 5. Load and Format Dataset (ChatML format)
    dataset = load_dataset("json", data_files=data_path)

    def tokenize_chatml(batch):
        formatted_texts = []
        for inst, inp, out in zip(batch["instruction"], batch["input"], batch["output"]):
            chatml_text = (
                f"<|im_start|>system\n{inst}<|im_end|>\n"
                f"<|im_start|>user\n{inp}<|im_end|>\n"
                f"<|im_start|>assistant\n{out}<|im_end|>"
            )
            formatted_texts.append(chatml_text)
        
        tokenized = tokenizer(
            formatted_texts,
            truncation=True,
            max_length=1024,
            padding=False
        )
        tokenized["labels"] = [ids.copy() for ids in tokenized["input_ids"]]
        return tokenized

    tokenized_dataset = dataset.map(tokenize_chatml, batched=True, remove_columns=dataset["train"].column_names)

    # 6. Training Arguments & Standard HuggingFace Trainer
    os.makedirs(output_dir, exist_ok=True)
    from transformers import TrainingArguments, Trainer, DataCollatorForSeq2Seq

    training_args = TrainingArguments(
        output_dir=output_dir,
        per_device_train_batch_size=batch_size,
        gradient_accumulation_steps=gradient_accumulation_steps,
        learning_rate=learning_rate,
        num_train_epochs=num_epochs,
        logging_steps=1,
        fp16=use_cuda and not torch.cuda.is_bf16_supported(),
        bf16=use_cuda and torch.cuda.is_bf16_supported(),
        save_strategy="epoch",
        report_to="none"
    )

    data_collator = DataCollatorForSeq2Seq(
        tokenizer=tokenizer,
        model=model,
        pad_to_multiple_of=8
    )

    # 7. Supervised Fine-Tuning
    trainer = Trainer(
        model=model,
        train_dataset=tokenized_dataset["train"],
        data_collator=data_collator,
        args=training_args
    )

    print("⚡ Training in progress...")
    trainer.train()

    # 8. Save Trained LoRA Adapter & Tokenizer
    final_save_path = os.path.join(output_dir, "final_adapter")
    trainer.model.save_pretrained(final_save_path)
    tokenizer.save_pretrained(final_save_path)
    print(f"🎉 Fine-Tuning Complete! Adapter saved to: {final_save_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="CALYPSO-RAG QLoRA Fine-Tuning")
    parser.add_argument("--base_model", type=str, default="Qwen/Qwen2.5-1.5B-Instruct")
    parser.add_argument("--data_path", type=str, default="./data/train_gate_cs_dataset.jsonl")
    parser.add_argument("--output_dir", type=str, default="./models/calypso_gate_qlora")
    parser.add_argument("--epochs", type=int, default=4)
    parser.add_argument("--batch_size", type=int, default=2)
    parser.add_argument("--grad_accum", type=int, default=4)
    parser.add_argument("--lr", type=float, default=2e-4)

    args = parser.parse_args()
    train_gate_model(
        base_model_name=args.base_model,
        data_path=args.data_path,
        output_dir=args.output_dir,
        num_epochs=args.epochs,
        batch_size=args.batch_size,
        gradient_accumulation_steps=args.grad_accum,
        learning_rate=args.lr
    )
