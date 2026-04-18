// app/quiz/page.tsx — TechPro Haiti
// Quiz IA + Examens planifiés + Corrigé automatique IA
// Le formateur peut ajouter ses propres questions, l'IA complète le reste
'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useTenant } from '@/lib/tenantContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const VERT = '#1B3A6B';
const BLEU = '#FF6B35';

interface Question {
  id: string;
  texte: string;
  options: string[];
  bonneReponse: number;
  explication: string;
  source: 'IA' | 'FORMATEUR';
}

interface ExamenConfig {
  id: string;
  titre: string;
  categorie: string;
  niveau: 'DEBUTANT' | 'INTERMEDIAIRE' | 'AVANCE';
  nbQuestions: number;
  dureeMin: number;
  type: 'QUIZ_IA' | 'EXAMEN';
  statut: 'OUVERT' | 'FERME' | 'PROGRAMME';
  dateDebut?: string;
  dateFin?: string;
  formateurNom?: string;
  questions?: Question[];
  tentatives?: number;
  meilleurScore?: number;
}

const QUESTIONS_FALLBACK: Question[] = [
  { id: 'q1', source: 'IA', texte: "Quelle est la complexité temporelle d'une recherche binaire ?", options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], bonneReponse: 1, explication: 'La recherche binaire divise le tableau en deux à chaque étape, donnant une complexité de O(log n). C\'est bien plus efficace que la recherche linéaire O(n) pour les tableaux triés.' },
  { id: 'q2', source: 'IA', texte: "Qu'est-ce que le Big O notation O(1) ?", options: ['Très lent', 'Dépend de l\'entrée', 'Temps constant', 'Logarithmique'], bonneReponse: 1, explication: 'O(1) signifie temps constant — l\'opération prend le même temps quelle que soit la taille de l\'entrée. Ex: accéder à un index de tableau.' },
  { id: 'q3', source: 'IA', texte: 'Quelle commande Git annule le dernier commit sans perdre les changements ?', options: ['git revert HEAD', 'git reset --soft HEAD~1', 'git checkout HEAD', 'git delete commit'], bonneReponse: 1, explication: '`git reset --soft HEAD~1` annule le dernier commit mais conserve les fichiers modifiés dans le staging area. `git revert` crée un nouveau commit inverse.' },
  { id: 'q4', source: 'IA', texte: 'Quelle méthode HTTP est idempotente et sécurisée ?', options: ['POST', 'DELETE', 'GET', 'PATCH'], bonneReponse: 2, explication: 'GET est à la fois idempotente (même résultat si répété) et sécurisée (ne modifie pas l\'état du serveur). POST n\'est ni l\'un ni l\'autre.' },
  { id: 'q5', source: 'IA', texte: 'Qu\'est-ce que le principe SOLID en programmation ?', options: ['Simple, Open, Left, Interface, Dependency', 'Single responsibility, Open/closed, Liskov, Interface segregation, Dependency inversion', 'Secure, Object, Linked, Integrated, Dynamic', 'None of the above'], bonneReponse: 1, explication: 'SOLID: S=Single Responsibility, O=Open/Closed, L=Liskov Substitution, I=Interface Segregation, D=Dependency Inversion. Ces 5 principes guident la conception orientée objet robuste.' },
  { id: 'q6', source: 'IA', texte: "Quelle est la différence entre SQL et NoSQL ?", options: ['SQL est plus rapide', 'SQL = relationnel structuré, NoSQL = flexible non-relationnel', 'NoSQL ne supporte pas les requêtes', 'Ils sont identiques'], bonneReponse: 1, explication: 'SQL (MySQL, PostgreSQL) utilise des tables relationnelles avec schéma fixe. NoSQL (MongoDB, Redis) offre plus de flexibilité pour les données non structurées. Le choix dépend du cas d\'usage.' },
  { id: 'q7', source: 'IA', texte: 'Quel protocole HTTP est utilisé pour les WebSockets ?', options: ['HTTP/1.1', 'HTTP/2', 'WebSocket (ws://)', 'FTP'], bonneReponse: 2, explication: 'WebSocket utilise le protocole ws:// (ou wss:// sécurisé). Il permet une communication bidirectionnelle full-duplex entre client et serveur, contrairement à HTTP.' },
  { id: 'q8', source: 'IA', texte: 'Quelle est la commande pour créer un projet React avec Vite ?', options: ['npx create-react-app', 'npm init vite@latest', 'npm create react', 'npx vite new'], bonneReponse: 1, explication: '`npm create vite@latest` ou `npm init vite@latest` crée un projet React avec Vite. Vite est beaucoup plus rapide que Create React App grâce au bundling ES modules natif.' },
  { id: 'q9', source: 'IA', texte: 'Qu\'est-ce qu\'une API REST ?', options: ['Réseau En Serveur Temps-réel', 'Representational State Transfer', 'Remote Execution Service Tool', 'Relational Entity System Type'], bonneReponse: 1, explication: 'REST (Representational State Transfer) est un style architectural pour les APIs web utilisant HTTP. Il utilise les méthodes GET, POST, PUT, DELETE et retourne généralement du JSON.' },
  { id: 'q10', source: 'IA', texte: "Quelle est la différence entre == et === en JavaScript ?", options: ['Aucune différence', '== compare valeur seulement, === compare valeur ET type', '=== est plus lent', '== est plus strict'], bonneReponse: 1, explication: '== fait une comparaison lâche avec coercition de type (1 == \'1\' → true). === fait une comparaison stricte sans coercition (1 === \'1\' → false). Toujours utiliser === en JavaScript.' },
];

