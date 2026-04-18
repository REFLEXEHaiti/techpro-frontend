// app/paiement/succes/page.tsx — TechPro Haiti
'use client';

import Link from 'next/link';
import { useTenant } from '@/lib/tenantContext';

export default function PagePaiementSucces() {
  const { config } = useTenant();
  const primaire   = config?.couleursTheme.primaire   ?? '#1B3A6B';
  const secondaire = config?.couleursTheme.secondaire ?? '#FF6B35';

  return (
    <div style={{ minHeight: '100vh', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
      <div style={{ background: 'white', borderRadius: 24, padding: 'clamp(32px,5vw,56px)', maxWidth: 520, width: '100%', textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.08)', border: '1px solid #BBF7D0' }}>

        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 40 }}>🎉</div>

        <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 28, color: '#14532D', margin: '0 0 12px', fontWeight: 'normal' }}>
          Abonnement activé !
        </h1>
        <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 15, color: '#1E40AF', lineHeight: 1.7, margin: '0 0 8px' }}>
          Votre abonnement <strong>{config?.nom ?? 'TechPro Haiti'}</strong> est maintenant actif.
        </p>
        <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, color: '#475569', lineHeight: 1.7, margin: '0 0 32px' }}>
          Vous avez accès à toutes les formations IT, projets pratiques et certifications de votre plan.
        </p>

        {/* Résumé accès */}
        <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: '16px 20px', marginBottom: 28, textAlign: 'left' }}>
          {['📚 Toutes les formations IT débloquées', '🔬 Bibliothèque Tech complète', '🤖 Assistant IA Tech IA illimité', '📜 Certificat numérique disponible'].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#1E40AF' }}>
              {item}
            </div>
          ))}
        </div>

        <Link href="/dashboard"
          style={{ display: 'inline-block', padding: '16px 40px', background: primaire, color: 'white', borderRadius: 100, textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 16 }}>
          Accéder à mon espace →
        </Link>

        <div style={{ marginTop: 16 }}>
          <Link href="/formations" style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: primaire, textDecoration: 'none', fontWeight: 600 }}>
            Commencer une formation →
          </Link>
        </div>
      </div>
    </div>
  );
}
