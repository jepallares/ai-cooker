'use client';

import { useState } from 'react';
import { parseTranscript, type ParsedVoice } from '@/lib/voice';

// Minimal type declarations for the Web Speech API (not yet in standard TS lib)
interface SpeechRecognitionResult { readonly 0: { transcript: string } }
interface SpeechRecognitionResultList { readonly 0: SpeechRecognitionResult }
interface SpeechRecognitionEvent extends Event { readonly results: SpeechRecognitionResultList }
interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart:  (() => void) | null;
  onend:    (() => void) | null;
  onerror:  (() => void) | null;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  start(): void;
}
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SpeechRecognition:       (new () => SpeechRecognitionInstance) | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webkitSpeechRecognition: (new () => SpeechRecognitionInstance) | undefined;
  }
}

type Props = {
  /** Called with the parsed fields and the raw transcript so the form can pre-fill and show confirmation */
  onResult: (parsed: ParsedVoice, transcript: string) => void;
};

/** Microphone button that activates SpeechRecognition and returns parsed pantry fields. */
export default function VoiceButton({ onResult }: Props) {
  const [listening, setListening] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  function start() {
    setError(null);
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) {
      setError('Tu navegador no soporta dictado por voz');
      return;
    }

    const recognition = new SR();
    recognition.lang             = 'es-ES';
    recognition.continuous       = false;
    recognition.interimResults   = false;
    recognition.maxAlternatives  = 1;

    recognition.onstart  = () => setListening(true);
    recognition.onend    = () => setListening(false);
    recognition.onerror  = () => { setListening(false); setError('No se pudo escuchar. Inténtalo de nuevo.'); };
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(parseTranscript(transcript), transcript);
    };

    recognition.start();
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={start}
        disabled={listening}
        title="Dictar producto"
        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
          listening
            ? 'border-red-300 bg-red-50 text-red-600 animate-pulse'
            : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
        }`}
      >
        {/* Microphone SVG */}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
          <rect x="9" y="2" width="6" height="11" rx="3" />
          <path d="M5 10a7 7 0 0014 0M12 19v3M9 22h6" strokeLinecap="round" />
        </svg>
        {listening ? 'Escuchando…' : 'Voz'}
      </button>
      {error && <p className="text-xs text-red-500 text-center">{error}</p>}
    </div>
  );
}
