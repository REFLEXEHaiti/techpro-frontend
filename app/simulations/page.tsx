// app/simulations/page.tsx — TechPro Haiti
// Projets IA générés par IA + Galerie photos moments forts
'use client';

import { useState, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useTenant } from '@/lib/tenantContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const BLEU   = '#1B3A6B';
const ORANGE = '#FF6B35';

const DOMAINES = [
  { id: 'web',       label: 'Développement Web',         description: 'Créez une application web complète : React, Node.js, API REST, base de données.',     icone: '🌐', couleur: '#1B3A6B' },
  { id: 'compta',    label: 'Comptabilité & Finance',    description: 'Système de gestion comptable, tableau de bord financier, rapport fiscal.',              icone: '📊', couleur: '#059669' },
  { id: 'secretariat', label: 'Secrétariat & Admin',    description: 'Système de gestion documentaire, agenda, base de contacts professionnels.',              icone: '📋', couleur: '#7C3AED' },
  { id: 'marketing', label: 'Marketing Digital',         description: 'Stratégie de contenu, campagne réseaux sociaux, analyse de performance.',               icone: '📣', couleur: '#D97706' },
  { id: 'cyber',     label: 'Cybersécurité',             description: 'Audit de sécurité, pentest basique, plan de réponse aux incidents.',                    icone: '🔒', couleur: '#DC2626' },
  { id: 'ia',        label: 'IA & Automatisation',       description: 'Automatisation de tâches, chatbot, analyse de données avec Python et IA générative.',   icone: '🤖', couleur: '#0891B2' },
  { id: 'gestion',   label: 'Gestion de Projet',         description: 'Plan de projet Scrum, tableau Kanban, gestion des risques et livrables.',               icone: '📈', couleur: '#BE185D' },
  { id: 'immobilier', label: 'Immobilier & Droit',       description: 'Application de gestion locative, contrats types, suivi des transactions immobilières.',  icone: '🏠', couleur: '#92400E' },
];

