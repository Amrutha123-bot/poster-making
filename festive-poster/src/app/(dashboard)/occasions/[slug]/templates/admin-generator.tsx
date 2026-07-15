'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { uploadTemplateIllustration } from './actions';
import { Button } from '@/components/ui/button';

interface AdminGeneratorProps {
  templateId: string;
  templateName: string;
  currentIllustrationUrl: string | null;
}

export function AdminGenerator({
  templateId,
  templateName,
  currentIllustrationUrl,
}: AdminGeneratorProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setStatus(null);

    // Create a local preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setStatus(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await uploadTemplateIllustration(templateId, formData);

      if (res.success) {
        setStatus({
          type: 'success',
          message: `Illustration uploaded and saved successfully!`,
        });
        setSelectedFile(null);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        router.refresh();
      } else {
        setStatus({
          type: 'error',
          message: res.error || 'Failed to upload illustration.',
        });
      }
    } catch (err: any) {
      console.error(err);
      setStatus({
        type: 'error',
        message: err.message || 'An error occurred during upload.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreview(null);
    setStatus(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="mt-3 pt-3 border-t border-border-subtle/50 text-left">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-[11px] font-bold text-accent-gold hover:text-accent-gold/80 transition-colors uppercase tracking-wider select-none"
      >
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
            expanded ? 'rotate-90' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
        </svg>
        <span>Upload Illustration (Admin)</span>
      </button>

      {expanded && (
        <div className="mt-3 flex flex-col gap-3 p-3 rounded-lg bg-black/40 border border-white/5 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Current illustration status */}
          {currentIllustrationUrl && (
            <div className="flex items-center gap-2 p-2 rounded bg-emerald-950/30 border border-emerald-500/20">
              <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-black/30">
                <img
                  src={currentIllustrationUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-emerald-300">
                  Current illustration set
                </p>
                <p className="text-[9px] text-emerald-400/60 truncate">
                  {currentIllustrationUrl}
                </p>
              </div>
            </div>
          )}

          {/* File input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-text-secondary uppercase tracking-wide">
              Upload PNG / JPEG / WebP / SVG
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={handleFileSelect}
              disabled={loading}
              className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-accent-purple/20 file:text-accent-purple hover:file:bg-accent-purple/30 file:cursor-pointer text-text-secondary cursor-pointer"
            />
          </div>

          {/* Local Preview */}
          {preview && (
            <div className="relative rounded-md overflow-hidden border border-white/10 bg-black/30">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-32 object-contain"
              />
              <button
                onClick={handleClear}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500/80 hover:bg-red-500 flex items-center justify-center text-white text-[10px] font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center gap-2">
            <p className="text-[9px] text-text-muted">
              {selectedFile
                ? `${selectedFile.name} (${(selectedFile.size / 1024).toFixed(0)} KB)`
                : 'No file selected'}
            </p>
            <Button
              onClick={handleUpload}
              disabled={loading || !selectedFile}
              isLoading={loading}
              className="text-[10px] py-1.5 px-3 h-auto bg-gradient-to-r from-accent-purple to-accent-pink border-none! text-white"
            >
              Upload & Save
            </Button>
          </div>

          {status && (
            <div
              className={`p-2 rounded text-[10px] font-semibold leading-relaxed border ${
                status.type === 'success'
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-900/30 border-red-500/40 text-red-200'
              }`}
            >
              {status.message}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
