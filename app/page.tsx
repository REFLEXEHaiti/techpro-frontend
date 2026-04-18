// app/page.tsx — TechPro Haiti
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useTenant } from '@/lib/tenantContext';
import api from '@/lib/api';

// Hook compteur animé
function useAnimatedCounter(target: number, duration = 1500) {
  const [count, setCount] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef   = useRef<number>(0);

  const animate = useCallback((timestamp: number) => {
    if (!startRef.current) startRef.current = timestamp;
    const elapsed  = timestamp - startRef.current;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const ease = 1 - Math.pow(1 - progress, 3);
    setCount(Math.round(ease * target));
    if (progress < 1) rafRef.current = requestAnimationFrame(animate);
  }, [target, duration]);

  const restart = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    startRef.current = null;
    setCount(0);
    rafRef.current = requestAnimationFrame(animate);
  }, [animate]);

  useEffect(() => {
    restart();
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, restart]);

  return { count, restart };
}

const BLEU = '#1B3A6B'; const ORANGE = '#FF6B35';

// Stats initiales (remplacées par API si disponible)
const STATS_DEFAULT = [
  { cible: 3200, suffix: '+', label: 'Professionnels formés' },
  { cible: 85,   suffix: '',  label: 'Formations disponibles' },
  { cible: 16,   suffix: '',  label: 'Domaines couverts' },
  { cible: 98,   suffix: '%', label: 'Taux de satisfaction' },
];

// Composant compteur animé
function StatCounter({ cible, suffix, label, primaire, secondaire }: { cible: number; suffix: string; label: string; primaire: string; secondaire: string }) {
  const { count, restart } = useAnimatedCounter(cible, 1800);

  // Réanimer toutes les 8 secondes
  useEffect(() => {
    const interval = setInterval(() => restart(), 8000);
    return () => clearInterval(interval);
  }, [restart]);

  return (
    <div style={{ cursor: 'pointer' }} onClick={restart} title="Cliquez pour réanimer">
      <div style={{ fontSize: 'clamp(16px,2vw,28px)', fontWeight: 900, color: secondaire, fontFamily: 'Georgia,serif', lineHeight: 1 }}>
        {count.toLocaleString('fr')}{suffix}
      </div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{label}</div>
    </div>
  );
}

const DOMAINES = [
  '💻 Bureautique & IT', '🌐 Développement Web', '🔒 Cybersécurité',
  '📊 Comptabilité & Finance', '⚖️ Droit des affaires', '📋 Secrétariat & RH',
  '🏠 Immobilier', '📣 Marketing Digital', '🏪 Caissier & Commerce',
  '📈 Gestion de Projet', '🤖 IA pour professionnels', '💼 Finance & Fiscalité DGI',
];

