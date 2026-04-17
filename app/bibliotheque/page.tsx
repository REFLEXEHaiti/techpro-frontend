// app/bibliotheque/page.tsx — TechPro Haiti
'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useTenant } from '@/lib/tenantContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const BORDEAUX = '#1B3A6B';
const OR       = '#FF6B35';

const COLLECTIONS_BASE = [
  {
    id: 'codes', titre: 'Langages & Frameworks', icone: '💻', couleur: BORDEAUX,
    description: 'Guides et documentations des langages et frameworks populaires',
    items: [
      { id: 'c1', titre: 'Documentation de code infirmiers fondamentaux', pages: 245, annee: '2024', gratuit: true, type: 'document' },
      { id: 'c2', titre: 'Guide cybersécurité en Haïti', pages: 312, annee: '2023', gratuit: true, type: 'document' },
      { id: 'c3', titre: 'React — Documentation Officielle', pages: 456, annee: '2024', gratuit: false, type: 'document' },
      { id: 'c4', titre: 'Node.js & Express — Guide du Développeur', pages: 378, annee: '2023', gratuit: false, type: 'document' },
    ],
  },
  {
    id: 'constitutions', titre: 'Langages & Frameworks', icone: '🔒', couleur: '#1A3A6B',
    description: 'Médicaments essentiels, formulaire national et documentation API',
    items: [
      { id: 'co1', titre: 'Liste des bibliothèques JavaScript — Haïti 2024', pages: 156, annee: '2024', gratuit: true, type: 'document' },
      { id: 'co2', titre: 'Ethical Hacking — CEH Study Guide', pages: 687, annee: '2023', gratuit: false, type: 'document' },
      { id: 'co3', titre: 'Acte de l\'Indépendance 1804', pages: 12, annee: '1804', gratuit: true, type: 'document' },
    ],
  },
  {
    id: 'jurisprudences', titre: 'Articles & Blogs Tech', icone: '☁️', couleur: '#065F46',
    description: 'Décisions de la Cour de Cassation, tribunaux civils et cours d\'appel',
    items: [
      { id: 'j1', titre: 'State of JS Report haïtien 2024', pages: 180, annee: '2024', gratuit: true, type: 'document' },
      { id: 'j2', titre: 'Épidémiologie des tendances technologiques en Haïti', pages: 320, annee: '2023', gratuit: false, type: 'document' },
    ],
  },
  {
    id: 'doctrine', titre: 'Livres & E-books IT', icone: '🤖', couleur: '#7C2D12',
    description: 'Articles doctrinaux, thèses et commentaires de juristes haïtiens',
    items: [
      { id: 'd1', titre: 'Clean Code — Robert C. Martin — MSF', pages: 412, annee: '2023', gratuit: true, type: 'document' },
      { id: 'd2', titre: "The Pragmatic Programmer en Haïti", pages: 278, annee: '2024', gratuit: true, type: 'document' },
      { id: 'd3', titre: 'DevOps tropicale — Guide complet', pages: 489, annee: '2022', gratuit: false, type: 'document' },
    ],
  },
  {
    id: 'formulaires', titre: 'Templates & Modèles', icone: '📝', couleur: '#4C1D95',
    description: 'Actes types, formulaires officiels et modèles de plaidoiries',
    items: [
      { id: 'f1', titre: "Templates de projets GitHub — GitHub / GitLab", pages: 45, annee: '2024', gratuit: true, type: 'document' },
      { id: 'f2', titre: 'Fiches de surveillance des standards de code', pages: 28, annee: '2024', gratuit: true, type: 'document' },
    ],
  },
  {
    id: 'videos', titre: 'Vidéos & Broadcasts', icone: '🎬', couleur: '#C2410C',
    description: 'Webinaires Tech, broadcasts archivés et cours vidéo',
    items: [],
  },
];

