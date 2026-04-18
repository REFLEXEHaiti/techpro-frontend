// app/auth/connexion/page.tsx — TechPro Haiti
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { useTenant } from '@/lib/tenantContext';
import api from '@/lib/api';

const VERT = '#1B3A6B';
const BLEU = '#FF6B35';

export default function PageConnexion() {
  const { seConnecter } = useAuth();
  const { estConnecte, _hasHydrated } = useAuthStore();
  const { config } = useTenant();
  const router = useRouter();

  const [email, setEmail]           = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [voirMDP, setVoirMDP]       = useState(false);
  const [erreur, setErreur]         = useState('');
  const [chargement, setChargement] = useState(false);
  const [sponsors, setSponsors]     = useState<any[]>([]);
  const defilRef = useRef<HTMLDivElement>(null);
  const posRef   = useRef(0);

  const primaire   = config?.couleursTheme.primaire   ?? VERT;
  const secondaire = config?.couleursTheme.secondaire ?? BLEU;

  useEffect(() => {
    if (_hasHydrated && estConnecte) router.replace('/dashboard');
  }, [_hasHydrated, estConnecte]);

  useEffect(() => {
    api.get('/sponsors').then(({ data }) => { if (Array.isArray(data)) setSponsors(data); }).catch(() => {});
  }, []);

  useEffect(() => {
    const el = defilRef.current; if (!el || sponsors.length === 0) return;
    const anim = setInterval(() => { posRef.current += 0.5; if (posRef.current >= el.scrollWidth / 2) posRef.current = 0; el.scrollLeft = posRef.current; }, 16);
    return () => clearInterval(anim);
  }, [sponsors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setErreur(''); setChargement(true);
    try {
      await seConnecter(email, motDePasse);
    } catch (err: any) {
      setErreur(err.response?.data?.message ?? 'Email ou mot de passe incorrect');
    } finally { setChargement(false); }
  };

  const inp: React.CSSProperties = {
    width: '100%', padding: '13px 16px',
    border: '1.5px solid #CBD5E1', borderRadius: 10,
    fontSize: 15, outline: 'none', boxSizing: 'border-box',
    fontFamily: "'Helvetica Neue',Arial,sans-serif",
    color: '#0D1B2A', background: 'white', transition: 'border-color 0.2s',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F0F4FA', display: 'flex', flexDirection: 'column' }}>

      {/* Bannière sponsors */}
      {sponsors.length > 0 && (
        <div style={{ background: 'white', borderBottom: '1px solid #CBD5E1', padding: '8px 0' }}>
          <p style={{ textAlign: 'center', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 10, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px', fontWeight: 700 }}>Partenaires tech</p>
          <div ref={defilRef} style={{ display: 'flex', overflow: 'hidden', alignItems: 'center' }}>
            {[...sponsors, ...sponsors].map((s, i) => (
              <a key={i} href={s.siteWeb || '#'} target="_blank" rel="noreferrer"
                style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 140, height: 44, margin: '0 14px', textDecoration: 'none', opacity: 0.65 }}>
                {s.logoUrl ? <img src={s.logoUrl} alt={s.nom} style={{ maxWidth: 120, maxHeight: 36, objectFit: 'contain' }} /> : <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, fontWeight: 700, color: '#475569' }}>{s.nom}</span>}
              </a>
            ))}
          </div>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex' }}>
        {/* Panneau gauche — image hero (desktop) */}
        <div style={{ flex: 1, background: `linear-gradient(135deg, #0D1B2A 0%, ${primaire} 100%)`, display: 'none', alignItems: 'center', justifyContent: 'center', padding: 48, position: 'relative', overflow: 'hidden' }}
          className="auth-panel-left">
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15 }} />
          <div style={{ position: 'relative', textAlign: 'center', maxWidth: 380 }}>
            <div style={{ fontSize: 56, marginBottom: 20 }}>🖥️</div>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 28, color: 'white', margin: '0 0 16px', fontWeight: 'normal', lineHeight: 1.2 }}>
              La formation professionnelle haïtienne au bout des doigts
            </h2>
            <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, margin: '0 0 32px' }}>
              Bureautique, comptabilité, droit, secrétariat et IT — formations certifiantes pour professionnels haïtiens.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {['3 200+ professionnels inscrits', '85 formations disponibles', 'Certifications Tech Haiti', 'Certifications reconnues'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: secondaire, flexShrink: 0 }} />
                  <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <div style={{ width: '100%', maxWidth: 480, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(24px,5vw,48px) 24px' }}>
          <div style={{ width: '100%' }}>
            {/* Logo */}
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ width: 60, height: 60, borderRadius: 16, background: `linear-gradient(135deg, #0D1B2A, ${primaire})`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', color: 'white', fontFamily: 'Georgia,serif', fontWeight: 700, fontSize: 22 }}>TP</div>
              <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 24, fontWeight: 'normal', color: '#0D1B2A', margin: '0 0 6px' }}>TechPro Haiti</h1>
              <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#475569', margin: 0 }}>Plateforme de formation professionnelle haïtienne</p>
            </div>

            {/* Carte formulaire */}
            <div style={{ background: 'white', borderRadius: 20, padding: 'clamp(24px,4vw,36px)', border: '1px solid #CBD5E1', boxShadow: `0 8px 40px ${primaire}10` }}>
              <div style={{ height: 3, background: `linear-gradient(90deg, ${primaire}, ${secondaire})`, borderRadius: 2, marginBottom: 28 }} />

              <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 22, fontWeight: 'normal', color: '#0D1B2A', margin: '0 0 6px', textAlign: 'center' }}>Connexion</h2>
              <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#475569', textAlign: 'center', margin: '0 0 24px' }}>
                Accédez à votre espace professionnel
              </p>

              {erreur && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#DC2626', textAlign: 'center' }}>
                  ⚠ {erreur}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, fontWeight: 600, color: '#0D1B2A', marginBottom: 6 }}>
                    Email professionnel
                  </label>
                  <input type="email" value={email} required onChange={e => setEmail(e.target.value)}
                    placeholder="dev@exemple.ht" style={inp}
                    onFocus={e => { e.target.style.borderColor = primaire; e.target.style.boxShadow = `0 0 0 3px ${primaire}15`; }}
                    onBlur={e => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = 'none'; }} />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, fontWeight: 600, color: '#0D1B2A' }}>Mot de passe</label>
                    <Link href="/auth/mot-de-passe-oublie" style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: primaire, textDecoration: 'none' }}>
                      Mot de passe oublié ?
                    </Link>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input type={voirMDP ? 'text' : 'password'} value={motDePasse} required onChange={e => setMotDePasse(e.target.value)}
                      placeholder="••••••••" style={{ ...inp, paddingRight: 48 }}
                      onFocus={e => { e.target.style.borderColor = primaire; e.target.style.boxShadow = `0 0 0 3px ${primaire}15`; }}
                      onBlur={e => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = 'none'; }} />
                    <button type="button" onClick={() => setVoirMDP(v => !v)}
                      style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#64748B' }}>
                      {voirMDP ? '🙈' : '👁'}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={chargement}
                  style={{ width: '100%', padding: '15px', background: chargement ? '#475569' : primaire, color: 'white', border: 'none', borderRadius: 12, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 16, cursor: chargement ? 'not-allowed' : 'pointer', transition: 'background 0.2s', marginTop: 4 }}>
                  {chargement ? '⏳ Connexion…' : 'Se connecter →'}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: 20, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, color: '#475569' }}>
                Pas encore inscrit ?{' '}
                <Link href="/auth/inscription" style={{ color: primaire, fontWeight: 700, textDecoration: 'none' }}>Créer un compte</Link>
              </div>
            </div>

            <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#64748B', textAlign: 'center', marginTop: 16 }}>
              🔒 Connexion sécurisée · Certifications Tech Haiti
            </p>
          </div>
        </div>
      </div>

      <style>{`@media(min-width:900px){.auth-panel-left{display:flex!important;}}`}</style>
    </div>
  );
}
