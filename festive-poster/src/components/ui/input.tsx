import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  id,
  className = '',
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-text-secondary tracking-wide uppercase">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`input-field ${error ? 'border-red-500! focus:border-red-500! focus:ring-red-500/20!' : ''}`}
        {...props}
      />
      {error && (
        <span className="text-xs text-red-400 font-medium mt-0.5">
          {error}
        </span>
      )}
      {!error && helperText && (
        <span className="text-xs text-text-muted mt-0.5">
          {helperText}
        </span>
      )}
    </div>
  );
}
