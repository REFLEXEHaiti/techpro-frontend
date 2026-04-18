// app/formations/[id]/page.tsx — TechPro Haiti
// Structure : Chapitres → Séances vidéo → Quiz IA après chaque vidéo
//             Examen après chaque chapitre → Examen mi-parcours → Examen final
//             Certificat conditionné au succès + frais de certification
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useTenant } from '@/lib/tenantContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const NAVY = '#1B3A6B'; const ORANGE = '#FF6B35';

const NIV: Record<string, { bg: string; color: string; label: string }> = {
  DEBUTANT:      { bg: '#DCFCE7', color: '#166534', label: '🟢 Débutant' },
  INTERMEDIAIRE: { bg: '#DBEAFE', color: '#1E40AF', label: '🔵 Intermédiaire' },
  AVANCE:        { bg: '#FCE7F3', color: '#9D174D', label: '🔴 Avancé' },
};

const STATUT_EXAM: Record<string, { label: string; bg: string; color: string; icone: string }> = {
  DISPONIBLE: { label: 'Disponible',  bg: '#DCFCE7', color: '#166534', icone: '✅' },
  VERROUILLE: { label: 'Verrouillé', bg: '#F1F5F9', color: '#64748B', icone: '🔒' },
  TERMINE:    { label: 'Réussi',      bg: '#DBEAFE', color: '#1E40AF', icone: '🏆' },
  ECHEC:      { label: 'À reprendre', bg: '#FEF2F2', color: '#DC2626', icone: '↩️' },
};

// Démo formation complète avec structure chapitres
const DEMO_FORMATION = {
  id: 'demo',
  titre: 'Comptabilité générale haïtienne',
  description: "Maîtrisez les fondamentaux de la comptabilité selon le plan comptable haïtien. Formation complète pour débutants et professionnels souhaitant formaliser leurs connaissances.",
  niveau: 'DEBUTANT', categorie: 'Comptabilité & Finance',
  gratuit: false, prix: 1500, prixCertificat: 500,
  imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80',
  chapitres: [
    {
      id: 'ch1', titre: 'Chapitre 1 — Principes fondamentaux', ordre: 1,
      description: 'Introduction à la comptabilité, grands principes et cadre légal haïtien.',
      seances: [
        { id: 's1', titre: "Introduction à la comptabilité", dureeMin: 25, ordre: 1, quizApres: true, termine: false },
        { id: 's2', titre: "Le plan comptable haïtien (PCH)", dureeMin: 30, ordre: 2, quizApres: true, termine: false },
        { id: 's3', titre: "Les grands principes comptables", dureeMin: 20, ordre: 3, quizApres: false, termine: false },
      ],
      examenChapitre: { id: 'ex_ch1', titre: 'Examen — Chapitre 1', nbQuestions: 10, dureeMin: 20, statut: 'VERROUILLE' },
    },
    {
      id: 'ch2', titre: 'Chapitre 2 — Opérations courantes', ordre: 2,
      description: 'Comptabilisation des achats, ventes, paiements et encaissements.',
      seances: [
        { id: 's4', titre: "Les écritures d'achat et de vente", dureeMin: 35, ordre: 1, quizApres: true, termine: false },
        { id: 's5', titre: "Les règlements et encaissements", dureeMin: 28, ordre: 2, quizApres: true, termine: false },
        { id: 's6', titre: "La TVA haïtienne (TCA)", dureeMin: 32, ordre: 3, quizApres: true, termine: false },
      ],
      examenChapitre: { id: 'ex_ch2', titre: 'Examen — Chapitre 2', nbQuestions: 15, dureeMin: 25, statut: 'VERROUILLE' },
    },
    {
      id: 'ch3', titre: 'Chapitre 3 — Inventaire et bilan', ordre: 3,
      description: "Clôture comptable, amortissements, provisions et états financiers.",
      seances: [
        { id: 's7', titre: "Les amortissements", dureeMin: 40, ordre: 1, quizApres: true, termine: false },
        { id: 's8', titre: "Les provisions et régularisations", dureeMin: 35, ordre: 2, quizApres: false, termine: false },
        { id: 's9', titre: "Bilan et compte de résultat", dureeMin: 45, ordre: 3, quizApres: true, termine: false },
      ],
      examenChapitre: { id: 'ex_ch3', titre: 'Examen — Chapitre 3', nbQuestions: 20, dureeMin: 35, statut: 'VERROUILLE' },
    },
  ],
  examenMiParcours: { id: 'ex_mi', titre: 'Examen mi-parcours — Chapitres 1 & 2', nbQuestions: 25, dureeMin: 45, statut: 'VERROUILLE' },
  examenFinal: { id: 'ex_final', titre: 'Examen final — Comptabilité générale haïtienne', nbQuestions: 40, dureeMin: 75, statut: 'VERROUILLE' },
  certificationDisponible: false,
  _count: { seances: 9, inscriptions: 634 },
};

