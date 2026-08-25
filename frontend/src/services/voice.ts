/**
 * IIT Professor Voice Engine for CALYPSO-RAG.
 * Implements Web Speech API Speech-to-Text (SpeechRecognition) and
 * natural mathematical Text-to-Speech (SpeechSynthesis).
 */

// ── Part 1: Speech-to-Text (Voice Query Input) ──────────────────────────

export class VoiceRecognition {
  private recognition: any = null;
  public isSupported: boolean = false;
  private isListening: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        this.isSupported = true;
      }
    }
  }

  public start(
    onTranscript: (text: string, isFinal: boolean) => void,
    onError: (err: string) => void,
    onEnd: () => void
  ) {
    if (!this.recognition) {
      onError("Voice recognition is not supported in this browser. Please use Chrome/Edge/Safari.");
      return;
    }

    if (this.isListening) {
      this.stop();
    }

    this.recognition.onstart = () => {
      this.isListening = true;
    };

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        onTranscript(finalTranscript, true);
      } else if (interimTranscript) {
        onTranscript(interimTranscript, false);
      }
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      onError(event.error || "Speech recognition error");
    };

    this.recognition.onend = () => {
      this.isListening = false;
      onEnd();
    };

    try {
      this.recognition.start();
    } catch (e: any) {
      onError(e.message || "Failed to start microphone");
    }
  }

  public stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }
}

export const voiceRecognition = new VoiceRecognition();


// ── Part 2: IIT Professor Text-to-Speech (Math Audio Narrator) ───────────

/**
 * Sanitizes markdown and LaTeX equations for natural pedagogical speech.
 */
export function cleanMathForSpeech(text: string): string {
  if (!text) return "";

  let spoken = text;

  // Remove markdown headings, hashes, bullets, and citations
  spoken = spoken.replace(/^#+\s+/gm, '');
  spoken = spoken.replace(/\*\*([^*]+)\*\*/g, '$1');
  spoken = spoken.replace(/\*([^*]+)\*/g, '$1');
  spoken = spoken.replace(/`([^`]+)`/g, '$1');
  spoken = spoken.replace(/\[\^?\d+\]/g, '');
  spoken = spoken.replace(/---/g, ' ');

  // Convert common GATE CS LaTeX symbols to spoken words
  spoken = spoken.replace(/\\Theta/g, 'Theta');
  spoken = spoken.replace(/\\Omega/g, 'Omega');
  spoken = spoken.replace(/\\mathcal\{O\}/g, 'Big O');
  spoken = spoken.replace(/\\mathcal\{([A-Za-z])\}/g, '$1');
  spoken = spoken.replace(/\\approx/g, 'approximately equal to');
  spoken = spoken.replace(/\\le|\\leq/g, 'less than or equal to');
  spoken = spoken.replace(/\\ge|\\geq/g, 'greater than or equal to');
  spoken = spoken.replace(/\\neq/g, 'not equal to');
  spoken = spoken.replace(/\\in/g, 'is an element of');
  spoken = spoken.replace(/\\subset|\\subseteq/g, 'subset of');
  spoken = spoken.replace(/\\times|\\cdot/g, ' multiplied by ');
  spoken = spoken.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 over $2');
  spoken = spoken.replace(/\\sqrt\{([^}]+)\}/g, 'square root of $1');
  spoken = spoken.replace(/\\log_?(\w+)?/g, 'log');
  spoken = spoken.replace(/\\sum_?([^{]+)?\^?([^{]+)?/g, 'summation');
  spoken = spoken.replace(/\\mu\s?s/g, 'microseconds');
  spoken = spoken.replace(/\\mu/g, 'micro');
  spoken = spoken.replace(/\\rightarrow|\\to/g, 'leads to');
  spoken = spoken.replace(/\$([^$]+)\$/g, '$1');
  spoken = spoken.replace(/\\\[([^\\]+)\\\]/g, '$1');

  // Clean remaining backslashes and whitespace
  spoken = spoken.replace(/\\([a-zA-Z]+)/g, '$1');
  spoken = spoken.replace(/\s+/g, ' ').trim();

  return spoken;
}

export class IITProfessorNarrator {
  private synth: SpeechSynthesis | null = null;
  public isSpeaking: boolean = false;
  public isPaused: boolean = false;
  private rate: number = 1.0;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public speak(
    markdownText: string,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: string) => void
  ) {
    if (!this.synth) {
      if (onError) onError("Text-to-speech is not supported in this browser.");
      return;
    }

    // Stop any existing playback
    this.stop();

    const spokenScript = cleanMathForSpeech(markdownText);
    if (!spokenScript.trim()) return;

    // Intro professorial preface
    const fullAudioScript = `Here is the verified conceptual derivation from CALYPSO. ${spokenScript}`;

    const utterance = new SpeechSynthesisUtterance(fullAudioScript);
    utterance.rate = this.rate;
    utterance.pitch = 0.95; // Slightly deeper, academic tone
    utterance.lang = 'en-US';

    // Pick best English voice if available
    const voices = this.synth.getVoices();
    const preferredVoice = voices.find(v => 
      v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Daniel') || v.name.includes('Oliver') || v.name.includes('Alex'))
    ) || voices.find(v => v.lang.startsWith('en'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.isPaused = false;
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.isPaused = false;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      this.isSpeaking = false;
      this.isPaused = false;
      if (onError) onError(e.error || "Speech playback error");
    };

    this.synth.speak(utterance);
  }

  public pause() {
    if (this.synth && this.isSpeaking && !this.isPaused) {
      this.synth.pause();
      this.isPaused = true;
    }
  }

  public resume() {
    if (this.synth && this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
    }
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
      this.isPaused = false;
    }
  }

  public setRate(rate: number) {
    this.rate = rate;
  }
}

export const professorNarrator = new IITProfessorNarrator();
