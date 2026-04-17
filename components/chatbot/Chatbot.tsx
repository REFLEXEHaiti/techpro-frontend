// components/chatbot/Chatbot.tsx
// ✅ COMMUN AUX 3 PLATEFORMES
// Le chatbot IA s'adapte automatiquement au domaine du tenant :
//   - LexHaiti    → assistant droit haïtien
//   - TechPro     → assistant formations professionnelles
//   - MediForm    → assistant médical/infirmier
// Les suggestions et le message d'accueil changent par plateforme

'use client';

import { useState, useRef, useEffect } from 'react';
import api from '@/lib/api';
import { useTenant } from '@/lib/tenantContext';

interface Message {
  role: 'user' | 'assistant';
  contenu: string;
}

// ── Contenus localisés par tenant ────────────────────────────
const ACCUEIL: Record<string, Record<string, string>> = {
  lex: {
    fr: "Bonjour ! Je suis l'assistant IA de LexHaiti. Je peux vous aider sur le droit haïtien, les plaidoiries et vos formations. Comment puis-je vous aider ?",
    ht: "Bonjou ! Mwen se asistan IA LexHaiti a. Mwen ka ede ou ak dwa ayisyen, plèdwari ak fòmasyon ou yo.",
    en: "Hello! I'm the LexHaiti AI assistant. I can help with Haitian law, legal debates and your courses.",
  },
  techpro: {
    fr: "Bonjour ! Je suis l'assistant IA de TechPro Haiti. Je vous aide avec le développement web, la cybersécurité, le cloud et vos formations IT. Comment puis-je vous aider ?",
    ht: "Bonjou ! Mwen se asistan IA TechPro Haiti a. Mwen ka ede ou ak devlopman web, cybersecurity ak fòmasyon IT yo.",
    en: "Hello! I'm TechPro Haiti's AI assistant. I can help with web development, cybersecurity, cloud and IT training.",
  },
};

const SUGGESTIONS: Record<string, Record<string, string[]>> = {
  lex: {
    fr: ["Comment consulter le Code civil haïtien ?", "Comment préparer une plaidoirie ?", "Comment accéder aux formations ?", "Comment rejoindre un moot court ?"],
    ht: ["Kijan pou konsulte Kòd sivil ayisyen an ?", "Kijan pou prepare yon plèdwari ?", "Kijan pou jwenn aksè nan fòmasyon yo ?"],
    en: ["How to consult the Haitian Civil Code?", "How to prepare a legal argument?", "How to access the courses?"],
  },
  techpro: {
    fr: ["Comment démarrer en développement web ?", "Quelles certifications IT sont disponibles ?", "Comment accéder aux projets IA ?", "Comment progresser en cybersécurité ?"],
    ht: ["Kijan pou kòmanse nan devlopman web ?", "Ki sètifikasyon IT ki disponib ?", "Kijan pou jwenn aksè nan pwojè IA yo ?"],
    en: ["How to start in web development?", "What IT certifications are available?", "How to access AI projects?"],
  },
};

