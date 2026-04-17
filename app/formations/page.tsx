// app/formations/page.tsx — TechPro Haiti
'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useTenant } from '@/lib/tenantContext';
import api from '@/lib/api';
import ModalPaiement from '@/components/paiement/ModalPaiement';
import toast from 'react-hot-toast';

const VERT = '#1B3A6B';
const BLEU = '#FF6B35';

const NIV: Record<string, { bg: string; text: string; label: string }> = {
  DEBUTANT:      { bg: '#DCFCE7', text: '#1E40AF', label: 'Débutant' },
  INTERMEDIAIRE: { bg: '#DBEAFE', text: '#1E40AF', label: 'Intermédiaire' },
  AVANCE:        { bg: '#FCE7F3', text: '#9D174D', label: 'Avancé' },
};

const FORMATIONS_DEMO = [
  { id: 'demo-1', titre: 'Développement Web Full Stack', description: 'HTML, CSS, JavaScript, React et Node.js — de zéro à développeur full stack professionnel.', niveau: 'DEBUTANT', categorie: 'Développement Web', publie: true, gratuit: true, _count: { lecons: 12, inscriptions: 512 }, imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80' },
  { id: 'demo-2', titre: 'Cybersécurité & Ethical Hacking', description: 'Sécurité des réseaux, tests de pénétration, cryptographie et gestion des vulnérabilités.', niveau: 'INTERMEDIAIRE', categorie: 'Cybersécurité', publie: true, gratuit: false, _count: { lecons: 14, inscriptions: 298 }, imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&q=80' },
  { id: 'demo-3', titre: 'Cloud Computing et réanimation', description: 'AWS, Azure, GCP — déploiement cloud, serverless, conteneurs Docker et Kubernetes.', niveau: 'AVANCE', categorie: 'Cloud Computing', publie: true, gratuit: false, _count: { lecons: 18, inscriptions: 187 }, imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80' },
  { id: 'demo-4', titre: 'Data Science & Python', description: 'Python, Pandas, Machine Learning et visualisation de données avec Matplotlib et Seaborn.', niveau: 'INTERMEDIAIRE', categorie: 'Data Science', publie: true, gratuit: false, _count: { lecons: 16, inscriptions: 156 }, imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80' },
  { id: 'demo-5', titre: 'Intelligence Artificielle & Deep Learning', description: 'TensorFlow, PyTorch, réseaux de neurones, NLP et Computer Vision appliqués aux projets réels.', niveau: 'AVANCE', categorie: 'Intelligence Artificielle', publie: true, gratuit: false, _count: { lecons: 20, inscriptions: 243 }, imageUrl: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80' },
  { id: 'demo-6', titre: 'Gestion de Projet IT & Agile', description: 'Scrum, Kanban, JIRA, gestion d\'équipes tech et livraison de projets informatiques.', niveau: 'DEBUTANT', categorie: 'Santé publique', publie: true, gratuit: true, _count: { lecons: 8, inscriptions: 412 }, imageUrl: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=600&q=80' },
];

const CATEGORIES = ['Tous', 'Développement Web', 'Cybersécurité', 'Cloud Computing', 'Data Science', 'Intelligence Artificielle', 'Santé publique', 'Développement Mobile', 'DevOps'];

const FORM_VIDE = { titre: '', description: '', niveau: 'DEBUTANT', categorie: 'Développement Web', publie: true, gratuit: true, typeVideo: 'UPLOAD' as const, videoUrl: '', imageUrl: '' };

export default function PageFormations() {
  const { utilisateur } = useAuthStore();
  const { config } = useTenant();

  const [formations, setFormations]   = useState(FORMATIONS_DEMO);
  const [filtreNiveau, setFiltreNiveau] = useState('tous');
  const [filtreCat, setFiltreCat]       = useState('Tous');
  const [chargement, setChargement]     = useState(true);
  const [modal, setModal]               = useState<{ montantHTG: number; description: string } | null>(null);
  const [modalForm, setModalForm]       = useState(false);
  const [enEdition, setEnEdition]       = useState<any>(null);
  const [form, setForm]                 = useState<any>(FORM_VIDE);
  const [videoFile, setVideoFile]       = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [videoErreur, setVideoErreur]   = useState('');
  const [imageFile, setImageFile]       = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [envoi, setEnvoi]               = useState(false);
  const videoRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);

  const primaire   = config?.couleursTheme.primaire   ?? VERT;
  const secondaire = config?.couleursTheme.secondaire ?? BLEU;
  const estAdmin   = ['ADMIN', 'FORMATEUR'].includes(utilisateur?.role ?? '');

  useEffect(() => {
    api.get('/cours').then(({ data }) => { if (Array.isArray(data) && data.length) setFormations(data); }).catch(() => {}).finally(() => setChargement(false));
  }, []);

  const handleVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setVideoErreur('');
    if (!['video/mp4','video/webm','video/ogg','video/quicktime'].includes(f.type)) { setVideoErreur('Format non supporté. MP4, WebM, OGG ou MOV.'); return; }
    if (f.size > 500 * 1024 * 1024) { setVideoErreur('Maximum 500 MB.'); return; }
    setVideoFile(f); setVideoPreview(URL.createObjectURL(f));
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    if (!['image/png','image/jpeg','image/webp'].includes(f.type)) return;
    if (f.size > 2 * 1024 * 1024) return;
    setImageFile(f);
    const reader = new FileReader(); reader.onload = () => setImagePreview(reader.result as string); reader.readAsDataURL(f);
  };

  const fileEnBase64 = (file: File): Promise<string> => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(file); });

  const ouvrir = (f?: any) => {
    setEnEdition(f ?? null);
    setForm(f ? { titre: f.titre, description: f.description, niveau: f.niveau, categorie: f.categorie, publie: f.publie, gratuit: f.gratuit ?? true, typeVideo: 'UPLOAD', videoUrl: f.videoUrl ?? '', imageUrl: f.imageUrl ?? '' } : FORM_VIDE);
    setVideoFile(null); setVideoPreview(''); setVideoErreur(''); setImageFile(null); setImagePreview('');
    setModalForm(true);
  };

  const sauvegarder = async (e: React.FormEvent) => {
    e.preventDefault(); if (!form.titre.trim()) { toast.error('Le titre est requis'); return; }
    setEnvoi(true);
    try {
      let videoUrl = ''; let imageUrl = form.imageUrl;
      if (videoFile) videoUrl = await fileEnBase64(videoFile);
      if (imageFile) imageUrl = await fileEnBase64(imageFile);
      const payload = { titre: form.titre, description: form.description, niveau: form.niveau, categorie: form.categorie, publie: form.publie, gratuit: form.gratuit, videoUrl, imageUrl };
      if (enEdition) {
        await api.patch(`/cours/${enEdition.id}`, payload).catch(() => {});
        setFormations(prev => prev.map(f => f.id === enEdition.id ? { ...f, ...payload } : f));
        toast.success('✅ Formation mise à jour !');
      } else {
        let nouveau: any;
        try { const { data } = await api.post('/cours', payload); nouveau = { ...data, _count: { lecons: 0, inscriptions: 0 } }; }
        catch { nouveau = { ...payload, id: 'local_' + Date.now(), _count: { lecons: 0, inscriptions: 0 } }; }
        setFormations(prev => [nouveau, ...prev]); toast.success('✅ Formation créée !');
      }
      setModalForm(false);
    } catch { toast.error('Erreur'); }
    setEnvoi(false);
  };

  const supprimer = async (id: string) => {
    if (!confirm('Supprimer cette formation ?')) return;
    await api.delete(`/cours/${id}`).catch(() => {});
    setFormations(prev => prev.filter(f => f.id !== id)); toast.success('Supprimé');
  };

  const filtrees = formations.filter(f => {
    if (!f.publie && !estAdmin) return false;
    if (filtreNiveau !== 'tous' && f.niveau !== filtreNiveau) return false;
    if (filtreCat !== 'Tous' && f.categorie !== filtreCat) return false;
    return true;
  });

  const inp: React.CSSProperties = { width: '100%', padding: '11px 14px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", boxSizing: 'border-box', color: '#1A1A1A', background: 'white' };

  return (
    <div style={{ background: '#F0F4FA', minHeight: '100vh' }}>
      {modal && <ModalPaiement montantHTG={modal.montantHTG} description={modal.description} plan="PREMIUM" onFermer={() => setModal(null)} />}

      {/* Hero */}
      <section style={{ background: `linear-gradient(135deg, #0D1B2A 0%, ${primaire} 100%)`, padding: 'clamp(40px,6vw,72px) clamp(20px,5vw,48px)', textAlign: 'center' }}>
        <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: secondaire, fontWeight: 700, marginBottom: 14 }}>Formation IT professionnelle</div>
        <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(26px,4vw,44px)', color: 'white', margin: '0 0 14px', fontWeight: 'normal' }}>Maîtrisez les sciences de la santé</h1>
        <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 'clamp(13px,1.6vw,16px)', color: 'rgba(255,255,255,0.7)', maxWidth: 520, margin: '0 auto 28px', lineHeight: 1.7 }}>
          Formations conçues par des développeurs et experts IT haïtiens. Du débutant au professionnel confirmé.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'inline-flex', gap: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 100, padding: 4 }}>
            {['tous', 'DEBUTANT', 'INTERMEDIAIRE', 'AVANCE'].map(n => (
              <button key={n} onClick={() => setFiltreNiveau(n)}
                style={{ padding: '8px 16px', borderRadius: 100, border: 'none', background: filtreNiveau === n ? 'white' : 'transparent', color: filtreNiveau === n ? primaire : 'rgba(255,255,255,0.75)', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, fontWeight: filtreNiveau === n ? 700 : 400, cursor: 'pointer' }}>
                {n === 'tous' ? 'Tous niveaux' : NIV[n]?.label}
              </button>
            ))}
          </div>
          {estAdmin && (
            <button onClick={() => ouvrir()} style={{ padding: '8px 20px', background: secondaire, color: 'white', border: 'none', borderRadius: 100, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>
              + Nouvelle formation
            </button>
          )}
        </div>
      </section>

      {/* Filtres catégorie */}
      <div style={{ background: 'white', borderBottom: '1px solid #CBD5E1', position: 'sticky', top: 56, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(20px,5vw,48px)', display: 'flex', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setFiltreCat(cat)}
              style={{ padding: '13px 14px', background: 'none', border: 'none', borderBottom: `2px solid ${filtreCat === cat ? primaire : 'transparent'}`, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: filtreCat === cat ? primaire : '#64748B', fontWeight: filtreCat === cat ? 700 : 400, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grille */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(24px,4vw,48px) clamp(20px,5vw,48px)' }}>
        {chargement ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#475569' }}>Chargement…</div>
        ) : filtrees.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🖥️</div>
            <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, color: '#475569' }}>Aucune formation dans cette catégorie.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {filtrees.map((f: any) => {
              const niv = NIV[f.niveau] ?? NIV['DEBUTANT'];
              return (
                <div key={f.id} style={{ background: 'white', border: '1px solid #CBD5E1', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.2s', position: 'relative' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${primaire}18`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}>
                  {estAdmin && (
                    <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 10, display: 'flex', gap: 4 }}>
                      <button onClick={() => ouvrir(f)} style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 11 }}>✏️</button>
                      <button onClick={() => supprimer(f.id)} style={{ padding: '4px 8px', background: 'rgba(254,242,242,0.9)', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 11, color: '#DC2626' }}>🗑</button>
                    </div>
                  )}
                  <Link href={`/formations/${f.id}`} style={{ textDecoration: 'none', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {f.imageUrl ? (
                      <div style={{ height: 160, background: `url(${f.imageUrl}) center/cover` }} />
                    ) : (
                      <div style={{ height: 160, background: `linear-gradient(135deg, ${primaire}20, ${secondaire}20)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>🖥️</div>
                    )}
                    <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                        <span style={{ background: niv.bg, color: niv.text, fontSize: 10, padding: '2px 8px', borderRadius: 100, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700 }}>{niv.label}</span>
                        {f.gratuit !== false && <span style={{ background: '#DCFCE7', color: '#1E40AF', fontSize: 10, padding: '2px 8px', borderRadius: 100, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700 }}>Gratuit</span>}
                      </div>
                      <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 16, color: '#0D1B2A', lineHeight: 1.4, margin: '0 0 8px', fontWeight: 'normal', flex: 1 }}>{f.titre}</h3>
                      <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#475569', lineHeight: 1.55, margin: '0 0 14px' }}>{f.description}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid #EBF3FB' }}>
                        <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#64748B' }}>
                          📚 {f._count?.lecons ?? 0} leçons · 👥 {f._count?.inscriptions ?? 0} inscrits
                        </div>
                        <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, fontWeight: 700, color: primaire }}>Voir →</span>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: 48, background: '#0D1B2A', borderRadius: 12, padding: '28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 20, color: secondaire, margin: '0 0 8px' }}>Bibliothèque Tech Haïtienne</h3>
            <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.65)', margin: 0, maxWidth: 480 }}>Documentation, guides techniques et ressources pour approfondir chaque formation.</p>
          </div>
          <Link href="/bibliotheque" style={{ padding: '12px 24px', background: secondaire, color: 'white', borderRadius: 6, textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>Bibliothèque →</Link>
        </div>
      </div>

      {/* Modal création formation */}
      {modalForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 14, padding: '28px 32px', width: '100%', maxWidth: 540, boxShadow: '0 24px 64px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, paddingBottom: 14, borderBottom: `2px solid ${primaire}` }}>
              <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 18, color: primaire, margin: 0 }}>{enEdition ? 'Modifier' : 'Nouvelle formation'}</h2>
              <button onClick={() => setModalForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#64748B' }}>✕</button>
            </div>
            <form onSubmit={sauvegarder} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Titre *</label><input value={form.titre} required onChange={e => setForm((p: any) => ({ ...p, titre: e.target.value }))} placeholder="Ex : Développement Web avancés" style={inp} /></div>
              <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Description</label><textarea value={form.description} onChange={e => setForm((p: any) => ({ ...p, description: e.target.value }))} rows={3} style={{ ...inp, resize: 'vertical' }} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Niveau</label>
                  <select value={form.niveau} onChange={e => setForm((p: any) => ({ ...p, niveau: e.target.value }))} style={{ ...inp, appearance: 'none' as any }}>
                    {['DEBUTANT','INTERMEDIAIRE','AVANCE'].map(n => <option key={n} value={n}>{NIV[n].label}</option>)}
                  </select>
                </div>
                <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Catégorie</label>
                  <select value={form.categorie} onChange={e => setForm((p: any) => ({ ...p, categorie: e.target.value }))} style={{ ...inp, appearance: 'none' as any }}>
                    {CATEGORIES.filter(c => c !== 'Tous').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13 }}><input type="checkbox" checked={form.publie} onChange={e => setForm((p: any) => ({ ...p, publie: e.target.checked }))} /> Publier</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13 }}><input type="checkbox" checked={form.gratuit} onChange={e => setForm((p: any) => ({ ...p, gratuit: e.target.checked }))} /> Gratuit</label>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Image de couverture</label>
                <div onClick={() => imageRef.current?.click()} style={{ border: `2px dashed ${imagePreview ? primaire : '#E2E8F0'}`, borderRadius: 10, padding: 16, textAlign: 'center', cursor: 'pointer', background: imagePreview ? `${primaire}04` : '#F8FAFC', height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {imagePreview ? <img src={imagePreview} style={{ maxHeight: 64, maxWidth: '100%', objectFit: 'contain', borderRadius: 4 }} /> : <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#94A3B8' }}>🖼 Image de couverture (PNG, JPG — max 2MB)</span>}
                </div>
                <input ref={imageRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImage} style={{ display: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Vidéo du cours (pré-enregistrée)</label>
                <div style={{ background: '#F8F7F4', border: '1px solid #E8E4DC', borderRadius: 8, padding: '10px 14px', marginBottom: 10, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#64748B' }}>
                  📁 <strong>Formats :</strong> MP4, WebM, OGG, MOV · <strong>Max :</strong> 500 MB
                </div>
                <div onClick={() => videoRef.current?.click()} style={{ border: `2px dashed ${videoPreview ? primaire : '#E2E8F0'}`, borderRadius: 10, padding: 20, textAlign: 'center', cursor: 'pointer', background: videoPreview ? `${primaire}04` : '#F8FAFC' }}>
                  {videoPreview ? (
                    <div><video src={videoPreview} style={{ maxWidth: '100%', maxHeight: 100, borderRadius: 6, marginBottom: 8 }} /><p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#16A34A', margin: 0, fontWeight: 600 }}>✓ {videoFile?.name}</p></div>
                  ) : (
                    <div><div style={{ fontSize: 32, marginBottom: 8 }}>🎬</div><p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#64748B', margin: 0, fontWeight: 600 }}>Cliquer pour sélectionner la vidéo</p><p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#94A3B8', margin: '4px 0 0' }}>Depuis votre ordinateur, clé USB, disque externe…</p></div>
                  )}
                </div>
                <input ref={videoRef} type="file" accept="video/mp4,video/webm,video/ogg,video/quicktime,.mov" onChange={handleVideo} style={{ display: 'none' }} />
                {videoErreur && <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#DC2626', margin: '6px 0 0' }}>⚠ {videoErreur}</p>}
              </div>
              <button type="submit" disabled={envoi} style={{ width: '100%', padding: '14px', background: primaire, color: 'white', border: 'none', borderRadius: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 15, cursor: 'pointer', marginTop: 4 }}>
                {envoi ? 'Sauvegarde…' : (enEdition ? 'Enregistrer →' : 'Créer la formation →')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
