'use client';

import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Company, Template, SIZE_PRESETS, SizeVariant, Poster } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { saveGeneratedPoster } from './actions';

// Dynamically import Konva component with SSR disabled
const FestiveCanvas = dynamic(
  () => import('./festive-canvas').then((mod) => mod.FestiveCanvas),
  { ssr: false }
);

interface PosterEditorProps {
  template: Template & { occasion: any };
  company: Company;
  savedPoster?: Poster;
}

const FONTS_LIST = ['Inter', 'Playfair Display', 'Cinzel', 'Montserrat', 'Lora', 'Caveat'];

export function PosterEditor({ template, company, savedPoster }: PosterEditorProps) {
  const router = useRouter();
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const layout = template.layout_json;
  const logoConfig = layout.elements.find((el) => el.type === 'logo');
  const taglineConfig = layout.elements.find((el) => el.type === 'tagline');
  const titleConfig = layout.elements.find((el) => el.type === 'title');
  const messageConfig = layout.elements.find((el) => el.type === 'message');
  const footerConfig = layout.elements.find((el) => el.type === 'footer');

  const samples = template.occasion.sample_greeting_copy || [];

  // ─── 1. Content states ──────────────────────────────────────────────────
  const [title, setTitle] = useState(
    savedPoster?.title || samples[0]?.title || 'Happy Festive Occasion'
  );
  const [message, setMessage] = useState(
    savedPoster?.message || samples[0]?.message || 'Wishing you and your family a beautiful, joy-filled celebration.'
  );

  // ─── 2. Colors state ────────────────────────────────────────────────────
  const savedColors = savedPoster?.customizations?.colorOverrides
    ? (Object.values(savedPoster.customizations.colorOverrides) as string[])
    : null;
  const [activeColors, setActiveColors] = useState<string[]>(
    savedColors || template.occasion.color_palette || company.brand_colors || ['#8B5CF6', '#FFD700']
  );

  // ─── 3. Logo adjustment states ──────────────────────────────────────────
  const [logoScale, setLogoScale] = useState<number>(
    savedPoster?.customizations?.logo?.scale ?? savedPoster?.customizations?.logoScale ?? 1.0
  );
  const [logoX, setLogoX] = useState<number>(
    savedPoster?.customizations?.logo?.x ?? logoConfig?.x ?? 0.5
  );
  const [logoY, setLogoY] = useState<number>(
    savedPoster?.customizations?.logo?.y ?? logoConfig?.y ?? 0.08
  );

  // ─── 4. Tagline adjustment states ────────────────────────────────────────
  const [taglineX, setTaglineX] = useState<number>(
    savedPoster?.customizations?.tagline?.x ?? taglineConfig?.x ?? 0.5
  );
  const [taglineY, setTaglineY] = useState<number>(
    savedPoster?.customizations?.tagline?.y ?? taglineConfig?.y ?? 0.14
  );
  const [taglineSize, setTaglineSize] = useState<number>(
    savedPoster?.customizations?.tagline?.fontSize ?? taglineConfig?.fontSize ?? 0.016
  );
  const [taglineFont, setTaglineFont] = useState<string>(
    savedPoster?.customizations?.tagline?.fontFamily ?? taglineConfig?.fontFamily ?? 'Inter'
  );
  const [taglineColor, setTaglineColor] = useState<string>(
    savedPoster?.customizations?.tagline?.fill ?? taglineConfig?.fill ?? '#F3F4F6'
  );

  // ─── 5. Title adjustment states ──────────────────────────────────────────
  const [titleX, setTitleX] = useState<number>(
    savedPoster?.customizations?.title?.x ?? titleConfig?.x ?? 0.5
  );
  const [titleY, setTitleY] = useState<number>(
    savedPoster?.customizations?.title?.y ?? titleConfig?.y ?? 0.26
  );
  const [titleSize, setTitleSize] = useState<number>(
    savedPoster?.customizations?.title?.fontSize ?? titleConfig?.fontSize ?? 0.065
  );
  const [titleFont, setTitleFont] = useState<string>(
    savedPoster?.customizations?.title?.fontFamily ?? titleConfig?.fontFamily ?? 'Playfair Display'
  );
  const [titleColor, setTitleColor] = useState<string>(
    savedPoster?.customizations?.title?.fill ?? titleConfig?.fill ?? '#FFD700'
  );

  // ─── 6. Message adjustment states ────────────────────────────────────────
  const [messageX, setMessageX] = useState<number>(
    savedPoster?.customizations?.message?.x ?? messageConfig?.x ?? 0.5
  );
  const [messageY, setMessageY] = useState<number>(
    savedPoster?.customizations?.message?.y ?? messageConfig?.y ?? 0.38
  );
  const [messageSize, setMessageSize] = useState<number>(
    savedPoster?.customizations?.message?.fontSize ?? messageConfig?.fontSize ?? 0.024
  );
  const [messageFont, setMessageFont] = useState<string>(
    savedPoster?.customizations?.message?.fontFamily ?? messageConfig?.fontFamily ?? 'Inter'
  );
  const [messageColor, setMessageColor] = useState<string>(
    savedPoster?.customizations?.message?.fill ?? messageConfig?.fill ?? '#F9FAFB'
  );

  // ─── 7. Footer adjustment states ─────────────────────────────────────────
  const [footerX, setFooterX] = useState<number>(
    savedPoster?.customizations?.footer?.x ?? footerConfig?.x ?? 0.5
  );
  const [footerY, setFooterY] = useState<number>(
    savedPoster?.customizations?.footer?.y ?? footerConfig?.y ?? 0.94
  );
  const [footerSize, setFooterSize] = useState<number>(
    savedPoster?.customizations?.footer?.fontSize ?? footerConfig?.fontSize ?? 0.018
  );
  const [footerFont, setFooterFont] = useState<string>(
    savedPoster?.customizations?.footer?.fontFamily ?? footerConfig?.fontFamily ?? 'Inter'
  );
  const [footerColor, setFooterColor] = useState<string>(
    savedPoster?.customizations?.footer?.fill ?? footerConfig?.fill ?? '#FFD700'
  );

  // Contact fields visibility
  const [visibleFields, setVisibleFields] = useState<string[]>(
    savedPoster?.customizations?.visibleContactFields || ['website', 'email', 'phone']
  );

  // Active accordion section
  const [openSection, setOpenSection] = useState<string | null>('logo');

  // Resize and size preset states
  const [selectedSize, setSelectedSize] = useState<SizeVariant>(SIZE_PRESETS[0]);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 500, height: 500 });
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Calculate size to fit container bounding box
  const updateCanvasDimensions = () => {
    if (!containerRef.current) return;
    const padding = 32;
    const maxWidth = containerRef.current.clientWidth - padding;
    const maxHeight = window.innerHeight - 300;

    const targetRatio = selectedSize.width / selectedSize.height;

    let w = maxWidth;
    let h = w / targetRatio;

    if (h > maxHeight) {
      h = maxHeight;
      w = h * targetRatio;
    }

    setCanvasDimensions({
      width: Math.max(w, 280),
      height: Math.max(h, 280),
    });
  };

  useEffect(() => {
    updateCanvasDimensions();
    window.addEventListener('resize', updateCanvasDimensions);
    return () => window.removeEventListener('resize', updateCanvasDimensions);
  }, [selectedSize]);

  // Load sample template texts
  const applySampleText = (idx: number) => {
    if (samples[idx]) {
      setTitle(samples[idx].title);
      setMessage(samples[idx].message);
    }
  };

  const toggleField = (field: string) => {
    if (visibleFields.includes(field)) {
      setVisibleFields(visibleFields.filter((f) => f !== field));
    } else {
      setVisibleFields([...visibleFields, field]);
    }
  };

  // Trigger export
  const handleExport = (format: 'png' | 'jpeg') => {
    if (!stageRef.current) return;

    const ratio = selectedSize.width / canvasDimensions.width;
    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';

    const dataUrl = stageRef.current.toDataURL({
      pixelRatio: ratio,
      mimeType: mimeType,
      quality: 0.95,
    });

    const link = document.createElement('a');
    link.download = `${template.occasion.slug}_poster_${selectedSize.name.toLowerCase().replace(' ', '_')}.${format}`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Save changes to Supabase
  const handleSaveToHistory = async () => {
    if (!stageRef.current) return;
    setIsSaving(true);
    setStatusMsg(null);

    try {
      const ratio = 1080 / canvasDimensions.width;
      const dataUrl = stageRef.current.toDataURL({
        pixelRatio: ratio,
        mimeType: 'image/png',
      });
      const base64Image = dataUrl.split(',')[1];

      const colorOverrides: Record<string, string> = {};
      activeColors.forEach((c, i) => {
        colorOverrides[`color_${i}`] = c;
      });

      const customizations = {
        colorOverrides,
        visibleContactFields: visibleFields,
        logo: {
          scale: logoScale,
          x: logoX,
          y: logoY,
        },
        tagline: {
          x: taglineX,
          y: taglineY,
          fontSize: taglineSize,
          fontFamily: taglineFont,
          fill: taglineColor,
        },
        title: {
          x: titleX,
          y: titleY,
          fontSize: titleSize,
          fontFamily: titleFont,
          fill: titleColor,
        },
        message: {
          x: messageX,
          y: messageY,
          fontSize: messageSize,
          fontFamily: messageFont,
          fill: messageColor,
        },
        footer: {
          x: footerX,
          y: footerY,
          fontSize: footerSize,
          fontFamily: footerFont,
          fill: footerColor,
        },
      };

      const result = await saveGeneratedPoster({
        templateId: template.id,
        occasionId: template.occasion_id,
        title,
        message,
        customizations,
        base64Image,
      });

      if (result.success) {
        setStatusMsg({
          type: 'success',
          text: 'Poster customizations saved to History successfully!',
        });

        router.refresh();
        setTimeout(() => {
          router.push('/history');
        }, 1500);
      } else {
        setStatusMsg({
          type: 'error',
          text: result.error || 'Failed to save poster customization.',
        });
      }
    } catch (err: any) {
      console.error(err);
      setStatusMsg({
        type: 'error',
        text: err.message || 'An error occurred during save.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start h-full pb-8">
      {/* ─── LEFT COLUMN: Canvas Live Preview Area ─── */}
      <div className="lg:col-span-7 flex flex-col gap-5 items-center w-full" ref={containerRef}>
        <div className="flex justify-between items-center w-full max-w-lg border-b border-border-subtle pb-3">
          <Link
            href={`/occasions/${template.occasion.slug}/templates`}
            className="text-xs font-medium text-text-secondary hover:text-accent-gold flex items-center gap-1 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Change Template
          </Link>
          <span className="text-xs font-semibold text-accent-gold uppercase tracking-wider font-mono">
            {selectedSize.name} ({selectedSize.width}x{selectedSize.height})
          </span>
        </div>

        {/* Dynamic Canvas with reactive states */}
        <div className="flex items-center justify-center min-h-[300px] w-full py-4 relative bg-black/20 rounded-xl border border-white/5">
          <FestiveCanvas
            stageRef={stageRef}
            width={canvasDimensions.width}
            height={canvasDimensions.height}
            company={company}
            template={template}
            title={title}
            message={message}
            colors={activeColors}
            visibleFields={visibleFields}

            // Logo Customizations
            logoScale={logoScale}
            logoX={logoX}
            logoY={logoY}
            onUpdateLogo={(attrs) => {
              if (attrs.x !== undefined) setLogoX(attrs.x);
              if (attrs.y !== undefined) setLogoY(attrs.y);
            }}

            // Tagline Customizations
            taglineX={taglineX}
            taglineY={taglineY}
            taglineSize={taglineSize}
            taglineFont={taglineFont}
            taglineColor={taglineColor}
            onUpdateTagline={(attrs) => {
              if (attrs.x !== undefined) setTaglineX(attrs.x);
              if (attrs.y !== undefined) setTaglineY(attrs.y);
            }}

            // Title Customizations
            titleX={titleX}
            titleY={titleY}
            titleSize={titleSize}
            titleFont={titleFont}
            titleColor={titleColor}
            onUpdateTitle={(attrs) => {
              if (attrs.x !== undefined) setTitleX(attrs.x);
              if (attrs.y !== undefined) setTitleY(attrs.y);
            }}

            // Message Customizations
            messageX={messageX}
            messageY={messageY}
            messageSize={messageSize}
            messageFont={messageFont}
            messageColor={messageColor}
            onUpdateMessage={(attrs) => {
              if (attrs.x !== undefined) setMessageX(attrs.x);
              if (attrs.y !== undefined) setMessageY(attrs.y);
            }}

            // Footer Customizations
            footerX={footerX}
            footerY={footerY}
            footerSize={footerSize}
            footerFont={footerFont}
            footerColor={footerColor}
            onUpdateFooter={(attrs) => {
              if (attrs.x !== undefined) setFooterX(attrs.x);
              if (attrs.y !== undefined) setFooterY(attrs.y);
            }}
          />
        </div>

        {/* Presets sizes toggles */}
        <div className="flex gap-2 p-1.5 bg-white/5 border border-border-subtle rounded-xl max-w-md w-full justify-between backdrop-blur-sm mt-2">
          {SIZE_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => setSelectedSize(preset)}
              className={`flex-1 text-center py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-150 ${
                selectedSize.name === preset.name
                  ? 'bg-accent-purple/20 border border-accent-purple/30 text-accent-gold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5 border border-transparent'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* ─── RIGHT COLUMN: Controls Panel ─── */}
      <div className="lg:col-span-5 flex flex-col gap-6 max-h-[85vh] overflow-y-auto pr-1">
        <Card glow={true}>
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-lg font-bold text-text-primary">
                {savedPoster ? 'Edit Saved Poster' : 'Customize Poster'}
              </h2>
              <p className="text-text-secondary text-xs mt-1">
                Drag layers directly on the poster preview, or use layout controls below to adjust details.
              </p>
            </div>

            {statusMsg && (
              <div
                className={`p-4 rounded-lg border text-xs font-medium ${
                  statusMsg.type === 'success'
                    ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                    : 'bg-red-900/30 border-red-500/40 text-red-200'
                }`}
              >
                {statusMsg.text}
              </div>
            )}

            {/* Accordion List */}
            <div className="flex flex-col gap-3">
              {/* Presets copywriting suggestions */}
              {samples.length > 0 && (
                <div className="border border-white/5 bg-black/10 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection('presets')}
                    className="w-full flex justify-between items-center p-3 text-xs font-semibold text-text-primary bg-white/5 hover:bg-white/10"
                  >
                    <span>Greeting Text Presets</span>
                    <span className="text-accent-gold">{openSection === 'presets' ? '▲' : '▼'}</span>
                  </button>
                  {openSection === 'presets' && (
                    <div className="p-3 flex flex-col gap-2 bg-black/20">
                      {samples.map((s: any, idx: number) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => applySampleText(idx)}
                          className="w-full text-left p-2.5 rounded-lg bg-white/5 border border-border-subtle hover:border-accent-purple/40 hover:bg-white/7 transition-all text-xs flex flex-col gap-1"
                        >
                          <strong className="text-accent-gold font-semibold">{s.title}</strong>
                          <span className="text-text-secondary line-clamp-1">{s.message}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Text contents block */}
              <div className="border border-white/5 bg-black/10 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleSection('text-content')}
                  className="w-full flex justify-between items-center p-3 text-xs font-semibold text-text-primary bg-white/5 hover:bg-white/10"
                >
                  <span>Edit Text Content</span>
                  <span className="text-accent-gold">{openSection === 'text-content' ? '▲' : '▼'}</span>
                </button>
                {openSection === 'text-content' && (
                  <div className="p-3 flex flex-col gap-4 bg-black/20">
                    <Input
                      label="Greeting Title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      maxLength={45}
                      placeholder="e.g. Happy Diwali"
                      disabled={isSaving}
                    />
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-text-secondary tracking-wide uppercase">
                        Greeting Message
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        maxLength={180}
                        rows={3}
                        className="input-field resize-none leading-relaxed"
                        placeholder="Enter greeting card details..."
                        disabled={isSaving}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Logo adjustment controls */}
              {logoConfig && (
                <div className="border border-white/5 bg-black/10 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection('logo')}
                    className="w-full flex justify-between items-center p-3 text-xs font-semibold text-text-primary bg-white/5 hover:bg-white/10"
                  >
                    <span>Branding Logo Layer</span>
                    <span className="text-accent-gold">{openSection === 'logo' ? '▲' : '▼'}</span>
                  </button>
                  {openSection === 'logo' && (
                    <div className="p-3 flex flex-col gap-3.5 bg-black/20 text-xs text-text-secondary">
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between font-medium">
                          <span>Scale Size</span>
                          <span className="font-mono text-accent-gold">{Math.round(logoScale * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.2"
                          max="2.5"
                          step="0.05"
                          value={logoScale}
                          onChange={(e) => setLogoScale(parseFloat(e.target.value))}
                          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent-gold"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-[10px] uppercase">X Position</span>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={logoX}
                            onChange={(e) => setLogoX(parseFloat(e.target.value))}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-[10px] uppercase">Y Position</span>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={logoY}
                            onChange={(e) => setLogoY(parseFloat(e.target.value))}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tagline adjustments */}
              {company.tagline && taglineConfig && (
                <div className="border border-white/5 bg-black/10 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection('tagline')}
                    className="w-full flex justify-between items-center p-3 text-xs font-semibold text-text-primary bg-white/5 hover:bg-white/10"
                  >
                    <span>Tagline Text Layer</span>
                    <span className="text-accent-gold">{openSection === 'tagline' ? '▲' : '▼'}</span>
                  </button>
                  {openSection === 'tagline' && (
                    <div className="p-3 flex flex-col gap-3.5 bg-black/20 text-xs text-text-secondary">
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between font-medium">
                          <span>Font Size</span>
                          <span className="font-mono text-accent-gold">{Math.round(taglineSize * 1000)}pt</span>
                        </div>
                        <input
                          type="range"
                          min="0.005"
                          max="0.06"
                          step="0.001"
                          value={taglineSize}
                          onChange={(e) => setTaglineSize(parseFloat(e.target.value))}
                          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent-gold"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-[10px] uppercase">Font Family</span>
                          <select
                            value={taglineFont}
                            onChange={(e) => setTaglineFont(e.target.value)}
                            className="w-full p-1.5 bg-white/5 border border-white/10 rounded text-xs text-text-primary"
                          >
                            {FONTS_LIST.map((f) => (
                              <option key={f} value={f} className="bg-bg-primary text-text-primary">{f}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-[10px] uppercase">Font Color</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={taglineColor}
                              onChange={(e) => setTaglineColor(e.target.value)}
                              className="w-8 h-8 rounded border border-white/10 cursor-pointer p-0 bg-transparent"
                            />
                            <span className="font-mono text-[10px] text-text-muted">{taglineColor}</span>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-[10px] uppercase">X Position</span>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={taglineX}
                            onChange={(e) => setTaglineX(parseFloat(e.target.value))}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-[10px] uppercase">Y Position</span>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={taglineY}
                            onChange={(e) => setTaglineY(parseFloat(e.target.value))}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Title adjustments */}
              {titleConfig && (
                <div className="border border-white/5 bg-black/10 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection('title')}
                    className="w-full flex justify-between items-center p-3 text-xs font-semibold text-text-primary bg-white/5 hover:bg-white/10"
                  >
                    <span>Greeting Title Layer</span>
                    <span className="text-accent-gold">{openSection === 'title' ? '▲' : '▼'}</span>
                  </button>
                  {openSection === 'title' && (
                    <div className="p-3 flex flex-col gap-3.5 bg-black/20 text-xs text-text-secondary">
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between font-medium">
                          <span>Font Size</span>
                          <span className="font-mono text-accent-gold">{Math.round(titleSize * 1000)}pt</span>
                        </div>
                        <input
                          type="range"
                          min="0.02"
                          max="0.15"
                          step="0.002"
                          value={titleSize}
                          onChange={(e) => setTitleSize(parseFloat(e.target.value))}
                          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent-gold"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-[10px] uppercase">Font Family</span>
                          <select
                            value={titleFont}
                            onChange={(e) => setTitleFont(e.target.value)}
                            className="w-full p-1.5 bg-white/5 border border-white/10 rounded text-xs text-text-primary"
                          >
                            {FONTS_LIST.map((f) => (
                              <option key={f} value={f} className="bg-bg-primary text-text-primary">{f}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-[10px] uppercase">Font Color</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={titleColor}
                              onChange={(e) => setTitleColor(e.target.value)}
                              className="w-8 h-8 rounded border border-white/10 cursor-pointer p-0 bg-transparent"
                            />
                            <span className="font-mono text-[10px] text-text-muted">{titleColor}</span>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-[10px] uppercase">X Position</span>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={titleX}
                            onChange={(e) => setTitleX(parseFloat(e.target.value))}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-[10px] uppercase">Y Position</span>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={titleY}
                            onChange={(e) => setTitleY(parseFloat(e.target.value))}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Message adjustments */}
              {messageConfig && (
                <div className="border border-white/5 bg-black/10 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection('message')}
                    className="w-full flex justify-between items-center p-3 text-xs font-semibold text-text-primary bg-white/5 hover:bg-white/10"
                  >
                    <span>Message Text Layer</span>
                    <span className="text-accent-gold">{openSection === 'message' ? '▲' : '▼'}</span>
                  </button>
                  {openSection === 'message' && (
                    <div className="p-3 flex flex-col gap-3.5 bg-black/20 text-xs text-text-secondary">
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between font-medium">
                          <span>Font Size</span>
                          <span className="font-mono text-accent-gold">{Math.round(messageSize * 1000)}pt</span>
                        </div>
                        <input
                          type="range"
                          min="0.01"
                          max="0.08"
                          step="0.001"
                          value={messageSize}
                          onChange={(e) => setMessageSize(parseFloat(e.target.value))}
                          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent-gold"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-[10px] uppercase">Font Family</span>
                          <select
                            value={messageFont}
                            onChange={(e) => setMessageFont(e.target.value)}
                            className="w-full p-1.5 bg-white/5 border border-white/10 rounded text-xs text-text-primary"
                          >
                            {FONTS_LIST.map((f) => (
                              <option key={f} value={f} className="bg-bg-primary text-text-primary">{f}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-[10px] uppercase">Font Color</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={messageColor}
                              onChange={(e) => setMessageColor(e.target.value)}
                              className="w-8 h-8 rounded border border-white/10 cursor-pointer p-0 bg-transparent"
                            />
                            <span className="font-mono text-[10px] text-text-muted">{messageColor}</span>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-[10px] uppercase">X Position</span>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={messageX}
                            onChange={(e) => setMessageX(parseFloat(e.target.value))}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-[10px] uppercase">Y Position</span>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={messageY}
                            onChange={(e) => setMessageY(parseFloat(e.target.value))}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Footer adjustments */}
              {footerConfig && (
                <div className="border border-white/5 bg-black/10 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection('footer')}
                    className="w-full flex justify-between items-center p-3 text-xs font-semibold text-text-primary bg-white/5 hover:bg-white/10"
                  >
                    <span>Contact Footer Layer</span>
                    <span className="text-accent-gold">{openSection === 'footer' ? '▲' : '▼'}</span>
                  </button>
                  {openSection === 'footer' && (
                    <div className="p-3 flex flex-col gap-3.5 bg-black/20 text-xs text-text-secondary">
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between font-medium">
                          <span>Font Size</span>
                          <span className="font-mono text-accent-gold">{Math.round(footerSize * 1000)}pt</span>
                        </div>
                        <input
                          type="range"
                          min="0.005"
                          max="0.05"
                          step="0.001"
                          value={footerSize}
                          onChange={(e) => setFooterSize(parseFloat(e.target.value))}
                          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent-gold"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-[10px] uppercase">Font Family</span>
                          <select
                            value={footerFont}
                            onChange={(e) => setFooterFont(e.target.value)}
                            className="w-full p-1.5 bg-white/5 border border-white/10 rounded text-xs text-text-primary"
                          >
                            {FONTS_LIST.map((f) => (
                              <option key={f} value={f} className="bg-bg-primary text-text-primary">{f}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-[10px] uppercase">Font Color</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={footerColor}
                              onChange={(e) => setFooterColor(e.target.value)}
                              className="w-8 h-8 rounded border border-white/10 cursor-pointer p-0 bg-transparent"
                            />
                            <span className="font-mono text-[10px] text-text-muted">{footerColor}</span>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-[10px] uppercase">X Position</span>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={footerX}
                            onChange={(e) => setFooterX(parseFloat(e.target.value))}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-[10px] uppercase">Y Position</span>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={footerY}
                            onChange={(e) => setFooterY(parseFloat(e.target.value))}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Contact fields selectors */}
                      <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-white/5">
                        <span className="text-[10px] uppercase font-semibold text-text-secondary">
                          Toggle Visible Contact Details
                        </span>
                        <div className="flex flex-wrap gap-4 mt-1">
                          {[
                            { key: 'website', label: 'Website' },
                            { key: 'email', label: 'Email' },
                            { key: 'phone', label: 'Phone' },
                          ].map((field) => (
                            <label key={field.key} className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={visibleFields.includes(field.key)}
                                onChange={() => toggleField(field.key)}
                                className="rounded border-border-subtle text-accent-purple focus:ring-accent-purple bg-white/5 cursor-pointer"
                                disabled={isSaving}
                              />
                              <span>{field.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Exporting & Persistence Actions */}
            <div className="border-t border-border-subtle pt-6 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                  History Dashboard Sync
                </span>
                <Button
                  onClick={handleSaveToHistory}
                  variant="primary"
                  isLoading={isSaving}
                  className="w-full py-3 bg-gradient-to-r from-accent-purple to-accent-pink hover:from-accent-purple/80 hover:to-accent-pink/80 border-none! text-white text-xs"
                >
                  Save to History Dashboard
                </Button>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                  Direct Local Download (High-Res Render)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={() => handleExport('png')} variant="secondary" disabled={isSaving} className="text-xs">
                    Download PNG
                  </Button>
                  <Button onClick={() => handleExport('jpeg')} variant="secondary" disabled={isSaving} className="text-xs">
                    Download JPG
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
