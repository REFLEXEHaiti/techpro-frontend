// app/simulations/page.tsx — TechPro Haiti
// ⚠️ EXCLUSIF À MEDIFORM HAITI — module unique, absent de LexHaiti et TechPro
// Projets IA générés par l'IA — TechPro Haiti

'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import ProtectedRoute from '@/components/layout/ProtectedRoute';

const VERT = '#1B3A6B';
const BLEU = '#FF6B35';

const CAS_TYPES = [
  { id: 'web',        label: 'Développement Web',              description: 'Créez des applications web complètes avec React, Node.js et des APIs REST.',  icone: '🌐', couleur: '#1B3A6B' },
  { id: 'maternite',  label: 'Maternité & Data Science', description: 'Accouchements, complications, hémorragie post-partum, prééclampsie…', icone: '👶', couleur: BLEU },
  { id: 'pediatrie',  label: 'DevOps',               description: 'Diarrhée sévère, malnutrition, paludisme chez l\'enfant, infections…', icone: '💻', couleur: '#9B59B6' },
  { id: 'chronique',  label: 'Maladies chroniques',     description: 'Diabète, hypertension, tuberculose, VIH/SIDA, insuffisance rénale…',  icone: '❤️', couleur: VERT },
  { id: 'cyber',      label: 'Cybersécurité',           description: 'Pentest, audit de sécurité, CTF et défense des systèmes haïtiens.',       icone: '🔒', couleur: '#DC2626' },
  { id: 'psychiatrie',label: 'Santé mentale',           description: 'Dépression, PTSD post-catastrophe, psychose, gestion de crise…',    icone: '🧠', couleur: '#1ABC9C' },
];

interface ResultatSimulation {
  evaluation: string;
  etapesSoins: string[];
  alertes: string[];
  protocolesReferencer: string[];
}

export default function PageSimulations() {
  return (
    <ProtectedRoute>
      <ContenuSimulations />
    </ProtectedRoute>
  );
}