const NIV_CFG: Record<string, { bg: string; text: string; label: string }> = {
  DEBUTANT:      { bg: '#DCFCE7', text: '#1E40AF', label: '🟢 Débutant' },
  INTERMEDIAIRE: { bg: '#DBEAFE', text: '#1E40AF', label: '🔵 Intermédiaire' },
  AVANCE:        { bg: '#FCE7F3', text: '#9D174D', label: '🔴 Avancé' },
};

const STATUT_CFG: Record<string, { label: string; couleur: string; bg: string }> = {
  OUVERT:    { label: '✅ Ouvert',    couleur: '#059669', bg: '#DCFCE7' },
  PROGRAMME: { label: '📅 Programmé', couleur: BLEU,      bg: '#DBEAFE' },
  FERME:     { label: '🔒 Fermé',     couleur: '#64748B', bg: '#F1F5F9' },
};

const CATS = ['Développement Web', 'Cybersécurité', 'Cloud Computing', 'Data Science', 'DevOps', 'Intelligence Artificielle', 'Réseaux & Systèmes', 'Développement Mobile'];

const QUIZ_DEMO: ExamenConfig[] = [
  { id: 'q1', titre: 'Cybersécurité — Antibiotiques essentiels', categorie: 'Cybersécurité', niveau: 'INTERMEDIAIRE', nbQuestions: 10, dureeMin: 15, type: 'QUIZ_IA', statut: 'OUVERT', tentatives: 0 },
  { id: 'q2', titre: 'Développement Web — Constantes vitales', categorie: 'Développement Web', niveau: 'DEBUTANT', nbQuestions: 8, dureeMin: 10, type: 'QUIZ_IA', statut: 'OUVERT', tentatives: 1, meilleurScore: 75 },
];

const EXAMENS_DEMO: ExamenConfig[] = [
  { id: 'e1', titre: 'Examen final — Développement Web avancés', categorie: 'Développement Web', niveau: 'AVANCE', nbQuestions: 20, dureeMin: 45, type: 'EXAMEN', statut: 'OUVERT', dateDebut: '2026-04-15', dateFin: '2026-04-20', formateurNom: 'Jean-Pierre Moreau' },
  { id: 'e2', titre: 'Évaluation — Cybersécurité Avancée', categorie: 'Cybersécurité', niveau: 'INTERMEDIAIRE', nbQuestions: 15, dureeMin: 30, type: 'EXAMEN', statut: 'PROGRAMME', dateDebut: '2026-05-01', dateFin: '2026-05-03', formateurNom: 'Jean-Baptiste Pierre' },
  { id: 'e3', titre: 'Certification — Cloud Computing pédiatriques', categorie: 'DevOps', niveau: 'AVANCE', nbQuestions: 25, dureeMin: 50, type: 'EXAMEN', statut: 'FERME', dateDebut: '2026-03-10', dateFin: '2026-03-12', formateurNom: 'Paul Étienne' },
];

