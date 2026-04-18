// app/sponsors/page.tsx — TechPro Haiti

'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

const VERT = '#1B3A6B';
const BLEU = '#FF6B35';

const MOCK: any[] = [
  { id:'S1', nom:'Digicel Haiti',       typeContrat:'PLATINE', couleur:BLEU,    siteWeb:'https://www.digicelhaiti.com',  actif:true, logoUrl:'' },
  { id:'S2', nom:'OIIH',             typeContrat:'PLATINE', couleur:VERT,    siteWeb:'',                      actif:true, logoUrl:'' },
  { id:'S3', nom:'BRH Haiti',  typeContrat:'OR',      couleur:'#E67E22',siteWeb:'https://www.brh.ht',  actif:true, logoUrl:'' },
  { id:'S4', nom:'Digicel Haiti',    typeContrat:'ARGENT',  couleur:'#FF6600',siteWeb:'https://digicelhaiti.com', actif:true, logoUrl:'' },
];

const BADGE: Record<string, { bg: string; text: string; emoji: string }> = {
  PLATINE: { bg:'#F1F5F9', text:'#475569', emoji:'💎' },
  OR:      { bg:'#FFFBEB', text:'#92400E', emoji:'🥇' },
  ARGENT:  { bg:'#F8FAFC', text:'#475569', emoji:'🥈' },
  BRONZE:  { bg:'#FFF7ED', text:'#9A3412', emoji:'🥉' },
};

