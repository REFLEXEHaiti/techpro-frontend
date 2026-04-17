// app/lives/page.tsx — TechPro Haiti
'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useTenant } from '@/lib/tenantContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const VERT = '#1B3A6B';
const BLEU = '#FF6B35';

const getYoutubeThumb = (url: string) => {
  const m = url?.match(/(?:youtube\.com\/(?:watch\?v=|live\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : null;
};
const getEmbedUrl = (url: string) => {
  if (!url) return '';
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (m) return `https://www.youtube.com/embed/${m[1]}?rel=0&autoplay=1`;
  return url;
};

const LIVES_DEMO = [
  { id: 'L1', titre: 'Masterclass React 18 — Server Components & Suspense', description: 'Les nouvelles fonctionnalités React 18 : Server Components, Concurrent Mode et Suspense expliqués.', categorie: 'Développement Web', statut: 'TERMINE', vues: 1840, dateDebut: '2026-03-05', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', videoUrl: '' },
  { id: 'L2', titre: 'Cybersécurité en Haïti — Protégez votre infrastructure', description: 'Sécuriser les réseaux et applications dans le contexte haïtien : menaces locales et solutions.', categorie: 'Cybersécurité', statut: 'TERMINE', vues: 1230, dateDebut: '2026-03-18', youtubeUrl: 'https://www.youtube.com/watch?v=ysz5S6PUM-U', videoUrl: '' },
  { id: 'L3', titre: 'Réanimation pédiatrique — challenges techniques commentés', description: 'Pandas, NumPy, Matplotlib et Scikit-learn appliqués aux données haïtiennes réelles.', categorie: 'DevOps', statut: 'TERMINE', vues: 980, dateDebut: '2026-02-28', youtubeUrl: 'https://www.youtube.com/watch?v=L_jWHffIx5E', videoUrl: '' },
  { id: 'L4', titre: 'AWS Cloud Practitioner — Certifiez-vous en 30 jours', description: 'Préparation à la certification AWS Cloud Practitioner — services essentiels et architecture cloud.', categorie: 'Réseaux & Systèmes', statut: 'TERMINE', vues: 2100, dateDebut: '2026-02-14', youtubeUrl: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ', videoUrl: '' },
  { id: 'L5', titre: 'TechPro Hackathon 2026 — Développez pour Haïti', description: 'Hackathon national — 48h pour construire des solutions tech aux problèmes haïtiens.', categorie: 'Intelligence Artificielle', statut: 'PROGRAMME', vues: 0, dateDebut: '2026-06-15', youtubeUrl: '', videoUrl: '' },
];

const CATS = ['Tous', 'Développement Web', 'Intelligence Artificielle', 'Data Science', 'DevOps', 'Réseaux & Systèmes', 'Cloud Computing', 'Développement Mobile'];
const CAT_COLORS: Record<string, string> = {
  'Développement Web': VERT, 'Intelligence Artificielle': '#065F46', 'Data Science': '#9D174D',
  'DevOps': '#FF6B35', 'Réseaux & Systèmes': '#7C3AED', 'Cloud Computing': '#DC2626', 'Développement Mobile': '#7C2D12',
};

const FORM_VIDE = { titre: '', description: '', categorie: 'Intelligence Artificielle', statut: 'PROGRAMME', dateDebut: '', type: 'LIVE' as 'LIVE' | 'UPLOAD', youtubeUrl: '', videoUrl: '' };

export default function PageLives() {
  const { utilisateur } = useAuthStore();
  const { config } = useTenant();
  const primaire   = config?.couleursTheme.primaire   ?? VERT;
  const secondaire = config?.couleursTheme.secondaire ?? BLEU;
  const [lives, setLives]             = useState(LIVES_DEMO);
  const [replay, setReplay]           = useState<any>(null);
  const [filtre, setFiltre]           = useState('Tous');
  const [chargement, setChargement]   = useState(true);
  const [modalForm, setModalForm]     = useState(false);
  const [enEdition, setEnEdition]     = useState<any>(null);
  const [form, setForm]               = useState<any>(FORM_VIDE);
  const [videoFile, setVideoFile]     = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [videoErreur, setVideoErreur] = useState('');
  const [envoi, setEnvoi]             = useState(false);
  const videoRef = useRef<HTMLInputElement>(null);

  const estAdmin = ['ADMIN', 'FORMATEUR'].includes(utilisateur?.role ?? '');

  useEffect(() => {
    api.get('/lives').then(({ data }) => { if (Array.isArray(data) && data.length) setLives(data); }).catch(() => {}).finally(() => setChargement(false));
  }, []);

  const handleVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return; setVideoErreur('');
    if (!['video/mp4','video/webm','video/ogg','video/quicktime'].includes(f.type)) { setVideoErreur('Format non supporté. MP4, WebM, OGG ou MOV.'); return; }
    if (f.size > 500 * 1024 * 1024) { setVideoErreur('Maximum 500 MB.'); return; }
    setVideoFile(f); setVideoPreview(URL.createObjectURL(f));
  };

  const fileEnBase64 = (file: File): Promise<string> => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(file); });

  const ouvrir = (l?: any) => {
    setEnEdition(l ?? null);
    setForm(l ? { titre: l.titre, description: l.description, categorie: l.categorie, statut: l.statut, dateDebut: l.dateDebut?.slice(0,10) ?? '', type: l.youtubeUrl ? 'LIVE' : 'UPLOAD', youtubeUrl: l.youtubeUrl ?? '', videoUrl: l.videoUrl ?? '' } : FORM_VIDE);
    setVideoFile(null); setVideoPreview(''); setVideoErreur(''); setModalForm(true);
  };

  const sauvegarder = async (e: React.FormEvent) => {
    e.preventDefault(); if (!form.titre.trim()) { toast.error('Le titre est requis'); return; }
    setEnvoi(true);
    try {
      let videoUrl = form.type === 'LIVE' ? form.youtubeUrl : '';
      if (videoFile && form.type === 'UPLOAD') videoUrl = await fileEnBase64(videoFile);
      const payload = { ...form, youtubeUrl: form.type === 'LIVE' ? form.youtubeUrl : '', videoUrl: form.type === 'UPLOAD' ? videoUrl : '' };
      if (enEdition) {
        await api.patch(`/lives/${enEdition.id}`, payload).catch(() => {});
        setLives(prev => prev.map(l => l.id === enEdition.id ? { ...l, ...payload } : l));
        toast.success('✅ Live mis à jour !');
      } else {
        let nouveau: any;
        try { const { data } = await api.post('/lives', payload); nouveau = data; } catch { nouveau = { ...payload, id: 'local_' + Date.now(), vues: 0 }; }
        setLives(prev => [nouveau, ...prev]); toast.success('✅ Live ajouté !');
      }
      setModalForm(false);
    } catch { toast.error('Erreur'); }
    setEnvoi(false);
  };

  const supprimer = async (id: string) => {
    if (!confirm('Supprimer ce live ?')) return;
    await api.delete(`/lives/${id}`).catch(() => {});
    setLives(prev => prev.filter(l => l.id !== id)); toast.success('Supprimé');
  };

  const filtres   = lives.filter(l => filtre === 'Tous' || l.categorie === filtre);
  const enDirect  = lives.filter(l => l.statut === 'EN_DIRECT');
  const programmes = lives.filter(l => l.statut === 'PROGRAMME');
  const archives  = filtres.filter(l => l.statut === 'TERMINE');

  const inp: React.CSSProperties = { width: '100%', padding: '11px 14px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", boxSizing: 'border-box', color: '#1A1A1A', background: 'white' };

  return (
    <div style={{ background: '#F0F4FA', minHeight: '100vh' }}>

      {replay && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ width: '100%', maxWidth: 900 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 16, color: 'white', margin: 0 }}>{replay.titre}</h3>
              <button onClick={() => setReplay(null)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
              {replay.youtubeUrl ? <iframe src={getEmbedUrl(replay.youtubeUrl)} title={replay.titre} allow="autoplay; encrypted-media" allowFullScreen style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', borderRadius: 8 }} />
              : replay.videoUrl ? <video src={replay.videoUrl} controls autoPlay style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: 8 }} />
              : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Aucune vidéo disponible</div>}
            </div>
          </div>
        </div>
      )}

      <section style={{ background: `linear-gradient(135deg, #0D1B2A 0%, ${VERT} 100%)`, padding: 'clamp(40px,6vw,72px) clamp(20px,5vw,48px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: secondaire, fontWeight: 700, marginBottom: 14 }}>Webinaires Tech & Projets IA</div>
            <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(26px,4vw,44px)', color: 'white', margin: '0 0 10px', fontWeight: 'normal' }}>MediForm — En direct & Replays</h1>
            <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.7)', maxWidth: 520, margin: 0, lineHeight: 1.7 }}>
              Webinaires tech, masterclasses, hackathons et replays des formations IT en direct.
            </p>
          </div>
          {estAdmin && <button onClick={() => ouvrir()} style={{ padding: '13px 24px', background: secondaire, color: 'white', border: 'none', borderRadius: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>+ Ajouter un live</button>}
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(24px,4vw,48px) clamp(20px,5vw,48px)' }}>

        {enDirect.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 22, color: '#0D1B2A', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#DC2626', display: 'inline-block', animation: 'pulse 1.5s infinite' }} /> En direct
            </h2>
            {enDirect.map(l => (
              <div key={l.id} style={{ background: '#0D1B2A', border: `2px solid ${BLEU}`, borderRadius: 12, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: secondaire, fontWeight: 700, marginBottom: 6 }}>🔴 EN DIRECT</div>
                  <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 18, color: 'white', margin: '0 0 8px', fontWeight: 'normal' }}>{l.titre}</h3>
                  <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.65)', margin: 0 }}>{l.description}</p>
                </div>
                <button onClick={() => setReplay(l)} style={{ padding: '13px 28px', background: secondaire, color: 'white', border: 'none', borderRadius: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>▶ Regarder</button>
              </div>
            ))}
          </div>
        )}

        {programmes.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 22, color: '#0D1B2A', margin: '0 0 20px' }}>Prochaines webinaires tech</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {programmes.map(l => (
                <div key={l.id} style={{ background: 'white', border: `1px solid ${BLEU}30`, borderRadius: 10, padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 10, color: secondaire, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>📅 {new Date(l.dateDebut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                    <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 15, color: '#0D1B2A', margin: '0 0 6px', fontWeight: 'normal' }}>{l.titre}</h3>
                    <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#475569', margin: 0 }}>{l.description}</p>
                  </div>
                  {estAdmin && (
                    <div style={{ display: 'flex', gap: 4, marginLeft: 8 }}>
                      <button onClick={() => ouvrir(l)} style={{ padding: '6px 10px', background: '#EBF3FB', color: '#FF6B35', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>✏️</button>
                      <button onClick={() => supprimer(l.id)} style={{ padding: '6px 10px', background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>🗑</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {CATS.map(cat => (
            <button key={cat} onClick={() => setFiltre(cat)} style={{ padding: '7px 14px', borderRadius: 100, border: `1.5px solid ${filtre === cat ? VERT : '#CBD5E1'}`, background: filtre === cat ? VERT : 'white', color: filtre === cat ? 'white' : '#475569', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, fontWeight: filtre === cat ? 700 : 400, cursor: 'pointer' }}>{cat}</button>
          ))}
        </div>

        <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 22, color: '#0D1B2A', margin: '0 0 20px' }}>Replays & Archives Tech</h2>

        {archives.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#475569' }}><div style={{ fontSize: 40, marginBottom: 12 }}>🖥️</div><p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14 }}>Aucun replay dans cette catégorie.</p></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {archives.map(l => {
              const thumb = getYoutubeThumb(l.youtubeUrl ?? '');
              const catColor = CAT_COLORS[l.categorie] ?? VERT;
              return (
                <div key={l.id} style={{ background: 'white', border: '1px solid #CBD5E1', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${VERT}12`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}>
                  <div style={{ position: 'relative', height: 160, background: thumb ? `url(${thumb}) center/cover` : `linear-gradient(135deg, ${catColor}20, ${catColor}40)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={() => (l.youtubeUrl || l.videoUrl) && setReplay(l)}>
                    {!thumb && <span style={{ fontSize: 36 }}>🖥️</span>}
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>▶</div>
                    </div>
                    <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.6)', color: 'white', padding: '3px 8px', borderRadius: 4, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 10 }}>
                      👁 {(l.vues ?? 0).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 10, color: catColor, fontWeight: 700, background: `${catColor}12`, padding: '2px 8px', borderRadius: 100 }}>{l.categorie}</span>
                        <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 14, color: '#0D1B2A', lineHeight: 1.45, margin: '8px 0 6px', fontWeight: 'normal' }}>{l.titre}</h3>
                        <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#64748B' }}>📅 {new Date(l.dateDebut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                      </div>
                      {estAdmin && (
                        <div style={{ display: 'flex', gap: 4, marginLeft: 8, flexShrink: 0 }}>
                          <button onClick={e => { e.stopPropagation(); ouvrir(l); }} style={{ padding: '6px 8px', background: '#EBF3FB', color: '#FF6B35', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 11 }}>✏️</button>
                          <button onClick={e => { e.stopPropagation(); supprimer(l.id); }} style={{ padding: '6px 8px', background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 11 }}>🗑</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modalForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 14, padding: '28px 32px', width: '100%', maxWidth: 540, boxShadow: '0 24px 64px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, paddingBottom: 14, borderBottom: `2px solid ${VERT}` }}>
              <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 18, color: primaire, margin: 0 }}>{enEdition ? 'Modifier le live' : 'Ajouter une conférence'}</h2>
              <button onClick={() => setModalForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#64748B' }}>✕</button>
            </div>
            <form onSubmit={sauvegarder} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Titre *</label><input value={form.titre} required onChange={e => setForm((p: any) => ({ ...p, titre: e.target.value }))} placeholder="Ex : Masterclass JavaScript avancé 2026" style={inp} /></div>
              <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Description</label><textarea value={form.description} onChange={e => setForm((p: any) => ({ ...p, description: e.target.value }))} rows={3} style={{ ...inp, resize: 'vertical' }} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Catégorie</label>
                  <select value={form.categorie} onChange={e => setForm((p: any) => ({ ...p, categorie: e.target.value }))} style={{ ...inp, appearance: 'none' as any }}>
                    {CATS.filter(c => c !== 'Tous').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Statut</label>
                  <select value={form.statut} onChange={e => setForm((p: any) => ({ ...p, statut: e.target.value }))} style={{ ...inp, appearance: 'none' as any }}>
                    {['PROGRAMME','EN_DIRECT','TERMINE'].map(s => <option key={s} value={s}>{s === 'PROGRAMME' ? '📅 Programmé' : s === 'EN_DIRECT' ? '🔴 En direct' : '✅ Terminé'}</option>)}
                  </select>
                </div>
              </div>
              <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Date</label><input type="date" value={form.dateDebut} onChange={e => setForm((p: any) => ({ ...p, dateDebut: e.target.value }))} style={inp} /></div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Source vidéo</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                  {[{ val: 'LIVE', label: '🔗 URL (YouTube/Lien)', desc: 'Pour les conférences en ligne' }, { val: 'UPLOAD', label: '📁 Upload depuis PC', desc: 'MP4, WebM, MOV — max 500 MB' }].map(opt => (
                    <div key={opt.val} onClick={() => setForm((p: any) => ({ ...p, type: opt.val }))}
                      style={{ border: `2px solid ${form.type === opt.val ? VERT : '#E2E8F0'}`, borderRadius: 10, padding: '10px', cursor: 'pointer', background: form.type === opt.val ? `${primaire}06` : 'white', textAlign: 'center' }}>
                      <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, fontWeight: 700, color: form.type === opt.val ? VERT : '#374151', marginBottom: 2 }}>{opt.label}</div>
                      <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 10, color: '#94A3B8' }}>{opt.desc}</div>
                    </div>
                  ))}
                </div>
                {form.type === 'LIVE' ? (
                  <input value={form.youtubeUrl} onChange={e => setForm((p: any) => ({ ...p, youtubeUrl: e.target.value }))} placeholder="https://youtube.com/watch?v=... ou URL directe" style={inp} />
                ) : (
                  <div>
                    <div onClick={() => videoRef.current?.click()} style={{ border: `2px dashed ${videoPreview ? VERT : '#E2E8F0'}`, borderRadius: 10, padding: 20, textAlign: 'center', cursor: 'pointer', background: videoPreview ? `${primaire}04` : '#F8FAFC' }}>
                      {videoPreview ? (
                        <div><video src={videoPreview} style={{ maxWidth: '100%', maxHeight: 100, borderRadius: 6, marginBottom: 8 }} /><p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#16A34A', margin: 0, fontWeight: 600 }}>✓ {videoFile?.name}</p></div>
                      ) : (
                        <div><div style={{ fontSize: 32, marginBottom: 8 }}>🎬</div><p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#64748B', margin: 0, fontWeight: 600 }}>Cliquer pour sélectionner la vidéo</p></div>
                      )}
                    </div>
                    <input ref={videoRef} type="file" accept="video/mp4,video/webm,video/ogg,video/quicktime,.mov" onChange={handleVideo} style={{ display: 'none' }} />
                    {videoErreur && <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#DC2626', margin: '6px 0 0' }}>⚠ {videoErreur}</p>}
                  </div>
                )}
              </div>
              <button type="submit" disabled={envoi} style={{ width: '100%', padding: '14px', background: primaire, color: 'white', border: 'none', borderRadius: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                {envoi ? 'Sauvegarde…' : (enEdition ? 'Enregistrer →' : 'Ajouter →')}
              </button>
            </form>
          </div>
        </div>
      )}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}