const FORM_VIDE = {
  titre: '', description: '', annee: new Date().getFullYear().toString(),
  gratuit: false, categorieId: 'codes',
  // Type de contenu : DOCUMENT ou VIDEO
  typeContenu: 'DOCUMENT' as 'DOCUMENT' | 'VIDEO',
  // Pour document : PDF_UPLOAD ou PDF_URL
  sourceDoc: 'PDF_UPLOAD' as 'PDF_UPLOAD' | 'PDF_URL',
  pdfUrl: '',
  // Pour vidéo : VIDEO_UPLOAD ou VIDEO_URL
  sourceVideo: 'VIDEO_UPLOAD' as 'VIDEO_UPLOAD' | 'VIDEO_URL',
  videoUrl: '',
};

export default function PageBibliotheque() {
  const { utilisateur } = useAuthStore();
  const { config } = useTenant();
  const PRIMAIRE   = config?.couleursTheme.primaire   ?? '#1B3A6B';
  const SECONDAIRE = config?.couleursTheme.secondaire ?? '#FF6B35';
  const [collections, setCollections]         = useState(COLLECTIONS_BASE);
  const [categorieActive, setCategorieActive] = useState('codes');
  const [recherche, setRecherche]             = useState('');
  const [lecteur, setLecteur]                 = useState<any>(null);
  const [modalForm, setModalForm]             = useState(false);
  const [modalBroadcast, setModalBroadcast]   = useState(false);
  const [lives, setLives]                     = useState<any[]>([]);
  const [form, setForm]                       = useState<any>(FORM_VIDE);

  // Fichiers
  const [pdfFile, setPdfFile]         = useState<File | null>(null);
  const [pdfNom, setPdfNom]           = useState('');
  const [pdfErreur, setPdfErreur]     = useState('');
  const [videoFile, setVideoFile]     = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [videoErreur, setVideoErreur] = useState('');
  const [envoi, setEnvoi]             = useState(false);

  const pdfRef   = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const estAdmin = ['ADMIN', 'FORMATEUR'].includes(utilisateur?.role ?? '');

  const collection   = collections.find(c => c.id === categorieActive) ?? collections[0];
  const itemsFiltres = collection.items.filter((item: any) =>
    !recherche || item.titre.toLowerCase().includes(recherche.toLowerCase())
  );

  const estVideo = (item: any) => item.type === 'video';

  // ── Gestion fichiers ──
  const handlePdf = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPdfErreur('');
    if (f.type !== 'application/pdf') { setPdfErreur('Seuls les fichiers PDF sont acceptés.'); return; }
    if (f.size > 50 * 1024 * 1024) { setPdfErreur('Fichier trop lourd. Maximum 50 MB.'); return; }
    setPdfFile(f);
    setPdfNom(f.name);
  };

  const handleVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setVideoErreur('');
    if (!['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'].includes(f.type)) {
      setVideoErreur('Format non supporté. Utilisez MP4, WebM, OGG ou MOV.'); return;
    }
    if (f.size > 500 * 1024 * 1024) { setVideoErreur('Fichier trop lourd. Maximum 500 MB.'); return; }
    setVideoFile(f);
    setVideoPreview(URL.createObjectURL(f));
  };

  const fileEnBase64 = (file: File): Promise<string> => new Promise((res, rej) => {
    const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(file);
  });

  const getYoutubeEmbed = (url: string) => {
    const m = url?.match(/(?:youtube\.com\/(?:watch\?v=|live\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return m ? `https://www.youtube.com/embed/${m[1]}?rel=0&autoplay=1` : url;
  };

  // ── Ouvrir modal ──
  const ouvrirModal = () => {
    setForm({ ...FORM_VIDE, categorieId: categorieActive });
    setPdfFile(null); setPdfNom(''); setPdfErreur('');
    setVideoFile(null); setVideoPreview(''); setVideoErreur('');
    setModalForm(true);
  };

  // ── Ouvrir modal broadcasts ──
  const ouvrirBroadcasts = async () => {
    try {
      const { data } = await api.get('/lives');
      setLives(Array.isArray(data) ? data.filter((l: any) => l.statut === 'TERMINE') : []);
    } catch {
      setLives([]);
    }
    setModalBroadcast(true);
  };

  // ── Ajouter un broadcast à la bibliothèque ──
  const ajouterBroadcast = (live: any) => {
    const nouvelItem: any = {
      id: 'broadcast_' + live.id,
      titre: live.titre,
      description: live.description,
      annee: live.dateDebut ? new Date(live.dateDebut).getFullYear().toString() : new Date().getFullYear().toString(),
      gratuit: false,
      type: 'video',
      pages: 0,
      videoUrl: live.youtubeUrl || live.videoUrl || '',
      badge: '📡 Broadcast',
    };
    setCollections(prev => prev.map(col =>
      col.id === 'videos'
        ? { ...col, items: [nouvelItem, ...col.items.filter((i: any) => i.id !== nouvelItem.id)] as any }
        : col
    ));
    toast.success(`✅ "${live.titre}" ajouté à la bibliothèque`);
    setCategorieActive('videos');
    setModalBroadcast(false);
  };

  // ── Sauvegarder ressource ──
  const sauvegarder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titre.trim()) { toast.error('Le titre est requis'); return; }
    setEnvoi(true);
    try {
      let fichierUrl = '';
      let type = 'document';

      if (form.typeContenu === 'DOCUMENT') {
        if (form.sourceDoc === 'PDF_UPLOAD' && pdfFile) {
          fichierUrl = await fileEnBase64(pdfFile);
        } else if (form.sourceDoc === 'PDF_URL') {
          fichierUrl = form.pdfUrl;
        }
        type = 'document';
      } else {
        if (form.sourceVideo === 'VIDEO_UPLOAD' && videoFile) {
          fichierUrl = await fileEnBase64(videoFile);
        } else if (form.sourceVideo === 'VIDEO_URL') {
          fichierUrl = form.videoUrl;
        }
        type = 'video';
      }

      const nouvelItem: any = {
        id: 'local_' + Date.now(),
        titre: form.titre,
        description: form.description,
        annee: form.annee,
        gratuit: form.gratuit,
        type,
        pages: 0,
        videoUrl: type === 'video' ? fichierUrl : '',
        fichierUrl: type === 'document' ? fichierUrl : '',
        pdfNom: type === 'document' && pdfFile ? pdfFile.name : '',
      };

      try {
        const { data } = await api.post('/bibliotheque', { ...nouvelItem, categorieId: form.categorieId });
        nouvelItem.id = data.id ?? nouvelItem.id;
      } catch {}

      setCollections(prev => prev.map(col =>
        col.id === form.categorieId
          ? { ...col, items: [nouvelItem, ...col.items] as any }
          : col
      ));
      toast.success('✅ Ressource ajoutée !');
      setModalForm(false);
    } catch { toast.error('Erreur lors de l\'ajout'); }
    setEnvoi(false);
  };

  const supprimer = (colId: string, itemId: string) => {
    if (!confirm('Supprimer cette ressource ?')) return;
    setCollections(prev => prev.map(col =>
      col.id === colId ? { ...col, items: col.items.filter((i: any) => i.id !== itemId) } : col
    ));
    toast.success('Supprimé');
  };

  const inp: React.CSSProperties = { width: '100%', padding: '11px 14px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", boxSizing: 'border-box', color: '#1A1A1A', background: 'white' };

  return (
    <div style={{ background: '#FAFAF8', minHeight: '100vh' }}>

      {/* Lecteur vidéo */}
      {lecteur && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ width: '100%', maxWidth: 900 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 16, color: 'white', margin: 0 }}>{lecteur.titre}</h3>
              <button onClick={() => setLecteur(null)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
              {lecteur.videoUrl?.includes('youtube') || lecteur.videoUrl?.includes('youtu.be') ? (
                <iframe src={getYoutubeEmbed(lecteur.videoUrl)} title={lecteur.titre} allow="autoplay; encrypted-media" allowFullScreen
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', borderRadius: 8 }} />
              ) : lecteur.videoUrl ? (
                <video src={lecteur.videoUrl} controls autoPlay style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: 8 }} />
              ) : (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Aucune vidéo disponible</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lecteur PDF inline */}
      {lecteur && lecteur.type === 'document' && lecteur.fichierUrl && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ width: '100%', maxWidth: 900, height: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 16, color: 'white', margin: 0 }}>{lecteur.titre}</h3>
              <button onClick={() => setLecteur(null)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>
            {lecteur.fichierUrl.startsWith('http') ? (
              <iframe src={lecteur.fichierUrl} style={{ flex: 1, border: 'none', borderRadius: 8 }} title={lecteur.titre} />
            ) : (
              <iframe src={lecteur.fichierUrl} style={{ flex: 1, border: 'none', borderRadius: 8 }} title={lecteur.titre} />
            )}
          </div>
        </div>
      )}

      {/* Hero */}
      <section style={{ background: `linear-gradient(135deg, #0D1B2A, ${PRIMAIRE})`, padding: 'clamp(40px,6vw,80px) clamp(20px,5vw,48px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ width: 48, height: 2, background: OR, margin: '0 auto 20px' }} />
          <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(28px,4vw,52px)', color: 'white', margin: '0 0 14px', fontWeight: 'normal' }}>
            Bibliothèque Tech Haïtienne
          </h1>
          <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 'clamp(13px,1.6vw,17px)', color: 'rgba(255,255,255,0.65)', maxWidth: 560, margin: '0 auto 32px', lineHeight: 1.7 }}>
            Documentation, e-books, articles tech et ressources pour développeurs haïtiens.
          </p>
          <div style={{ maxWidth: 480, margin: '0 auto', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 18 }}>🔍</span>
            <input type="text" value={recherche} onChange={e => setRecherche(e.target.value)}
              placeholder="Rechercher un cours, un framework, une documentation…"
              style={{ width: '100%', padding: '14px 16px 14px 48px', background: 'rgba(255,255,255,0.1)', border: `1px solid ${OR}50`, borderRadius: 8, fontSize: 14, outline: 'none', color: 'white', fontFamily: "'Helvetica Neue',Arial,sans-serif", boxSizing: 'border-box' }} />
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(24px,4vw,48px) clamp(20px,5vw,48px)', display: 'grid', gridTemplateColumns: '240px 1fr', gap: 32, alignItems: 'start' }}>

        {/* Sidebar */}
        <aside>
          <div style={{ background: 'white', border: '1px solid #E8E4DC', borderRadius: 10, overflow: 'hidden', position: 'sticky', top: 72 }}>
            <div style={{ padding: '14px 16px', background: PRIMAIRE }}>
              <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: OR, fontWeight: 700 }}>Collections</span>
            </div>
            {collections.map(col => (
              <button key={col.id} onClick={() => setCategorieActive(col.id)}
                style={{ width: '100%', padding: '12px 16px', background: categorieActive === col.id ? `${PRIMAIRE}08` : 'white', border: 'none', borderLeft: `3px solid ${categorieActive === col.id ? BORDEAUX : 'transparent'}`, cursor: 'pointer', textAlign: 'left', display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ fontSize: 18 }}>{col.icone}</span>
                <div>
                  <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, fontWeight: categorieActive === col.id ? 700 : 400, color: categorieActive === col.id ? BORDEAUX : '#374151' }}>{col.titre}</div>
                  <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{col.items.length} ressources</div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Contenu */}
        <main>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 26, color: '#1A1A1A', margin: '0 0 6px', fontWeight: 'normal' }}>{collection.icone} {collection.titre}</h2>
              <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, color: '#64748B', margin: 0 }}>{collection.description}</p>
            </div>
            {estAdmin && (
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button onClick={ouvrirBroadcasts}
                  style={{ padding: '10px 16px', background: '#C2410C', color: 'white', border: 'none', borderRadius: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                  📡 Broadcast →
                </button>
                <button onClick={ouvrirModal}
                  style={{ padding: '10px 20px', background: PRIMAIRE, color: 'white', border: 'none', borderRadius: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  + Ajouter
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {itemsFiltres.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#94A3B8' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>{collection.icone}</div>
                <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14 }}>
                  {estAdmin ? 'Aucune ressource. Cliquez "+ Ajouter" ou "📡 Broadcast" pour en ajouter.' : 'Aucune ressource disponible.'}
                </p>
              </div>
            ) : (
              itemsFiltres.map((item: any, i) => (
                <div key={item.id ?? i} style={{ background: 'white', border: '1px solid #E8E4DC', borderRadius: 10, padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 16 }}>{estVideo(item) ? '🎬' : '📄'}</span>
                      <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 16, color: '#1A1A1A', margin: 0, fontWeight: 'normal' }}>{item.titre}</h3>
                      {item.gratuit && <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 10, color: '#1E40AF', background: '#DCFCE7', padding: '2px 8px', borderRadius: 100, fontWeight: 700 }}>GRATUIT</span>}
                      {item.badge && <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 10, color: '#C2410C', background: '#FFF7ED', padding: '2px 8px', borderRadius: 100, fontWeight: 700 }}>{item.badge}</span>}
                      {estVideo(item) && item.videoUrl?.startsWith('data:') && <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 10, color: PRIMAIRE, background: `${PRIMAIRE}10`, padding: '2px 8px', borderRadius: 100, fontWeight: 700 }}>📁 Fichier</span>}
                      {!estVideo(item) && item.fichierUrl?.startsWith('data:') && <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 10, color: '#4C1D95', background: '#F5F3FF', padding: '2px 8px', borderRadius: 100, fontWeight: 700 }}>📎 PDF uploadé</span>}
                      {!estVideo(item) && item.fichierUrl?.startsWith('http') && <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 10, color: '#1A3A6B', background: '#EFF6FF', padding: '2px 8px', borderRadius: 100, fontWeight: 700 }}>🔗 Lien PDF</span>}
                    </div>
                    {item.description && <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#64748B', margin: '0 0 6px', lineHeight: 1.5 }}>{item.description}</p>}
                    <div style={{ display: 'flex', gap: 16, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#94A3B8' }}>
                      {item.pages > 0 && <span>📄 {item.pages} pages</span>}
                      <span>📅 {item.annee}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    {item.gratuit || estAdmin ? (
                      estVideo(item) ? (
                        <button onClick={() => setLecteur(item)} style={{ padding: '8px 16px', background: PRIMAIRE, color: 'white', border: 'none', borderRadius: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>▶ Regarder</button>
                      ) : (item.fichierUrl ? (
                        <button onClick={() => setLecteur(item)} style={{ padding: '8px 16px', background: PRIMAIRE, color: 'white', border: 'none', borderRadius: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>📖 Lire</button>
                      ) : (
                        <button style={{ padding: '8px 16px', background: PRIMAIRE, color: 'white', border: 'none', borderRadius: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Lire →</button>
                      ))
                    ) : (
                      <Link href="/premium" style={{ padding: '8px 16px', background: OR, color: '#1A0000', borderRadius: 6, textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, fontWeight: 700 }}>Premium →</Link>
                    )}
                    {estAdmin && (
                      <button onClick={() => supprimer(categorieActive, item.id)} style={{ padding: '8px 10px', background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>🗑</button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ marginTop: 32, background: `linear-gradient(135deg, ${BORDEAUX}10, ${OR}10)`, border: `1px solid ${BORDEAUX}25`, borderRadius: 12, padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 18, color: PRIMAIRE, margin: '0 0 6px' }}>Accès illimité à toute la bibliothèque</h3>
              <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#64748B', margin: 0 }}>Plus de 3 000 documents et vidéos avec le plan Avocat ou Institution.</p>
            </div>
            <Link href="/premium" style={{ padding: '12px 24px', background: PRIMAIRE, color: 'white', borderRadius: 6, textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>Voir les plans →</Link>
          </div>
        </main>
      </div>

      {/* ── Modal ajout ressource ── */}
      {modalForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 14, padding: '28px 32px', width: '100%', maxWidth: 560, boxShadow: '0 24px 64px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, paddingBottom: 14, borderBottom: `2px solid ${BORDEAUX}` }}>
              <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 18, color: PRIMAIRE, margin: 0 }}>Ajouter une ressource</h2>
              <button onClick={() => setModalForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#64748B' }}>✕</button>
            </div>

            <form onSubmit={sauvegarder} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Titre *</label>
                <input value={form.titre} required onChange={e => setForm((p: any) => ({ ...p, titre: e.target.value }))} placeholder="Ex : Code Civil Haïtien annoté" style={inp} />
              </div>
              <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Description</label>
                <textarea value={form.description} onChange={e => setForm((p: any) => ({ ...p, description: e.target.value }))} rows={2} style={{ ...inp, resize: 'vertical' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Collection</label>
                  <select value={form.categorieId} onChange={e => setForm((p: any) => ({ ...p, categorieId: e.target.value }))} style={{ ...inp, appearance: 'none' as any }}>
                    {collections.map(c => <option key={c.id} value={c.id}>{c.icone} {c.titre}</option>)}
                  </select>
                </div>
                <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Année</label>
                  <input value={form.annee} onChange={e => setForm((p: any) => ({ ...p, annee: e.target.value }))} placeholder="2026" style={inp} />
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13 }}>
                <input type="checkbox" checked={form.gratuit} onChange={e => setForm((p: any) => ({ ...p, gratuit: e.target.checked }))} /> Accès gratuit
              </label>

              {/* Type de contenu : Document ou Vidéo */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Type de contenu</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                  {[
                    { val: 'DOCUMENT', label: '📄 Document', desc: 'PDF, texte médical' },
                    { val: 'VIDEO', label: '🎬 Vidéo', desc: 'Cours, conférence' },
                  ].map(opt => (
                    <div key={opt.val} onClick={() => setForm((p: any) => ({ ...p, typeContenu: opt.val }))}
                      style={{ border: `2px solid ${form.typeContenu === opt.val ? BORDEAUX : '#E2E8F0'}`, borderRadius: 10, padding: '12px', cursor: 'pointer', background: form.typeContenu === opt.val ? `${PRIMAIRE}06` : 'white', textAlign: 'center' }}>
                      <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, fontWeight: 700, color: form.typeContenu === opt.val ? BORDEAUX : '#374151', marginBottom: 4 }}>{opt.label}</div>
                      <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#94A3B8' }}>{opt.desc}</div>
                    </div>
                  ))}
                </div>

                {/* ── Document ── */}
                {form.typeContenu === 'DOCUMENT' && (
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Source du document</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                      {[
                        { val: 'PDF_UPLOAD', label: '📁 Upload PDF', desc: 'Depuis PC, clé USB…' },
                        { val: 'PDF_URL', label: '🔗 URL PDF', desc: 'Lien vers un PDF en ligne' },
                      ].map(opt => (
                        <div key={opt.val} onClick={() => setForm((p: any) => ({ ...p, sourceDoc: opt.val }))}
                          style={{ border: `2px solid ${form.sourceDoc === opt.val ? BORDEAUX : '#E2E8F0'}`, borderRadius: 10, padding: '10px', cursor: 'pointer', background: form.sourceDoc === opt.val ? `${PRIMAIRE}06` : 'white', textAlign: 'center' }}>
                          <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, fontWeight: 700, color: form.sourceDoc === opt.val ? BORDEAUX : '#374151', marginBottom: 2 }}>{opt.label}</div>
                          <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 10, color: '#94A3B8' }}>{opt.desc}</div>
                        </div>
                      ))}
                    </div>

                    {form.sourceDoc === 'PDF_UPLOAD' && (
                      <div>
                        <div style={{ background: '#F8F7F4', border: '1px solid #E8E4DC', borderRadius: 8, padding: '10px 14px', marginBottom: 10, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#64748B' }}>
                          📎 <strong>Format :</strong> PDF uniquement · <strong>Max :</strong> 50 MB
                        </div>
                        <div onClick={() => pdfRef.current?.click()}
                          style={{ border: `2px dashed ${pdfNom ? BORDEAUX : '#E2E8F0'}`, borderRadius: 10, padding: '20px', textAlign: 'center', cursor: 'pointer', background: pdfNom ? `${PRIMAIRE}04` : '#F8FAFC' }}>
                          {pdfNom ? (
                            <div>
                              <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
                              <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#16A34A', margin: '0 0 4px', fontWeight: 600 }}>✓ {pdfNom}</p>
                              <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#94A3B8', margin: 0 }}>Cliquer pour changer</p>
                            </div>
                          ) : (
                            <div>
                              <div style={{ fontSize: 32, marginBottom: 8 }}>📎</div>
                              <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#64748B', margin: 0, fontWeight: 600 }}>Cliquer pour sélectionner un PDF</p>
                              <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#94A3B8', margin: '4px 0 0' }}>Depuis votre ordinateur, clé USB, disque externe…</p>
                            </div>
                          )}
                        </div>
                        <input ref={pdfRef} type="file" accept="application/pdf,.pdf" onChange={handlePdf} style={{ display: 'none' }} />
                        {pdfErreur && <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#DC2626', margin: '6px 0 0' }}>⚠ {pdfErreur}</p>}
                      </div>
                    )}

                    {form.sourceDoc === 'PDF_URL' && (
                      <div>
                        <input value={form.pdfUrl} onChange={e => setForm((p: any) => ({ ...p, pdfUrl: e.target.value }))}
                          placeholder="https://example.com/document.pdf"
                          style={inp} />
                        <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#94A3B8', margin: '6px 0 0' }}>
                          Lien direct vers un fichier PDF accessible en ligne
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Vidéo ── */}
                {form.typeContenu === 'VIDEO' && (
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Source de la vidéo</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                      {[
                        { val: 'VIDEO_UPLOAD', label: '📁 Upload vidéo', desc: 'MP4, WebM, MOV' },
                        { val: 'VIDEO_URL', label: '🔗 URL vidéo', desc: 'YouTube, lien direct' },
                      ].map(opt => (
                        <div key={opt.val} onClick={() => setForm((p: any) => ({ ...p, sourceVideo: opt.val }))}
                          style={{ border: `2px solid ${form.sourceVideo === opt.val ? BORDEAUX : '#E2E8F0'}`, borderRadius: 10, padding: '10px', cursor: 'pointer', background: form.sourceVideo === opt.val ? `${PRIMAIRE}06` : 'white', textAlign: 'center' }}>
                          <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, fontWeight: 700, color: form.sourceVideo === opt.val ? BORDEAUX : '#374151', marginBottom: 2 }}>{opt.label}</div>
                          <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 10, color: '#94A3B8' }}>{opt.desc}</div>
                        </div>
                      ))}
                    </div>

                    {form.sourceVideo === 'VIDEO_UPLOAD' && (
                      <div>
                        <div style={{ background: '#F8F7F4', border: '1px solid #E8E4DC', borderRadius: 8, padding: '10px 14px', marginBottom: 10, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#64748B' }}>
                          🎬 <strong>Formats :</strong> MP4, WebM, OGG, MOV · <strong>Max :</strong> 500 MB
                        </div>
                        <div onClick={() => videoRef.current?.click()}
                          style={{ border: `2px dashed ${videoPreview ? BORDEAUX : '#E2E8F0'}`, borderRadius: 10, padding: 20, textAlign: 'center', cursor: 'pointer', background: videoPreview ? `${PRIMAIRE}04` : '#F8FAFC' }}>
                          {videoPreview ? (
                            <div>
                              <video src={videoPreview} style={{ maxWidth: '100%', maxHeight: 100, borderRadius: 6, marginBottom: 8 }} />
                              <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#16A34A', margin: '0 0 4px', fontWeight: 600 }}>✓ {videoFile?.name}</p>
                              <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#94A3B8', margin: 0 }}>Cliquer pour changer</p>
                            </div>
                          ) : (
                            <div>
                              <div style={{ fontSize: 32, marginBottom: 8 }}>🎬</div>
                              <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#64748B', margin: 0, fontWeight: 600 }}>Cliquer pour sélectionner la vidéo</p>
                              <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#94A3B8', margin: '4px 0 0' }}>Depuis votre ordinateur, clé USB, disque externe…</p>
                            </div>
                          )}
                        </div>
                        <input ref={videoRef} type="file" accept="video/mp4,video/webm,video/ogg,video/quicktime,.mov" onChange={handleVideo} style={{ display: 'none' }} />
                        {videoErreur && <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#DC2626', margin: '6px 0 0' }}>⚠ {videoErreur}</p>}
                      </div>
                    )}

                    {form.sourceVideo === 'VIDEO_URL' && (
                      <div>
                        <input value={form.videoUrl} onChange={e => setForm((p: any) => ({ ...p, videoUrl: e.target.value }))}
                          placeholder="https://youtube.com/watch?v=... ou URL directe"
                          style={inp} />
                        <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#94A3B8', margin: '6px 0 0' }}>
                          Accepte YouTube, Vimeo et URLs directes de vidéos
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button type="submit" disabled={envoi}
                style={{ width: '100%', padding: '14px', background: PRIMAIRE, color: 'white', border: 'none', borderRadius: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 15, cursor: 'pointer', marginTop: 4 }}>
                {envoi ? 'Ajout en cours…' : 'Ajouter la ressource →'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal broadcasts ── */}
      {modalBroadcast && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 14, padding: '28px 32px', width: '100%', maxWidth: 560, boxShadow: '0 24px 64px rgba(0,0,0,0.2)', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, paddingBottom: 14, borderBottom: `2px solid #C2410C` }}>
              <div>
                <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 18, color: '#C2410C', margin: '0 0 4px' }}>📡 Ajouter un broadcast</h2>
                <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#64748B', margin: 0 }}>Sélectionnez un live terminé à archiver dans la bibliothèque</p>
              </div>
              <button onClick={() => setModalBroadcast(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#64748B' }}>✕</button>
            </div>

            {lives.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#94A3B8' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📡</div>
                <p style={{ fontFamily: "'Helvetic Neue',Arial,sans-serif", fontSize: 14 }}>Aucun broadcast terminé disponible.</p>
                <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#CBD5E1', marginTop: 8 }}>
                  Allez dans la page Lives pour créer des broadcasts.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {lives.map((live: any) => (
                  <div key={live.id} style={{ background: '#F8F7F4', border: '1px solid #E8E4DC', borderRadius: 10, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 10, color: '#C2410C', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
                        📡 {live.categorie} · {live.dateDebut ? new Date(live.dateDebut).toLocaleDateString('fr-FR') : ''}
                      </div>
                      <div style={{ fontFamily: 'Georgia,serif', fontSize: 14, color: '#1A1A1A', marginBottom: 4 }}>{live.titre}</div>
                      <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#94A3B8' }}>
                        {live.youtubeUrl ? '🔗 YouTube' : live.videoUrl ? '📁 Fichier uploadé' : '⚠ Aucune vidéo'}
                      </div>
                    </div>
                    <button onClick={() => ajouterBroadcast(live)}
                      style={{ padding: '8px 16px', background: '#C2410C', color: 'white', border: 'none', borderRadius: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 12, cursor: 'pointer', flexShrink: 0 }}>
                      Archiver →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`@media(max-width:768px){div[style*="grid-template-columns: 240px 1fr"]{grid-template-columns:1fr!important;}}`}</style>
    </div>
  );
}
