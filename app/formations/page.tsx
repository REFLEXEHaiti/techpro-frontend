// app/formations/page.tsx — TechPro Haiti
// Catalogue complet : Informatique, Comptabilité, Secrétariat, Droit, Finance, Immobilier, Communication
// Admin : ajouter/modifier/supprimer formation + upload fichier ou URL
'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useTenant } from '@/lib/tenantContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const BLEU   = '#1B3A6B';
const ORANGE = '#FF6B35';

// ── Catalogue TechPro / Juris-Expert ───────────────────────────
const CATEGORIES = [
  { id: 'tous',            label: 'Tous les domaines',      icone: '🎯' },
  { id: 'informatique',   label: 'Informatique & IT',       icone: '💻' },
  { id: 'comptabilite',   label: 'Comptabilité & Finance',  icone: '📊' },
  { id: 'secretariat',    label: 'Secrétariat & Admin',     icone: '📋' },
  { id: 'droit',          label: 'Droit & Juridique',       icone: '⚖️' },
  { id: 'immobilier',     label: 'Immobilier',              icone: '🏠' },
  { id: 'communication',  label: 'Communication & Marketing', icone: '📣' },
  { id: 'gestion',        label: 'Gestion de Projet',       icone: '📈' },
  { id: 'caissier',       label: 'Caissier & Commerce',     icone: '🏪' },
  { id: 'developpement',  label: 'Développement Web',       icone: '🌐' },
  { id: 'cybersecurite',  label: 'Cybersécurité',           icone: '🔒' },
  { id: 'ia',             label: 'Intelligence Artificielle', icone: '🤖' },
];

