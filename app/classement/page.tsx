// app/classement/page.tsx — TechPro Haiti
'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

const VERT = '#1B3A6B';

const MOCK = [
  { rang:1, user:{ prenom:'Marie-Flore', nom:'Jean', photoUrl:null }, points:{ points:1420, niveau:5 }, _count:{ inscriptions:18, badges:4 } },
  { rang:2, user:{ prenom:'Jean-Robert', nom:'Pierre', photoUrl:null }, points:{ points:1180, niveau:4 }, _count:{ inscriptions:14, badges:3 } },
  { rang:3, user:{ prenom:'Claudette', nom:'Marc', photoUrl:null }, points:{ points:920, niveau:3 }, _count:{ inscriptions:12, badges:2 } },
  { rang:4, user:{ prenom:'Patrick', nom:'Fils', photoUrl:null }, points:{ points:750, niveau:3 }, _count:{ inscriptions:10, badges:2 } },
  { rang:5, user:{ prenom:'Nadège', nom:'Saint', photoUrl:null }, points:{ points:620, niveau:2 }, _count:{ inscriptions:8, badges:1 } },
];

export default function PageClassement() {
  const [classement, setClassement] = useState(MOCK);

  useEffect(() => {
    api.get('/gamification/classement?limite=20').then(({ data }) => { if (Array.isArray(data) && data.length) setClassement(data); }).catch(() => {});
  }, []);

  const podium = classement.slice(0, 3);
  const reste  = classement.slice(3);
  const medalColors = ['#C0C0C0', '#FFD700', '#CD7F32'];

  return (
    <div style={{ background: '#F8FAFB', minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{ background: `linear-gradient(135deg, ${VERT} 0%, #0D4D2E 100%)`, padding: 'clamp(40px,5vw,64px) clamp(20px,5vw,48px)', textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Inter',sans-serif", fontSize: 'clamp(28px,4vw,44px)', color: 'white', fontWeight: 800, marginBottom: 12 }}>Classement TechPro Haiti</h1>
        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.75)', maxWidth: 400, margin: '0 auto' }}>
          Les développeurs & techniciens les plus engagés dans leur formation continue.
        </p>
      </section>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: 'clamp(24px,4vw,48px) clamp(20px,5vw,48px)' }}>
        {/* Podium */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 40, alignItems: 'end' }}>
          {[podium[1], podium[0], podium[2]].map((p, i) => {
            if (!p) return <div key={i}/>;
            const rang = i === 0 ? 2 : i === 1 ? 1 : 3;
            const medal = rang === 1 ? medalColors[1] : rang === 2 ? medalColors[0] : medalColors[2];
            const taille = rang === 1 ? 140 : 110;
            return (
              <div key={rang} style={{ textAlign: 'center' }}>
                <div style={{ width: rang === 1 ? 64 : 52, height: rang === 1 ? 64 : 52, borderRadius: '50%', background: `${medal}25`, border: `3px solid ${medal}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: rang === 1 ? 20 : 16, color: '#0D1F2D' }}>
                  {(p.user?.prenom?.[0] ?? '') + (p.user?.nom?.[0] ?? '')}
                </div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 13, color: '#0D1F2D', marginBottom: 4 }}>{p.user?.prenom} {p.user?.nom}</div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 20, fontWeight: 800, color: medal }}>{p.points?.points ?? 0}</div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: '#64748B' }}>points</div>
                <div style={{ height: taille, background: `${medal}15`, border: `2px solid ${medal}30`, borderRadius: '8px 8px 0 0', marginTop: 12 }} />
              </div>
            );
          })}
        </div>

        {/* Liste */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {reste.map((p, i) => (
            <div key={i} style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 13, color: '#64748B', flexShrink: 0 }}>
                {(p.rang ?? i + 4)}
              </div>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${VERT}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 15, color: VERT, flexShrink: 0 }}>
                {(p.user?.prenom?.[0] ?? '') + (p.user?.nom?.[0] ?? '')}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 14, color: '#0D1F2D' }}>{p.user?.prenom} {p.user?.nom}</div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: '#94A3B8' }}>{p._count?.inscriptions ?? 0} formations · {p._count?.badges ?? 0} badges</div>
              </div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 16, fontWeight: 800, color: VERT }}>{p.points?.points ?? 0} pts</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