const FORMATIONS_VEDETTES = [
  { id: 'd1', titre: 'Bureautique & Microsoft Office 365', categorie: 'Informatique & IT', inscrits: 842, gratuit: true, img: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600' },
  { id: 'd4', titre: 'Comptabilité générale haïtienne', categorie: 'Comptabilité & Finance', inscrits: 634, gratuit: true, img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600' },
  { id: 'd16', titre: 'IA pour les professionnels haïtiens', categorie: 'Intelligence Artificielle', inscrits: 923, gratuit: true, img: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600' },
];

export default function PageAccueil() {
  const { estConnecte } = useAuthStore();
  const { config } = useTenant();
  const [formations, setFormations] = useState(FORMATIONS_VEDETTES);
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [stats, setStats] = useState(STATS_DEFAULT);
  const defilRef = useRef<HTMLDivElement>(null);
  const posRef   = useRef(0);

  const primaire   = config?.couleursTheme.primaire   ?? BLEU;
  const secondaire = config?.couleursTheme.secondaire ?? ORANGE;
  const nom        = 'TechPro Haiti';

  useEffect(() => {
    api.get('/cours?limite=3&gratuit=true').then(({ data }) => {
      if (Array.isArray(data) && data.length) setFormations(data.slice(0, 3));
    }).catch(() => {});
    api.get('/sponsors').then(({ data }) => {
      if (Array.isArray(data)) setSponsors(data);
    }).catch(() => {});
    // Stats dynamiques depuis le backend
    api.get('/stats').then(({ data }) => {
      if (data) setStats([
        { cible: data.totalUtilisateurs ?? 3200, suffix: '+', label: 'Professionnels formés' },
        { cible: data.totalCours ?? 85,          suffix: '',  label: 'Formations disponibles' },
        { cible: data.totalCategories ?? 16,     suffix: '',  label: 'Domaines couverts' },
        { cible: 98,                              suffix: '%', label: 'Taux de satisfaction' },
      ]);
    }).catch(() => {}); // Garde les valeurs par défaut si pas de route stats
  }, []);

  useEffect(() => {
    const el = defilRef.current;
    if (!el || sponsors.length === 0) return;
    const anim = setInterval(() => {
      posRef.current += 0.5;
      if (posRef.current >= el.scrollWidth / 2) posRef.current = 0;
      el.scrollLeft = posRef.current;
    }, 16);
    return () => clearInterval(anim);
  }, [sponsors]);

  return (
    <div style={{ background: '#F0F4FA', fontFamily: "'Helvetica Neue',Arial,sans-serif", overflowX: 'hidden' }}>

      {/* Bannière sponsors */}
      {sponsors.length > 0 && (
        <div style={{ background: 'white', borderBottom: '1px solid #E2E8F0', padding: '10px 0' }}>
          <p style={{ textAlign: 'center', fontSize: 10, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px', fontWeight: 700 }}>Partenaires & Sponsors</p>
          <div ref={defilRef} style={{ display: 'flex', overflow: 'hidden', alignItems: 'center' }}>
            {[...sponsors, ...sponsors].map((s, i) => (
              <a key={i} href={s.siteWeb || '#'} target="_blank" rel="noreferrer"
                style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 160, height: 48, margin: '0 16px', textDecoration: 'none', opacity: 0.7 }}>
                {s.logoUrl ? <img src={s.logoUrl} alt={s.nom} style={{ maxWidth: 140, maxHeight: 40, objectFit: 'contain' }} />
                : <span style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>{s.nom}</span>}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Hero */}
      <section style={{ background: primaire, padding: 'clamp(60px,8vw,100px) clamp(20px,5vw,48px)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '45%', height: '100%', background: `linear-gradient(135deg, transparent, rgba(255,107,53,0.08))`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, right: -60, width: 300, height: 300, borderRadius: '50%', border: `2px solid rgba(255,107,53,0.12)`, pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 20, background: 'rgba(255,107,53,0.15)', border: '1px solid rgba(255,107,53,0.3)', borderRadius: 100, padding: '6px 14px' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: secondaire, animation: 'pulse 1.5s infinite' }} />
              <span style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: secondaire, fontWeight: 700 }}>Plateforme professionnelle haïtienne #1</span>
            </div>

            <h1 style={{ fontSize: 'clamp(28px,4vw,54px)', fontWeight: 900, lineHeight: 1.05, color: 'white', marginBottom: 20, letterSpacing: '-1px' }}>
              Formez-vous<br />
              <span style={{ color: secondaire }}>professionnellement</span><br />
              en Haïti
            </h1>

            <p style={{ fontSize: 'clamp(14px,1.6vw,17px)', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: 36, maxWidth: 440 }}>
              Comptabilité, droit, informatique, secrétariat, immobilier et plus — formations certifiantes pour les professionnels haïtiens.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>
              <Link href="/formations" style={{ display: 'inline-block', padding: '15px 32px', background: secondaire, color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: 14, borderRadius: 8, boxShadow: `0 4px 20px rgba(255,107,53,0.4)` }}>
                Voir le catalogue →
              </Link>
              <Link href="/quiz" style={{ display: 'inline-block', padding: '15px 28px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1.5px solid rgba(255,255,255,0.25)', textDecoration: 'none', fontWeight: 600, fontSize: 14, borderRadius: 8 }}>
                Passer une certification
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              {stats.map(s => (
                <StatCounter key={s.label} cible={s.cible} suffix={s.suffix} label={s.label} primaire={primaire} secondaire={secondaire} />
              ))}
            </div>
          </div>

          {/* Code snippet */}
          <div style={{ background: '#0D1117', borderRadius: 16, padding: '24px', border: '1px solid rgba(255,255,255,0.08)', fontFamily: "'Courier New', monospace", fontSize: 13, lineHeight: 1.8, boxShadow: '0 24px 60px rgba(0,0,0,0.4)' }} className="hero-code">
            <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
              {['#FF5F56','#FFBD2E','#27C93F'].map((c, i) => <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />)}
            </div>
            <div style={{ color: '#6B7280' }}>{'// TechPro Haiti — Votre avenir pro'}</div>
            <div><span style={{ color: '#C792EA' }}>const</span> <span style={{ color: '#82AAFF' }}>techPro</span> = {'{'}</div>
            <div style={{ paddingLeft: 20 }}><span style={{ color: '#80CBC4' }}>domaines</span>: <span style={{ color: '#C3E88D' }}>'16 filières'</span>,</div>
            <div style={{ paddingLeft: 20 }}><span style={{ color: '#80CBC4' }}>formations</span>: <span style={{ color: '#C3E88D' }}>'85 cours'</span>,</div>
            <div style={{ paddingLeft: 20 }}><span style={{ color: '#80CBC4' }}>certifications</span>: <span style={{ color: '#FFCB6B' }}>true</span>,</div>
            <div style={{ paddingLeft: 20 }}><span style={{ color: '#80CBC4' }}>assistantIA</span>: <span style={{ color: '#FFCB6B' }}>true</span>,</div>
            <div style={{ paddingLeft: 20 }}><span style={{ color: '#80CBC4' }}>haïti</span>: <span style={{ color: '#C3E88D' }}>'100%'</span>,</div>
            <div>{'};'}</div>
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#27C93F', animation: 'pulse 1.5s infinite' }} />
              <span style={{ color: '#27C93F', fontSize: 12 }}>Prêt à vous former ✓</span>
            </div>
          </div>
        </div>
      </section>

      {/* Bande domaines */}
      <div style={{ background: 'white', borderTop: `3px solid ${secondaire}`, padding: 'clamp(16px,2.5vw,24px) clamp(20px,5vw,48px)', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          {DOMAINES.map(d => (
            <span key={d} style={{ fontSize: 12, fontWeight: 600, color: primaire, background: '#EBF3FB', padding: '5px 14px', borderRadius: 100, border: `1px solid ${primaire}20` }}>{d}</span>
          ))}
        </div>
      </div>

      {/* Formations vedettes */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(40px,5vw,64px) clamp(20px,5vw,48px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: secondaire, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>CATALOGUE</div>
            <h2 style={{ fontSize: 'clamp(22px,2.5vw,32px)', fontWeight: 900, color: primaire, margin: 0, letterSpacing: '-0.5px' }}>Formations gratuites pour démarrer</h2>
          </div>
          <Link href="/formations" style={{ fontSize: 13, color: secondaire, textDecoration: 'none', fontWeight: 700 }}>Tout voir →</Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
          {formations.map((f: any) => (
            <Link key={f.id} href={f.id?.startsWith('d') ? '/formations' : `/formations/${f.id}`} style={{ textDecoration: 'none' }}>
              <div style={{ background: 'white', borderRadius: 14, overflow: 'hidden', border: '1px solid #E2E8F0', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = `0 12px 40px rgba(27,58,107,0.15)`; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'none'; el.style.boxShadow = 'none'; }}>
                <div style={{ height: 6, background: `linear-gradient(90deg, ${primaire}, ${secondaire})` }} />
                {(f.img || f.imageUrl) && <img src={f.img || f.imageUrl} alt={f.titre} style={{ width: '100%', height: 150, objectFit: 'cover' }} />}
                <div style={{ padding: '16px 20px' }}>
                  <span style={{ fontSize: 11, color: primaire, fontWeight: 700, background: '#EBF3FB', padding: '3px 10px', borderRadius: 100 }}>{f.categorie}</span>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: primaire, lineHeight: 1.4, margin: '10px 0 8px' }}>{f.titre}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748B' }}>
                    <span>👥 {f._count?.inscriptions ?? f.inscrits ?? 0} inscrits</span>
                    <span style={{ color: '#059669', fontWeight: 700 }}>Gratuit</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTAs */}
        <div style={{ marginTop: 48, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={{ background: primaire, borderRadius: 14, padding: '28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: 'white', margin: '0 0 6px' }}>Bibliothèque professionnelle</h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', margin: 0 }}>E-books, guides, templates et ressources pour professionnels haïtiens.</p>
            </div>
            <Link href="/bibliotheque" style={{ padding: '11px 22px', background: secondaire, color: 'white', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>Ressources →</Link>
          </div>
          <div style={{ background: '#0D1117', borderRadius: 14, padding: '28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: secondaire, margin: '0 0 6px' }}>Galerie & Événements</h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', margin: 0 }}>Hackathons, certifications et moments forts de TechPro Haiti.</p>
            </div>
            <Link href="/simulations" style={{ padding: '11px 22px', background: primaire, color: 'white', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>Galerie →</Link>
          </div>
        </div>
      </section>

      {/* CTA inscription */}
      <section style={{ background: 'white', padding: 'clamp(40px,5vw,64px) clamp(20px,5vw,48px)', textAlign: 'center', borderTop: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(22px,3vw,36px)', fontWeight: 900, color: primaire, margin: '0 0 14px', letterSpacing: '-0.5px' }}>Rejoignez {nom}</h2>
          <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.7, margin: '0 0 28px' }}>Gratuit pour commencer. Certifications reconnues par les employeurs haïtiens et internationaux.</p>
          {estConnecte ? (
            <Link href="/dashboard" style={{ display: 'inline-block', padding: '15px 40px', background: primaire, color: 'white', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>Mon espace →</Link>
          ) : (
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/auth/inscription" style={{ display: 'inline-block', padding: '15px 32px', background: secondaire, color: 'white', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>Commencer gratuitement →</Link>
              <Link href="/formations" style={{ display: 'inline-block', padding: '15px 32px', background: 'white', color: primaire, border: `2px solid ${primaire}`, borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>Voir le catalogue</Link>
            </div>
          )}
        </div>
      </section>

      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @media(max-width:768px){.hero-code{display:none!important;} section:first-of-type > div{grid-template-columns:1fr!important;}}
      `}</style>
    </div>
  );
}
