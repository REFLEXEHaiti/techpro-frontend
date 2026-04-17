// app/premium/page.tsx — TechPro Haiti
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTenant } from '@/lib/tenantContext';
import { useAuthStore } from '@/store/authStore';
import ModalPaiement from '@/components/paiement/ModalPaiement';

const VERT = '#1B3A6B';
const BLEU = '#FF6B35';

const TARIFS = [
  {
    id: 'GRATUIT', label: 'Gratuit', montantHTG: 0, recommande: false, icone: '💻',
    avantages: ['3 formations IT gratuites', '3 formations IT gratuites', 'Assistant IA tech — 3 consultations/mois', 'Accès aux conférences publiques'],
  },
  {
    id: 'PREMIUM', label: 'Développeur', montantHTG: 600, recommande: true, icone: '🖥️',
    avantages: ['Toutes les formations IT', 'Bibliothèque Tech complète', 'Assistant IA Tech IA illimité', 'Projets & challenges IA', 'Certification reconnue employeurs', 'Documentation technique complète'],
  },
  {
    id: 'AVANCE', label: 'Expert', montantHTG: 900, recommande: false, icone: '🏆',
    avantages: ['Tout du plan Développeur', 'Protocoles de spécialités médicales', 'Formation continue reconnue', 'Support prioritaire 24h', 'Accès aux articles et blogs tech'],
  },
  {
    id: 'INSTITUTION', label: 'Entreprise', montantHTG: 1400, recommande: false, icone: '🏢',
    avantages: ['Tout du plan Spécialiste', "Jusqu'à 50 développeurs & techniciens", 'Tableau de bord institutionnel', 'Certification officielle Tech Haiti', 'API bibliothèque médicale'],
  },
];

const FAQ = [
  { q: 'Comment payer ?', r: 'Via MonCash, PayPal, Zelle ou carte Visa. Paiement sécurisé.' },
  { q: 'Les certifications sont-elles reconnues ?', r: 'Oui, reconnues par le Tech Haiti et les établissements de santé partenaires.' },
  { q: 'Puis-je annuler ?', r: 'Oui, à tout moment depuis votre tableau de bord, sans frais.' },
  { q: 'Y a-t-il un essai gratuit ?', r: 'Oui, le plan Gratuit donne accès à 3 formations sans carte bancaire.' },
  { q: 'Les formations sont-elles adaptées à Haïti ?', r: 'Oui, toutes les formations sont conçues par des développeurs & techniciens haïtiens.' },
  { q: 'Que comprend le plan Institution ?', r: "Jusqu'à 50 professionnels, tableau de bord de suivi et certification officielle MSP." },
];

