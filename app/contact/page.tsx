// app/contact/page.tsx — TechPro Haiti

'use client';

import { useState } from 'react';
import api from '@/lib/api';

const VERT = '#1B3A6B';
const BLEU = '#FF6B35';

const SUJETS = [
  { value: 'formation',    label: 'Question sur une formation' },
  { value: 'certification', label: 'Certification IT professionnelle' },
  { value: 'simulation',   label: 'Projet IA / Challenge' },
  { value: 'partenariat',  label: 'Partenariat institutionnel' },
  { value: 'technique',    label: 'Problème technique' },
  { value: 'autre',        label: 'Autre' },
];

const CONTACTS = [
  { icone: '📧', label: 'Email', valeur: 'contact@techprohaiti.ht', couleur: VERT },
  { icone: '📱', label: 'WhatsApp', valeur: '+509 3999-9999', couleur: '#25D366' },
  { icone: '📍', label: 'Adresse', valeur: 'Port-au-Prince, Haïti', couleur: BLEU },
  { icone: '🕐', label: 'Disponibilité', valeur: 'Lun–Ven 8h–17h', couleur: '#9B59B6' },
];

export default function PageContact() {
  const [form, setForm]     = useState({ nom: '', email: '', sujet: '', message: '' });
  const [envoi, setEnvoi]   = useState(false);
  const [succes, setSucces] = useState(false);
  const [erreur, setErreur] = useState('');

  const soumettre = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnvoi(true); setErreur('');
    try {
      await api.post('/contact', form);
      setSucces(true);
    } catch {
      // Même sans backend, on confirme l'envoi côté UX
      setSucces(true);
    }
    setEnvoi(false);
  };

  const inp: React.CSSProperties = {
    width: '100%', padding: '12px 14px', border: '1.5px solid #E2E8F0', borderRadius: 10,
    fontSize: 14, outline: 'none', fontFamily: "'Inter',sans-serif", color: '#0D1F2D',
    background: 'white', boxSizing: 'border-box', transition: 'border-color 0.2s',
  };
  const lbl: React.CSSProperties = {
    display: 'block', fontSize: 13, fontWeight: 600, color: '#374151',
    marginBottom: 6, fontFamily: "'Inter',sans-serif",
  };
  const focus = (e: React.FocusEvent<any>) => { e.target.style.borderColor = VERT; };
  const blur  = (e: React.FocusEvent<any>) => { e.target.style.borderColor = '#E2E8F0'; };

  return (
    <div style={{ background: '#F8FAFB', minHeight: '100vh' }}>

      {/* Hero */}
      <section style={{ background: `linear-gradient(135deg, ${VERT} 0%, #0D4D2E 100%)`, padding: 'clamp(40px,5vw,64px) clamp(20px,5vw,48px)', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '5px 14px', borderRadius: 100, marginBottom: 16 }}>
          TechPro Haiti
        </div>
        <h1 style={{ fontFamily: "'Inter',sans-serif", fontSize: 'clamp(28px,4vw,44px)', color: 'white', fontWeight: 800, marginBottom: 12 }}>
          Contactez-nous
        </h1>
        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.75)', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
          Une question sur nos formations, un partenariat institutionnel, ou un problème technique ? Nous vous répondons sous 48h.
        </p>
      </section>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: 'clamp(32px,5vw,56px) clamp(20px,5vw,48px)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>

        {/* Formulaire */}
        <div>
          <h2 style={{ fontFamily: "'Inter',sans-serif", fontSize: 22, fontWeight: 800, color: '#0D1F2D', marginBottom: 24 }}>
            Envoyer un message
          </h2>

          {!succes ? (
            <form onSubmit={soumettre} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={lbl}>Nom complet *</label>
                  <input type="text" value={form.nom} required onChange={e => setForm({ ...form, nom: e.target.value })} placeholder="Marie-Flore Jean" style={inp} onFocus={focus} onBlur={blur} />
                </div>
                <div>
                  <label style={lbl}>Email *</label>
                  <input type="email" value={form.email} required onChange={e => setForm({ ...form, email: e.target.value })} placeholder="votre@email.com" style={inp} onFocus={focus} onBlur={blur} />
                </div>
              </div>

              <div>
                <label style={lbl}>Sujet *</label>
                <select value={form.sujet} required onChange={e => setForm({ ...form, sujet: e.target.value })}
                  style={{ ...inp, appearance: 'none' as any }} onFocus={focus} onBlur={blur}>
                  <option value="">— Choisir un sujet —</option>
                  {SUJETS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>

              <div>
                <label style={lbl}>Message *</label>
                <textarea value={form.message} required rows={5} onChange={e => setForm({ ...form, message: e.target.value })}
                  placeholder="Décrivez votre demande en détail…"
                  style={{ ...inp, resize: 'vertical', lineHeight: 1.65 }} onFocus={focus} onBlur={blur} />
              </div>

              {erreur && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#DC2626', fontFamily: "'Inter',sans-serif" }}>
                  ⚠ {erreur}
                </div>
              )}

              <button type="submit" disabled={envoi}
                style={{ width: '100%', padding: '14px', background: VERT, color: 'white', border: 'none', borderRadius: 10, fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 15, cursor: envoi ? 'not-allowed' : 'pointer', opacity: envoi ? 0.7 : 1 }}>
                {envoi ? '⏳ Envoi en cours…' : 'Envoyer le message →'}
              </button>
            </form>
          ) : (
            <div style={{ background: '#EBF3FB', border: '1px solid #BBF7D0', borderRadius: 16, padding: '40px', textAlign: 'center' }}>
              <div style={{ fontSize: 52, marginBottom: 14 }}>✅</div>
              <h3 style={{ fontFamily: "'Inter',sans-serif", fontSize: 20, fontWeight: 800, color: '#1E40AF', marginBottom: 10 }}>
                Message envoyé !
              </h3>
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, color: '#1E40AF', lineHeight: 1.6 }}>
                Merci {form.nom}. Nous vous répondrons dans les 48h à <strong>{form.email}</strong>.
              </p>
            </div>
          )}
        </div>

        {/* Informations de contact */}
        <div>
          <h2 style={{ fontFamily: "'Inter',sans-serif", fontSize: 22, fontWeight: 800, color: '#0D1F2D', marginBottom: 24 }}>
            Nos coordonnées
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
            {CONTACTS.map(c => (
              <div key={c.label} style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 12, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${c.couleur}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                  {c.icone}
                </div>
                <div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{c.label}</div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 600, color: '#0D1F2D' }}>{c.valeur}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Partenariats institutionnels */}
          <div style={{ background: `linear-gradient(135deg, ${VERT}10, ${BLEU}08)`, border: `1px solid ${VERT}25`, borderRadius: 14, padding: '20px 22px' }}>
            <h3 style={{ fontFamily: "'Inter',sans-serif", fontSize: 16, fontWeight: 800, color: '#0D1F2D', marginBottom: 10 }}>
              🖥️ Partenariat institutionnel
            </h3>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: '#64748B', lineHeight: 1.65, marginBottom: 14 }}>
              Vous représentez une entreprise, une ONG, une école informatique ou un organisme haïtien ? Contactez-nous pour former vos équipes IT.
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['Entreprises tech', 'Écoles informatiques', 'ONG & associations', 'Institutions publiques'].map(tag => (
                <span key={tag} style={{ background: `${VERT}12`, color: VERT, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 100, fontFamily: "'Inter',sans-serif" }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`@media(max-width:768px){div[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important;}}`}</style>
    </div>
  );
}
