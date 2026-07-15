'use client';

import React, { useEffect, useState } from 'react';
import { Stage, Layer, Rect, Text, Image as KonvaImage } from 'react-konva';
import { Company, Template } from '@/types/database';

interface FestiveCanvasProps {
  stageRef: React.RefObject<any>;
  width: number;
  height: number;
  company: Company;
  template: Template & { occasion: any };
  title: string;
  message: string;
  colors: string[];
  visibleFields: string[];

  // Logo customizations
  logoScale: number;
  logoX: number;
  logoY: number;
  onUpdateLogo: (attrs: { scale?: number; x?: number; y?: number }) => void;

  // Tagline customizations
  taglineX: number;
  taglineY: number;
  taglineSize: number;
  taglineFont: string;
  taglineColor: string;
  onUpdateTagline: (attrs: { x?: number; y?: number; fontSize?: number; fontFamily?: string; fill?: string }) => void;

  // Title customizations
  titleX: number;
  titleY: number;
  titleSize: number;
  titleFont: string;
  titleColor: string;
  onUpdateTitle: (attrs: { x?: number; y?: number; fontSize?: number; fontFamily?: string; fill?: string }) => void;

  // Message customizations
  messageX: number;
  messageY: number;
  messageSize: number;
  messageFont: string;
  messageColor: string;
  onUpdateMessage: (attrs: { x?: number; y?: number; fontSize?: number; fontFamily?: string; fill?: string }) => void;

  // Footer customizations
  footerX: number;
  footerY: number;
  footerSize: number;
  footerFont: string;
  footerColor: string;
  onUpdateFooter: (attrs: { x?: number; y?: number; fontSize?: number; fontFamily?: string; fill?: string }) => void;
}

// Hook to load image asynchronously with CORS anonymous setup
function useCanvasImage(src: string | null) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!src) {
      setImage(null);
      return;
    }

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    img.onload = () => {
      setImage(img);
    };
    img.onerror = () => {
      console.error('Failed to load image at source:', src);
      setImage(null);
    };
  }, [src]);

  return image;
}

// Map selected font family names to actual CSS variables
const resolveFontFamily = (fontFamily?: string) => {
  if (!fontFamily) return 'var(--font-sans)';
  const fontMap: Record<string, string> = {
    'Inter': 'var(--font-inter), sans-serif',
    'Playfair Display': 'var(--font-playfair), serif',
    'Cinzel': 'var(--font-cinzel), serif',
    'Montserrat': 'var(--font-montserrat), sans-serif',
    'Lora': 'var(--font-lora), serif',
    'Caveat': 'var(--font-caveat), cursive',
  };
  return fontMap[fontFamily] || fontFamily;
};

// Text readability drop shadow configuration
const READABILITY_SHADOW = {
  shadowColor: '#000000',
  shadowBlur: 10,
  shadowOpacity: 0.9,
  shadowOffset: { x: 1.5, y: 1.5 },
};