export default function PagePremium() {
  const { config } = useTenant();
  const { utilisateur, estConnecte } = useAuthStore();
  const [modal, setModal] = useState<{ montantHTG: number; description: string; plan: string } | null>(null);

  const primaire   = config?.couleursTheme.primaire   ?? VERT;
  const secondaire = config?.couleursTheme.secondaire ?? BLEU;

  if (utilisateur?.role === 'ADMIN') return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 24 }}>
      <div style={{ fontSize: 56 }}>⚙️</div>
      <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 22, color: '#0D1B2A', textAlign: 'center', fontWeight: 'normal' }}>Accès administrateur complet</h2>
      <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, color: '#475569', textAlign: 'center', maxWidth: 420, lineHeight: 1.6 }}>
        En tant qu'administrateur, vous avez accès à toutes les fonctionnalités de TechPro Haiti.
      </p>
      <Link href="/dashboard" style={{ padding: '12px 28px', background: primaire, color: 'white', borderRadius: 8, textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 14 }}>
        Tableau de bord →
      </Link>
    </div>
  );

  return (
    <div style={{ background: '#F0F4FA', minHeight: '100vh' }}>
      {modal && (
        <ModalPaiement
          montantHTG={modal.montantHTG}
          description={modal.description}
          plan={modal.plan}
          onFermer={() => setModal(null)}
          onSucces={() => setModal(null)}
        />
      )}

      {/* Hero */}
      <section style={{ background: `linear-gradient(135deg, #0D1B2A 0%, ${primaire} 100%)`, padding: 'clamp(40px,6vw,72px) clamp(20px,5vw,48px)', textAlign: 'center' }}>
        <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: secondaire, fontWeight: 700, marginBottom: 16 }}>
          Abonnements TechPro Haiti
        </div>
        <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(26px,4vw,44px)', color: 'white', margin: '0 0 14px', fontWeight: 'normal' }}>
          Investissez dans votre formation médicale
        </h1>
        <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.75)', maxWidth: 540, margin: '0 auto 24px', lineHeight: 1.7 }}>
          Protocoles cliniques adaptés à Haïti, certifications MSP et outils IA pour les développeurs & techniciens.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {['🖥️ Reconnu Tech Haiti', '🔒 Paiement sécurisé', '📜 Certificat numérique', '↩️ Annulation libre'].map(b => (
            <span key={b} style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)', fontSize: 12, padding: '6px 14px', borderRadius: 100, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 600 }}>{b}</span>
          ))}
        </div>
      </section>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(40px,6vw,64px) clamp(20px,5vw,48px)' }}>

        {/* Cartes plans */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 24 }}>
          {TARIFS.map(t => (
            <div key={t.id} style={{ background: t.recommande ? primaire : 'white', border: t.recommande ? 'none' : '1px solid #CBD5E1', borderRadius: 16, padding: '28px 24px', position: 'relative', boxShadow: t.recommande ? `0 16px 48px ${primaire}40` : '0 2px 12px rgba(0,0,0,0.04)' }}>
              {t.recommande && (
                <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: secondaire, color: 'white', padding: '5px 18px', borderRadius: 100, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, fontWeight: 800, whiteSpace: 'nowrap' }}>
                  ⭐ RECOMMANDÉ
                </div>
              )}
              <div style={{ fontSize: 32, marginBottom: 12 }}>{t.icone}</div>
              <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 22, color: t.recommande ? 'white' : '#0D1B2A', margin: '0 0 10px', fontWeight: 'normal' }}>{t.label}</h3>
              <div style={{ marginBottom: 24 }}>
                {t.montantHTG === 0 ? (
                  <span style={{ fontFamily: 'Georgia,serif', fontSize: 34, fontWeight: 700, color: t.recommande ? 'white' : '#0D1B2A' }}>Gratuit</span>
                ) : (
                  <div>
                    <span style={{ fontFamily: 'Georgia,serif', fontSize: 34, fontWeight: 700, color: t.recommande ? 'white' : primaire }}>{t.montantHTG.toLocaleString()}</span>
                    <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, color: t.recommande ? 'rgba(255,255,255,0.7)' : '#64748B' }}> HTG/mois</span>
                    <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: t.recommande ? 'rgba(255,255,255,0.5)' : '#94A3B8', marginTop: 4 }}>
                      ≈ ${(t.montantHTG / 132).toFixed(0)} USD / mois
                    </div>
                  </div>
                )}
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 9 }}>
                {t.avantages.map((a, i) => (
                  <li key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                    <span style={{ color: t.recommande ? 'rgba(255,255,255,0.8)' : primaire, fontWeight: 700, flexShrink: 0 }}>✓</span>
                    <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: t.recommande ? 'rgba(255,255,255,0.85)' : '#374151', lineHeight: 1.5 }}>{a}</span>
                  </li>
                ))}
              </ul>
              {t.montantHTG === 0 ? (
                <Link href={estConnecte ? "/formations" : "/auth/inscription"}
                  style={{ display: 'block', padding: '14px', background: t.recommande ? 'rgba(255,255,255,0.18)' : `${primaire}12`, color: t.recommande ? 'white' : primaire, borderRadius: 10, textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 14, textAlign: 'center', border: t.recommande ? '1px solid rgba(255,255,255,0.3)' : 'none' }}>
                  {estConnecte ? 'Accéder aux formations →' : "S'inscrire gratuitement →"}
                </Link>
              ) : (
                <button onClick={() => { if (!estConnecte) { window.location.href = '/auth/inscription'; return; } setModal({ montantHTG: t.montantHTG, description: `Abonnement TechPro Haiti — Plan ${t.label}`, plan: t.id }); }}
                  style={{ width: '100%', padding: '14px', background: t.recommande ? secondaire : primaire, color: 'white', border: 'none', borderRadius: 10, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                  {!estConnecte ? 'Créer un compte →' : `S'abonner — ${t.montantHTG.toLocaleString()} HTG →`}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Méthodes de paiement */}
        <div style={{ marginTop: 48, background: 'white', border: '1px solid #CBD5E1', borderRadius: 16, padding: 'clamp(24px,4vw,36px)' }}>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 20, color: '#0D1B2A', margin: '0 0 6px', fontWeight: 'normal', textAlign: 'center' }}>Méthodes de paiement</h2>
          <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#475569', textAlign: 'center', margin: '0 0 24px' }}>Payez avec le moyen qui vous convient le mieux</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {[
              { icone: '💳', nom: 'Visa / Mastercard', desc: 'Stripe — sécurisé' },
              { icone: '📱', nom: 'MonCash', desc: 'Mobile money Digicel' },
              { icone: '🅿️', nom: 'PayPal', desc: 'Paiement international' },
              { icone: '💜', nom: 'Zelle', desc: 'Virement USA instantané' },
            ].map(m => (
              <div key={m.nom} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: '#F0F4FA', borderRadius: 10, border: '1px solid #CBD5E1' }}>
                <span style={{ fontSize: 22 }}>{m.icone}</span>
                <div>
                  <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, fontWeight: 700, color: '#0D1B2A' }}>{m.nom}</div>
                  <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#64748B' }}>{m.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div style={{ marginTop: 36, background: 'white', border: '1px solid #CBD5E1', borderRadius: 16, padding: 'clamp(24px,4vw,40px)' }}>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 22, color: '#0D1B2A', margin: '0 0 28px', fontWeight: 'normal' }}>Questions fréquentes</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {FAQ.map(({ q, r }, i) => (
              <div key={i}>
                <div style={{ fontFamily: 'Georgia,serif', fontSize: 15, color: '#0D1B2A', marginBottom: 6 }}>💻 {q}</div>
                <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#475569', lineHeight: 1.6 }}>{r}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        {!estConnecte && (
          <div style={{ marginTop: 36, background: `linear-gradient(135deg, #0D1B2A, ${primaire})`, borderRadius: 16, padding: 'clamp(24px,4vw,40px)', textAlign: 'center' }}>
            <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 24, color: 'white', margin: '0 0 12px', fontWeight: 'normal' }}>Rejoignez 2 400+ développeurs & techniciens haïtiens</h3>
            <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.7)', margin: '0 0 24px' }}>Gratuit pour commencer. Certifications reconnues par le Tech Haiti.</p>
            <Link href="/auth/inscription" style={{ display: 'inline-block', padding: '16px 40px', background: secondaire, color: 'white', borderRadius: 100, textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 800, fontSize: 15 }}>
              Commencer gratuitement →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