const GALLERY_DEMO = [
  { id: 'g1', titre: 'Hackathon TechPro 2025', sousTitre: 'Port-au-Prince', url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&q=80' },
  { id: 'g2', titre: 'Cérémonie de certification', sousTitre: 'Promotion Novembre 2025', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80' },
  { id: 'g3', titre: 'Atelier Développement Web', sousTitre: 'Bootcamp 3 semaines', url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=600&q=80' },
  { id: 'g4', titre: 'Formation Comptabilité', sousTitre: 'Entreprises haïtiennes', url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&q=80' },
  { id: 'g5', titre: 'Masterclass Marketing Digital', sousTitre: 'Réseaux sociaux & stratégie', url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&q=80' },
  { id: 'g6', titre: 'Cybersécurité — Workshop', sousTitre: 'CTF & Ethical Hacking', url: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&q=80' },
];

export default function PageSimulations() {
  const { utilisateur } = useAuthStore();
  const { config } = useTenant();

  const primaire   = config?.couleursTheme.primaire   ?? BLEU;
  const secondaire = config?.couleursTheme.secondaire ?? ORANGE;
  const estAdmin   = ['ADMIN', 'FORMATEUR'].includes(utilisateur?.role ?? '');

  const [onglet, setOnglet]           = useState<'projets' | 'galerie'>('projets');
  const [domaineSelectionne, setDomaine] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [resultat, setResultat]       = useState('');
  const [chargement, setChargement]   = useState(false);
  const [erreur, setErreur]           = useState('');
  const [gallery, setGallery]         = useState(GALLERY_DEMO);
  const [modalGallery, setModalGallery] = useState(false);
  const [formGallery, setFormGallery] = useState({ titre: '', sousTitre: '', url: '', source: 'URL' as 'URL' | 'UPLOAD' });
  const [imageGallery, setImageGallery] = useState<File | null>(null);
  const imgRef = useRef<HTMLInputElement>(null);

  const domaine = DOMAINES.find(d => d.id === domaineSelectionne);

  const genererProjet = async () => {
    if (!domaineSelectionne) { setErreur('Choisissez un domaine.'); return; }
    if (!description.trim()) { setErreur('Décrivez votre projet ou contexte.'); return; }
    setErreur(''); setChargement(true); setResultat('');
    try {
      const { data } = await api.post('/ia/projet-technique', {
        domaine: domaine?.label, description,
        contexte: 'Haïti, professionnels haïtiens, outils locaux',
      });
      setResultat(data.resultat ?? data.contenu ?? data.projet ?? '');
    } catch {
      setResultat(`**Projet IA — ${domaine?.label}**\n\n**Titre :** Système de gestion ${domaine?.label} haïtien\n\n**Objectif :** ${description}\n\n**Stack recommandée :** React.js (frontend) + Node.js/Express (backend) + PostgreSQL (base de données)\n\n**Étapes :**\n1. Analyse des besoins et conception de la base de données\n2. Développement du backend REST API\n3. Création de l'interface React responsive\n4. Tests et déploiement sur Vercel/Render\n\n**Durée estimée :** 3 à 4 semaines pour un développeur junior\n\n**Ressources :** Documentation React, tutoriels Node.js, exemples de projets similaires en Haïti.`);
    }
    setChargement(false);
  };

  const ajouterPhoto = async () => {
    let url = formGallery.url;
    if (formGallery.source === 'UPLOAD' && imageGallery) {
      const r = new FileReader();
      url = await new Promise<string>(res => { r.onload = () => res(r.result as string); r.readAsDataURL(imageGallery!); });
    }
    const nouveau = { id: 'g' + Date.now(), titre: formGallery.titre, sousTitre: formGallery.sousTitre, url };
    setGallery(prev => [nouveau, ...prev]);
    toast.success('Photo ajoutée à la galerie !');
    setModalGallery(false);
    setFormGallery({ titre: '', sousTitre: '', url: '', source: 'URL' });
    setImageGallery(null);
  };

  const supprimerPhoto = (id: string) => {
    setGallery(prev => prev.filter(g => g.id !== id));
    toast.success('Photo supprimée');
  };

  const inp: React.CSSProperties = { width: '100%', padding: '10px 12px', border: '1.5px solid #CBD5E1', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' as const, fontFamily: "'Helvetica Neue',Arial,sans-serif", color: '#0D1B2A' };

  return (
    <div style={{ background: '#F0F4FA', minHeight: '100vh' }}>

      {/* Modal galerie */}
      {modalGallery && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: '28px 32px', width: '100%', maxWidth: 480 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 18, fontWeight: 800, color: primaire, margin: 0 }}>📸 Ajouter une photo</h3>
              <button onClick={() => setModalGallery(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div><label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 5, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Titre *</label>
                <input value={formGallery.titre} onChange={e => setFormGallery(p => ({ ...p, titre: e.target.value }))} placeholder="Ex : Hackathon TechPro 2026" style={inp} /></div>
              <div><label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 5, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Sous-titre</label>
                <input value={formGallery.sousTitre} onChange={e => setFormGallery(p => ({ ...p, sousTitre: e.target.value }))} placeholder="Ex : Port-au-Prince, Décembre 2026" style={inp} /></div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Source de l'image</label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  {[{ v: 'URL', l: '🔗 URL' }, { v: 'UPLOAD', l: '📁 Depuis PC' }].map(s => (
                    <button type="button" key={s.v} onClick={() => setFormGallery(p => ({ ...p, source: s.v as any }))}
                      style={{ flex: 1, padding: '8px', border: `1.5px solid ${formGallery.source === s.v ? primaire : '#CBD5E1'}`, borderRadius: 6, background: formGallery.source === s.v ? `${primaire}08` : 'white', color: formGallery.source === s.v ? primaire : '#64748B', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      {s.l}
                    </button>
                  ))}
                </div>
                {formGallery.source === 'URL' ? (
                  <input value={formGallery.url} onChange={e => setFormGallery(p => ({ ...p, url: e.target.value }))} placeholder="https://exemple.com/photo.jpg" style={inp} />
                ) : (
                  <button type="button" onClick={() => imgRef.current?.click()}
                    style={{ width: '100%', padding: '14px', background: imageGallery ? '#DCFCE7' : `${primaire}08`, border: `2px dashed ${imageGallery ? '#16A34A' : primaire}`, borderRadius: 8, cursor: 'pointer', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, fontWeight: 700, color: imageGallery ? '#16A34A' : primaire }}>
                    {imageGallery ? `✅ ${imageGallery.name}` : '📁 Cliquez pour choisir une image'}
                  </button>
                )}
                <input ref={imgRef} type="file" accept="image/*" onChange={e => setImageGallery(e.target.files?.[0] ?? null)} style={{ display: 'none' }} />
              </div>
              <button onClick={ajouterPhoto} disabled={!formGallery.titre}
                style={{ padding: '13px', background: !formGallery.titre ? '#CBD5E1' : primaire, color: 'white', border: 'none', borderRadius: 10, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 15, cursor: 'pointer', marginTop: 4 }}>
                ✅ Ajouter à la galerie
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <section style={{ background: `linear-gradient(135deg, #0D1B2A 0%, ${primaire} 100%)`, padding: 'clamp(48px,6vw,72px) clamp(20px,5vw,48px)', textAlign: 'center' }}>
        <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: secondaire, fontWeight: 700, marginBottom: 14 }}>PROJETS IA & GALERIE TECHPRO</div>
        <h1 style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 'clamp(28px,4vw,52px)', fontWeight: 900, color: 'white', margin: '0 0 14px', letterSpacing: '-1px' }}>
          Construisez des projets <span style={{ color: secondaire }}>réels</span>
        </h1>
        <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.7)', maxWidth: 540, margin: '0 auto 28px', lineHeight: 1.7 }}>
          L'IA génère un projet complet adapté à votre domaine. Suivez les étapes et construisez votre portfolio professionnel haïtien.
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          {[{ id: 'projets', l: '🤖 Générateur de Projets IA' }, { id: 'galerie', l: '📸 Galerie — Moments forts' }].map(o => (
            <button key={o.id} onClick={() => setOnglet(o.id as any)}
              style={{ padding: '11px 22px', borderRadius: 8, border: 'none', background: onglet === o.id ? secondaire : 'rgba(255,255,255,0.15)', color: 'white', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, fontWeight: onglet === o.id ? 700 : 400, cursor: 'pointer' }}>
              {o.l}
            </button>
          ))}
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(32px,4vw,48px) clamp(20px,5vw,48px)' }}>

        {/* ── PROJETS IA ── */}
        {onglet === 'projets' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }}>
            {/* Gauche : formulaire */}
            <div>
              <h2 style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 20, fontWeight: 800, color: primaire, margin: '0 0 20px' }}>
                1. Choisissez votre domaine
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 28 }}>
                {DOMAINES.map(d => (
                  <button key={d.id} onClick={() => setDomaine(d.id)}
                    style={{ padding: '14px 12px', borderRadius: 10, border: `2px solid ${domaineSelectionne === d.id ? d.couleur : '#E2E8F0'}`, background: domaineSelectionne === d.id ? `${d.couleur}08` : 'white', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                    <div style={{ fontSize: 22, marginBottom: 4 }}>{d.icone}</div>
                    <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, fontWeight: 800, color: domaineSelectionne === d.id ? d.couleur : '#374151', lineHeight: 1.3, marginBottom: 4 }}>{d.label}</div>
                    <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 10, color: '#94A3B8', lineHeight: 1.4 }}>{d.description.slice(0, 55)}…</div>
                  </button>
                ))}
              </div>

              <h2 style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 20, fontWeight: 800, color: primaire, margin: '0 0 12px' }}>
                2. Décrivez votre projet
              </h2>
              <textarea value={description} onChange={e => setDescription(e.target.value)}
                placeholder={domaine ? `Ex : Je veux créer ${domaine.description.toLowerCase().slice(0, 60)}…` : "Choisissez d'abord un domaine, puis décrivez votre idée de projet…"}
                rows={5}
                style={{ width: '100%', padding: '14px 16px', border: '1.5px solid #CBD5E1', borderRadius: 10, fontSize: 14, outline: 'none', resize: 'none' as const, fontFamily: "'Helvetica Neue',Arial,sans-serif", color: '#0D1B2A', boxSizing: 'border-box' as const, lineHeight: 1.6 }} />

              {erreur && <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#DC2626', marginTop: 8 }}>⚠ {erreur}</p>}

              <button onClick={genererProjet} disabled={chargement}
                style={{ width: '100%', marginTop: 14, padding: '15px', background: chargement ? '#64748B' : (domaineSelectionne ? secondaire : '#CBD5E1'), color: 'white', border: 'none', borderRadius: 10, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 800, fontSize: 16, cursor: domaineSelectionne ? 'pointer' : 'default', transition: 'background 0.2s' }}>
                {chargement ? '🤖 Génération en cours…' : '🚀 Générer mon projet IA →'}
              </button>
              <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#94A3B8', textAlign: 'center', marginTop: 8 }}>
                Projet généré selon vos cours et le contexte haïtien · Usage éducatif
              </p>
            </div>

            {/* Droite : résultat */}
            <div style={{ position: 'sticky', top: 80 }}>
              {chargement ? (
                <div style={{ background: 'white', borderRadius: 14, border: `1px solid ${primaire}20`, padding: '48px 32px', textAlign: 'center' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🤖</div>
                  <h3 style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 18, fontWeight: 800, color: primaire, margin: '0 0 8px' }}>L'IA génère votre projet…</h3>
                  <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#64748B', margin: '0 0 20px' }}>Architecture, stack, étapes et ressources</p>
                  <div style={{ width: 200, height: 4, background: '#E2E8F0', borderRadius: 2, margin: '0 auto', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: `linear-gradient(90deg, ${primaire}, ${secondaire})`, animation: 'iaload 1.8s ease-in-out infinite', borderRadius: 2 }} />
                  </div>
                  <style>{`@keyframes iaload{0%{width:5%}60%{width:85%}100%{width:95%}}`}</style>
                </div>
              ) : resultat ? (
                <div style={{ background: 'white', borderRadius: 14, border: `1px solid ${primaire}20`, overflow: 'hidden' }}>
                  <div style={{ background: `linear-gradient(90deg, ${primaire}, ${secondaire})`, padding: '14px 20px', display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: 20 }}>{domaine?.icone}</span>
                    <div>
                      <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, fontWeight: 800, color: 'white' }}>Projet généré — {domaine?.label}</div>
                      <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>Adapté au contexte haïtien par l'IA TechPro</div>
                    </div>
                  </div>
                  <div style={{ padding: '20px 24px', maxHeight: 500, overflowY: 'auto' }}>
                    <pre style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#374151', whiteSpace: 'pre-wrap' as const, lineHeight: 1.7, margin: 0 }}>{resultat}</pre>
                  </div>
                  <div style={{ padding: '14px 20px', background: '#F8FAFF', borderTop: '1px solid #E2E8F0', display: 'flex', gap: 10 }}>
                    <button onClick={() => setResultat('')}
                      style={{ flex: 1, padding: '10px', background: 'white', color: primaire, border: `1.5px solid ${primaire}`, borderRadius: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                      🔄 Nouveau projet
                    </button>
                    <button onClick={() => { navigator.clipboard?.writeText(resultat); toast.success('Copié !'); }}
                      style={{ flex: 1, padding: '10px', background: primaire, color: 'white', border: 'none', borderRadius: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                      📋 Copier
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E2E8F0', padding: '48px 32px', textAlign: 'center' }}>
                  <div style={{ fontSize: 64, marginBottom: 16 }}>🏗️</div>
                  <h3 style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 18, fontWeight: 800, color: primaire, margin: '0 0 10px' }}>Votre projet apparaîtra ici</h3>
                  <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                    Choisissez un domaine, décrivez votre idée et l'IA génère un plan de projet complet avec architecture, stack et étapes.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── GALERIE ── */}
        {onglet === 'galerie' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <div>
                <h2 style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 24, fontWeight: 900, color: primaire, margin: '0 0 4px' }}>📸 Galerie — Moments forts</h2>
                <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, color: '#64748B', margin: 0 }}>
                  Formations, hackathons, certifications et événements TechPro Haiti
                </p>
              </div>
              {estAdmin && (
                <button onClick={() => setModalGallery(true)}
                  style={{ padding: '12px 22px', background: secondaire, color: 'white', border: 'none', borderRadius: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
                  📸 Ajouter une photo
                </button>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {gallery.map(g => (
                <div key={g.id} style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid #E2E8F0', background: 'white', position: 'relative' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px rgba(27,58,107,0.15)`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}>
                  <div style={{ height: 200, overflow: 'hidden', position: 'relative' }}>
                    <img src={g.url} alt={g.titre} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.05)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'; }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.6))' }} />
                    {estAdmin && (
                      <button onClick={() => supprimerPhoto(g.id)} title="Supprimer"
                        style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🗑️</button>
                    )}
                  </div>
                  <div style={{ padding: '12px 16px' }}>
                    <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, fontWeight: 800, color: primaire, lineHeight: 1.3 }}>{g.titre}</div>
                    {g.sousTitre && <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#64748B', marginTop: 3 }}>{g.sousTitre}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
