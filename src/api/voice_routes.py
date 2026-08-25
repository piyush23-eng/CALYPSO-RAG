"""
Neural Human Text-to-Speech API Route for CALYPSO-RAG.
Provides ultra-realistic neural speech synthesis using studio-grade neural voices.
"""

from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel
from typing import Optional
import edge_tts
import asyncio
import re

voice_router = APIRouter(prefix="/api/voice", tags=["voice"])


class TTSRequest(BaseModel):
    text: str
    voice: Optional[str] = "en-IN-PrabhatNeural"  # Default: Authentic Indian English Professor
    rate: Optional[str] = "+0%"
    pitch: Optional[str] = "+0Hz"


def sanitize_math_for_tts(text: str) -> str:
    """
    Cleans LaTeX, Markdown and mathematical formulas for natural human speech flow.
    """
    if not text:
        return ""

    s = text

    # Remove markdown headers and decorators
    s = re.sub(r"^#+\s+", "", s, flags=re.MULTILINE)
    s = re.sub(r"\*\*([^*]+)\*\*", r"\1", s)
    s = re.sub(r"\*([^*]+)\*", r"\1", s)
    s = re.sub(r"`([^`]+)`", r"\1", s)
    s = re.sub(r"\[\^?\d+\]", "", s)
    s = re.sub(r"---", " ", s)

    # Convert LaTeX symbols to spoken equivalents
    s = re.sub(r"\\Theta", "Theta", s)
    s = re.sub(r"\\Omega", "Omega", s)
    s = re.sub(r"\\mathcal\{O\}", "Big O", s)
    s = re.sub(r"\\mathcal\{([A-Za-z])\}", r"\1", s)
    s = re.sub(r"\\approx", "approximately equal to", s)
    s = re.sub(r"\\le|\\leq", "less than or equal to", s)
    s = re.sub(r"\\ge|\\geq", "greater than or equal to", s)
    s = re.sub(r"\\neq", "not equal to", s)
    s = re.sub(r"\\in", "is in", s)
    s = re.sub(r"\\times|\\cdot", " times ", s)
    s = re.sub(r"\\frac\{([^}]+)\}\{([^}]+)\}", r"\1 divided by \2", s)
    s = re.sub(r"\\sqrt\{([^}]+)\}", r"square root of \1", s)
    s = re.sub(r"\\mu\s?s", "microseconds", s)
    s = re.sub(r"\\mu", "micro", s)
    s = re.sub(r"\\rightarrow|\\to", " leads to ", s)
    s = re.sub(r"\$([^$]+)\$", r"\1", s)
    s = re.sub(r"\\\[([^\\]+)\\\]", r"\1", s)
    s = re.sub(r"\\([a-zA-Z]+)", r"\1", s)

    # Remove code blocks or trim long repetitive sequences
    s = re.sub(r"\s+", " ", s).strip()
    return s


@voice_router.post("/synthesize")
async def synthesize_speech(request: TTSRequest):
    """
    Synthesizes text into high-fidelity neural MP3 audio.
    """
    clean_text = sanitize_math_for_tts(request.text)
    if not clean_text:
        raise HTTPException(status_code=400, detail="Text cannot be empty.")

    # Limit to reasonable lecture length (up to 3,000 characters)
    trimmed_text = clean_text[:3000]
    lecture_intro = f"Here is the verified conceptual derivation. {trimmed_text}"

    selected_voice = request.voice or "en-IN-PrabhatNeural"

    try:
        communicate = edge_tts.Communicate(
            text=lecture_intro,
            voice=selected_voice,
            rate=request.rate or "+0%",
            pitch=request.pitch or "+0Hz"
        )
        audio_buffer = b""
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_buffer += chunk["data"]

        return Response(content=audio_buffer, media_type="audio/mpeg")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Neural TTS synthesis failed: {str(e)}")