// ── Quiz actif ──────────────────────────────────────────────────
function QuizActif({ quiz, onTerminer }: {
  quiz: ExamenConfig;
  onTerminer: (score: number, reponses: number[], questions: Question[]) => void;
}) {
  const [questions, setQuestions]     = useState<Question[]>(quiz.questions ?? []);
  const [chargement, setChargement]   = useState(!quiz.questions?.length);
  const [idx, setIdx]                 = useState(0);
  const [reponses, setReponses]       = useState<number[]>([]);
  const [reponseChoisie, setReponseChoisie] = useState<number | null>(null);
  const [valide, setValide]           = useState(false);
  const [tempsRestant, setTempsRestant] = useState(quiz.dureeMin * 60);

  useEffect(() => {
    if (quiz.questions?.length) return;
    api.post('/quiz/generer', { categorie: quiz.categorie, niveau: quiz.niveau, nbQuestions: quiz.nbQuestions })
      .then(({ data }) => {
        if (Array.isArray(data) && data.length) setQuestions(data.map((q: any) => ({ ...q, source: 'IA' })));
        else setQuestions(QUESTIONS_FALLBACK.slice(0, quiz.nbQuestions));
      })
      .catch(() => setQuestions(QUESTIONS_FALLBACK.slice(0, quiz.nbQuestions)))
      .finally(() => setChargement(false));
  }, []);

  useEffect(() => {
    if (chargement || questions.length === 0) return;
    const t = setInterval(() => setTempsRestant(p => {
      if (p <= 1) { clearInterval(t); soumettre(reponses); return 0; }
      return p - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [chargement, questions.length]);

  const soumettre = (rep: number[]) => {
    const bonnes = rep.filter((r, i) => questions[i] && r === questions[i].bonneReponse).length;
    onTerminer(Math.round((bonnes / questions.length) * 100), rep, questions);
  };

  const validerEtSuivre = () => {
    if (reponseChoisie === null) return;
    const newRep = [...reponses, reponseChoisie];
    setReponses(newRep);
    setValide(true);
    if (idx + 1 >= questions.length) setTimeout(() => soumettre(newRep), 1200);
  };

  const suivant = () => { setIdx(p => p + 1); setReponseChoisie(null); setValide(false); };

  const mm = Math.floor(tempsRestant / 60).toString().padStart(2, '0');
  const ss = (tempsRestant % 60).toString().padStart(2, '0');
  const q  = questions[idx];

  if (chargement) return (
    <div style={{ textAlign: 'center', padding: '64px 24px' }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>🤖</div>
      <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 22, color: VERT, margin: '0 0 8px', fontWeight: 'normal' }}>L'IA génère vos questions…</h3>
      <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, color: '#475569', margin: '0 0 20px' }}>
        {quiz.nbQuestions} questions sur <strong>{quiz.categorie}</strong>
      </p>
      <div style={{ width: 200, height: 4, background: '#CBD5E1', borderRadius: 2, margin: '0 auto', overflow: 'hidden' }}>
        <div style={{ height: '100%', background: VERT, animation: 'iaload 1.8s ease-in-out infinite', borderRadius: 2 }} />
      </div>
      <style>{`@keyframes iaload{0%{width:5%}60%{width:85%}100%{width:95%}}`}</style>
    </div>
  );

  if (!q) return null;

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 17, color: '#0D1B2A', margin: '0 0 3px', fontWeight: 'normal' }}>{quiz.titre}</h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#475569' }}>Q {idx + 1}/{questions.length}</span>
            <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: q.source === 'IA' ? VERT : BLEU, fontWeight: 700, background: q.source === 'IA' ? `${VERT}10` : `${BLEU}10`, padding: '2px 8px', borderRadius: 100 }}>
              {q.source === 'IA' ? '🤖 IA' : '👨‍💻 Formateur'}
            </span>
          </div>
        </div>
        <div style={{ background: tempsRestant < 60 ? '#FEF2F2' : '#F0FDF4', border: `1px solid ${tempsRestant < 60 ? '#FCA5A5' : '#BBF7D0'}`, borderRadius: 8, padding: '6px 12px', fontFamily: 'Georgia,serif', fontSize: 16, fontWeight: 700, color: tempsRestant < 60 ? '#DC2626' : VERT }}>
          ⏱ {mm}:{ss}
        </div>
      </div>

      <div style={{ height: 5, background: '#EBF3FB', borderRadius: 3, marginBottom: 18, overflow: 'hidden' }}>
        <div style={{ height: '100%', background: `linear-gradient(90deg, ${VERT}, ${BLEU})`, width: `${((idx + (valide ? 1 : 0)) / questions.length) * 100}%`, transition: 'width 0.3s' }} />
      </div>

      <div style={{ background: 'white', border: '1px solid #CBD5E1', borderRadius: 14, padding: '22px 26px', marginBottom: 16 }}>
        <p style={{ fontFamily: 'Georgia,serif', fontSize: 17, color: '#0D1B2A', lineHeight: 1.6, margin: 0 }}>{q.texte}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 14 }}>
        {q.options.map((opt, i) => {
          let bg = 'white', border = '#CBD5E1', color = '#0D1B2A';
          if (valide) {
            if (i === q.bonneReponse) { bg = '#DCFCE7'; border = '#16A34A'; color = '#1E40AF'; }
            else if (i === reponseChoisie) { bg = '#FEF2F2'; border = '#DC2626'; color = '#991B1B'; }
          } else if (i === reponseChoisie) { bg = `${VERT}08`; border = VERT; color = VERT; }
          return (
            <button key={i} onClick={() => { if (!valide) setReponseChoisie(i); }}
              style={{ padding: '13px 16px', borderRadius: 10, border: `2px solid ${border}`, background: bg, color, cursor: valide ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, fontWeight: (i === reponseChoisie || (valide && i === q.bonneReponse)) ? 700 : 400, textAlign: 'left', transition: 'all 0.15s' }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: i === reponseChoisie && !valide ? VERT : border, color: i === reponseChoisie && !valide ? 'white' : '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                {valide && i === q.bonneReponse ? '✓' : valide && i === reponseChoisie ? '✗' : String.fromCharCode(65 + i)}
              </div>
              {opt}
            </button>
          );
        })}
      </div>

      {valide && (
        <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, padding: '12px 16px', marginBottom: 14 }}>
          <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, fontWeight: 700, color: '#1E40AF', marginBottom: 4 }}>
            💡 Explication {q.source === 'IA' ? '(générée par IA)' : '(formateur)'}
          </div>
          <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#1E40AF', lineHeight: 1.6, margin: 0 }}>{q.explication}</p>
        </div>
      )}

      {!valide ? (
        <button onClick={validerEtSuivre} disabled={reponseChoisie === null}
          style={{ width: '100%', padding: '14px', background: reponseChoisie !== null ? VERT : '#CBD5E1', color: reponseChoisie !== null ? 'white' : '#64748B', border: 'none', borderRadius: 10, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 15, cursor: reponseChoisie !== null ? 'pointer' : 'default' }}>
          Valider la réponse →
        </button>
      ) : idx + 1 < questions.length ? (
        <button onClick={suivant} style={{ width: '100%', padding: '14px', background: VERT, color: 'white', border: 'none', borderRadius: 10, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
          Question suivante →
        </button>
      ) : (
        <div style={{ textAlign: 'center', padding: '8px', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#475569' }}>
          ⏳ Génération du corrigé…
        </div>
      )}
    </div>
  );
}

// ── Corrigé détaillé ────────────────────────────────────────────
function CorrigeDetaille({ quiz, reponses, questions, score, onRecommencer, onRetour }: {
  quiz: ExamenConfig; reponses: number[]; questions: Question[];
  score: number; onRecommencer: () => void; onRetour: () => void;
}) {
  const [ouvert, setOuvert] = useState(false);
  const mention = score >= 90 ? { label: 'Excellent !', emoji: '🏆', couleur: '#059669' }
    : score >= 75 ? { label: 'Très bien', emoji: '🎉', couleur: VERT }
    : score >= 60 ? { label: 'Bien', emoji: '👍', couleur: BLEU }
    : { label: 'À réviser', emoji: '📚', couleur: '#D97706' };

  const nbBonnes = reponses.filter((r, i) => questions[i] && r === questions[i].bonneReponse).length;
  const nbIA     = questions.filter(q => q.source === 'IA').length;
  const nbFormateur = questions.filter(q => q.source === 'FORMATEUR').length;

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      {/* Score */}
      <div style={{ background: 'white', border: '1px solid #CBD5E1', borderRadius: 20, padding: '32px', marginBottom: 20, textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>{mention.emoji}</div>
        <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 26, color: '#0D1B2A', margin: '0 0 6px', fontWeight: 'normal' }}>{mention.label}</h2>
        <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, color: '#475569', margin: '0 0 20px' }}>{quiz.titre}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 20 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Georgia,serif', fontSize: 52, fontWeight: 700, color: mention.couleur, lineHeight: 1 }}>{score}</div>
            <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#64748B' }}>/ 100 points</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Georgia,serif', fontSize: 52, fontWeight: 700, color: '#0D1B2A', lineHeight: 1 }}>{nbBonnes}</div>
            <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#64748B' }}>/ {questions.length} bonnes réponses</div>
          </div>
        </div>
        <div style={{ height: 8, background: '#EBF3FB', borderRadius: 4, overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ height: '100%', background: mention.couleur, width: `${score}%`, borderRadius: 4, transition: 'width 1s' }} />
        </div>
        {/* Composition de l'examen */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
          {nbIA > 0 && <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: VERT, background: `${VERT}10`, padding: '3px 10px', borderRadius: 100, fontWeight: 700 }}>🤖 {nbIA} questions IA</span>}
          {nbFormateur > 0 && <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: BLEU, background: `${BLEU}10`, padding: '3px 10px', borderRadius: 100, fontWeight: 700 }}>👨‍💻 {nbFormateur} questions formateur</span>}
        </div>
        {score >= 75 && quiz.type === 'EXAMEN' && (
          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, padding: '12px 16px' }}>
            <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, color: '#1E40AF', fontWeight: 700 }}>
              🏅 Éligible à la certification TechPro — disponible dans votre profil sous 24h
            </div>
          </div>
        )}
      </div>

      {/* Corrigé IA */}
      <div style={{ background: 'white', border: '1px solid #CBD5E1', borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}>
        <button onClick={() => setOuvert(v => !v)}
          style={{ width: '100%', padding: '16px 24px', background: ouvert ? `${BLEU}06` : 'white', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>📋</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontFamily: 'Georgia,serif', fontSize: 16, color: '#0D1B2A', fontWeight: 'normal' }}>Corrigé complet</div>
              <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#475569' }}>
                Toutes les réponses avec explications — {nbIA > 0 ? 'générées par IA' : 'du formateur'}
              </div>
            </div>
          </div>
          <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: BLEU, fontWeight: 700 }}>
            {ouvert ? '▲ Masquer' : '▼ Voir le corrigé'}
          </span>
        </button>

        {ouvert && (
          <div style={{ padding: '0 24px 24px' }}>
            {questions.map((q, i) => {
              const repDonnee = reponses[i];
              const correcte  = repDonnee === q.bonneReponse;
              return (
                <div key={q.id} style={{ marginTop: 24, paddingTop: 20, borderTop: i === 0 ? 'none' : '1px solid #EBF3FB' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: correcte ? '#DCFCE7' : '#FEF2F2', color: correcte ? '#1E40AF' : '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>
                      {correcte ? '✓' : '✗'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#94A3B8', fontWeight: 700 }}>Q{i + 1}</span>
                        <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: q.source === 'IA' ? VERT : BLEU, fontWeight: 700, background: q.source === 'IA' ? `${VERT}10` : `${BLEU}10`, padding: '1px 8px', borderRadius: 100 }}>
                          {q.source === 'IA' ? '🤖 IA' : '👨‍💻 Formateur'}
                        </span>
                      </div>
                      <p style={{ fontFamily: 'Georgia,serif', fontSize: 15, color: '#0D1B2A', lineHeight: 1.5, margin: '0 0 10px' }}>{q.texte}</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
                        {q.options.map((opt, j) => {
                          const estBonne  = j === q.bonneReponse;
                          const estDonnee = j === repDonnee;
                          return (
                            <div key={j} style={{ padding: '7px 12px', borderRadius: 6, background: estBonne ? '#DCFCE7' : (estDonnee && !estBonne) ? '#FEF2F2' : '#F8FAFC', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: estBonne ? '#1E40AF' : (estDonnee && !estBonne) ? '#DC2626' : '#64748B', fontWeight: (estBonne || estDonnee) ? 700 : 400, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span>{String.fromCharCode(65 + j)}. {opt}</span>
                              <span style={{ fontSize: 11, flexShrink: 0, marginLeft: 12 }}>
                                {estBonne ? '← Bonne réponse' : estDonnee && !estBonne ? '← Votre réponse' : ''}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '10px 14px' }}>
                        <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, fontWeight: 700, color: '#1E40AF', marginBottom: 4 }}>
                          {q.source === 'IA' ? '🤖 Explication (IA)' : '👨‍💻 Explication (formateur)'}
                        </div>
                        <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#1E40AF', lineHeight: 1.6, margin: 0 }}>{q.explication}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button onClick={onRecommencer} style={{ width: '100%', padding: '14px', background: VERT, color: 'white', border: 'none', borderRadius: 10, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
          🔄 Recommencer
        </button>
        <button onClick={onRetour} style={{ width: '100%', padding: '14px', background: 'white', color: VERT, border: `2px solid ${VERT}`, borderRadius: 10, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
          ← Retour aux quiz
        </button>
      </div>
    </div>
  );
}

// ── Modal créer examen ──────────────────────────────────────────
function ModalCreerExamen({ onFermer, onCreer, primaire, secondaire }: {
  onFermer: () => void;
  onCreer: (payload: any) => void;
  primaire: string; secondaire: string;
}) {
  const [etape, setEtape] = useState<1 | 2>(1);
  const [form, setForm]   = useState({
    titre: '', categorie: 'Développement Web', niveau: 'INTERMEDIAIRE',
    nbQuestions: 20, dureeMin: 45, dateDebut: '', dateFin: '',
  });
  const [questionsFormateur, setQuestionsFormateur] = useState<Partial<Question>[]>([]);
  const [envoi, setEnvoi] = useState(false);

  const nbIA = Math.max(0, form.nbQuestions - questionsFormateur.length);

  const ajouterQ = () => setQuestionsFormateur(prev => [...prev, { texte: '', options: ['', '', '', ''], bonneReponse: 0, explication: '', source: 'FORMATEUR' as const }]);
  const supprimerQ = (i: number) => setQuestionsFormateur(prev => prev.filter((_, j) => j !== i));
  const updateQ = (i: number, k: string, v: any) => setQuestionsFormateur(prev => prev.map((q, j) => j === i ? { ...q, [k]: v } : q));
  const updateOpt = (qi: number, oi: number, v: string) => setQuestionsFormateur(prev => prev.map((q, j) => j === qi ? { ...q, options: (q.options ?? ['','','','']).map((o, k) => k === oi ? v : o) } : q));

  const creer = () => {
    setEnvoi(true);
    onCreer({ ...form, questions: questionsFormateur.filter(q => q.texte?.trim()), genererAvecIA: nbIA > 0, nbQuestionsIA: nbIA, type: 'EXAMEN', statut: form.dateDebut ? 'PROGRAMME' : 'OUVERT' });
    setEnvoi(false);
  };

  const inp: React.CSSProperties = { width: '100%', padding: '10px 12px', border: '1.5px solid #CBD5E1', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", boxSizing: 'border-box' as const, color: '#0D1B2A', background: 'white' };
  const lbl: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#0D1B2A', marginBottom: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif" };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'white', borderRadius: 16, padding: '28px 32px', width: '100%', maxWidth: 600, boxShadow: '0 24px 64px rgba(0,0,0,0.2)', maxHeight: '92vh', overflowY: 'auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 14, borderBottom: `2px solid ${primaire}` }}>
          <div>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 18, color: primaire, margin: '0 0 4px' }}>Créer un examen</h2>
            <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#475569', margin: 0 }}>Ajoutez vos questions — l'IA génère le reste + corrigé complet</p>
          </div>
          <button onClick={onFermer} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#64748B' }}>✕</button>
        </div>

        {/* Étapes */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          {[{ n: 1, label: 'Paramètres' }, { n: 2, label: 'Vos questions (optionnel)' }].map((s, i) => (
            <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {i > 0 && <div style={{ width: 24, height: 2, background: etape > s.n ? primaire : '#CBD5E1' }} />}
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: etape >= s.n ? primaire : '#CBD5E1', color: etape >= s.n ? 'white' : '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 13 }}>
                {etape > s.n ? '✓' : s.n}
              </div>
              <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: etape >= s.n ? primaire : '#64748B', fontWeight: etape >= s.n ? 700 : 400 }}>{s.label}</span>
            </div>
          ))}
        </div>

        {etape === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div><label style={lbl}>Titre *</label><input value={form.titre} onChange={e => setForm(p => ({ ...p, titre: e.target.value }))} placeholder="Ex : Examen final — Développement Web avancés" style={inp} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><label style={lbl}>Catégorie IT</label>
                <select value={form.categorie} onChange={e => setForm(p => ({ ...p, categorie: e.target.value }))} style={{ ...inp, appearance: 'none' as any }}>
                  {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div><label style={lbl}>Niveau</label>
                <select value={form.niveau} onChange={e => setForm(p => ({ ...p, niveau: e.target.value }))} style={{ ...inp, appearance: 'none' as any }}>
                  <option value="DEBUTANT">🟢 Débutant</option>
                  <option value="INTERMEDIAIRE">🔵 Intermédiaire</option>
                  <option value="AVANCE">🔴 Avancé</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><label style={lbl}>Nb questions total</label><input type="number" min={5} max={50} value={form.nbQuestions} onChange={e => setForm(p => ({ ...p, nbQuestions: parseInt(e.target.value) || 10 }))} style={inp} /></div>
              <div><label style={lbl}>Durée (min)</label><input type="number" min={10} max={180} value={form.dureeMin} onChange={e => setForm(p => ({ ...p, dureeMin: parseInt(e.target.value) || 30 }))} style={inp} /></div>
            </div>

            {/* Période accès */}
            <div style={{ background: `${secondaire}08`, border: `1px solid ${secondaire}25`, borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, fontWeight: 700, color: secondaire, marginBottom: 10 }}>📅 Période d'accès (optionnel)</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={{ ...lbl, fontSize: 12 }}>Ouverture</label><input type="datetime-local" value={form.dateDebut} onChange={e => setForm(p => ({ ...p, dateDebut: e.target.value }))} style={inp} /></div>
                <div><label style={{ ...lbl, fontSize: 12 }}>Fermeture</label><input type="datetime-local" value={form.dateFin} onChange={e => setForm(p => ({ ...p, dateFin: e.target.value }))} style={inp} /></div>
              </div>
              <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#475569', margin: '8px 0 0' }}>Laissez vide pour un accès immédiat et permanent.</p>
            </div>

            <div style={{ background: `${primaire}06`, border: `1px solid ${primaire}20`, borderRadius: 10, padding: '12px 14px' }}>
              <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: primaire, margin: 0, lineHeight: 1.6 }}>
                🤖 L'IA générera <strong>{form.nbQuestions} questions</strong> sur <strong>{form.categorie}</strong> avec explication pour chaque réponse. À l'étape suivante, vous pouvez ajouter vos propres questions.
              </p>
            </div>
            <button onClick={() => { if (!form.titre.trim()) { toast.error('Titre requis'); return; } setEtape(2); }}
              style={{ width: '100%', padding: '14px', background: primaire, color: 'white', border: 'none', borderRadius: 10, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
              Continuer →
            </button>
          </div>
        )}

        {etape === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: '#F0F4FA', border: '1px solid #CBD5E1', borderRadius: 10, padding: '12px 16px' }}>
              <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#0D1B2A', margin: 0, lineHeight: 1.6 }}>
                <strong>Plan :</strong> {form.nbQuestions} questions au total —{' '}
                <span style={{ color: BLEU }}>👨‍💻 {questionsFormateur.length} de vous</span>
                {' + '}
                <span style={{ color: VERT }}>🤖 {nbIA} générées par IA</span>
              </p>
            </div>

            {questionsFormateur.map((q, qi) => (
              <div key={qi} style={{ background: `${BLEU}04`, border: `1px solid ${BLEU}20`, borderRadius: 12, padding: '16px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, fontWeight: 700, color: BLEU }}>👨‍💻 Votre question {qi + 1}</span>
                  <button onClick={() => supprimerQ(qi)} style={{ background: '#FEF2F2', border: 'none', color: '#DC2626', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 11, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700 }}>Supprimer</button>
                </div>
                <textarea value={q.texte} onChange={e => updateQ(qi, 'texte', e.target.value)} placeholder="Texte de la question" rows={2} style={{ ...inp, resize: 'none' as const, marginBottom: 10 }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                  {(q.options ?? ['','','','']).map((opt, oi) => (
                    <div key={oi} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input type="radio" name={`bonne_${qi}`} checked={q.bonneReponse === oi} onChange={() => updateQ(qi, 'bonneReponse', oi)} style={{ accentColor: VERT, flexShrink: 0 }} title="Marquer comme bonne réponse" />
                      <input value={opt} onChange={e => updateOpt(qi, oi, e.target.value)} placeholder={`Option ${String.fromCharCode(65 + oi)}`} style={{ ...inp, flex: 1 }} />
                    </div>
                  ))}
                </div>
                <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#475569', margin: '0 0 6px' }}>Explication pour le corrigé :</p>
                <textarea value={q.explication} onChange={e => updateQ(qi, 'explication', e.target.value)} placeholder="Pourquoi cette réponse est correcte ?" rows={2} style={{ ...inp, resize: 'none' as const, background: '#F0FDF4', borderColor: '#BBF7D0' }} />
              </div>
            ))}

            {questionsFormateur.length < form.nbQuestions && (
              <button onClick={ajouterQ} style={{ padding: '12px', background: `${BLEU}08`, color: BLEU, border: `1px dashed ${BLEU}40`, borderRadius: 10, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                + Ajouter une de vos questions (optionnel)
              </button>
            )}

            {nbIA > 0 && (
              <div style={{ background: `${VERT}06`, border: `1px solid ${VERT}20`, borderRadius: 10, padding: '12px 14px' }}>
                <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: VERT, margin: 0, lineHeight: 1.6 }}>
                  🤖 <strong>{nbIA} question{nbIA > 1 ? 's' : ''}</strong> seront générées automatiquement par l'IA sur <strong>{form.categorie}</strong>, avec explication complète pour le corrigé.
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setEtape(1)} style={{ flex: 1, padding: '13px', background: 'white', color: primaire, border: `2px solid ${primaire}`, borderRadius: 10, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>← Retour</button>
              <button onClick={creer} disabled={envoi}
                style={{ flex: 2, padding: '13px', background: envoi ? '#475569' : primaire, color: 'white', border: 'none', borderRadius: 10, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                {envoi ? '⏳ Création…' : '📋 Créer l\'examen →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Page principale ─────────────────────────────────────────────
export default function PageQuiz() {
  const { estConnecte, utilisateur } = useAuthStore();
  const { config } = useTenant();

  const [onglet, setOnglet]         = useState<'quiz' | 'examens'>('quiz');
  const [filtreCat, setFiltreCat]   = useState('Tous');
  const [quizActif, setQuizActif]   = useState<ExamenConfig | null>(null);
  const [score, setScore]           = useState<number | null>(null);
  const [repFinales, setRepFinales] = useState<number[]>([]);
  const [qFinales, setQFinales]     = useState<Question[]>([]);
  const [quizList, setQuizList]     = useState<ExamenConfig[]>(QUIZ_DEMO);
  const [examens, setExamens]       = useState<ExamenConfig[]>(EXAMENS_DEMO);
  const [modalCreer, setModalCreer] = useState(false);

  const primaire   = config?.couleursTheme.primaire   ?? VERT;
  const secondaire = config?.couleursTheme.secondaire ?? BLEU;
  const estAdmin   = ['ADMIN', 'FORMATEUR'].includes(utilisateur?.role ?? '');

  useEffect(() => {
    api.get('/quiz').then(({ data }) => { if (Array.isArray(data) && data.length) setQuizList(data); }).catch(() => {});
    api.get('/examens').then(({ data }) => {
    if (Array.isArray(data) && data.length) {
      setExamens(prev => {
        const locals = prev.filter(e => e.id?.startsWith('local_'));
        return [...locals, ...data];
      });
    }
  }).catch(() => {});
  }, []);

  const lancerQuiz = (q: ExamenConfig) => {
    if (!estConnecte) { window.location.href = '/auth/connexion'; return; }
    setScore(null); setRepFinales([]); setQFinales([]);
    setQuizActif(q);
  };

  const terminerQuiz = async (s: number, rep: number[], qs: Question[]) => {
    setScore(s); setRepFinales(rep); setQFinales(qs);
    if (quizActif) {
      await api.post(`/quiz/${quizActif.id}/resultat`, { score: s }).catch(() => {});
      const upd = (prev: ExamenConfig[]) => prev.map(q => q.id === quizActif.id ? { ...q, tentatives: (q.tentatives ?? 0) + 1, meilleurScore: Math.max(q.meilleurScore ?? 0, s) } : q);
      setQuizList(upd); setExamens(upd);
    }
  };

  const creerExamen = async (payload: any) => {
    try {
      const { data } = await api.post('/examens', payload);
      setExamens(prev => [data, ...prev]);
    } catch {
      setExamens(prev => [{ ...payload, id: 'local_' + Date.now(), statut: payload.dateDebut ? 'PROGRAMME' : 'OUVERT', formateurNom: `${utilisateur?.prenom} ${utilisateur?.nom}` }, ...prev]);
    }
    toast.success('✅ Examen créé !');
    setModalCreer(false);
    setOnglet('examens');
  };

  if (quizActif && score === null) return (
    <div style={{ background: '#F0F4FA', minHeight: '100vh', padding: 'clamp(24px,4vw,48px) clamp(20px,5vw,48px)' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <button onClick={() => setQuizActif(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#475569', marginBottom: 20, padding: 0 }}>← Abandonner</button>
        <QuizActif quiz={quizActif} onTerminer={terminerQuiz} />
      </div>
    </div>
  );

  if (quizActif && score !== null) return (
    <div style={{ background: '#F0F4FA', minHeight: '100vh', padding: 'clamp(24px,4vw,48px) clamp(20px,5vw,48px)' }}>
      <div style={{ maxWidth: 750, margin: '0 auto' }}>
        <CorrigeDetaille quiz={quizActif} reponses={repFinales} questions={qFinales} score={score}
          onRecommencer={() => { setScore(null); setRepFinales([]); setQFinales([]); }}
          onRetour={() => { setQuizActif(null); setScore(null); }} />
      </div>
    </div>
  );

  const filtres = quizList.filter(q => filtreCat === 'Tous' || q.categorie === filtreCat);

  return (
    <div style={{ background: '#F0F4FA', minHeight: '100vh' }}>
      {modalCreer && <ModalCreerExamen onFermer={() => setModalCreer(false)} onCreer={creerExamen} primaire={primaire} secondaire={secondaire} />}

      <section style={{ background: `linear-gradient(135deg, #0D1B2A 0%, ${primaire} 100%)`, padding: 'clamp(40px,6vw,64px) clamp(20px,5vw,48px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: secondaire, fontWeight: 700, marginBottom: 12 }}>Certifications & Quiz IT</div>
            <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(26px,4vw,44px)', color: 'white', margin: '0 0 10px', fontWeight: 'normal' }}>Évaluations TechPro Haiti</h1>
            <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.7)', maxWidth: 500, margin: 0, lineHeight: 1.6 }}>
              Quiz générés par IA, examens des formateurs et corrigé détaillé automatique après chaque évaluation.
            </p>
          </div>
          {estAdmin && <button onClick={() => setModalCreer(true)} style={{ padding: '13px 24px', background: secondaire, color: 'white', border: 'none', borderRadius: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>📋 Créer un examen</button>}
        </div>
        <div style={{ maxWidth: 1200, margin: '20px auto 0', display: 'flex', gap: 8 }}>
          {[{ id: 'quiz', label: '🤖 Quiz IA' }, { id: 'examens', label: '📋 Examens formateurs' }].map(o => (
            <button key={o.id} onClick={() => setOnglet(o.id as any)}
              style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: onglet === o.id ? 'white' : 'rgba(255,255,255,0.15)', color: onglet === o.id ? primaire : 'rgba(255,255,255,0.85)', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, fontWeight: onglet === o.id ? 700 : 400, cursor: 'pointer' }}>
              {o.label}
            </button>
          ))}
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(32px,4vw,48px) clamp(20px,5vw,48px)' }}>

        {onglet === 'quiz' && (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
              {['Tous', ...CATS].map(cat => (
                <button key={cat} onClick={() => setFiltreCat(cat)}
                  style={{ padding: '7px 14px', borderRadius: 100, border: `1.5px solid ${filtreCat === cat ? primaire : '#CBD5E1'}`, background: filtreCat === cat ? primaire : 'white', color: filtreCat === cat ? 'white' : '#475569', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, fontWeight: filtreCat === cat ? 700 : 400, cursor: 'pointer' }}>
                  {cat}
                </button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
              {filtres.map(q => {
                const niv = NIV_CFG[q.niveau];
                return (
                  <div key={q.id} style={{ background: 'white', border: '1px solid #CBD5E1', borderRadius: 14, overflow: 'hidden' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${primaire}15`; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}>
                    <div style={{ height: 4, background: `linear-gradient(90deg, ${primaire}, ${secondaire})` }} />
                    <div style={{ padding: '20px 22px' }}>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                        <span style={{ background: niv.bg, color: niv.text, fontSize: 11, padding: '3px 10px', borderRadius: 100, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700 }}>{niv.label}</span>
                        <span style={{ background: `${secondaire}10`, color: secondaire, fontSize: 11, padding: '3px 10px', borderRadius: 100, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700 }}>🤖 IA + Corrigé</span>
                      </div>
                      <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 16, color: '#0D1B2A', margin: '0 0 8px', fontWeight: 'normal', lineHeight: 1.4 }}>{q.titre}</h3>
                      <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
                        <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#64748B' }}>❓ {q.nbQuestions} questions</span>
                        <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#64748B' }}>⏱ {q.dureeMin} min</span>
                      </div>
                      {(q.tentatives ?? 0) > 0 && q.meilleurScore !== undefined && (
                        <div style={{ background: '#F0FDF4', borderRadius: 8, padding: '6px 12px', marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#1E40AF' }}>Meilleur score</span>
                          <span style={{ fontFamily: 'Georgia,serif', fontSize: 16, fontWeight: 700, color: primaire }}>{q.meilleurScore}%</span>
                        </div>
                      )}
                      <button onClick={() => lancerQuiz(q)} style={{ width: '100%', padding: '12px', background: primaire, color: 'white', border: 'none', borderRadius: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                        {(q.tentatives ?? 0) > 0 ? '🔄 Recommencer' : '▶ Commencer'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {onglet === 'examens' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {examens.map(ex => {
              const statut = STATUT_CFG[ex.statut ?? 'FERME'];
              const niv    = NIV_CFG[ex.niveau];
              const ouvert = ex.statut === 'OUVERT';
              return (
                <div key={ex.id} style={{ background: 'white', border: `1px solid ${ouvert ? primaire + '40' : '#CBD5E1'}`, borderRadius: 14, overflow: 'hidden' }}>
                  {ouvert && <div style={{ height: 4, background: `linear-gradient(90deg, ${primaire}, ${secondaire})` }} />}
                  <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, fontWeight: 700, color: statut.couleur, background: statut.bg, padding: '3px 10px', borderRadius: 100 }}>{statut.label}</span>
                        <span style={{ background: niv.bg, color: niv.text, fontSize: 11, padding: '3px 10px', borderRadius: 100, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700 }}>{niv.label}</span>
                        <span style={{ background: `${primaire}10`, color: primaire, fontSize: 11, padding: '3px 10px', borderRadius: 100, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700 }}>📋 Corrigé IA inclus</span>
                      </div>
                      <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 18, color: '#0D1B2A', margin: '0 0 8px', fontWeight: 'normal' }}>{ex.titre}</h3>
                      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                        {ex.formateurNom && <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#475569' }}>👨‍💻 {ex.formateurNom}</span>}
                        <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#475569' }}>❓ {ex.nbQuestions} questions</span>
                        <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#475569' }}>⏱ {ex.dureeMin} min</span>
                        {ex.dateDebut && <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#475569' }}>📅 {new Date(ex.dateDebut).toLocaleDateString('fr-FR')} → {ex.dateFin ? new Date(ex.dateFin).toLocaleDateString('fr-FR') : '—'}</span>}
                      </div>
                      {(ex.tentatives ?? 0) > 0 && ex.meilleurScore !== undefined && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 8, background: '#F0FDF4', borderRadius: 8, padding: '4px 12px' }}>
                          <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#1E40AF' }}>Meilleur score :</span>
                          <span style={{ fontFamily: 'Georgia,serif', fontSize: 16, fontWeight: 700, color: primaire }}>{ex.meilleurScore}%</span>
                        </div>
                      )}
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      {ouvert ? (
                        <button onClick={() => lancerQuiz(ex)} style={{ padding: '12px 22px', background: primaire, color: 'white', border: 'none', borderRadius: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                          ▶ Passer l'examen
                        </button>
                      ) : (
                        <div style={{ padding: '12px 18px', background: '#F1F5F9', color: '#94A3B8', borderRadius: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 13, textAlign: 'center' }}>
                          {ex.statut === 'PROGRAMME' ? '📅 Bientôt' : '🔒 Fermé'}
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
    </div>
  );
}
