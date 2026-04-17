// app/formations/[id]/page.tsx — TechPro Haiti
// Détail formation avec quiz IA et examens planifiés par le formateur
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useTenant } from '@/lib/tenantContext';
import api from '@/lib/api';
import ModalPaiement from '@/components/paiement/ModalPaiement';

const VERT = '#1B3A6B';
const BLEU = '#FF6B35';

const NIV: Record<string, { bg: string; text: string; label: string }> = {
  DEBUTANT:      { bg: '#DCFCE7', text: '#1E40AF', label: 'Débutant' },
  INTERMEDIAIRE: { bg: '#DBEAFE', text: '#1E40AF', label: 'Intermédiaire' },
  AVANCE:        { bg: '#FCE7F3', text: '#9D174D', label: 'Avancé' },
};

const FORMATION_DEMO = {
  id: 'demo', titre: 'Développement Web Full Stack', description: 'HTML, CSS, JavaScript, React et Node.js — construisez des applications web complètes.',
  niveau: 'DEBUTANT', categorie: 'Développement Web', publie: true, gratuit: true,
  lecons: [
    { id: 'l1', titre: 'Introduction à HTML5 & CSS3', dureeMin: 20, quiz: true, quizNbQuestions: 5 },
    { id: 'l2', titre: 'Surveillance des standards de code', dureeMin: 30, quiz: true, quizNbQuestions: 8 },
    { id: 'l3', titre: 'React — Composants & Hooks', dureeMin: 25, quiz: true, quizNbQuestions: 6 },
    { id: 'l4', titre: 'Node.js & API REST', dureeMin: 35, quiz: false },
    { id: 'l5', titre: 'Déploiement & DevOps basique', dureeMin: 20, quiz: false },
  ],
  examens: [
    { id: 'ex1', titre: 'Quiz de mi-parcours — Leçons 1-3', type: 'QUIZ_IA', nbQuestions: 15, dureeMin: 20, apresLecon: 3, statut: 'DISPONIBLE' },
    { id: 'ex2', titre: 'Examen final — Développement Web fondamentaux', type: 'EXAMEN', nbQuestions: 30, dureeMin: 60, apresLecon: 5, statut: 'VERROUILLE', dateDebut: '2026-05-01', dateFin: '2026-05-07', formateurNom: 'Marie Théodore' },
  ],
  _count: { lecons: 5, inscriptions: 342 },
};

interface QuizEmbed {
  id: string;
  titre: string;
  type: 'QUIZ_IA' | 'EXAMEN';
  nbQuestions: number;
  dureeMin: number;
  apresLecon?: number;
  statut: 'DISPONIBLE' | 'VERROUILLE' | 'TERMINE' | 'FERME';
  score?: number;
  dateDebut?: string;
  dateFin?: string;
  formateurNom?: string;
}

