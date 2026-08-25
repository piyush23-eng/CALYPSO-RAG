/**
 * Neural Voice Engine for CALYPSO-RAG.
 * Implements:
 * 1. Web Speech API Speech-to-Text for live voice queries.
 * 2. Neural Audio Walkthrough via /api/voice/synthesize
 *    (featuring structured unit pronunciation, formula reading, and intonation).
 */


const API_BASE = import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined' && window.location.port === '5173'
    ? 'http://localhost:8000'
    : ''
);

export type VoicePersona = 
  | 'en-IN-PrabhatNeural'      // Natural Indian English
  | 'en-US-ChristopherNeural' // Natural American English (Deep)
  | 'en-GB-RyanNeural'        // Natural British English
  | 'en-US-JennyNeural';      // Natural American English (Clear)

export const VOICE_OPTIONS: { id: VoicePersona; label: string; tag: string }[] = [
  { id: 'en-IN-PrabhatNeural', label: 'Prabhat (Indian)', tag: 'Natural Indian English' },
  { id: 'en-US-ChristopherNeural', label: 'Christopher (US)', tag: 'Natural American English' },
  { id: 'en-GB-RyanNeural', label: 'Ryan (UK)', tag: 'Natural British English' },
  { id: 'en-US-JennyNeural', label: 'Jenny (US)', tag: 'Clear American English' }
];


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


// ── Part 2: Studio-Grade Neural Human Audio Player ──────────────────────

export class IITProfessorNarrator {
  private audioElement: HTMLAudioElement | null = null;
  private currentAudioUrl: string | null = null;
  public isSpeaking: boolean = false;
  public isPaused: boolean = false;
  public isLoading: boolean = false;
  private rate: number = 1.0;
  private currentVoice: VoicePersona = 'en-IN-PrabhatNeural';

  public async speak(
    markdownText: string,
    voice: VoicePersona = 'en-IN-PrabhatNeural',
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: string) => void
  ) {
    // Stop any active audio
    this.stop();

    this.currentVoice = voice;
    this.isLoading = true;

    try {
      // Request neural human MP3 synthesis from backend
      const response = await fetch(`${API_BASE}/api/voice/synthesize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: markdownText,
          voice: this.currentVoice
        })
      });

      if (!response.ok) {
        throw new Error(`TTS synthesis returned status ${response.status}`);
      }

      const audioBlob = await response.blob();
      this.currentAudioUrl = URL.createObjectURL(audioBlob);

      this.audioElement = new Audio(this.currentAudioUrl);
      this.audioElement.playbackRate = this.rate;

      this.audioElement.onplay = () => {
        this.isSpeaking = true;
        this.isPaused = false;
        this.isLoading = false;
        if (onStart) onStart();
      };

      this.audioElement.onpause = () => {
        if (!this.audioElement?.ended) {
          this.isPaused = true;
        }
      };

      this.audioElement.onended = () => {
        this.isSpeaking = false;
        this.isPaused = false;
        this.isLoading = false;
        if (onEnd) onEnd();
      };

      this.audioElement.onerror = () => {
        this.isSpeaking = false;
        this.isPaused = false;
        this.isLoading = false;
        if (onError) onError("Failed to play audio stream.");
      };

      await this.audioElement.play();
    } catch (err: any) {
      this.isSpeaking = false;
      this.isPaused = false;
      this.isLoading = false;
      if (onError) onError(err.message || "Neural audio synthesis error");
    }
  }

  public pause() {
    if (this.audioElement && this.isSpeaking) {
      this.audioElement.pause();
      this.isPaused = true;
    }
  }

  public resume() {
    if (this.audioElement && this.isPaused) {
      this.audioElement.play();
      this.isPaused = false;
    }
  }

  public stop() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      this.audioElement = null;
    }
    if (this.currentAudioUrl) {
      URL.revokeObjectURL(this.currentAudioUrl);
      this.currentAudioUrl = null;
    }
    this.isSpeaking = false;
    this.isPaused = false;
    this.isLoading = false;
  }

  public setRate(rate: number) {
    this.rate = rate;
    if (this.audioElement) {
      this.audioElement.playbackRate = rate;
    }
  }

  public setVoice(voice: VoicePersona) {
    this.currentVoice = voice;
  }

  public getVoice(): VoicePersona {
    return this.currentVoice;
  }
}

export const professorNarrator = new IITProfessorNarrator();