export default function Chatbot() {
  const { config } = useTenant();
  const slug   = config?.slug ?? 'lex';
  const primaire   = config?.couleursTheme.primaire   ?? '#1B3A6B';
  const secondaire = config?.couleursTheme.secondaire ?? '#FF6B35';

  const [ouvert,    setOuvert]    = useState(false);
  const [langue,    setLangue]    = useState('fr');
  const [messages,  setMessages]  = useState<Message[]>([]);
  const [saisie,    setSaisie]    = useState('');
  const [chargement, setChargement] = useState(false);
  const finRef = useRef<HTMLDivElement>(null);

  // Message d'accueil selon langue + tenant
  useEffect(() => {
    const saved = localStorage.getItem('idea-lang') ?? 'fr';
    setLangue(saved);
    const accueil = ACCUEIL[slug]?.[saved] ?? ACCUEIL[slug]?.['fr'] ?? ACCUEIL['lex']['fr'];
    setMessages([{ role: 'assistant', contenu: accueil }]);
  }, [slug]);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const envoyer = async () => {
    const texte = saisie.trim();
    if (!texte || chargement) return;
    setSaisie('');
    setMessages(m => [...m, { role: 'user', contenu: texte }]);
    setChargement(true);
    try {
      const { data } = await api.post('/ia/chatbot', { message: texte });
      setMessages(m => [...m, { role: 'assistant', contenu: data.reponse }]);
    } catch {
      setMessages(m => [...m, { role: 'assistant', contenu: "Désolé, une erreur s'est produite. Réessayez dans un moment." }]);
    } finally {
      setChargement(false);
    }
  };

  const changerLangue = (l: string) => {
    setLangue(l);
    localStorage.setItem('idea-lang', l);
    const accueil = ACCUEIL[slug]?.[l] ?? ACCUEIL[slug]?.['fr'];
    setMessages([{ role: 'assistant', contenu: accueil }]);
  };

  const suggestions = SUGGESTIONS[slug]?.[langue] ?? SUGGESTIONS[slug]?.['fr'] ?? [];

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setOuvert(o => !o)}
        style={{ position: 'fixed', bottom: 24, right: 24, width: 56, height: 56, borderRadius: '50%', background: `linear-gradient(135deg, ${primaire}, ${secondaire})`, color: 'white', border: 'none', cursor: 'pointer', boxShadow: `0 8px 24px ${primaire}55`, zIndex: 999, fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
        title="Assistant IA"
      >
        {ouvert ? '✕' : '🤖'}
      </button>

      {/* Fenêtre chatbot */}
      {ouvert && (
        <div style={{ position: 'fixed', bottom: 92, right: 24, width: 'clamp(300px,90vw,380px)', background: 'white', borderRadius: 20, boxShadow: '0 24px 64px rgba(0,0,0,0.18)', zIndex: 998, display: 'flex', flexDirection: 'column', overflow: 'hidden', border: `1px solid ${primaire}20` }}>

          {/* Entête */}
          <div style={{ background: `linear-gradient(135deg, ${primaire}, ${secondaire})`, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 14, color: 'white' }}>
                Assistant IA — {config?.nom ?? 'IDEA Haiti'}
              </div>
              <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>
                {chargement ? '⏳ En train de répondre…' : '🟢 En ligne'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {['fr', 'ht', 'en'].map(l => (
                <button key={l} onClick={() => changerLangue(l)}
                  style={{ padding: '3px 8px', borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 10, fontWeight: 700, background: langue === l ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)', color: langue === l ? primaire : 'white' }}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', maxHeight: 320, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '82%', padding: '10px 14px', borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: m.role === 'user' ? primaire : '#F8FAFC',
                  color: m.role === 'user' ? 'white' : '#0D1B2A',
                  fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, lineHeight: 1.5,
                }}>
                  {m.contenu}
                </div>
              </div>
            ))}
            {chargement && (
              <div style={{ display: 'flex', gap: 4, padding: '8px 14px' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#CBD5E1', animation: `bounce 1s ${i * 0.2}s infinite` }} />
                ))}
              </div>
            )}
            <div ref={finRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div style={{ padding: '8px 16px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => { setSaisie(s); }}
                  style={{ padding: '5px 10px', background: `${primaire}12`, border: `1px solid ${primaire}25`, borderRadius: 16, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: primaire, cursor: 'pointer', textAlign: 'left', lineHeight: 1.4 }}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Zone de saisie */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid #F1F5F9', display: 'flex', gap: 8 }}>
            <input
              value={saisie}
              onChange={e => setSaisie(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); envoyer(); } }}
              placeholder={langue === 'ht' ? 'Kesyon ou...' : langue === 'en' ? 'Your question...' : 'Votre question…'}
              style={{ flex: 1, padding: '10px 14px', border: '1.5px solid #E2E8F0', borderRadius: 20, fontSize: 13, outline: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", color: '#0D1B2A', background: 'white' }}
              onFocus={e => { e.target.style.borderColor = primaire; }}
              onBlur={e => { e.target.style.borderColor = '#E2E8F0'; }}
            />
            <button
              onClick={envoyer} disabled={chargement || !saisie.trim()}
              style={{ width: 40, height: 40, borderRadius: '50%', background: saisie.trim() ? primaire : '#E2E8F0', border: 'none', cursor: saisie.trim() ? 'pointer' : 'default', color: 'white', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s', flexShrink: 0 }}>
              ➤
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes bounce { 0%,80%,100%{transform:scale(0.6)} 40%{transform:scale(1)} }`}</style>
    </>
  );
}