function ContenuSimulations() {
  const { utilisateur } = useAuthStore();
  const [casType,      setCasType]       = useState('');
  const [typePatient,  setTypePatient]   = useState('');
  const [symptomes,    setSymptomes]     = useState('');
  const [description,  setDescription]  = useState('');
  const [resultat,     setResultat]      = useState<ResultatSimulation | null>(null);
  const [chargement,   setChargement]    = useState(false);
  const [erreur,       setErreur]        = useState('');

  const lancerSimulation = async () => {
    if (!description.trim() || !typePatient.trim()) {
      setErreur('Veuillez décrire votre projet et les technologies souhaitées.');
      return;
    }
    setErreur('');
    setChargement(true);
    setResultat(null);

    try {
      const { data } = await api.post('/ia/projet-technique', {
        description,
        contexte: {
          typePatient,
          symptomes: symptomes.split(',').map(s => s.trim()).filter(Boolean),
        },
      });
      setResultat(data);
    } catch {
      setErreur('Simulation indisponible pour l\'instant. Réessayez dans un moment.');
    } finally {
      setChargement(false);
    }
  };

  const reinitialiser = () => {
    setResultat(null);
    setDescription('');
    setTypePatient('');
    setSymptomes('');
    setCasType('');
  };

  return (
    <div style={{ background: '#F8FAFB', minHeight: '100vh' }}>

      {/* Hero */}
      <section style={{ background: `linear-gradient(135deg, ${VERT} 0%, #0D4D2E 100%)`, padding: 'clamp(40px,5vw,64px) clamp(20px,5vw,48px)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.06) 0%, transparent 50%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '5px 14px', borderRadius: 100, marginBottom: 16 }}>
            Générateur de Projets IA — TechPro
          </div>
          <h1 style={{ fontSize: 'clamp(28px,4vw,48px)', color: 'white', marginBottom: 14, fontWeight: 800 }}>
            Pratiquez sur des cas patients
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
            L'IA génère un projet complet avec architecture, stack technique recommandé, étapes de développement et ressources. Usage éducatif.
          </p>
          <div style={{ marginTop: 20, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 100, padding: '8px 16px' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ADE80' }} />
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>Ne remplace pas l'accompagnement d'un instructeur</span>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(24px,4vw,48px) clamp(20px,5vw,48px)' }}>

        {!resultat ? (
          <>
            {/* Sélection type de cas */}
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0D1F2D', marginBottom: 16 }}>
                1. Choisissez le domaine clinique
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                {CAS_TYPES.map(c => (
                  <button key={c.id} onClick={() => setCasType(c.id)}
                    style={{ padding: '16px 18px', background: casType === c.id ? `${c.couleur}12` : 'white', border: `2px solid ${casType === c.id ? c.couleur : '#E2E8F0'}`, borderRadius: 12, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 22 }}>{c.icone}</span>
                      <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 14, color: casType === c.id ? c.couleur : '#0D1F2D' }}>{c.label}</span>
                    </div>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: '#64748B', margin: 0, lineHeight: 1.5 }}>{c.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Formulaire du cas */}
            <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 16, padding: '28px 32px', marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0D1F2D', marginBottom: 24 }}>
                2. Décrivez le cas clinique
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                    Type de patient *
                  </label>
                  <input type="text" value={typePatient} onChange={e => setTypePatient(e.target.value)}
                    placeholder="Ex : Femme enceinte 32 ans, 8 mois de grossesse"
                    style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: 14, outline: 'none', fontFamily: "'Inter',sans-serif", boxSizing: 'border-box' }}
                    onFocus={e => { e.target.style.borderColor = VERT; }}
                    onBlur={e => { e.target.style.borderColor = '#E2E8F0'; }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                    Symptômes principaux (séparés par virgule)
                  </label>
                  <input type="text" value={symptomes} onChange={e => setSymptomes(e.target.value)}
                    placeholder="Ex : douleurs abdominales, saignements, fièvre"
                    style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: 14, outline: 'none', fontFamily: "'Inter',sans-serif", boxSizing: 'border-box' }}
                    onFocus={e => { e.target.style.borderColor = VERT; }}
                    onBlur={e => { e.target.style.borderColor = '#E2E8F0'; }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                  Description complète de la situation *
                </label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={5}
                  placeholder="Décrivez la situation clinique en détail : contexte, heure d'arrivée, constantes si disponibles, antécédents pertinents, ressources disponibles (médicaments, équipements)…"
                  style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: "'Inter',sans-serif", color: '#374151', boxSizing: 'border-box', lineHeight: 1.6 }}
                  onFocus={e => { e.target.style.borderColor = VERT; }}
                  onBlur={e => { e.target.style.borderColor = '#E2E8F0'; }}
                />
              </div>

              {erreur && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 16px', fontSize: 14, color: '#EF4444', marginBottom: 20 }}>
                  ⚠ {erreur}
                </div>
              )}

              <button onClick={lancerSimulation} disabled={chargement || !description.trim() || !typePatient.trim()}
                style={{ width: '100%', padding: '16px', background: chargement ? '#94A3B8' : VERT, color: 'white', border: 'none', borderRadius: 10, fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 16, cursor: chargement || !description.trim() ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}>
                {chargement ? '⏳ L\'IA analyse le cas clinique…' : '💻 Lancer la simulation →'}
              </button>
            </div>

            {/* Note pédagogique */}
            <div style={{ background: '#EBF3FB', border: '1px solid #BFDBFE', borderRadius: 12, padding: '16px 20px', display: 'flex', gap: 12 }}>
              <div style={{ fontSize: 20, flexShrink: 0 }}>ℹ️</div>
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: '#1E40AF', lineHeight: 1.6, margin: 0 }}>
                Cette simulation est à des fins éducatives uniquement. L'IA ne pose pas de diagnostic. Pour tout cas réel, appliquez les protocoles MSPP et consultez un médecin superviseur.
              </p>
            </div>
          </>
        ) : (
          /* ── Résultat de la simulation ── */
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0D1F2D', margin: 0 }}>
                Résultat de la simulation
              </h2>
              <button onClick={reinitialiser}
                style={{ padding: '10px 20px', background: 'white', border: `2px solid ${VERT}`, color: VERT, borderRadius: 8, fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                Nouveau cas →
              </button>
            </div>

            {/* Évaluation */}
            <div style={{ background: 'white', border: `1px solid ${VERT}30`, borderRadius: 16, padding: '24px 28px', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EBF3FB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: VERT, fontSize: 18 }}>💻</div>
                <h3 style={{ fontFamily: "'Inter',sans-serif", fontSize: 17, fontWeight: 700, color: '#0D1F2D', margin: 0 }}>Évaluation pédagogique</h3>
              </div>
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 15, color: '#374151', lineHeight: 1.75, margin: 0 }}>{resultat.evaluation}</p>
            </div>

            {/* Étapes de soins */}
            <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 16, padding: '24px 28px', marginBottom: 20 }}>
              <h3 style={{ fontFamily: "'Inter',sans-serif", fontSize: 17, fontWeight: 700, color: '#0D1F2D', marginBottom: 18 }}>
                Étapes de soins recommandées
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {resultat.etapesSoins.map((etape, i) => (
                  <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: VERT, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0, marginTop: 1 }}>
                      {i + 1}
                    </div>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, color: '#374151', lineHeight: 1.65, margin: 0 }}>{etape}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Alertes */}
            {resultat.alertes?.length > 0 && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 16, padding: '20px 24px', marginBottom: 20 }}>
                <h3 style={{ fontFamily: "'Inter',sans-serif", fontSize: 16, fontWeight: 700, color: '#991B1B', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  ⚠ Signes d'alarme à surveiller
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {resultat.alertes.map((a, i) => (
                    <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontFamily: "'Inter',sans-serif", fontSize: 14, color: '#7F1D1D', lineHeight: 1.55 }}>
                      <span style={{ color: '#DC2626', flexShrink: 0, fontWeight: 700 }}>•</span>
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Protocoles */}
            {resultat.protocolesReferencer?.length > 0 && (
              <div style={{ background: '#EBF3FB', border: '1px solid #BFDBFE', borderRadius: 16, padding: '20px 24px', marginBottom: 24 }}>
                <h3 style={{ fontFamily: "'Inter',sans-serif", fontSize: 16, fontWeight: 700, color: '#1E3A8A', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  📋 Protocoles à référencer
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {resultat.protocolesReferencer.map((p, i) => (
                    <span key={i} style={{ background: 'white', border: '1px solid #BFDBFE', borderRadius: 8, padding: '6px 14px', fontFamily: "'Inter',sans-serif", fontSize: 13, color: '#1E3A8A', fontWeight: 600 }}>
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div style={{ background: '#F1F5F9', borderRadius: 12, padding: '16px 20px', textAlign: 'center' }}>
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: '#64748B', margin: 0, lineHeight: 1.6 }}>
                Ces recommandations sont générées à des fins éducatives. Consultez toujours un médecin superviseur pour les cas réels.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