// ── Mini Quiz inline ─────────────────────────────────────────────
function MiniQuiz({ quiz, onTerminer }: { quiz: QuizEmbed; onTerminer: (score: number) => void }) {
  const QUESTIONS_DEMO = [
    { id: 'q1', texte: 'Quel est le résultat de `typeof null` en JavaScript ?', options: ['undefined', 'null', 'object', 'string'], bonneReponse: 1, explication: 'En JavaScript, `typeof null` retourne \'object\' — c\'est un bug historique du langage conservé pour la compatibilité. null n\'est pas un objet, mais un type primitif.' },
    { id: 'q2', texte: 'Quelle balise HTML5 est sémantiquement correcte pour la navigation ?', options: ['<div class="nav">', '<navigation>', '<nav>', '<menu>'], bonneReponse: 1, explication: 'La fréquence respiratoire normale chez un adulte au repos est de 12 à 20 cycles par minute. En dehors de cette plage, on parle de bradypnée (<12) ou tachypnée (>20).' },
    { id: 'q3', texte: 'Avant d\'administrer un médicament, combien de "bons" doit-on vérifier ?', options: ['array.merge()', 'array.concat()', 'array.join()', 'array.combine()'], bonneReponse: 2, explication: 'La règle des 7 "bons" en pharmacologie infirmière : bon médicament, bonne dose, bon patient, bonne voie, bon moment, bonne documentation, bon effet attendu.' },
    { id: 'q4', texte: 'Qu'est-ce que le DOM en JavaScript ?', options: ['Data Object Model', 'Document Object Model', 'Dynamic Object Manager', 'Design Object Method'], bonneReponse: 1, explication: 'La glycémie normale à jeun est entre 0.7 et 1.1 g/L (70-110 mg/dL). En dessous de 0.7 g/L on parle d\'hypoglycémie, au-dessus de 1.26 g/L à 2 reprises on parle de diabète.' },
    { id: 'q5', texte: 'Quelle position adopter pour un patient inconscient qui respire ?', options: ['Position assise', 'Position latérale de sécurité (PLS)', 'Décubitus dorsal', 'Position de Trendelenburg'], bonneReponse: 1, explication: 'La Position Latérale de Sécurité (PLS) est indiquée pour un patient inconscient qui respire. Elle évite l\'inhalation de vomissements et maintient les voies aériennes dégagées.' },
  ];

  const [questions] = useState(QUESTIONS_DEMO.slice(0, Math.min(quiz.nbQuestions, QUESTIONS_DEMO.length)));
  const [idx, setIdx]                   = useState(0);
  const [reponseChoisie, setReponseChoisie] = useState<number | null>(null);
  const [valide, setValide]             = useState(false);
  const [reponses, setReponses]         = useState<number[]>([]);

  const terminer = (finalReponses: number[]) => {
    const bonnes = finalReponses.filter((r, i) => questions[i] && r === questions[i].bonneReponse).length;
    onTerminer(Math.round((bonnes / questions.length) * 100));
  };

  const validerEtSuivre = () => {
    if (reponseChoisie === null) return;
    const newReponses = [...reponses, reponseChoisie];
    setReponses(newReponses);
    setValide(true);
    if (idx + 1 >= questions.length) {
      setTimeout(() => terminer(newReponses), 1500);
    }
  };

  const suivant = () => {
    setIdx(prev => prev + 1);
    setReponseChoisie(null);
    setValide(false);
  };

  const q = questions[idx];

  return (
    <div style={{ background: '#F0F4FA', border: `2px solid ${VERT}`, borderRadius: 14, padding: '20px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: VERT, fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>🤖 Quiz IA — {quiz.titre}</div>
          <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#475569' }}>Question {idx + 1} / {questions.length}</div>
        </div>
        <div style={{ height: 4, width: 80, background: '#CBD5E1', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: VERT, width: `${((idx + (valide ? 1 : 0)) / questions.length) * 100}%` }} />
        </div>
      </div>

      <p style={{ fontFamily: 'Georgia,serif', fontSize: 16, color: '#0D1B2A', lineHeight: 1.55, margin: '0 0 16px' }}>{q.texte}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
        {q.options.map((opt, i) => {
          let bg = 'white', border = '#CBD5E1', color = '#0D1B2A';
          if (valide) {
            if (i === q.bonneReponse) { bg = '#DCFCE7'; border = '#16A34A'; color = '#1E40AF'; }
            else if (i === reponseChoisie) { bg = '#FEF2F2'; border = '#DC2626'; color = '#991B1B'; }
          } else if (i === reponseChoisie) { bg = `${VERT}08`; border = VERT; color = VERT; }
          return (
            <button key={i} onClick={() => { if (!valide) setReponseChoisie(i); }}
              style={{ padding: '11px 14px', borderRadius: 10, border: `2px solid ${border}`, background: bg, color, cursor: valide ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 10, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, fontWeight: i === reponseChoisie || (valide && i === q.bonneReponse) ? 700 : 400, textAlign: 'left' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: i === reponseChoisie && !valide ? VERT : border, color: i === reponseChoisie && !valide ? 'white' : '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                {valide && i === q.bonneReponse ? '✓' : valide && i === reponseChoisie ? '✗' : String.fromCharCode(65 + i)}
              </div>
              {opt}
            </button>
          );
        })}
      </div>

      {valide && (
        <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '10px 14px', marginBottom: 12 }}>
          <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, fontWeight: 700, color: '#1E40AF', marginBottom: 3 }}>💡 Explication</div>
          <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#1E40AF', lineHeight: 1.5, margin: 0 }}>{q.explication}</p>
        </div>
      )}

      {!valide ? (
        <button onClick={validerEtSuivre} disabled={reponseChoisie === null}
          style={{ width: '100%', padding: '12px', background: reponseChoisie !== null ? VERT : '#CBD5E1', color: reponseChoisie !== null ? 'white' : '#64748B', border: 'none', borderRadius: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 14, cursor: reponseChoisie !== null ? 'pointer' : 'default' }}>
          Valider →
        </button>
      ) : idx + 1 < questions.length ? (
        <button onClick={suivant}
          style={{ width: '100%', padding: '12px', background: VERT, color: 'white', border: 'none', borderRadius: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
          Question suivante →
        </button>
      ) : (
        <div style={{ textAlign: 'center', padding: '8px 0', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#475569' }}>
          ✅ Quiz terminé — Calcul du score…
        </div>
      )}
    </div>
  );
}

// ── Page principale ─────────────────────────────────────────────
export default function PageFormationDetail() {
  const { id }    = useParams() as { id: string };
  const { estConnecte, utilisateur } = useAuthStore();
  const { config } = useTenant();

  const [formation, setFormation] = useState<any>(null);
  const [chargement, setChargement] = useState(true);
  const [modal, setModal]           = useState(false);
  const [inscrit, setInscrit]       = useState(false);
  const [progression, setProgression] = useState<any>(null);
  const [quizOuvert, setQuizOuvert]   = useState<string | null>(null);
  const [scoresQuiz, setScoresQuiz]   = useState<Record<string, number>>({});
  const [modalExamen, setModalExamen] = useState<any>(null);
  const [onglet, setOnglet]           = useState<'programme' | 'examens'>('programme');

  const primaire   = config?.couleursTheme.primaire   ?? VERT;
  const secondaire = config?.couleursTheme.secondaire ?? BLEU;
  const estAdmin   = ['ADMIN', 'FORMATEUR'].includes(utilisateur?.role ?? '');

  useEffect(() => {
    api.get(`/cours/${id}`)
      .then(({ data }) => setFormation(data))
      .catch(() => setFormation(FORMATION_DEMO))
      .finally(() => setChargement(false));
    if (estConnecte) {
      api.get(`/cours/${id}/progression`).then(({ data }) => setProgression(data)).catch(() => {});
    }
  }, [id, estConnecte]);

  const sInscrire = async () => {
    if (!estConnecte) { window.location.href = `/auth/inscription?redirect=/formations/${id}`; return; }
    if (formation?.gratuit === false) { setModal(true); return; }
    await api.post(`/cours/${id}/inscrire`, {}).catch(() => {});
    setInscrit(true);
  };

  const terminerQuiz = async (quizId: string, score: number) => {
    setScoresQuiz(prev => ({ ...prev, [quizId]: score }));
    setQuizOuvert(null);
    await api.post(`/quiz/${quizId}/resultat`, { score, coursId: id }).catch(() => {});
  };

  if (chargement) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: `3px solid #EBF3FB`, borderTopColor: VERT, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!formation) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 48 }}>🖥️</div>
      <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 20, fontWeight: 'normal', color: '#0D1B2A' }}>Formation introuvable</h2>
      <Link href="/formations" style={{ color: VERT, fontSize: 14 }}>← Retour aux formations</Link>
    </div>
  );

  const niv = NIV[formation.niveau] ?? NIV['DEBUTANT'];
  const dejaInscrit = inscrit || progression?.terminees !== undefined;
  const pct = progression?.pourcentage ?? 0;
  const estGratuit = formation.gratuit !== false;
  const examens: QuizEmbed[] = formation.examens ?? FORMATION_DEMO.examens;
  const nbExamensDisponibles = examens.filter(e => e.statut === 'DISPONIBLE').length;

  return (
    <div style={{ background: '#F0F4FA', minHeight: '100vh' }}>
      {modal && (
        <ModalPaiement montantHTG={600} description={`Accès à la formation : ${formation.titre}`} plan="PREMIUM"
          onFermer={() => setModal(false)} onSucces={() => { setModal(false); setInscrit(true); }} />
      )}

      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, #0D1B2A 0%, ${primaire} 100%)`, padding: 'clamp(32px,5vw,56px) clamp(20px,5vw,56px)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr auto', gap: 32, alignItems: 'start' }}>
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
              <Link href="/formations" style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>Formations</Link>
              <span>/</span>
              <span style={{ color: 'rgba(255,255,255,0.8)' }}>{formation.categorie}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
              <span style={{ background: niv.bg, color: niv.text, fontSize: 11, padding: '3px 12px', borderRadius: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700 }}>{niv.label}</span>
              {estGratuit ? (
                <span style={{ background: '#DCFCE7', color: '#1E40AF', fontSize: 11, padding: '3px 12px', borderRadius: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700 }}>✓ Gratuit</span>
              ) : (
                <span style={{ background: `${secondaire}25`, color: 'white', fontSize: 11, padding: '3px 12px', borderRadius: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700 }}>⭐ Premium</span>
              )}
              {nbExamensDisponibles > 0 && (
                <span style={{ background: `${secondaire}25`, color: 'white', fontSize: 11, padding: '3px 12px', borderRadius: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700 }}>📋 {nbExamensDisponibles} examen{nbExamensDisponibles > 1 ? 's' : ''} disponible{nbExamensDisponibles > 1 ? 's' : ''}</span>
              )}
            </div>
            <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(20px,3.5vw,34px)', fontWeight: 'normal', color: 'white', margin: '0 0 12px', lineHeight: 1.2 }}>{formation.titre}</h1>
            <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, margin: '0 0 14px', maxWidth: 520 }}>{formation.description}</p>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>📚 {formation.lecons?.length ?? 0} leçons</span>
              <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>👥 {formation._count?.inscriptions ?? 0} inscrits</span>
              <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>🤖 {examens.filter(e => e.type === 'QUIZ_IA').length} quiz IA</span>
            </div>
          </div>

          {/* Carte inscription */}
          <div style={{ background: 'white', borderRadius: 16, padding: '24px', minWidth: 220, boxShadow: '0 16px 48px rgba(0,0,0,0.25)', flexShrink: 0 }}>
            {dejaInscrit && progression ? (
              <>
                <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#16A34A', fontWeight: 700, marginBottom: 8 }}>✅ Inscrit</div>
                <div style={{ fontFamily: 'Georgia,serif', fontSize: 32, fontWeight: 700, color: primaire, marginBottom: 8 }}>{pct}%</div>
                <div style={{ height: 6, background: '#EBF3FB', borderRadius: 3, overflow: 'hidden', marginBottom: 16 }}>
                  <div style={{ height: '100%', background: primaire, width: `${pct}%` }} />
                </div>
                <Link href={`/formations/${id}/lecons/${formation.lecons?.[0]?.id ?? '1'}`}
                  style={{ display: 'block', padding: '13px', background: primaire, color: 'white', borderRadius: 10, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 14, textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' }}>
                  {pct === 0 ? 'Commencer →' : pct === 100 ? 'Revoir →' : 'Continuer →'}
                </Link>
                <Link href="/quiz"
                  style={{ display: 'block', marginTop: 8, padding: '11px', background: `${secondaire}12`, color: secondaire, borderRadius: 10, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 13, textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' }}>
                  📋 Mes examens
                </Link>
              </>
            ) : (
              <>
                <div style={{ fontFamily: 'Georgia,serif', fontSize: 30, fontWeight: 700, color: estGratuit ? '#16A34A' : primaire, marginBottom: 4 }}>
                  {estGratuit ? 'Gratuit' : '600 HTG'}
                </div>
                <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#64748B', marginBottom: 16, lineHeight: 1.5 }}>
                  ✓ Accès à vie · ✓ Certificat inclus<br />✓ Quiz IA après chaque module
                </div>
                <button onClick={sInscrire}
                  style={{ width: '100%', padding: '13px', background: primaire, color: 'white', border: 'none', borderRadius: 10, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer', marginBottom: 8 }}>
                  {!estConnecte ? "S'inscrire pour accéder →" : (estGratuit ? 'Commencer gratuitement →' : 'S\'abonner pour accéder →')}
                </button>
                {!estGratuit && estConnecte && (
                  <Link href="/premium" style={{ display: 'block', textAlign: 'center', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: primaire, textDecoration: 'none', fontWeight: 600 }}>
                    Voir les abonnements →
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Corps */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: 'clamp(24px,4vw,48px) clamp(20px,5vw,56px)' }}>

        {/* Onglets */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 28, background: 'white', border: '1px solid #CBD5E1', borderRadius: 12, padding: 4, width: 'fit-content' }}>
          {[{ id: 'programme', label: '📚 Programme' }, { id: 'examens', label: `📋 Quiz & Examens (${examens.length})` }].map(o => (
            <button key={o.id} onClick={() => setOnglet(o.id as any)}
              style={{ padding: '10px 20px', borderRadius: 9, border: 'none', background: onglet === o.id ? primaire : 'transparent', color: onglet === o.id ? 'white' : '#475569', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: onglet === o.id ? 700 : 400, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s' }}>
              {o.label}
            </button>
          ))}
        </div>

        {/* ── Programme ── */}
        {onglet === 'programme' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
            <div>
              {/* Objectifs */}
              <div style={{ background: 'white', border: '1px solid #CBD5E1', borderRadius: 12, padding: '20px 24px', marginBottom: 20 }}>
                <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 18, fontWeight: 'normal', color: '#0D1B2A', margin: '0 0 14px' }}>Ce que vous apprendrez</h2>
                {['Maîtriser HTML5, CSS3 et JavaScript moderne', 'Créer des interfaces React professionnelles', 'Construire des API REST avec Node.js', 'Déployer des applications sur le cloud'].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                    <span style={{ color: primaire, fontWeight: 700, flexShrink: 0 }}>✓</span>
                    <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#374151' }}>{item}</span>
                  </div>
                ))}
              </div>

              {/* Leçons */}
              {formation.lecons?.length > 0 && (
                <div style={{ background: 'white', border: '1px solid #CBD5E1', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ padding: '16px 24px', borderBottom: '1px solid #EBF3FB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 18, fontWeight: 'normal', color: '#0D1B2A', margin: 0 }}>
                      Programme — {formation.lecons.length} leçons
                    </h2>
                    {estAdmin && (
                      <Link href={`/formations/${id}/ajouter-examen`}
                        style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: secondaire, textDecoration: 'none', fontWeight: 700, background: `${secondaire}10`, padding: '6px 12px', borderRadius: 6 }}>
                        + Ajouter un examen
                      </Link>
                    )}
                  </div>
                  {formation.lecons.map((l: any, i: number) => {
                    const termine = progression && i < (progression.terminees ?? 0);
                    const accessible = dejaInscrit || i === 0;
                    const quizDispo = l.quiz && dejaInscrit && termine;
                    const scoreQuiz = scoresQuiz[`lecon_${l.id}`];

                    return (
                      <div key={l.id ?? i}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 24px', borderBottom: '1px solid #F0FAF4' }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: termine ? `${primaire}15` : '#F0FAF4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: termine ? primaire : '#64748B', fontWeight: 700, flexShrink: 0 }}>
                            {termine ? '✓' : i + 1}
                          </div>
                          <div style={{ flex: 1 }}>
                            {accessible && dejaInscrit ? (
                              <Link href={`/formations/${id}/lecons/${l.id}`} style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, fontWeight: 600, color: '#0D1B2A', textDecoration: 'none', display: 'block', marginBottom: 2 }}>{l.titre}</Link>
                            ) : (
                              <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, fontWeight: 600, color: '#0D1B2A', margin: '0 0 2px' }}>{l.titre}</p>
                            )}
                            <div style={{ display: 'flex', gap: 12 }}>
                              <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#64748B' }}>⏱ {l.dureeMin} min</span>
                              {l.quiz && <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: secondaire, fontWeight: 600 }}>🤖 Quiz IA inclus</span>}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                            {scoreQuiz !== undefined && (
                              <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, fontWeight: 700, color: scoreQuiz >= 60 ? primaire : '#D97706', background: scoreQuiz >= 60 ? '#DCFCE7' : '#FEF3C7', padding: '3px 8px', borderRadius: 100 }}>
                                {scoreQuiz}%
                              </span>
                            )}
                            {!dejaInscrit && i > 0 && <span style={{ color: '#CBD5E1', fontSize: 16 }}>🔒</span>}
                          </div>
                        </div>

                        {/* Quiz IA après la leçon */}
                        {quizDispo && (
                          <div style={{ padding: '0 24px 14px 72px' }}>
                            {quizOuvert === l.id ? (
                              <MiniQuiz
                                quiz={{ id: `lecon_${l.id}`, titre: `Quiz — ${l.titre}`, type: 'QUIZ_IA', nbQuestions: l.quizNbQuestions ?? 5, dureeMin: 10, statut: 'DISPONIBLE' }}
                                onTerminer={(score) => terminerQuiz(`lecon_${l.id}`, score)}
                              />
                            ) : (
                              <button onClick={() => setQuizOuvert(l.id)}
                                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: `${secondaire}10`, border: `1px solid ${secondaire}25`, borderRadius: 8, cursor: 'pointer', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: secondaire, fontWeight: 700 }}>
                                🤖 Quiz IA — {l.quizNbQuestions ?? 5} questions générées par IA
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'white', border: '1px solid #CBD5E1', borderRadius: 12, padding: '18px' }}>
                <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 15, fontWeight: 'normal', color: '#0D1B2A', margin: '0 0 12px' }}>Inclus dans la formation</h3>
                {['✓ Accès à vie', '✓ Certificat TechPro reconnu', '✓ Quiz IA après chaque leçon', '✓ Projet final évalué'].map((c, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#374151' }}>{c}</span>
                  </div>
                ))}
              </div>

              {/* Examens à venir */}
              {examens.some(e => e.statut !== 'FERME') && (
                <div style={{ background: `${secondaire}08`, border: `1px solid ${secondaire}25`, borderRadius: 12, padding: '18px' }}>
                  <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 15, fontWeight: 'normal', color: '#0D1B2A', margin: '0 0 12px' }}>📋 Examens planifiés</h3>
                  {examens.filter(e => e.statut !== 'FERME').map(ex => (
                    <div key={ex.id} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid #CBD5E1' }}>
                      <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, fontWeight: 700, color: '#0D1B2A', marginBottom: 4 }}>{ex.titre}</div>
                      {ex.dateDebut && (
                        <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#475569' }}>
                          📅 {new Date(ex.dateDebut).toLocaleDateString('fr-FR')} → {ex.dateFin ? new Date(ex.dateFin).toLocaleDateString('fr-FR') : '—'}
                        </div>
                      )}
                      <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: ex.statut === 'DISPONIBLE' ? primaire : '#64748B', fontWeight: 700, marginTop: 4 }}>
                        {ex.statut === 'DISPONIBLE' ? '✅ Disponible' : '🔒 Bientôt disponible'}
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setOnglet('examens')}
                    style={{ width: '100%', padding: '8px', background: secondaire, color: 'white', border: 'none', borderRadius: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    Voir tous les examens →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Quiz & Examens ── */}
        {onglet === 'examens' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 22, color: '#0D1B2A', margin: '0 0 6px', fontWeight: 'normal' }}>Quiz & Examens</h2>
                <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#475569', margin: 0 }}>
                  Quiz générés par IA et examens planifiés par votre formateur
                </p>
              </div>
              {estAdmin && (
                <button onClick={() => setModalExamen(true)}
                  style={{ padding: '10px 20px', background: secondaire, color: 'white', border: 'none', borderRadius: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  + Planifier un examen
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {examens.map(ex => {
                const ouvert = ex.statut === 'DISPONIBLE';
                const scoreExistant = scoresQuiz[ex.id];
                return (
                  <div key={ex.id} style={{ background: 'white', border: `1px solid ${ouvert ? primaire + '40' : '#CBD5E1'}`, borderRadius: 14, padding: '20px 24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, fontWeight: 700, color: ex.type === 'QUIZ_IA' ? secondaire : primaire, background: ex.type === 'QUIZ_IA' ? `${secondaire}12` : `${primaire}12`, padding: '3px 10px', borderRadius: 100 }}>
                            {ex.type === 'QUIZ_IA' ? '🤖 Quiz IA' : '📋 Examen formateur'}
                          </span>
                          <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, fontWeight: 700, color: ouvert ? primaire : '#64748B', background: ouvert ? '#DCFCE7' : '#F1F5F9', padding: '3px 10px', borderRadius: 100 }}>
                            {ouvert ? '✅ Disponible' : ex.statut === 'VERROUILLE' ? '🔒 Verrouillé' : '📅 Programmé'}
                          </span>
                        </div>
                        <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 17, color: '#0D1B2A', margin: '0 0 8px', fontWeight: 'normal' }}>{ex.titre}</h3>
                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#475569' }}>❓ {ex.nbQuestions} questions</span>
                          <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#475569' }}>⏱ {ex.dureeMin} min</span>
                          {ex.formateurNom && <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#475569' }}>👨‍💻 {ex.formateurNom}</span>}
                          {ex.dateDebut && <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#475569' }}>📅 {new Date(ex.dateDebut).toLocaleDateString('fr-FR')} → {ex.dateFin ? new Date(ex.dateFin).toLocaleDateString('fr-FR') : '—'}</span>}
                          {ex.apresLecon && <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#475569' }}>🔓 Débloqué après leçon {ex.apresLecon}</span>}
                        </div>
                      </div>
                      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                        {scoreExistant !== undefined && (
                          <div style={{ background: scoreExistant >= 60 ? '#DCFCE7' : '#FEF3C7', borderRadius: 8, padding: '6px 12px', textAlign: 'center' }}>
                            <div style={{ fontFamily: 'Georgia,serif', fontSize: 20, fontWeight: 700, color: scoreExistant >= 60 ? primaire : '#D97706' }}>{scoreExistant}%</div>
                            <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 10, color: '#475569' }}>Dernier score</div>
                          </div>
                        )}
                        {ouvert && dejaInscrit ? (
                          <button onClick={() => setQuizOuvert(ex.id)}
                            style={{ padding: '10px 20px', background: ex.type === 'EXAMEN' ? primaire : secondaire, color: 'white', border: 'none', borderRadius: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                            {ex.type === 'QUIZ_IA' ? '🤖 Lancer le quiz' : '▶ Passer l\'examen'}
                          </button>
                        ) : !dejaInscrit ? (
                          <button onClick={sInscrire}
                            style={{ padding: '10px 20px', background: '#F1F5F9', color: '#64748B', border: '1px solid #CBD5E1', borderRadius: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                            S'inscrire pour accéder
                          </button>
                        ) : (
                          <div style={{ padding: '10px 16px', background: '#F1F5F9', color: '#94A3B8', borderRadius: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 12 }}>
                            {ex.statut === 'VERROUILLE' ? '🔒 Terminer les leçons' : '📅 Pas encore disponible'}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quiz inline ouvert */}
                    {quizOuvert === ex.id && (
                      <div style={{ marginTop: 16 }}>
                        <MiniQuiz
                          quiz={ex}
                          onTerminer={(score) => terminerQuiz(ex.id, score)}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <style>{`@media(max-width:768px){div[style*="grid-template-columns: 1fr auto"]{grid-template-columns:1fr!important;}div[style*="grid-template-columns: 1fr 300px"]{grid-template-columns:1fr!important;}}`}</style>
    </div>
  );
}
