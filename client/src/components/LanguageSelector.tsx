import { useState, useRef, useEffect } from 'react';
import { useLanguage, LANGUAGES } from '@/contexts/LanguageContext';

// The 6 supported languages for Login/SignUp pages
const AUTH_LANGUAGES = ['en', 'th', 'hu', 'hi', 'zh', 'vi'];

// ── Language Selector — pure React, no Radix UI dependency ──────────────────
export function LanguageSelector({ allowedLanguages }: { allowedLanguages?: string[] }) {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [open]);

  const langs = Object.entries(LANGUAGES).filter(
    ([code]) => !allowedLanguages || allowedLanguages.includes(code)
  );

  // Safe lookup — fallback to English if something goes wrong
  const curr = (LANGUAGES as Record<string, { name: string; flag: string }>)[language] || LANGUAGES.en;

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      {/* ── Trigger Button ── */}
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          padding: '6px 10px',
          borderRadius: '8px',
          border: '1px solid #cbd5e1',
          background: 'white',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 500,
          color: '#334155',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          whiteSpace: 'nowrap',
        }}
        aria-label="Select language"
      >
        <span style={{ fontSize: '18px', lineHeight: 1 }}>{curr.flag}</span>
        <span
          style={{ display: 'none' }}
          className="sm:inline"
        >
          {curr.name}
        </span>
        <span style={{ fontSize: '9px', opacity: 0.6 }}>{open ? '▲' : '▼'}</span>
      </button>

      {/* ── Dropdown List ── */}
      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 6px)',
            zIndex: 9999,
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            minWidth: '165px',
            overflow: 'hidden',
          }}
        >
          {langs.map(([code, { name, flag }]) => {
            const isActive = language === code;
            return (
              <button
                key={code}
                type="button"
                onClick={() => {
                  setLanguage(code as typeof language);
                  setOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  width: '100%',
                  textAlign: 'left',
                  background: isActive ? '#ecfeff' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: isActive ? '#0891b2' : '#334155',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                <span style={{ fontSize: '18px', lineHeight: 1 }}>{flag}</span>
                <span>{name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Pre-configured selector showing only the 6 auth-page languages
export function AuthLanguageSelector() {
  return <LanguageSelector allowedLanguages={AUTH_LANGUAGES} />;
}