export function FestiveCanvas({
  stageRef,
  width,
  height,
  company,
  template,
  title,
  message,
  colors,
  visibleFields,

  // Logo customizations
  logoScale,
  logoX,
  logoY,
  onUpdateLogo,

  // Tagline customizations
  taglineX,
  taglineY,
  taglineSize,
  taglineFont,
  taglineColor,
  onUpdateTagline,

  // Title customizations
  titleX,
  titleY,
  titleSize,
  titleFont,
  titleColor,
  onUpdateTitle,

  // Message customizations
  messageX,
  messageY,
  messageSize,
  messageFont,
  messageColor,
  onUpdateMessage,

  // Footer customizations
  footerX,
  footerY,
  footerSize,
  footerFont,
  footerColor,
  onUpdateFooter,
}: FestiveCanvasProps) {
  const layout = template.layout_json;

  // Dynamic image loaders
  const logoImg = useCanvasImage(company.logo_url);
  const illustrationImg = useCanvasImage(
    template.illustration_asset_url || null
  );

  // Dimensions scaling factor (scales elements relative to Stage width)
  const scale = width;

  // Find element configurations from layout Json to check if they are supported by this template
  const logoConfig = layout.elements.find((el) => el.type === 'logo');
  const taglineConfig = layout.elements.find((el) => el.type === 'tagline');
  const titleConfig = layout.elements.find((el) => el.type === 'title');
  const messageConfig = layout.elements.find((el) => el.type === 'message');
  const footerConfig = layout.elements.find((el) => el.type === 'footer');

  // Load decorative motifs if any
  const [motifImages, setMotifImages] = useState<Record<string, HTMLImageElement>>({});

  useEffect(() => {
    if (layout.decorations) {
      layout.decorations.forEach((dec) => {
        const path = dec.asset;
        if (!motifImages[dec.asset]) {
          const img = new window.Image();
          img.crossOrigin = 'anonymous';
          img.src = path;
          img.onload = () => {
            setMotifImages((prev) => ({ ...prev, [dec.asset]: img }));
          };
        }
      });
    }
  }, [layout.decorations]);

  // Compute full-bleed "cover" crop for illustration (object-fit: cover)
  let imgX = 0;
  let imgY = 0;
  let imgW = width;
  let imgH = height;

  if (illustrationImg) {
    const imgRatio = illustrationImg.naturalWidth / illustrationImg.naturalHeight;
    const canvasRatio = width / height;

    if (imgRatio > canvasRatio) {
      // Image is wider than canvas -> scale by height, crop horizontally
      imgH = height;
      imgW = height * imgRatio;
      imgX = -(imgW - width) / 2;
      imgY = 0;
    } else {
      // Image is taller than canvas -> scale by width, crop vertically
      imgW = width;
      imgH = width / imgRatio;
      imgX = 0;
      imgY = -(imgH - height) / 2;
    }
  }

  // Hover cursor setters for draggable elements
  const handleMouseEnter = (e: any) => {
    const stage = e.target.getStage();
    if (stage) stage.container().style.cursor = 'move';
  };

  const handleMouseLeave = (e: any) => {
    const stage = e.target.getStage();
    if (stage) stage.container().style.cursor = 'default';
  };

  return (
    <Stage ref={stageRef} width={width} height={height} className="rounded-lg shadow-2xl overflow-hidden border border-border-subtle">
      <Layer>
        {/* ═══════════════════════════════════════════════════════════════════
            1. FULL-BLEED BACKGROUND ILLUSTRATION
            Fills the entire canvas, cropped/scaled to cover all space
        ═══════════════════════════════════════════════════════════════════ */}
        {illustrationImg ? (
          <KonvaImage
            image={illustrationImg}
            x={imgX}
            y={imgY}
            width={imgW}
            height={imgH}
          />
        ) : (
          <Rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill="#120A24"
          />
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            2. DECORATIVE MOTIFS
        ═══════════════════════════════════════════════════════════════════ */}
        {layout.decorations?.map((dec, idx) => {
          const img = motifImages[dec.asset];
          if (!img) return null;

          const w = (dec.width || 0.15) * width;
          const h = (dec.height || 0.2) * height;

          let posX = 0;
          let posY = 0;
          let rot = 0;

          switch (dec.position) {
            case 'top-left':
              posX = 0;
              posY = 0;
              break;
            case 'top-right':
              posX = width;
              posY = 0;
              rot = 90;
              break;
            case 'top-center':
              posX = width / 2;
              posY = 0;
              break;
            case 'bottom-left':
              posX = 0;
              posY = height;
              break;
            case 'bottom-right':
              posX = width;
              posY = height;
              break;
          }

          return (
            <KonvaImage
              key={idx}
              image={img}
              x={posX}
              y={posY}
              width={w}
              height={h}
              offsetX={dec.position === 'top-right' || dec.position === 'bottom-right' ? w : dec.position === 'top-center' ? w / 2 : 0}
              offsetY={dec.position === 'bottom-left' || dec.position === 'bottom-right' ? h : 0}
              opacity={dec.opacity || 0.8}
            />
          );
        })}

        {/* ═══════════════════════════════════════════════════════════════════
            3. COMPANY LOGO LAYER (Draggable & Scalable)
        ═══════════════════════════════════════════════════════════════════ */}
        {logoImg && logoConfig && (
          <KonvaImage
            image={logoImg}
            x={logoX * width}
            y={logoY * height}
            width={(logoConfig.width || 0.16) * width * logoScale}
            height={(logoConfig.height || 0.08) * height * logoScale}
            offsetX={((logoConfig.width || 0.16) * width * logoScale) / 2}
            offsetY={((logoConfig.height || 0.08) * height * logoScale) / 2}
            draggable
            onDragEnd={(e) => {
              const node = e.target;
              onUpdateLogo({
                x: node.x() / width,
                y: node.y() / height,
              });
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            shadowColor="#000000"
            shadowBlur={10}
            shadowOpacity={0.65}
            shadowOffset={{ x: 1, y: 1 }}
          />
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            4. COMPANY TAGLINE LAYER (Draggable & Stylable)
        ═══════════════════════════════════════════════════════════════════ */}
        {company.tagline && taglineConfig && (
          <Text
            text={company.tagline}
            x={taglineX * width}
            y={taglineY * height}
            width={width * 0.8}
            offsetX={(width * 0.8) / 2}
            align="center"
            fontSize={taglineSize * scale}
            fontFamily={resolveFontFamily(taglineFont)}
            fill={taglineColor}
            draggable
            onDragEnd={(e) => {
              const node = e.target;
              onUpdateTagline({
                x: node.x() / width,
                y: node.y() / height,
              });
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            {...READABILITY_SHADOW}
          />
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            5. GREETING TITLE LAYER (Draggable & Stylable)
        ═══════════════════════════════════════════════════════════════════ */}
        {titleConfig && (
          <Text
            text={title}
            x={titleX * width}
            y={titleY * height}
            width={width * 0.9}
            offsetX={(width * 0.9) / 2}
            align="center"
            fontSize={titleSize * scale}
            fontFamily={resolveFontFamily(titleFont)}
            fontStyle="bold"
            fill={titleColor}
            draggable
            onDragEnd={(e) => {
              const node = e.target;
              onUpdateTitle({
                x: node.x() / width,
                y: node.y() / height,
              });
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            {...READABILITY_SHADOW}
          />
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            6. GREETING MESSAGE LAYER (Draggable & Stylable)
        ═══════════════════════════════════════════════════════════════════ */}
        {messageConfig && (
          <Text
            text={message}
            x={messageX * width}
            y={messageY * height}
            width={width * 0.8}
            offsetX={(width * 0.8) / 2}
            align="center"
            fontSize={messageSize * scale}
            fontFamily={resolveFontFamily(messageFont)}
            fill={messageColor}
            lineHeight={messageConfig.lineHeight || 1.5}
            draggable
            onDragEnd={(e) => {
              const node = e.target;
              onUpdateMessage({
                x: node.x() / width,
                y: node.y() / height,
              });
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            {...READABILITY_SHADOW}
          />
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            7. FOOTER CONTACT LAYER (Draggable & Stylable)
        ═══════════════════════════════════════════════════════════════════ */}
        {footerConfig && (
          <Text
            text={visibleFields
              .map((field) => {
                if (field === 'website' && company.website) return company.website;
                if (field === 'email' && company.email) return company.email;
                if (field === 'phone' && company.phone) return company.phone;
                return null;
              })
              .filter(Boolean)
              .join('   •   ')}
            x={footerX * width}
            y={footerY * height}
            width={width * 0.95}
            offsetX={(width * 0.95) / 2}
            align="center"
            fontSize={footerSize * scale}
            fontFamily={resolveFontFamily(footerFont)}
            fill={footerColor}
            fontStyle="600"
            draggable
            onDragEnd={(e) => {
              const node = e.target;
              onUpdateFooter({
                x: node.x() / width,
                y: node.y() / height,
              });
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            {...READABILITY_SHADOW}
          />
        )}
      </Layer>
    </Stage>
  );
}
