// components/layout/Navbar.tsx — TechPro Haiti
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/lib/tenantContext';
import ClochNotifications from '@/components/notifications/ClochNotifications';

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Administrateur', FORMATEUR: 'Instructeur', APPRENANT: 'Développeur', SPECTATEUR: 'Observateur',
};

export default function Navbar() {
  const { estConnecte, utilisateur, _hasHydrated } = useAuthStore();
  const { seDeconnecter } = useAuth();
  const { config } = useTenant();
  const pathname = usePathname();
  const [profilOuvert, setProfilOuvert] = useState(false);
  const [menuOuvert, setMenuOuvert] = useState(false);
  const profilRef = useRef<HTMLDivElement>(null);

  const primaire   = config?.couleursTheme.primaire   ?? '#1B3A6B';
  const secondaire = config?.couleursTheme.secondaire ?? '#FF6B35';
  const nom        = config?.nom ?? 'TechPro Haiti';
  const sloganCourt = config?.sloganCourt ?? 'FORMATIONS PRO & IT';

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (profilRef.current && !profilRef.current.contains(e.target as Node)) setProfilOuvert(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const liensNav = [
    { label: 'Catalogue',      href: '/formations' },
    { label: 'Certifications', href: '/quiz' },
    { label: 'Galerie',        href: '/simulations' },
    { label: 'Lives',          href: '/lives' },
    { label: 'Ressources',     href: '/bibliotheque' },
  ];

  const navStyle = (href: string): React.CSSProperties => ({
    fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13,
    fontWeight: isActive(href) ? 700 : 400,
    color: isActive(href) ? secondaire : 'rgba(255,255,255,0.65)',
    textDecoration: 'none', padding: '6px 0',
    borderBottom: `2px solid ${isActive(href) ? secondaire : 'transparent'}`,
    transition: 'color 0.15s', whiteSpace: 'nowrap' as const,
  });

  const liensMenu = [
    { href: '/dashboard',                 label: '🏠 Tableau de bord' },
    { href: `/profil/${utilisateur?.id}`, label: '👤 Mon profil' },
    { href: '/quiz',                      label: '🏆 Mes certifications' },
    { href: '/premium',                   label: '⭐ Mon abonnement' },
    ...(utilisateur?.role === 'ADMIN' ? [{ href: '/admin', label: '⚙️ Administration' }] : []),
  ];

  return (
    <>
      <nav style={{ position: 'sticky', top: 0, zIndex: 200, background: primaire, height: 64, display: 'flex', alignItems: 'center', padding: '0 clamp(16px,4vw,40px)', boxShadow: '0 2px 20px rgba(0,0,0,0.2)' }}>
        <div style={{ width: '100%', maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 32 }}>

          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ width: 38, height: 38, borderRadius: 8, background: secondaire, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 900, fontSize: 13, color: 'white' }}>TP</div>
            <div>
              <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 17, fontWeight: 800, color: 'white', lineHeight: 1 }}>{nom}</div>
              <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{sloganCourt}</div>
            </div>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 28, flex: 1 }} className="nav-desktop">
            {liensNav.map(({ label, href }) => (
              <Link key={href} href={href} style={navStyle(href)}>{label}</Link>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto', flexShrink: 0 }}>
            <button onClick={() => setMenuOuvert(v => !v)} className="nav-burger"
              style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: 'white', padding: 4 }}>☰</button>

            {!_hasHydrated ? null : estConnecte ? (
              <>
                <ClochNotifications />
                <div style={{ position: 'relative' }} ref={profilRef}>
                  <button onClick={() => setProfilOuvert(v => !v)}
                    style={{ width: 40, height: 40, borderRadius: '50%', background: secondaire, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 800, fontSize: 14, color: 'white' }}>
                    {(utilisateur?.prenom?.[0] ?? '') + (utilisateur?.nom?.[0] ?? '')}
                  </button>
                  {profilOuvert && (
                    <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', background: 'white', border: '1px solid #E2E8F0', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.15)', minWidth: 230, zIndex: 300, overflow: 'hidden' }}>
                      <div style={{ padding: '14px 16px', borderBottom: '1px solid #F1F5F9', background: '#F8FAFF' }}>
                        <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 15, fontWeight: 700, color: primaire }}>{utilisateur?.prenom} {utilisateur?.nom}</div>
                        <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{utilisateur?.email}</div>
                        <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: secondaire, fontWeight: 700, marginTop: 4 }}>{ROLE_LABEL[utilisateur?.role ?? ''] ?? utilisateur?.role}</div>
                      </div>
                      {liensMenu.map(({ href, label }) => (
                        <Link key={href} href={href} onClick={() => setProfilOuvert(false)}
                          style={{ display: 'block', padding: '11px 16px', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#374151', textDecoration: 'none', borderBottom: '1px solid #F8FAFF' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F8FAFF'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                          {label}
                        </Link>
                      ))}
                      <button onClick={() => { setProfilOuvert(false); seDeconnecter(); }}
                        style={{ display: 'block', width: '100%', padding: '11px 16px', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FEF2F2'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                        Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/connexion" style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)', textDecoration: 'none', padding: '8px 16px', border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: 6 }}>Connexion</Link>
                <Link href="/auth/inscription" style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, fontWeight: 700, color: 'white', textDecoration: 'none', padding: '8px 16px', background: secondaire, borderRadius: 6 }}>S'inscrire</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {menuOuvert && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 150, background: 'rgba(0,0,0,0.6)' }} onClick={() => setMenuOuvert(false)}>
          <div style={{ position: 'absolute', top: 64, left: 0, right: 0, background: primaire, padding: '8px 24px 16px' }} onClick={e => e.stopPropagation()}>
            {liensNav.map(({ label, href }) => (
              <Link key={href} href={href} onClick={() => setMenuOuvert(false)}
                style={{ display: 'block', padding: '13px 0', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 15, fontWeight: isActive(href) ? 700 : 400, color: isActive(href) ? secondaire : 'rgba(255,255,255,0.8)', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
      <style>{`@media(max-width:768px){.nav-desktop{display:none!important;}.nav-burger{display:flex!important;}}`}</style>
    </>
  );
}