export default function PageFormationDetail() {
  const { id } = useParams() as { id: string };
  const { estConnecte, utilisateur } = useAuthStore();
  const { config } = useTenant();
  const router = useRouter();

  const primaire   = config?.couleursTheme.primaire   ?? NAVY;
  const secondaire = config?.couleursTheme.secondaire ?? ORANGE;

  const [formation, setFormation]   = useState<any>(null);
  const [chargement, setChargement] = useState(true);
  const [onglet, setOnglet]         = useState<'programme'|'examens'|'certificat'>('programme');
  const [chapOuvert, setChapOuvert] = useState<string>('ch1');
  const [inscrit, setInscrit]       = useState(false);

  useEffect(() => {
    if (!id || id.startsWith('d') || id.startsWith('demo')) {
      setFormation(DEMO_FORMATION); setChargement(false); return;
    }
    api.get(`/cours/${id}`)
      .then(({ data }) => {
        // Normalise les formations sans chapitres (anciennes)
        if (!data.chapitres && data.lecons) {
          const chapitres = [{ id: 'ch1', titre: 'Programme du cours', ordre: 1, description: '', seances: data.lecons.map((l: any, i: number) => ({ ...l, ordre: i+1, quizApres: !!l.quiz, termine: false })), examenChapitre: null }];
          setFormation({ ...data, chapitres, examenFinal: data.examens?.find((e:any) => e.type === 'EXAMEN') });
        } else {
          setFormation(data.chapitres ? data : { ...data, chapitres: [] });
        }
        if (chapOuvert === 'ch1' && data.chapitres?.[0]) setChapOuvert(data.chapitres[0].id);
      })
      .catch(() => setFormation(DEMO_FORMATION))
      .finally(() => setChargement(false));
    if (estConnecte) api.get(`/cours/${id}/inscription`).then(() => setInscrit(true)).catch(() => {});
  }, [id, estConnecte]);

  const sInscrire = async () => {
    if (!estConnecte) { router.push('/auth/connexion'); return; }
    if (!formation?.gratuit) { toast('Redirection vers le paiement…'); return; }
    try { await api.post(`/cours/${id}/inscrire`, {}); } catch {}
    setInscrit(true); toast.success('Inscription réussie ! 🎓');
  };

  if (chargement) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0F4FA' }}>
      <div style={{ textAlign: 'center', fontFamily: "'Helvetica Neue',Arial,sans-serif", color: '#64748B' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>⏳</div>Chargement du cours…
      </div>
    </div>
  );
  if (!formation) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0F4FA', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 48 }}>❌</div>
      <h2 style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", color: NAVY }}>Formation introuvable</h2>
      <Link href="/formations" style={{ color: ORANGE, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>← Retour au catalogue</Link>
    </div>
  );

  const chapitres = formation.chapitres ?? [];
  const totalSeances = chapitres.reduce((s: number, c: any) => s + (c.seances?.length ?? 0), 0);
  const totalMin     = chapitres.reduce((s: number, c: any) => s + (c.seances ?? []).reduce((ss: number, se: any) => ss + (se.dureeMin ?? 0), 0), 0);
  const terminees    = chapitres.reduce((s: number, c: any) => s + (c.seances ?? []).filter((se: any) => se.termine).length, 0);
  const progression  = totalSeances > 0 ? Math.round((terminees / totalSeances) * 100) : 0;
  const niv = NIV[formation.niveau] ?? NIV.DEBUTANT;
  const nbQuizIA = chapitres.reduce((s: number, c: any) => s + (c.seances ?? []).filter((se: any) => se.quizApres).length, 0);

  return (
    <div style={{ background: '#F0F4FA', minHeight: '100vh' }}>

      {/* Hero */}
      <section style={{ background: `linear-gradient(135deg, #0D1B2A 0%, ${primaire} 100%)`, padding: 'clamp(32px,5vw,56px) clamp(20px,5vw,48px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 12 }}>
            <Link href="/formations" style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>Catalogue</Link> / {formation.categorie}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 32, alignItems: 'start' }}>
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, fontWeight: 700, background: niv.bg, color: niv.color, padding: '3px 12px', borderRadius: 100 }}>{niv.label}</span>
                <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, fontWeight: 700, background: formation.gratuit ? '#DCFCE7' : `${secondaire}25`, color: formation.gratuit ? '#166534' : secondaire, padding: '3px 12px', borderRadius: 100 }}>
                  {formation.gratuit ? '✓ Gratuit' : `💳 ${formation.prix?.toLocaleString()} HTG`}
                </span>
              </div>
              <h1 style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 'clamp(22px,3vw,36px)', fontWeight: 900, color: 'white', margin: '0 0 12px', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
                {formation.titre}
              </h1>
              <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, margin: '0 0 20px', maxWidth: 600 }}>
                {formation.description}
              </p>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>
                <span>📚 {chapitres.length} chapitres</span>
                <span>🎬 {totalSeances} séances</span>
                <span>⏱ {Math.round(totalMin/60)}h{totalMin%60>0?` ${totalMin%60}min`:''}</span>
                <span>🧠 {nbQuizIA} quiz IA</span>
                <span>👥 {(formation._count?.inscriptions ?? 0).toLocaleString()} inscrits</span>
              </div>
            </div>

            {/* Carte inscription */}
            <div style={{ background: 'white', borderRadius: 16, padding: '24px', width: 290, boxShadow: '0 16px 48px rgba(0,0,0,0.25)', flexShrink: 0 }}>
              {formation.imageUrl && <img src={formation.imageUrl} alt="" style={{ width: '100%', height: 130, objectFit: 'cover', borderRadius: 10, marginBottom: 14 }}/>}
              <div style={{ fontFamily: 'Georgia,serif', fontSize: formation.gratuit?28:22, fontWeight: 700, color: formation.gratuit ? '#059669' : primaire, marginBottom: 4 }}>
                {formation.gratuit ? 'Gratuit' : `${formation.prix?.toLocaleString()} HTG`}
              </div>
              {!formation.gratuit && <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#64748B', margin: '0 0 12px' }}>Accès complet à vie</p>}

              {inscrit ? (
                <div>
                  <div style={{ background: '#DCFCE7', borderRadius: 8, padding: '9px 14px', marginBottom: 12, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#166534', fontWeight: 700 }}>✓ Vous êtes inscrit(e)</div>
                  {progression > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#64748B', marginBottom: 4 }}>
                        <span>Progression</span><span style={{ fontWeight: 700, color: primaire }}>{progression}%</span>
                      </div>
                      <div style={{ height: 6, background: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${progression}%`, background: `linear-gradient(90deg, ${primaire}, ${secondaire})`, borderRadius: 3 }}/>
                      </div>
                    </div>
                  )}
                  {chapitres[0]?.seances[0] && (
                    <Link href={`/formations/${id}/lecons/${chapitres[0].seances[0].id}`}
                      style={{ display: 'block', textAlign: 'center', padding: '13px', background: primaire, color: 'white', borderRadius: 10, textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 14 }}>
                      {progression > 0 ? '▶ Continuer le cours' : '▶ Commencer le cours'}
                    </Link>
                  )}
                </div>
              ) : (
                <button onClick={sInscrire} style={{ width: '100%', padding: '14px', background: formation.gratuit ? '#059669' : secondaire, color: 'white', border: 'none', borderRadius: 10, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                  {formation.gratuit ? "S'inscrire gratuitement →" : `S'inscrire — ${formation.prix?.toLocaleString()} HTG →`}
                </button>
              )}

              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 5 }}>
                {['✓ Accès à vie', '✓ Quiz IA après chaque vidéo', '✓ Examens par chapitre', '✓ Examen final certifiant', '✓ Certificat numérique TechPro'].map(item => (
                  <span key={item} style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#64748B' }}>{item}</span>
                ))}
                {formation.prixCertificat && (
                  <div style={{ marginTop: 6, background: '#FEF3C7', borderRadius: 8, padding: '7px 10px', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#92400E' }}>
                    🏅 Frais certification : <strong>{formation.prixCertificat.toLocaleString()} HTG</strong>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Onglets */}
      <div style={{ background: 'white', borderBottom: '1px solid #E2E8F0', padding: '0 clamp(20px,5vw,48px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 0 }}>
          {[{ id:'programme', l:'📚 Programme' },{ id:'examens', l:'📝 Examens' },{ id:'certificat', l:'🏅 Certificat' }].map(o => (
            <button key={o.id} onClick={() => setOnglet(o.id as any)}
              style={{ padding: '15px 20px', border: 'none', borderBottom: `3px solid ${onglet===o.id?secondaire:'transparent'}`, background: 'transparent', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, fontWeight: onglet===o.id?700:400, color: onglet===o.id?primaire:'#64748B', cursor: 'pointer', whiteSpace: 'nowrap' as const }}>
              {o.l}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(24px,4vw,40px) clamp(20px,5vw,48px)' }}>

        {/* ── PROGRAMME ── */}
        {onglet === 'programme' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 28, alignItems: 'start' }}>
            <div>
              <h2 style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 18, fontWeight: 800, color: primaire, margin: '0 0 18px' }}>
                {chapitres.length} chapitres · {totalSeances} séances · {nbQuizIA} quiz IA
              </h2>

              {chapitres.map((chap: any, chapIdx: number) => (
                <div key={chap.id} style={{ background: 'white', borderRadius: 14, border: '1px solid #E2E8F0', marginBottom: 14, overflow: 'hidden' }}>
                  <button onClick={() => setChapOuvert(chapOuvert===chap.id ? '' : chap.id)}
                    style={{ width: '100%', padding: '16px 20px', background: chapOuvert===chap.id ? `${primaire}06` : 'white', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: primaire, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia,serif', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{chapIdx+1}</div>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 15, fontWeight: 800, color: primaire }}>{chap.titre}</div>
                        {chap.description && <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#64748B', marginTop: 1 }}>{chap.description}</div>}
                        <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#94A3B8', marginTop: 1 }}>
                          {chap.seances?.length ?? 0} séances · {(chap.seances ?? []).reduce((s:number, se:any) => s+se.dureeMin, 0)} min
                        </div>
                      </div>
                    </div>
                    <span style={{ fontSize: 16, color: '#94A3B8' }}>{chapOuvert===chap.id ? '▲' : '▼'}</span>
                  </button>

                  {chapOuvert === chap.id && (
                    <div style={{ borderTop: '1px solid #F1F5F9' }}>
                      {(chap.seances ?? []).map((seance: any, idx: number) => (
                        <div key={seance.id}>
                          {/* Séance */}
                          <div style={{ padding: '12px 20px 12px 66px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F8FAFF' }}>
                            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                              <span style={{ fontSize: 15 }}>{seance.termine ? '✅' : '▶️'}</span>
                              <div>
                                <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#374151', fontWeight: 500 }}>{idx+1}. {seance.titre}</div>
                                <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#94A3B8', marginTop: 1, display: 'flex', gap: 8 }}>
                                  <span>⏱ {seance.dureeMin} min</span>
                                  {seance.quizApres && <span style={{ color: '#7C3AED', fontWeight: 600 }}>🧠 Quiz IA après</span>}
                                </div>
                              </div>
                            </div>
                            {inscrit ? (
                              <Link href={`/formations/${id}/lecons/${seance.id}`}
                                style={{ padding: '6px 14px', background: seance.termine ? '#F1F5F9' : primaire, color: seance.termine ? '#64748B' : 'white', borderRadius: 8, textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, fontWeight: 700 }}>
                                {seance.termine ? 'Revoir' : 'Voir'}
                              </Link>
                            ) : <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 10, color: '#94A3B8' }}>🔒</span>}
                          </div>
                          {/* Quiz IA après la séance */}
                          {seance.quizApres && (
                            <div style={{ padding: '9px 20px 9px 66px', background: '#FAF5FF', borderBottom: '1px solid #F3E8FF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <span>🧠</span>
                                <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#7C3AED', fontWeight: 600 }}>Quiz IA — {seance.titre}</span>
                                <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 10, color: '#A78BFA' }}>5 questions · Résultat immédiat</span>
                              </div>
                              {seance.quizScore !== undefined
                                ? <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#059669', fontWeight: 700 }}>✓ {seance.quizScore}%</span>
                                : inscrit && <Link href={`/formations/${id}/lecons/${seance.id}?quiz=1`} style={{ padding: '4px 10px', background: '#7C3AED', color: 'white', borderRadius: 6, textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 10, fontWeight: 700 }}>Quiz →</Link>}
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Examen du chapitre */}
                      {chap.examenChapitre && (() => {
                        const ex = chap.examenChapitre;
                        const s = STATUT_EXAM[ex.statut] ?? STATUT_EXAM.VERROUILLE;
                        return (
                          <div style={{ padding: '14px 20px', background: '#F8FAFF', borderTop: '2px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                              <span style={{ fontSize: 18 }}>{s.icone}</span>
                              <div>
                                <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, fontWeight: 700, color: primaire }}>{ex.titre}</div>
                                <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#64748B' }}>{ex.nbQuestions} questions · {ex.dureeMin} min{ex.score !== undefined ? ` · ${ex.score}%` : ''}</div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                              <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 10, fontWeight: 700, background: s.bg, color: s.color, padding: '2px 8px', borderRadius: 100 }}>{s.label}</span>
                              {ex.statut === 'DISPONIBLE' && inscrit && (
                                <Link href={`/quiz?examen=${ex.id}`} style={{ padding: '6px 14px', background: primaire, color: 'white', borderRadius: 8, textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, fontWeight: 700 }}>Passer →</Link>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Sidebar */}
            <div style={{ position: 'sticky', top: 80 }}>
              <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E2E8F0', padding: '18px', marginBottom: 14 }}>
                <h3 style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, fontWeight: 800, color: primaire, margin: '0 0 14px' }}>📊 Progression</h3>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#64748B', marginBottom: 4 }}>
                    <span>{terminees}/{totalSeances} séances</span><span style={{ fontWeight: 700, color: primaire }}>{progression}%</span>
                  </div>
                  <div style={{ height: 7, background: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progression}%`, background: `linear-gradient(90deg, ${primaire}, ${secondaire})`, borderRadius: 4 }}/>
                  </div>
                </div>
                <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#374151', lineHeight: 2.1 }}>
                  <div>📚 {chapitres.length} chapitres</div>
                  <div>🎬 {totalSeances} séances vidéo</div>
                  <div>🧠 {nbQuizIA} quiz IA (après chaque vidéo)</div>
                  <div>📝 {chapitres.filter((c:any)=>c.examenChapitre).length} examens de chapitre</div>
                  {formation.examenMiParcours && <div>📊 1 examen mi-parcours</div>}
                  {formation.examenFinal && <div>🏆 1 examen final</div>}
                </div>
              </div>
              <div style={{ background: `${primaire}08`, borderRadius: 12, border: `1px solid ${primaire}20`, padding: '14px' }}>
                <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: primaire, fontWeight: 700, marginBottom: 8 }}>🏅 Pour le certificat :</div>
                <ul style={{ margin: 0, paddingLeft: 16, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#374151', lineHeight: 1.9 }}>
                  <li>Tous les examens de chapitres ≥ 60%</li>
                  <li>Examen final ≥ 70%</li>
                  {formation.prixCertificat && <li>Frais : <strong>{formation.prixCertificat.toLocaleString()} HTG</strong></li>}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ── EXAMENS ── */}
        {onglet === 'examens' && (
          <div style={{ maxWidth: 800 }}>
            <h2 style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 18, fontWeight: 800, color: primaire, margin: '0 0 20px' }}>📝 Tous les examens</h2>

            {/* Examens chapitres */}
            <h3 style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, fontWeight: 700, color: '#374151', margin: '0 0 12px' }}>Par chapitre</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
              {chapitres.filter((c:any)=>c.examenChapitre).map((chap:any) => {
                const ex = chap.examenChapitre; const s = STATUT_EXAM[ex.statut] ?? STATUT_EXAM.VERROUILLE;
                return (
                  <div key={ex.id} style={{ background: 'white', border: `1px solid ${ex.statut==='DISPONIBLE'?primaire+'40':'#E2E8F0'}`, borderRadius: 12, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span style={{ fontSize: 22 }}>{s.icone}</span>
                      <div>
                        <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, fontWeight: 700, color: primaire }}>{ex.titre}</div>
                        <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#64748B' }}>{ex.nbQuestions} questions · {ex.dureeMin} min{ex.score!==undefined ? ` · Score : ${ex.score}%` : ''}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 10, fontWeight: 700, background: s.bg, color: s.color, padding: '2px 9px', borderRadius: 100 }}>{s.label}</span>
                      {ex.statut==='DISPONIBLE' && inscrit && <Link href={`/quiz?examen=${ex.id}`} style={{ padding: '7px 16px', background: primaire, color: 'white', borderRadius: 8, textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, fontWeight: 700 }}>Commencer →</Link>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mi-parcours */}
            {formation.examenMiParcours && (() => {
              const ex = formation.examenMiParcours; const s = STATUT_EXAM[ex.statut] ?? STATUT_EXAM.VERROUILLE;
              return (
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, fontWeight: 700, color: '#374151', margin: '0 0 12px' }}>Examen mi-parcours</h3>
                  <div style={{ background: 'white', border: `2px solid ${secondaire}50`, borderRadius: 12, padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <span style={{ fontSize: 26 }}>📊</span>
                      <div>
                        <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 15, fontWeight: 800, color: primaire }}>{ex.titre}</div>
                        <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#64748B' }}>{ex.nbQuestions} questions · {ex.dureeMin} min · Requis pour la suite</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 10, fontWeight: 700, background: s.bg, color: s.color, padding: '2px 9px', borderRadius: 100 }}>{s.label}</span>
                      {ex.statut==='DISPONIBLE' && inscrit && <Link href={`/quiz?examen=${ex.id}`} style={{ padding: '8px 18px', background: secondaire, color: 'white', borderRadius: 8, textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, fontWeight: 700 }}>Passer →</Link>}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Examen final */}
            {formation.examenFinal && (() => {
              const ex = formation.examenFinal; const s = STATUT_EXAM[ex.statut] ?? STATUT_EXAM.VERROUILLE;
              return (
                <div>
                  <h3 style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, fontWeight: 700, color: '#374151', margin: '0 0 12px' }}>Examen final — Certifiant</h3>
                  <div style={{ background: ex.statut==='TERMINE'?'#F0FDF4':'white', border: `2px solid ${ex.statut==='TERMINE'?'#16A34A':primaire}`, borderRadius: 14, padding: '22px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <span style={{ fontSize: 30 }}>🏆</span>
                      <div>
                        <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 16, fontWeight: 900, color: primaire }}>{ex.titre}</div>
                        <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#64748B', marginTop: 4 }}>{ex.nbQuestions} questions · {ex.dureeMin} min · Score minimum 70%</div>
                        <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: secondaire, marginTop: 4, fontWeight: 600 }}>⚠ Conditions : réussir tous les examens précédents</div>
                      </div>
                    </div>
                    <div style={{ flexShrink: 0, textAlign: 'center' }}>
                      <span style={{ display: 'block', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, fontWeight: 700, background: s.bg, color: s.color, padding: '3px 10px', borderRadius: 100, marginBottom: 8 }}>{s.label}</span>
                      {ex.statut==='DISPONIBLE' && inscrit && (
                        <Link href={`/quiz?examen=${ex.id}`} style={{ padding: '11px 22px', background: primaire, color: 'white', borderRadius: 10, textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, fontWeight: 700, display: 'block' }}>Passer l'examen final →</Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ── CERTIFICAT ── */}
        {onglet === 'certificat' && (
          <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: 72, marginBottom: 16 }}>🏅</div>
            <h2 style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 26, fontWeight: 900, color: primaire, margin: '0 0 10px' }}>Certificat TechPro Haiti</h2>
            <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 15, color: '#64748B', lineHeight: 1.7, margin: '0 0 28px' }}>
              Certificat numérique officiel reconnu par les employeurs haïtiens. Obtenez-le en réussissant tous les examens de ce cours.
            </p>
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E2E8F0', padding: '24px', marginBottom: 20, textAlign: 'left' }}>
              <h3 style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 15, fontWeight: 800, color: primaire, margin: '0 0 14px' }}>Conditions d'obtention :</h3>
              {[
                `Réussir les ${chapitres.filter((c:any)=>c.examenChapitre).length} examens de chapitres (score ≥ 60%)`,
                formation.examenMiParcours ? "Réussir l'examen mi-parcours (score ≥ 60%)" : null,
                "Réussir l'examen final (score ≥ 70%)",
                formation.prixCertificat ? `Payer les frais de certification : ${formation.prixCertificat.toLocaleString()} HTG` : null,
              ].filter(Boolean).map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 12, color: '#64748B' }}>{i+1}</div>
                  <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, color: '#374151' }}>{item}</span>
                </div>
              ))}
            </div>
            {formation.certificationDisponible ? (
              <button style={{ padding: '16px 48px', background: `linear-gradient(135deg, ${primaire}, ${secondaire})`, color: 'white', border: 'none', borderRadius: 100, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 800, fontSize: 17, cursor: 'pointer', boxShadow: `0 8px 32px ${primaire}40` }}>
                🏅 Obtenir mon certificat — {formation.prixCertificat?.toLocaleString()} HTG
              </button>
            ) : (
              <div style={{ background: '#F8FAFF', borderRadius: 12, padding: '16px 24px', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, color: '#64748B', border: '1px solid #E2E8F0' }}>
                🔒 Complétez tous les examens pour déverrouiller le certificat
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
