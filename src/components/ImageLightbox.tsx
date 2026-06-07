"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";

interface Props {
  src: string;
  alt: string;
}

export default function ImageLightbox({ src, alt }: Props) {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  return (
    <>
      {/* Clickable image wrapper */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative aspect-[2/3] w-full overflow-hidden rounded-3xl bg-slate-900 shadow-2xl shadow-slate-950/20 ring-1 ring-white/70 cursor-zoom-in"
        aria-label={`View full size photo of ${alt}`}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition duration-300 group-hover:scale-105"
          priority
        />
        {/* Zoom hint overlay */}
        <div className="absolute inset-0 flex items-end justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="flex items-center gap-1.5 rounded-full bg-slate-950/80 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-white backdrop-blur">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
            View Full Size
          </span>
        </div>
      </button>

      {/* Lightbox modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={`Full size photo of ${alt}`}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={close}
            className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
            aria-label="Close photo"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image — full natural size, max screen */}
          <div
            className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className="block max-h-[90vh] max-w-[90vw] w-auto h-auto object-contain"
            />
          </div>

          {/* ESC hint */}
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/50">
            Press ESC or click outside to close
          </p>
        </div>
      )}
    </>
  );
}
