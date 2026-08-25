"""
Neural Human Text-to-Speech API Route for CALYPSO-RAG.
Provides ultra-realistic, human-cadence speech synthesis with full unit expansion,
natural mathematical pronunciation, and professorial breath pauses at punctuation.
"""

from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel
from typing import Optional
import edge_tts
import re

voice_router = APIRouter(prefix="/api/voice", tags=["voice"])


class TTSRequest(BaseModel):
    text: str
    voice: Optional[str] = "en-IN-PrabhatNeural"  # Default: Authentic Indian English Professor
    rate: Optional[str] = "-4%"                   # Slightly deliberate, calm professorial tempo
    pitch: Optional[str] = "+0Hz"


def sanitize_math_for_tts(text: str) -> str:
    """
    Transforms LaTeX equations, Markdown syntax, technical acronyms, and units into
    natural, pedagogical human speech with deliberate pauses at full stops.
    """
    if not text:
        return ""

    s = text

    # 1. Clean markdown headers and section dividers
    s = re.sub(r"^#+\s*", "", s, flags=re.MULTILINE)
    s = re.sub(r"^-\s*", "", s, flags=re.MULTILINE)
    s = re.sub(r"^(\d+)\.\s*", r"Step \1: ", s, flags=re.MULTILINE)
    s = re.sub(r"\*\*([^*]+)\*\*", r"\1", s)
    s = re.sub(r"\*([^*]+)\*", r"\1", s)
    s = re.sub(r"`([^`]+)`", r"\1", s)
    s = re.sub(r"\[\^?\d+\]", "", s)
    s = re.sub(r"---", " ", s)

    # 2. Technical Acronym Expansions
    s = re.sub(r"\bEMAT\b", "Effective Memory Access Time", s)
    s = re.sub(r"\bAMAT\b", "Average Memory Access Time", s)
    s = re.sub(r"\bTLB\b", "T L B", s)
    s = re.sub(r"\b2PL\b", "Two-Phase Locking", s)
    s = re.sub(r"\bGBN\b", "Go-Back-N", s)
    s = re.sub(r"\bSR\b", "Selective Repeat", s)
    s = re.sub(r"\b3NF\b", "Third Normal Form", s)
    s = re.sub(r"\b2NF\b", "Second Normal Form", s)
    s = re.sub(r"\b1NF\b", "First Normal Form", s)
    s = re.sub(r"\bBCNF\b", "B C N F", s)
    s = re.sub(r"\bLRU\b", "Least Recently Used", s)
    s = re.sub(r"\bFIFO\b", "First-In First-Out", s)
    s = re.sub(r"\bCIDR\b", "C I D R", s)
    s = re.sub(r"\bMIPS\b", "Million Instructions Per Second", s)
    s = re.sub(r"\bDFA\b", "D F A", s)
    s = re.sub(r"\bNFA\b", "N F A", s)
    s = re.sub(r"\bPDA\b", "P D A", s)
    s = re.sub(r"\bCFL\b", "Context Free Language", s)
    s = re.sub(r"\bSOP\b", "Sum of Products", s)
    s = re.sub(r"\bPOS\b", "Product of Sums", s)
    s = re.sub(r"\bMUX\b", "Multiplexer", s)
    s = re.sub(r"\bTCP\b", "T C P", s)
    s = re.sub(r"\bIP\b", "I P", s)
    s = re.sub(r"\bMAC\b", "M A C", s)

    # 3. Unit Expansions (Spelling out abbreviations like a human professor)
    s = re.sub(r"\b(\d+(?:\.\d+)?)\s*ns\b", r"\1 nanoseconds", s)
    s = re.sub(r"\b(\d+(?:\.\d+)?)\s*(?:μs|us)\b", r"\1 microseconds", s)
    s = re.sub(r"\b(\d+(?:\.\d+)?)\s*ms\b", r"\1 milliseconds", s)
    s = re.sub(r"\b(\d+(?:\.\d+)?)\s*km\b", r"\1 kilometers", s)
    s = re.sub(r"\b(\d+(?:\.\d+)?)\s*Mbps\b", r"\1 megabits per second", s)
    s = re.sub(r"\b(\d+(?:\.\d+)?)\s*Gbps\b", r"\1 gigabits per second", s)
    s = re.sub(r"\b(\d+(?:\.\d+)?)\s*KB\b", r"\1 kilobytes", s)
    s = re.sub(r"\b(\d+(?:\.\d+)?)\s*MB\b", r"\1 megabytes", s)
    s = re.sub(r"\b(\d+(?:\.\d+)?)\s*GB\b", r"\1 gigabytes", s)
    s = re.sub(r"\b(\d+(?:\.\d+)?)\s*RPM\b", r"\1 revolutions per minute", s)
    s = re.sub(r"\b(\d+(?:\.\d+)?)\s*m/s\b", r"\1 meters per second", s)
    s = re.sub(r"(\d+)%", r"\1 percent", s)

    # 4. Mathematical Variables, Symbols & Formulas
    s = re.sub(r"\\Theta", "Theta", s)
    s = re.sub(r"\\Omega", "Omega", s)
    s = re.sub(r"\\mathcal\{O\}", "Order", s)
    s = re.sub(r"\\mathcal\{([A-Za-z])\}", r"\1", s)
    s = re.sub(r"\\approx", " approximately equals ", s)
    s = re.sub(r"\\le|\\leq", " is less than or equal to ", s)
    s = re.sub(r"\\ge|\\geq", " is greater than or equal to ", s)
    s = re.sub(r"\\neq", " is not equal to ", s)
    s = re.sub(r"\\in", " is in ", s)
    s = re.sub(r"\\subset|\\subseteq", " is a subset of ", s)
    s = re.sub(r"\\times|\\cdot|\*", " multiplied by ", s)
    s = re.sub(r"\\frac\{([^}]+)\}\{([^}]+)\}", r"\1 divided by \2", s)
    s = re.sub(r"\\sqrt\{([^}]+)\}", r"square root of \1", s)
    s = re.sub(r"\\rightarrow|\\to|->", " leads to ", s)

    # Variable subscripts
    s = re.sub(r"\bt_TLB\b|\bt_\{TLB\}\b", "T L B access latency", s)
    s = re.sub(r"\bt_m\b|\bt_\{m\}\b", "main memory latency", s)
    s = re.sub(r"\bT_t\b|\bT_\{t\}\b", "transmission delay", s)
    s = re.sub(r"\bT_p\b|\bT_\{p\}\b", "propagation delay", s)
    s = re.sub(r"\bW_s\b|\bW_\{s\}\b", "sender window size", s)
    s = re.sub(r"\bW_r\b|\bW_\{r\}\b", "receiver window size", s)

    # Powers & Asymptotics
    s = re.sub(r"\b2\^([a-zA-Z0-9]+)\b", r"2 to the power \1", s)
    s = re.sub(r"\b([a-zA-Z0-9]+)\^(\d+)\b", r"\1 to the power \2", s)
    s = re.sub(r"\bTheta\(([^)]+)\)", r"Theta of \1", s)
    s = re.sub(r"\bO\(([^)]+)\)", r"Order of \1", s)
    s = re.sub(r"\bT\(([a-zA-Z0-9/]+)\)", r"T of \1", s)
    s = re.sub(r"\blog_?(\w+)?\s*([a-zA-Z0-9]+)", r"log base \1 of \2", s)
    s = re.sub(r"\blog\b", "log", s)

    # LaTeX delimiters cleanup
    s = re.sub(r"\$([^$]+)\$", r"\1", s)
    s = re.sub(r"\\\[([^\\]+)\\\]", r"\1", s)
    s = re.sub(r"\\([a-zA-Z]+)", r"\1", s)

    # 5. Natural Human Pacing, Punctuation & Breath Pauses
    # Ellipses ('... ') after full stops, colons, and semi-colons instruct the neural TTS
    # to insert an authentic 250ms–350ms human breathing cadence.
    s = re.sub(r"\.\s+", ". ... ", s)
    s = re.sub(r":\s+", ": ... ", s)
    s = re.sub(r";\s+", "; ... ", s)
    s = re.sub(r"\n+", ". ... ", s)
    s = re.sub(r"\s+", " ", s).strip()

    # Clean leading dots
    s = re.sub(r"^[.\s]+", "", s)

    return s


@voice_router.post("/synthesize")
async def synthesize_speech(request: TTSRequest):
    """
    Synthesizes lecture text into high-fidelity neural MP3 audio with natural human cadence.
    """
    clean_text = sanitize_math_for_tts(request.text)
    if not clean_text:
        raise HTTPException(status_code=400, detail="Text cannot be empty.")

    # Limit to reasonable lecture duration (up to 3,000 characters)
    trimmed_text = clean_text[:3000]
    lecture_intro = f"Hello. Let us go through the step-by-step verified derivation. ... {trimmed_text}"

    selected_voice = request.voice or "en-IN-PrabhatNeural"

    try:
        communicate = edge_tts.Communicate(
            text=lecture_intro,
            voice=selected_voice,
            rate=request.rate or "-4%",   # Natural deliberate professor tempo
            pitch=request.pitch or "+0Hz"
        )
        audio_buffer = b""
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_buffer += chunk["data"]

        return Response(content=audio_buffer, media_type="audio/mpeg")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Neural TTS synthesis failed: {str(e)}")