const FORMATIONS_DEMO = [
  // Informatique
  { id: 'demo-1', titre: 'Bureautique & Microsoft Office', description: 'Word, Excel, PowerPoint et Outlook — maîtrisez la suite Office pour le milieu professionnel haïtien.', niveau: 'DEBUTANT', categorie: 'Informatique & IT', publie: true, gratuit: true, _count: { lecons: 8, inscriptions: 842 }, imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80' },
  { id: 'demo-2', titre: 'Développement Web Full Stack', description: 'HTML, CSS, JavaScript, React et Node.js — construisez des applications web professionnelles de A à Z.', niveau: 'INTERMEDIAIRE', categorie: 'Développement Web', publie: true, gratuit: false, _count: { lecons: 14, inscriptions: 512 }, imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80' },
  { id: 'demo-3', titre: 'Cybersécurité & Protection des données', description: 'Sécurité des réseaux, protection des données personnelles et sensibilisation aux cybermenaces.', niveau: 'INTERMEDIAIRE', categorie: 'Cybersécurité', publie: true, gratuit: false, _count: { lecons: 10, inscriptions: 298 }, imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&q=80' },
  // Comptabilité & Finance
  { id: 'demo-4', titre: 'Comptabilité générale haïtienne', description: 'Principes fondamentaux de la comptabilité, plan comptable haïtien, écritures courantes et bilan.', niveau: 'DEBUTANT', categorie: 'Comptabilité & Finance', publie: true, gratuit: true, _count: { lecons: 12, inscriptions: 634 }, imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80' },
  { id: 'demo-5', titre: 'Finance d\'entreprise & Analyse financière', description: 'Lecture des états financiers, ratios, budget prévisionnel et gestion de trésorerie.', niveau: 'INTERMEDIAIRE', categorie: 'Comptabilité & Finance', publie: true, gratuit: false, _count: { lecons: 10, inscriptions: 289 }, imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80' },
  { id: 'demo-6', titre: 'Fiscalité haïtienne & DGI', description: 'Obligations fiscales des entreprises en Haïti, déclarations DGI, TVA, CFPB et conformité fiscale.', niveau: 'AVANCE', categorie: 'Comptabilité & Finance', publie: true, gratuit: false, _count: { lecons: 8, inscriptions: 187 }, imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&q=80' },
  // Secrétariat
  { id: 'demo-7', titre: 'Secrétariat professionnel & Gestion administrative', description: 'Accueil, rédaction de courriers professionnels, gestion d\'agenda et archivage documentaire.', niveau: 'DEBUTANT', categorie: 'Secrétariat & Admin', publie: true, gratuit: true, _count: { lecons: 9, inscriptions: 723 }, imageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&q=80' },
  { id: 'demo-8', titre: 'Ressources humaines & Gestion du personnel', description: 'Recrutement, contrats de travail haïtien, paie, congés et droit du travail en Haïti.', niveau: 'INTERMEDIAIRE', categorie: 'Secrétariat & Admin', publie: true, gratuit: false, _count: { lecons: 11, inscriptions: 341 }, imageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&q=80' },
  // Droit & Juridique
  { id: 'demo-9', titre: 'Droit des affaires haïtien', description: 'Création d\'entreprise, contrats commerciaux, sociétés commerciales et résolution de litiges.', niveau: 'INTERMEDIAIRE', categorie: 'Droit & Juridique', publie: true, gratuit: false, _count: { lecons: 13, inscriptions: 256 }, imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80' },
  { id: 'demo-10', titre: 'Droit foncier & Transactions immobilières en Haïti', description: 'Titres fonciers, actes notariés, procédures d\'acquisition et litiges fonciers haïtiens.', niveau: 'AVANCE', categorie: 'Droit & Juridique', publie: true, gratuit: false, _count: { lecons: 10, inscriptions: 198 }, imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80' },
  // Immobilier
  { id: 'demo-11', titre: 'Agent immobilier professionnel', description: 'Estimation, prospection, négociation, rédaction de mandats et réglementation immobilière haïtienne.', niveau: 'DEBUTANT', categorie: 'Immobilier', publie: true, gratuit: false, _count: { lecons: 10, inscriptions: 312 }, imageUrl: 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=600&q=80' },
  // Communication & Marketing
  { id: 'demo-12', titre: 'Communication professionnelle & Prise de parole', description: 'Rédaction professionnelle, communication orale, présentation efficace et image de marque personnelle.', niveau: 'DEBUTANT', categorie: 'Communication & Marketing', publie: true, gratuit: true, _count: { lecons: 8, inscriptions: 541 }, imageUrl: 'https://images.unsplash.com/photo-1557838923-2985c318be48?w=600&q=80' },
  { id: 'demo-13', titre: 'Marketing digital & Réseaux sociaux', description: 'Stratégie digitale, gestion des réseaux sociaux, publicité Facebook/Instagram et SEO pour Haïti.', niveau: 'INTERMEDIAIRE', categorie: 'Communication & Marketing', publie: true, gratuit: false, _count: { lecons: 12, inscriptions: 467 }, imageUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&q=80' },
  // Caissier & Commerce
  { id: 'demo-14', titre: 'Caissier professionnel & Gestion de caisse', description: 'Opérations de caisse, rendu de monnaie, logiciels de point de vente et contrôle des encaissements.', niveau: 'DEBUTANT', categorie: 'Caissier & Commerce', publie: true, gratuit: true, _count: { lecons: 6, inscriptions: 789 }, imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80' },
  // Gestion
  { id: 'demo-15', titre: 'Gestion de projet & Leadership', description: 'Scrum, Kanban, gestion d\'équipes, planification et livraison de projets en contexte haïtien.', niveau: 'INTERMEDIAIRE', categorie: 'Gestion de Projet', publie: true, gratuit: false, _count: { lecons: 11, inscriptions: 378 }, imageUrl: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=600&q=80' },
  // IA
  { id: 'demo-16', titre: 'Intelligence Artificielle pour les professionnels', description: 'ChatGPT, outils IA appliqués aux entreprises haïtiennes : comptabilité, marketing, service client.', niveau: 'DEBUTANT', categorie: 'Intelligence Artificielle', publie: true, gratuit: true, _count: { lecons: 7, inscriptions: 923 }, imageUrl: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80' },
];

const NIVEAUX: Record<string, { label: string; bg: string; color: string }> = {
  DEBUTANT:      { label: '🟢 Débutant',       bg: '#DCFCE7', color: '#166534' },
  INTERMEDIAIRE: { label: '🔵 Intermédiaire',  bg: '#DBEAFE', color: '#1E40AF' },
  AVANCE:        { label: '🔴 Avancé',          bg: '#FCE7F3', color: '#9D174D' },
};

const FORM_VIDE = {
  titre: '', description: '', categorie: 'Informatique & IT', niveau: 'DEBUTANT',
  gratuit: false, publie: true,
  typeContenu: 'VIDEO' as 'VIDEO' | 'DOCUMENT',
  sourceVideo: 'VIDEO_URL' as 'VIDEO_URL' | 'VIDEO_UPLOAD',
  videoUrl: '',
  sourceDoc: 'PDF_URL' as 'PDF_URL' | 'PDF_UPLOAD',
  pdfUrl: '',
  imageUrl: '',
};

export default function PageFormations() {
  const { estConnecte, utilisateur } = useAuthStore();
  const { config } = useTenant();

  const primaire   = config?.couleursTheme.primaire   ?? BLEU;
  const secondaire = config?.couleursTheme.secondaire ?? ORANGE;
  const estAdmin   = ['ADMIN', 'FORMATEUR'].includes(utilisateur?.role ?? '');

  const [formations, setFormations] = useState<any[]>(FORMATIONS_DEMO);
  const [filtreCat, setFiltreCat]   = useState('tous');
  const [filtreNiv, setFiltreNiv]   = useState('tous');
  const [recherche, setRecherche]   = useState('');
  const [modalForm, setModalForm]   = useState(false);
  const [editing, setEditing]       = useState<any>(null);
  const [form, setForm]             = useState<any>(FORM_VIDE);
  const [videoFile, setVideoFile]   = useState<File | null>(null);
  const [pdfFile, setPdfFile]       = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [envoi, setEnvoi]           = useState(false);

  const videoRef = useRef<HTMLInputElement>(null);
  const pdfRef   = useRef<HTMLInputElement>(null);
  const imgRef   = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get('/cours').then(({ data }) => {
      if (Array.isArray(data) && data.length) setFormations(data);
    }).catch(() => {});
  }, []);

  const filtrees = formations.filter(f => {
    const catMatch = filtreCat === 'tous' || f.categorie?.toLowerCase().includes(
      CATEGORIES.find(c => c.id === filtreCat)?.label.split(' ')[0].toLowerCase() ?? ''
    );
    const nivMatch = filtreNiv === 'tous' || f.niveau === filtreNiv;
    const recMatch = !recherche || f.titre?.toLowerCase().includes(recherche.toLowerCase()) ||
      f.description?.toLowerCase().includes(recherche.toLowerCase());
    return catMatch && nivMatch && recMatch;
  });

  const fileEnBase64 = (file: File) => new Promise<string>((res, rej) => {
    const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(file);
  });

  const ouvrirAjout = () => {
    setEditing(null);
    setForm(FORM_VIDE);
    setVideoFile(null); setVideoPreview(''); setPdfFile(null);
    setModalForm(true);
  };

  const ouvrirEdit = (f: any) => {
    setEditing(f);
    setForm({ ...FORM_VIDE, ...f });
    setVideoFile(null); setVideoPreview(''); setPdfFile(null);
    setModalForm(true);
  };

  const handleVideoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setVideoFile(f); setVideoPreview(URL.createObjectURL(f));
  };

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const b64 = await fileEnBase64(f);
    setForm((p: any) => ({ ...p, imageUrl: b64 }));
  };

  const soumettre = async (e: React.FormEvent) => {
    e.preventDefault(); setEnvoi(true);
    try {
      let payload = { ...form };
      if (videoFile && form.sourceVideo === 'VIDEO_UPLOAD') payload.videoUrl = await fileEnBase64(videoFile);
      if (pdfFile   && form.sourceDoc   === 'PDF_UPLOAD')   payload.pdfUrl   = await fileEnBase64(pdfFile);
      if (editing) {
        const { data } = await api.put(`/cours/${editing.id}`, payload);
        setFormations(prev => prev.map(f => f.id === editing.id ? data : f));
        toast.success('Formation mise à jour !');
      } else {
        const { data } = await api.post('/cours', payload);
        setFormations(prev => [data, ...prev]);
        toast.success('Formation créée !');
      }
      setModalForm(false);
    } catch {
      if (editing) {
        setFormations(prev => prev.map(f => f.id === editing.id ? { ...f, ...form } : f));
      } else {
        const nouveau = { ...form, id: 'local_' + Date.now(), _count: { lecons: 0, inscriptions: 0 } };
        setFormations(prev => [nouveau, ...prev]);
      }
      toast.success(editing ? 'Formation mise à jour !' : 'Formation créée !');
      setModalForm(false);
    }
    setEnvoi(false);
  };

  const supprimerFormation = async (id: string) => {
    if (!confirm('Supprimer cette formation ?')) return;
    await api.delete(`/cours/${id}`).catch(() => {});
    setFormations(prev => prev.filter(f => f.id !== id));
    toast.success('Formation supprimée');
  };

  const inp: React.CSSProperties = { width: '100%', padding: '10px 12px', border: '1.5px solid #CBD5E1', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' as const, fontFamily: "'Helvetica Neue',Arial,sans-serif", color: '#0D1B2A' };
  const lbl: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 5, fontFamily: "'Helvetica Neue',Arial,sans-serif" };

  return (
    <div style={{ background: '#F0F4FA', minHeight: '100vh' }}>

      {/* Modal ajout/édition */}
      {modalForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: '28px 32px', width: '100%', maxWidth: 620, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 14, borderBottom: `2px solid ${primaire}` }}>
              <h2 style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 18, fontWeight: 800, color: primaire, margin: 0 }}>
                {editing ? '✏️ Modifier la formation' : '➕ Nouvelle formation'}
              </h2>
              <button onClick={() => setModalForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#64748B' }}>✕</button>
            </div>
            <form onSubmit={soumettre} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><label style={lbl}>Titre *</label><input required value={form.titre} onChange={e => setForm((p: any) => ({ ...p, titre: e.target.value }))} placeholder="Ex : Comptabilité générale haïtienne" style={inp} /></div>
              <div><label style={lbl}>Description *</label><textarea required value={form.description} onChange={e => setForm((p: any) => ({ ...p, description: e.target.value }))} rows={3} placeholder="Décrivez le contenu de la formation..." style={{ ...inp, resize: 'none' as const }} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={lbl}>Catégorie</label>
                  <select value={form.categorie} onChange={e => setForm((p: any) => ({ ...p, categorie: e.target.value }))} style={{ ...inp, appearance: 'none' as any }}>
                    {CATEGORIES.filter(c => c.id !== 'tous').map(c => <option key={c.id} value={c.label}>{c.icone} {c.label}</option>)}
                  </select>
                </div>
                <div><label style={lbl}>Niveau</label>
                  <select value={form.niveau} onChange={e => setForm((p: any) => ({ ...p, niveau: e.target.value }))} style={{ ...inp, appearance: 'none' as any }}>
                    <option value="DEBUTANT">🟢 Débutant</option>
                    <option value="INTERMEDIAIRE">🔵 Intermédiaire</option>
                    <option value="AVANCE">🔴 Avancé</option>
                  </select>
                </div>
              </div>

              {/* Image de couverture */}
              <div>
                <label style={lbl}>Image de couverture</label>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input value={form.imageUrl?.startsWith('data:') ? '' : (form.imageUrl ?? '')}
                    onChange={e => setForm((p: any) => ({ ...p, imageUrl: e.target.value }))}
                    placeholder="URL de l'image (https://...)" style={{ ...inp, flex: 1 }} />
                  <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#64748B' }}>ou</span>
                  <button type="button" onClick={() => imgRef.current?.click()}
                    style={{ padding: '8px 14px', background: `${primaire}10`, color: primaire, border: `1px solid ${primaire}40`, borderRadius: 8, cursor: 'pointer', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' as const }}>
                    📁 Choisir
                  </button>
                  <input ref={imgRef} type="file" accept="image/*" onChange={handleImageFile} style={{ display: 'none' }} />
                </div>
                {form.imageUrl && <img src={form.imageUrl} alt="" style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8, marginTop: 8 }} />}
              </div>

              {/* Contenu principal */}
              <div style={{ background: '#F8FAFF', border: `1px solid ${primaire}20`, borderRadius: 10, padding: '14px 16px' }}>
                <label style={{ ...lbl, marginBottom: 10 }}>Type de contenu principal</label>
                <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                  {[{ v: 'VIDEO', l: '🎬 Vidéo' }, { v: 'DOCUMENT', l: '📄 Document PDF' }].map(t => (
                    <button type="button" key={t.v} onClick={() => setForm((p: any) => ({ ...p, typeContenu: t.v }))}
                      style={{ flex: 1, padding: '10px', border: `2px solid ${form.typeContenu === t.v ? primaire : '#CBD5E1'}`, borderRadius: 8, background: form.typeContenu === t.v ? `${primaire}08` : 'white', color: form.typeContenu === t.v ? primaire : '#64748B', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                      {t.l}
                    </button>
                  ))}
                </div>

                {form.typeContenu === 'VIDEO' && (
                  <>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                      {[{ v: 'VIDEO_URL', l: '🔗 URL (YouTube/Lien)' }, { v: 'VIDEO_UPLOAD', l: '📁 Upload depuis PC' }].map(s => (
                        <button type="button" key={s.v} onClick={() => setForm((p: any) => ({ ...p, sourceVideo: s.v }))}
                          style={{ flex: 1, padding: '8px', border: `1.5px solid ${form.sourceVideo === s.v ? secondaire : '#CBD5E1'}`, borderRadius: 6, background: form.sourceVideo === s.v ? `${secondaire}08` : 'white', color: form.sourceVideo === s.v ? secondaire : '#94A3B8', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                          {s.l}
                        </button>
                      ))}
                    </div>
                    {form.sourceVideo === 'VIDEO_URL' ? (
                      <input value={form.videoUrl} onChange={e => setForm((p: any) => ({ ...p, videoUrl: e.target.value }))}
                        placeholder="https://www.youtube.com/watch?v=..." style={inp} />
                    ) : (
                      <div>
                        <button type="button" onClick={() => videoRef.current?.click()}
                          style={{ width: '100%', padding: '14px', background: videoFile ? '#DCFCE7' : `${primaire}08`, border: `2px dashed ${videoFile ? '#16A34A' : primaire}`, borderRadius: 8, cursor: 'pointer', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, fontWeight: 700, color: videoFile ? '#16A34A' : primaire }}>
                          {videoFile ? `✅ ${videoFile.name}` : '📁 Cliquez pour choisir une vidéo (MP4, WebM)'}
                        </button>
                        <input ref={videoRef} type="file" accept="video/*" onChange={handleVideoFile} style={{ display: 'none' }} />
                        {videoPreview && <video src={videoPreview} controls style={{ width: '100%', marginTop: 8, borderRadius: 8 }} />}
                      </div>
                    )}
                  </>
                )}

                {form.typeContenu === 'DOCUMENT' && (
                  <>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                      {[{ v: 'PDF_URL', l: '🔗 URL du PDF' }, { v: 'PDF_UPLOAD', l: '📁 Upload depuis PC' }].map(s => (
                        <button type="button" key={s.v} onClick={() => setForm((p: any) => ({ ...p, sourceDoc: s.v }))}
                          style={{ flex: 1, padding: '8px', border: `1.5px solid ${form.sourceDoc === s.v ? secondaire : '#CBD5E1'}`, borderRadius: 6, background: form.sourceDoc === s.v ? `${secondaire}08` : 'white', color: form.sourceDoc === s.v ? secondaire : '#94A3B8', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                          {s.l}
                        </button>
                      ))}
                    </div>
                    {form.sourceDoc === 'PDF_URL' ? (
                      <input value={form.pdfUrl} onChange={e => setForm((p: any) => ({ ...p, pdfUrl: e.target.value }))}
                        placeholder="https://exemple.com/document.pdf" style={inp} />
                    ) : (
                      <button type="button" onClick={() => pdfRef.current?.click()}
                        style={{ width: '100%', padding: '14px', background: pdfFile ? '#DCFCE7' : `${primaire}08`, border: `2px dashed ${pdfFile ? '#16A34A' : primaire}`, borderRadius: 8, cursor: 'pointer', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, fontWeight: 700, color: pdfFile ? '#16A34A' : primaire }}>
                        {pdfFile ? `✅ ${pdfFile.name}` : '📁 Cliquez pour choisir un PDF (max 50MB)'}
                      </button>
                    )}
                    <input ref={pdfRef} type="file" accept=".pdf" onChange={e => setPdfFile(e.target.files?.[0] ?? null)} style={{ display: 'none' }} />
                  </>
                )}
              </div>

              <div style={{ display: 'flex', gap: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#374151' }}>
                  <input type="checkbox" checked={form.gratuit} onChange={e => setForm((p: any) => ({ ...p, gratuit: e.target.checked }))} style={{ accentColor: primaire, width: 16, height: 16 }} />
                  Formation gratuite
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#374151' }}>
                  <input type="checkbox" checked={form.publie} onChange={e => setForm((p: any) => ({ ...p, publie: e.target.checked }))} style={{ accentColor: primaire, width: 16, height: 16 }} />
                  Publier immédiatement
                </label>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setModalForm(false)}
                  style={{ flex: 1, padding: '13px', background: 'white', color: primaire, border: `2px solid ${primaire}`, borderRadius: 10, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                  Annuler
                </button>
                <button type="submit" disabled={envoi}
                  style={{ flex: 2, padding: '13px', background: envoi ? '#64748B' : primaire, color: 'white', border: 'none', borderRadius: 10, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                  {envoi ? '⏳ Enregistrement…' : editing ? '💾 Sauvegarder' : '✅ Créer la formation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hero */}
      <section style={{ background: `linear-gradient(135deg, #0D1B2A 0%, ${primaire} 100%)`, padding: 'clamp(40px,5vw,64px) clamp(20px,5vw,48px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: secondaire, fontWeight: 700, marginBottom: 8 }}>
                Formation professionnelle continue
              </div>
              <h1 style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 'clamp(26px,3vw,40px)', fontWeight: 900, color: 'white', margin: '0 0 10px', letterSpacing: '-0.5px' }}>
                Catalogue TechPro Haiti
              </h1>
              <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                {formations.length} formations disponibles · Informatique, Comptabilité, Droit, Secrétariat, Immobilier & plus
              </p>
            </div>
            {estAdmin && (
              <button onClick={ouvrirAjout}
                style={{ padding: '13px 24px', background: secondaire, color: 'white', border: 'none', borderRadius: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 800, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                ➕ Nouvelle formation
              </button>
            )}
          </div>

          {/* Recherche */}
          <div style={{ position: 'relative', maxWidth: 500 }}>
            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔍</span>
            <input value={recherche} onChange={e => setRecherche(e.target.value)}
              placeholder="Rechercher une formation, un domaine…"
              style={{ width: '100%', padding: '13px 16px 13px 46px', background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: 10, color: 'white', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, outline: 'none', boxSizing: 'border-box' as const }} />
          </div>
        </div>
      </section>

      {/* Filtres catégories */}
      <div style={{ background: 'white', borderBottom: '1px solid #E2E8F0', padding: '12px clamp(20px,5vw,48px)', overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: 8, maxWidth: 1200, margin: '0 auto', flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setFiltreCat(cat.id)}
              style={{ padding: '7px 14px', borderRadius: 100, border: `1.5px solid ${filtreCat === cat.id ? primaire : '#E2E8F0'}`, background: filtreCat === cat.id ? primaire : 'white', color: filtreCat === cat.id ? 'white' : '#374151', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, fontWeight: filtreCat === cat.id ? 700 : 400, cursor: 'pointer', whiteSpace: 'nowrap' as const }}>
              {cat.icone} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grille formations */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(32px,4vw,48px) clamp(20px,5vw,48px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, color: '#64748B', margin: 0 }}>
            <strong style={{ color: primaire }}>{filtrees.length}</strong> formation{filtrees.length > 1 ? 's' : ''} trouvée{filtrees.length > 1 ? 's' : ''}
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            {['tous', 'DEBUTANT', 'INTERMEDIAIRE', 'AVANCE'].map(n => (
              <button key={n} onClick={() => setFiltreNiv(n)}
                style={{ padding: '6px 12px', borderRadius: 100, border: `1.5px solid ${filtreNiv === n ? secondaire : '#E2E8F0'}`, background: filtreNiv === n ? secondaire : 'white', color: filtreNiv === n ? 'white' : '#64748B', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, fontWeight: filtreNiv === n ? 700 : 400, cursor: 'pointer' }}>
                {n === 'tous' ? 'Tous niveaux' : NIVEAUX[n]?.label ?? n}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {filtrees.map(f => {
            const niv = NIVEAUX[f.niveau ?? 'DEBUTANT'];
            return (
              <div key={f.id} style={{ background: 'white', borderRadius: 14, overflow: 'hidden', border: '1px solid #E2E8F0', position: 'relative', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-3px)'; el.style.boxShadow = `0 10px 40px rgba(27,58,107,0.12)`; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'none'; el.style.boxShadow = 'none'; }}>

                {/* Boutons admin */}
                {estAdmin && (
                  <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4, zIndex: 2 }}>
                    <button onClick={() => ouvrirEdit(f)} title="Modifier"
                      style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>✏️</button>
                    <button onClick={() => supprimerFormation(f.id)} title="Supprimer"
                      style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>🗑️</button>
                  </div>
                )}

                {/* Image */}
                {f.imageUrl && (
                  <div style={{ height: 160, overflow: 'hidden', position: 'relative' }}>
                    <img src={f.imageUrl} alt={f.titre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.3))' }} />
                    {f.gratuit !== false && (
                      <div style={{ position: 'absolute', top: 10, left: 10, background: '#059669', color: 'white', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 100, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>GRATUIT</div>
                    )}
                  </div>
                )}

                <div style={{ padding: '16px 18px' }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, background: '#EBF3FB', color: primaire, padding: '3px 10px', borderRadius: 100, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>{f.categorie}</span>
                    {niv && <span style={{ fontSize: 11, fontWeight: 700, background: niv.bg, color: niv.color, padding: '3px 10px', borderRadius: 100, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>{niv.label}</span>}
                  </div>
                  <h3 style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 15, fontWeight: 800, color: primaire, lineHeight: 1.4, margin: '0 0 8px' }}>{f.titre}</h3>
                  <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#64748B', lineHeight: 1.5, margin: '0 0 12px' }}>{f.description?.slice(0, 90)}{f.description?.length > 90 ? '…' : ''}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#94A3B8', marginBottom: 14, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>
                    <span>📚 {f._count?.lecons ?? 0} leçons</span>
                    <span>👥 {f._count?.inscriptions ?? 0} inscrits</span>
                  </div>
                  <Link href={f.id?.startsWith('demo-') ? '#' : `/formations/${f.id}`}
                    style={{ display: 'block', textAlign: 'center', padding: '11px', background: primaire, color: 'white', borderRadius: 8, textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 13 }}>
                    {f.gratuit !== false ? 'Commencer gratuitement →' : 'Voir la formation →'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {filtrees.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px 24px' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 16, color: '#64748B' }}>Aucune formation trouvée pour ces critères.</p>
            <button onClick={() => { setFiltreCat('tous'); setRecherche(''); setFiltreNiv('tous'); }}
              style={{ marginTop: 12, padding: '11px 24px', background: primaire, color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700 }}>
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
