'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { ImagePlus, Loader2, X } from 'lucide-react';

interface ImageUploadProps {
  label?: string;
  value?: string | null;
  onChange: (url: string | null) => void;
  aspect?: 'square' | 'wide';
}

export function ImageUpload({ label, value, onChange, aspect = 'square' }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Falha ao enviar imagem.');
      return;
    }
    onChange(data.url);
  }

  return (
    <div>
      {label && <p className="mb-1.5 text-sm font-medium text-slate-300">{label}</p>}
      <div
        className={`relative flex ${
          aspect === 'square' ? 'h-28 w-28' : 'h-24 w-48'
        } items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-night-850`}
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        ) : value ? (
          <>
            <Image src={value} alt={label || 'Imagem'} fill className="object-contain" />
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-slate-400 shadow hover:text-rose-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-brand-600"
          >
            <ImagePlus className="h-5 w-5" />
            <span className="text-xs">Enviar</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
      {!value && !loading && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-1 text-xs font-medium text-brand-600 hover:underline"
        >
          Escolher arquivo
        </button>
      )}
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
