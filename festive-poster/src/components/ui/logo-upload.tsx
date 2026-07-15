'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';

interface LogoUploadProps {
  value: string | null;
  onChange: (file: File | null) => void;
  onRemove: () => void;
}

export function LogoUpload({ value, onChange, onRemove }: LogoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndProcess(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcess(e.target.files[0]);
    }
  };

  const validateAndProcess = (file: File) => {
    // 2MB Limit
    if (file.size > 2 * 1024 * 1024) {
      alert('Logo file must be smaller than 2MB.');
      return;
    }

    if (!file.type.match('image/png') && !file.type.match('image/jpeg') && !file.type.match('image/svg\\+xml')) {
      alert('Logo must be a PNG, JPG, or SVG.');
      return;
    }

    // Set local preview URL
    const reader = new FileReader();
    reader.onload = () => {
      setLocalPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    onChange(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalPreview(null);
    onRemove();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const currentPreview = localPreview || value;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-text-secondary tracking-wide uppercase">
        Company Logo (Transparent PNG / SVG Preferred)
      </label>

      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className={`relative h-44 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-200 ${
          dragActive
            ? 'border-accent-gold bg-accent-gold/5 scale-[0.99]'
            : 'border-border-subtle hover:border-accent-purple bg-white/5 hover:bg-white/7'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/svg+xml"
          onChange={handleFileChange}
          className="hidden"
        />

        {currentPreview ? (
          <div className="relative w-full h-full flex flex-col items-center justify-center gap-3">
            <div className="relative max-w-[200px] max-h-[100px] w-full h-full flex items-center justify-center">
              <img
                src={currentPreview}
                alt="Logo preview"
                className="max-h-[100px] object-contain rounded"
              />
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-0 right-0 p-1.5 rounded-lg bg-red-950/80 border border-red-500/40 text-red-400 hover:bg-red-900 transition-colors"
              title="Remove logo"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-border-subtle flex items-center justify-center text-text-secondary group-hover:text-text-primary">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">
                Click to upload or drag & drop
              </p>
              <p className="text-xs text-text-muted mt-1">
                PNG, JPG or SVG up to 2MB (1:1 or landscape)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
