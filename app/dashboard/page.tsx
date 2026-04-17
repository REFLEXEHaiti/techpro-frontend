// app/dashboard/page.tsx — TechPro Haiti
'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useTenant } from '@/lib/tenantContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const VERT = '#1B3A6B';
const BLEU = '#FF6B35';

export default function PageDashboard() {
  const { estConnecte, utilisateur } = useAuthStore();
  const { config } = useTenant();
  const router = useRouter();

  const [pret, setPret]           = useState(false);
  const [data, setData]           = useState<any>(null);
  const [sponsors, setSponsors]   = useState<any[]>([]);
  const [onglet, setOnglet]       = useState<'accueil' | 'sponsors'>('accueil');
  const [modalSponsor, setModalSponsor] = useState(false);
  const [formSponsor, setFormSponsor]   = useState({ nom: '', siteWeb: '', typeContrat: 'OR', couleur: VERT });
  const [logoFile, setLogoFile]   = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [logoErreur, setLogoErreur]   = useState('');
  const [envoi, setEnvoi]         = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);

  const primaire   = config?.couleursTheme.primaire   ?? VERT;
  const secondaire = config?.couleursTheme.secondaire ?? BLEU;
  const estAdmin   = ['ADMIN', 'FORMATEUR'].includes(utilisateur?.role ?? '');

  useEffect(() => { const t = setTimeout(() => setPret(true), 50); return () => clearTimeout(t); }, []);

  useEffect(() => {
    if (!pret) return;
    if (!estConnecte) { router.replace('/auth/connexion'); return; }
    api.get('/analytics/dashboard').then(r => setData(r.data)).catch(() => {});
    api.get('/sponsors').then(({ data }) => { if (Array.isArray(data)) setSponsors(data); }).catch(() => {});
  }, [pret, estConnecte]);

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return; setLogoErreur('');
    if (!['image/png','image/jpeg','image/jpg','image/svg+xml','image/webp'].includes(f.type)) { setLogoErreur('Format non supporté. PNG, JPG, SVG ou WebP.'); return; }
    if (f.size > 2 * 1024 * 1024) { setLogoErreur('Maximum 2 MB.'); return; }
    const img = new Image(); const url = URL.createObjectURL(f);
    img.onload = () => { URL.revokeObjectURL(url); if (img.width < 100 || img.height < 50) { setLogoErreur('Trop petite. Minimum 100×50 px.'); return; } setLogoFile(f); setLogoPreview(URL.createObjectURL(f)); };
    img.onerror = () => { setLogoErreur('Impossible de lire ce fichier.'); }; img.src = url;
  };

  const fileEnBase64 = (file: File): Promise<string> => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(file); });

  const ajouterSponsor = async (e: React.FormEvent) => {
    e.preventDefault(); if (!formSponsor.nom.trim()) { toast.error('Le nom est requis'); return; }
    setEnvoi(true);
    try {
      let logoUrl = '';
      if (logoFile) logoUrl = await fileEnBase64(logoFile);
      const { data: created } = await api.post('/sponsors', { ...formSponsor, logoUrl });
      setSponsors(prev => [created, ...prev]);
      toast.success('✅ Partenaire ajouté !');
      setModalSponsor(false); setFormSponsor({ nom: '', siteWeb: '', typeContrat: 'OR', couleur: VERT }); setLogoFile(null); setLogoPreview('');
    } catch { toast.error("Erreur lors de l'ajout"); }
    setEnvoi(false);
  };

  const supprimerSponsor = async (id: string) => {
    if (!confirm('Retirer ce partenaire ?')) return;
    await api.delete(`/sponsors/${id}`).catch(() => {});
    setSponsors(prev => prev.filter(s => s.id !== id)); toast.success('Retiré');
  };

  if (!pret) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}><div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", color: '#475569', fontSize: 14 }}>Chargement…</div></div>;
  if (!estConnecte) return null;

  const inp: React.CSSProperties = { width: '100%', padding: '11px 14px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", boxSizing: 'border-box', color: '#1A1A1A', background: 'white' };

  return (
    <div style={{ background: '#F0F4FA', minHeight: '100vh' }}>
      <div style={{ background: `linear-gradient(135deg, #0D1B2A 0%, ${primaire} 100%)`, padding: 'clamp(32px,5vw,56px) clamp(16px,4vw,40px)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: secondaire, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia,serif', fontWeight: 700, fontSize: 20, color: 'white', flexShrink: 0 }}>
              {(utilisateur?.prenom?.[0] ?? '') + (utilisateur?.nom?.[0] ?? '')}
            </div>
            <div>
              <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(18px,3vw,24px)', color: 'white', margin: '0 0 4px', fontWeight: 'normal' }}>Bonjour, {utilisateur?.prenom} !</h1>
              <span style={{ background: secondaire, color: 'white', padding: '2px 10px', borderRadius: 100, fontSize: 11, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700 }}>{utilisateur?.role}</span>
            </div>
          </div>
          {estAdmin && (
            <div style={{ display: 'flex', gap: 8 }}>
              {[{ id: 'accueil', label: '🏠 Tableau de bord' }, { id: 'sponsors', label: '🤝 Partenaires' }].map(o => (
                <button key={o.id} onClick={() => setOnglet(o.id as any)}
                  style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: onglet === o.id ? 'white' : 'rgba(255,255,255,0.15)', color: onglet === o.id ? primaire : 'rgba(255,255,255,0.8)', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, fontWeight: onglet === o.id ? 700 : 400, cursor: 'pointer' }}>
                  {o.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(24px,4vw,40px) clamp(16px,4vw,40px)' }}>
        {onglet === 'accueil' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 20, color: '#0D1B2A', margin: 0, fontWeight: 'normal' }}>Mes formations en cours</h2>
                <Link href="/formations" style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: primaire, textDecoration: 'none', fontWeight: 600 }}>Voir tout →</Link>
              </div>
              {(!data?.inscriptions || data.inscriptions.length === 0) ? (
                <div style={{ background: 'white', borderRadius: 14, border: '1px solid #CBD5E1', padding: '32px', textAlign: 'center' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🖥️</div>
                  <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, color: '#475569', margin: '0 0 16px' }}>Aucune formation en cours.</p>
                  <Link href="/formations" style={{ display: 'inline-block', padding: '10px 24px', background: primaire, color: 'white', borderRadius: 100, textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 13 }}>Découvrir les formations →</Link>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                  {data.inscriptions.slice(0, 6).map((insc: any) => {
                    const pct = insc.progression?.pourcentage ?? 0;
                    return (
                      <Link key={insc.id} href={`/formations/${insc.coursId}`} style={{ textDecoration: 'none' }}>
                        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #CBD5E1', padding: '14px 16px' }}>
                          <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 14, color: '#0D1B2A', marginBottom: 8, lineHeight: 1.4 }}>{insc.cours?.titre}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#475569' }}>
                            <span>{insc.progression?.terminees ?? 0}/{insc.cours?._count?.lecons ?? 0} leçons</span>
                            <span style={{ fontWeight: 700, color: pct === 100 ? '#059669' : primaire }}>{pct}%</span>
                          </div>
                          <div style={{ height: 4, background: '#EBF3FB', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: pct === 100 ? '#059669' : primaire, width: `${pct}%` }} />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ background: 'white', borderRadius: 14, border: '1px solid #CBD5E1', padding: '20px 24px' }}>
              <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 18, color: '#0D1B2A', margin: '0 0 16px', fontWeight: 'normal' }}>Navigation rapide</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { href: '/formations',  label: '📚 Formations IT',        bg: `${primaire}08`, color: primaire },
                  { href: '/tournois',    label: '🖥️ Projets IA',       bg: `${secondaire}10`, color: secondaire },
                  { href: '/lives',       label: '🎥 Webinaires Tech',       bg: '#F0FDF4',  color: '#059669' },
                  { href: '/bibliotheque',label: '📖 Bibliothèque Tech',       bg: '#F5F3FF',  color: '#7C3AED' },
                  { href: '/profil/' + utilisateur?.id, label: '👤 Mon profil',   bg: '#F8F7F4',  color: '#374151' },
                  ...(!estAdmin ? [{ href: '/premium', label: '⭐ Abonnements', bg: `${secondaire}10`, color: secondaire }] : []),
                  ...(estAdmin  ? [{ href: '/admin',   label: '⚙️ Administration', bg: '#F1F5F9',  color: '#374151' }] : []),
                ].map(({ href, label, bg, color }) => (
                  <Link key={href} href={href} style={{ display: 'block', padding: '11px 14px', background: bg, borderRadius: 10, textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, fontWeight: 600, color }}>{label}</Link>
                ))}
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: 14, border: '1px solid #CBD5E1', padding: '20px 24px' }}>
              <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 18, color: '#0D1B2A', margin: '0 0 16px', fontWeight: 'normal' }}>Certifications</h2>
              {(!data?.badges || data.badges.length === 0) ? (
                <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#64748B', textAlign: 'center', padding: '20px 0' }}>Complétez des formations pour obtenir des certifications IT.</p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {data.badges.map((b: any) => (
                    <div key={b.id} style={{ background: `${primaire}10`, border: `1px solid ${primaire}25`, borderRadius: 6, padding: '5px 10px', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, fontWeight: 700, color: primaire }}>🏅 {b.titre}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {onglet === 'sponsors' && estAdmin && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 22, color: '#0D1B2A', margin: '0 0 6px', fontWeight: 'normal' }}>Partenaires tech</h2>
                <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#475569', margin: 0 }}>Apparaissent dans la bannière défilante sur toutes les pages.</p>
              </div>
              <button onClick={() => setModalSponsor(true)} style={{ padding: '11px 22px', background: primaire, color: 'white', border: 'none', borderRadius: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>+ Ajouter un partenaire</button>
            </div>
            {sponsors.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#64748B' }}><div style={{ fontSize: 48, marginBottom: 12 }}>🤝</div><p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14 }}>Aucun partenaire pour l'instant.</p></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {sponsors.map(s => (
                  <div key={s.id} style={{ background: 'white', border: '1px solid #CBD5E1', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 60, height: 60, borderRadius: 10, background: '#F0F4FA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', border: '1px solid #CBD5E1' }}>
                      {s.logoUrl ? <img src={s.logoUrl} alt={s.nom} style={{ maxWidth: 56, maxHeight: 56, objectFit: 'contain' }} /> : <span style={{ fontWeight: 700, color: primaire, fontSize: 22 }}>{s.nom?.[0]}</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 15, color: '#0D1B2A', marginBottom: 4 }}>{s.nom}</div>
                      <span style={{ background: '#F1F5F9', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 100, color: '#475569', fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>{s.typeContrat}</span>
                    </div>
                    <button onClick={() => supprimerSponsor(s.id)} style={{ padding: '8px 14px', background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>🗑 Retirer</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {modalSponsor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: '28px 32px', width: '100%', maxWidth: 480, boxShadow: '0 24px 64px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, paddingBottom: 14, borderBottom: `2px solid ${primaire}` }}>
              <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 18, color: primaire, margin: 0 }}>Ajouter un partenaire tech</h2>
              <button onClick={() => setModalSponsor(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#64748B' }}>✕</button>
            </div>
            <form onSubmit={ajouterSponsor} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Logo de l'organisation</label>
                <div style={{ background: '#F0F4FA', border: '1px solid #CBD5E1', borderRadius: 8, padding: '10px 14px', marginBottom: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#475569', lineHeight: 1.6 }}>
                  📐 <strong>Dimensions :</strong> 300×100 px (ratio 3:1) · <strong>Min :</strong> 100×50 px<br />
                  📁 <strong>Formats :</strong> PNG, JPG, SVG, WebP · <strong>Max :</strong> 2 MB
                </div>
                <div onClick={() => logoRef.current?.click()} style={{ border: `2px dashed ${logoPreview ? primaire : '#CBD5E1'}`, borderRadius: 10, padding: 20, textAlign: 'center', cursor: 'pointer', background: logoPreview ? `${primaire}04` : '#F0F4FA' }}>
                  {logoPreview ? (
                    <div><img src={logoPreview} alt="Aperçu" style={{ maxWidth: 200, maxHeight: 80, objectFit: 'contain', margin: '0 auto', display: 'block', borderRadius: 6 }} /><p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#16A34A', margin: '8px 0 0', fontWeight: 600 }}>✓ {logoFile?.name}</p></div>
                  ) : (
                    <div><div style={{ fontSize: 32, marginBottom: 8 }}>📁</div><p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#475569', margin: 0, fontWeight: 600 }}>Cliquer pour sélectionner le logo</p></div>
                  )}
                </div>
                <input ref={logoRef} type="file" accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp" onChange={handleLogo} style={{ display: 'none' }} />
                {logoErreur && <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#DC2626', margin: '6px 0 0' }}>⚠ {logoErreur}</p>}
              </div>
              <div><label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Nom de l'organisation *</label><input required value={formSponsor.nom} onChange={e => setFormSponsor(p => ({ ...p, nom: e.target.value }))} placeholder="Ex : TechPro Partner" style={inp} /></div>
              <div><label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Site web</label><input type="url" value={formSponsor.siteWeb} onChange={e => setFormSponsor(p => ({ ...p, siteWeb: e.target.value }))} placeholder="https://..." style={inp} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Niveau partenariat</label>
                  <select value={formSponsor.typeContrat} onChange={e => setFormSponsor(p => ({ ...p, typeContrat: e.target.value }))} style={{ ...inp, appearance: 'none' as any }}>
                    {['PLATINE','OR','ARGENT','BRONZE'].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div><label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Couleur</label>
                  <input type="color" value={formSponsor.couleur} onChange={e => setFormSponsor(p => ({ ...p, couleur: e.target.value }))} style={{ ...inp, height: 44, padding: 4, cursor: 'pointer' }} />
                </div>
              </div>
              <button type="submit" disabled={envoi || !!logoErreur || !formSponsor.nom.trim()} style={{ width: '100%', padding: '14px', background: primaire, color: 'white', border: 'none', borderRadius: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 15, cursor: 'pointer', opacity: (envoi || !!logoErreur || !formSponsor.nom.trim()) ? 0.5 : 1 }}>
                {envoi ? 'Ajout…' : 'Ajouter le partenaire →'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