export default function PageSponsors() {
  const { utilisateur }       = useAuthStore();
  const [sponsors, setSponsors] = useState(MOCK);
  const [chargement, setChargement] = useState(true);
  const [modal,    setModal]  = useState(false);
  const [form,     setForm]   = useState({ nom:'', siteWeb:'', typeContrat:'OR', couleur:'#1B3A6B', logoUrl:'' });
  const [envoi,    setEnvoi]  = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState('');

  const estAdmin = utilisateur?.role === 'ADMIN';

  useEffect(() => {
    api.get('/sponsoring/sponsors').then(({ data }) => { if (Array.isArray(data) && data.length) setSponsors(data); }).catch(() => {}).finally(() => setChargement(false));
  }, []);

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setPreview(url);
    setForm(p => ({ ...p, logoUrl: url }));
  };

  const soumettre = async (e: React.FormEvent) => {
    e.preventDefault(); setEnvoi(true);
    try {
      const { data } = await api.post('/sponsoring/sponsors', { ...form, logoUrl: preview || form.logoUrl });
      setSponsors(prev => [data, ...prev]);
      toast.success('Partenaire ajouté !');
      setModal(false); setForm({ nom:'', siteWeb:'', typeContrat:'OR', couleur:'#1B3A6B', logoUrl:'' }); setPreview('');
    } catch { toast.error('Erreur lors de l\'ajout'); }
    setEnvoi(false);
  };

  const supprimer = async (id: string) => {
    if (!confirm('Supprimer ce partenaire ?')) return;
    try { await api.delete(`/sponsoring/sponsors/${id}`); setSponsors(p => p.filter(s => s.id !== id)); toast.success('Supprimé'); }
    catch { toast.error('Erreur'); }
  };

  const platine = sponsors.filter(s => s.typeContrat === 'PLATINE');
  const or      = sponsors.filter(s => s.typeContrat === 'OR');
  const autres  = sponsors.filter(s => !['PLATINE','OR'].includes(s.typeContrat));

  const SponsorCard = ({ s }: { s: any }) => {
    const b = BADGE[s.typeContrat] ?? BADGE['BRONZE'];
    return (
      <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 14, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 14, transition: 'box-shadow 0.2s' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 6px 24px ${s.couleur ?? VERT}18`; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}>
        <div style={{ width: 56, height: 56, borderRadius: 12, background: `${s.couleur ?? VERT}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
          {s.logoUrl && !s.logoUrl.startsWith('#') ? (
            <img src={s.logoUrl} alt={s.nom} style={{ maxWidth: 50, maxHeight: 50, objectFit: 'contain' }} />
          ) : (
            <span style={{ fontSize: 22, fontWeight: 900, color: s.couleur ?? VERT }}>{s.nom?.[0]}</span>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 15, color: '#0D1F2D', marginBottom: 4 }}>{s.nom}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ background: b.bg, color: b.text, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100, fontFamily: "'Inter',sans-serif" }}>
              {b.emoji} {s.typeContrat}
            </span>
            {s.actif && <span style={{ background: '#EBF3FB', color: VERT, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100, fontFamily: "'Inter',sans-serif" }}>Actif</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          {s.siteWeb && (
            <a href={s.siteWeb} target="_blank" rel="noreferrer"
              style={{ padding: '7px 12px', background: `${VERT}10`, color: VERT, borderRadius: 8, textDecoration: 'none', fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 700 }}>
              Site →
            </a>
          )}
          {estAdmin && (
            <button onClick={() => supprimer(s.id)}
              style={{ padding: '7px 12px', background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: 8, fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              🗑
            </button>
          )}
        </div>
      </div>
    );
  };

  const inp: React.CSSProperties = { width: '100%', padding: '11px 14px', border: '1.5px solid #E2E8F0', borderRadius: 9, fontSize: 14, outline: 'none', fontFamily: "'Inter',sans-serif", boxSizing: 'border-box', color: '#0D1F2D', background: 'white' };
  const focus = (e: React.FocusEvent<any>) => { e.target.style.borderColor = VERT; };
  const blur  = (e: React.FocusEvent<any>) => { e.target.style.borderColor = '#E2E8F0'; };

  return (
    <div style={{ background: '#F8FAFB', minHeight: '100vh' }}>

      {/* Hero */}
      <section style={{ background: `linear-gradient(135deg, ${VERT} 0%, #0D4D2E 100%)`, padding: 'clamp(40px,5vw,64px) clamp(20px,5vw,48px)', textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Inter',sans-serif", fontSize: 'clamp(28px,4vw,44px)', color: 'white', fontWeight: 800, marginBottom: 12 }}>
          Nos partenaires
        </h1>
        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.75)', maxWidth: 500, margin: '0 auto 24px', lineHeight: 1.7 }}>
          TechPro Haiti est soutenu par les entreprises et institutions et partenaires qui croient en la formation continue des développeurs & techniciens haïtiens.
        </p>
        {estAdmin && (
          <button onClick={() => setModal(true)}
            style={{ padding: '12px 24px', background: 'white', color: VERT, border: 'none', borderRadius: 8, fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            + Ajouter un partenaire
          </button>
        )}
      </section>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(32px,5vw,56px) clamp(20px,5vw,48px)' }}>

        {/* Platine */}
        {platine.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ height: 2, flex: 1, background: '#E2E8F0' }} />
              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.1em' }}>💎 Partenaires Platine</span>
              <div style={{ height: 2, flex: 1, background: '#E2E8F0' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {platine.map(s => <SponsorCard key={s.id} s={s} />)}
            </div>
          </div>
        )}

        {/* Or */}
        {or.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ height: 2, flex: 1, background: '#E2E8F0' }} />
              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.1em' }}>🥇 Partenaires Or</span>
              <div style={{ height: 2, flex: 1, background: '#E2E8F0' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              {or.map(s => <SponsorCard key={s.id} s={s} />)}
            </div>
          </div>
        )}

        {/* Autres */}
        {autres.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ height: 2, flex: 1, background: '#E2E8F0' }} />
              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Autres partenaires</span>
              <div style={{ height: 2, flex: 1, background: '#E2E8F0' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
              {autres.map(s => <SponsorCard key={s.id} s={s} />)}
            </div>
          </div>
        )}

        {/* Devenir partenaire */}
        <div style={{ background: `linear-gradient(135deg, ${VERT}10, ${BLEU}08)`, border: `1px solid ${VERT}25`, borderRadius: 16, padding: '32px', textAlign: 'center' }}>
          <h3 style={{ fontFamily: "'Inter',sans-serif", fontSize: 22, fontWeight: 800, color: '#0D1F2D', marginBottom: 12 }}>
            Devenir partenaire TechPro
          </h3>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, color: '#64748B', lineHeight: 1.7, maxWidth: 500, margin: '0 auto 20px' }}>
            Rejoignez les institutions qui soutiennent la formation continue des développeurs & techniciens haïtiens. Visibilité auprès de 2 800+ soignants.
          </p>
          <Link href="/contact?sujet=partenariat"
            style={{ display: 'inline-block', padding: '13px 28px', background: VERT, color: 'white', borderRadius: 8, textDecoration: 'none', fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 14 }}>
            Nous contacter →
          </Link>
        </div>
      </div>

      {/* Modal ajout */}
      {modal && estAdmin && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: '28px 32px', width: '100%', maxWidth: 480, boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, paddingBottom: 14, borderBottom: `2px solid ${VERT}` }}>
              <h2 style={{ fontFamily: "'Inter',sans-serif", fontSize: 18, fontWeight: 800, color: VERT, margin: 0 }}>Nouveau partenaire</h2>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#64748B' }}>✕</button>
            </div>
            <form onSubmit={soumettre} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Logo upload */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, fontFamily: "'Inter',sans-serif" }}>Logo</label>
                <div onClick={() => logoRef.current?.click()} style={{ border: '2px dashed #E2E8F0', borderRadius: 10, padding: 16, textAlign: 'center', cursor: 'pointer', background: '#F8FAFB' }}>
                  {preview ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                      <img src={preview} alt="Logo" style={{ width: 52, height: 52, objectFit: 'contain', borderRadius: 8 }} />
                      <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: VERT, fontWeight: 600 }}>✓ Logo uploadé</span>
                    </div>
                  ) : (
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: '#94A3B8', margin: 0 }}>Cliquer pour uploader (PNG, JPG, SVG)</p>
                  )}
                </div>
                <input ref={logoRef} type="file" accept="image/*" onChange={handleLogo} style={{ display: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, fontFamily: "'Inter',sans-serif" }}>Nom *</label>
                <input type="text" value={form.nom} required onChange={e => setForm(p => ({ ...p, nom: e.target.value }))} placeholder="Ex : Digicel Haiti" style={inp} onFocus={focus} onBlur={blur} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, fontFamily: "'Inter',sans-serif" }}>Site web</label>
                <input type="url" value={form.siteWeb} onChange={e => setForm(p => ({ ...p, siteWeb: e.target.value }))} placeholder="https://..." style={inp} onFocus={focus} onBlur={blur} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, fontFamily: "'Inter',sans-serif" }}>Niveau</label>
                  <select value={form.typeContrat} onChange={e => setForm(p => ({ ...p, typeContrat: e.target.value }))} style={{ ...inp, appearance: 'none' as any }} onFocus={focus} onBlur={blur}>
                    <option value="PLATINE">💎 Platine</option>
                    <option value="OR">🥇 Or</option>
                    <option value="ARGENT">🥈 Argent</option>
                    <option value="BRONZE">🥉 Bronze</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, fontFamily: "'Inter',sans-serif" }}>Couleur de marque</label>
                  <input type="color" value={form.couleur} onChange={e => setForm(p => ({ ...p, couleur: e.target.value }))} style={{ ...inp, height: 44, padding: 4, cursor: 'pointer' }} />
                </div>
              </div>
              <button type="submit" disabled={envoi || !form.nom.trim()}
                style={{ width: '100%', padding: '13px', background: VERT, color: 'white', border: 'none', borderRadius: 10, fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 14, cursor: !form.nom.trim() ? 'not-allowed' : 'pointer', marginTop: 4 }}>
                {envoi ? 'Ajout…' : '✅ Ajouter le partenaire →'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
