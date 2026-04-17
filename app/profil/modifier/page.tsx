// app/profil/modifier/page.tsx — TechPro Haiti
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const VERT = '#1B3A6B';
const VILLES = ['Port-au-Prince','Pétion-Ville','Cap-Haïtien','Gonaïves','Les Cayes','Jacmel','Saint-Marc','Hinche','Jérémie','Miami','New York','Montréal','Paris','Autre'];
const ROLES_MED = ['Développeur Web', 'Développeur Mobile', 'Data Scientist', 'Administrateur Réseau', 'Cybersécurité', 'DevOps Engineer', 'Chef de Projet IT', 'Étudiant IT', 'Autre'];

export default function PageModifierProfil() {
  return <ProtectedRoute><ContenuModifier /></ProtectedRoute>;
}

function ContenuModifier() {
  const { utilisateur } = useAuthStore();
  const router = useRouter();
  const [chargement, setChargement] = useState(false);
  const [form, setForm] = useState({ prenom: '', nom: '', bio: '', ville: '', whatsapp: '' });

  useEffect(() => {
    if (utilisateur) setForm(f => ({ ...f, prenom: utilisateur.prenom ?? '', nom: utilisateur.nom ?? '' }));
    api.get('/profils/moi').then(({ data }) => {
      setForm({ prenom: data.prenom ?? '', nom: data.nom ?? '', bio: data.bio ?? '', ville: data.ville ?? '', whatsapp: data.whatsapp ?? '' });
    }).catch(() => {});
  }, [utilisateur]);

  const soumettre = async (e: React.FormEvent) => {
    e.preventDefault(); setChargement(true);
    try {
      await api.patch('/profils/moi', form);
      toast.success('Profil mis à jour !');
      router.push(`/profil/${utilisateur?.id}`);
    } catch { toast.error('Erreur lors de la mise à jour'); }
    finally { setChargement(false); }
  };

  const inp: React.CSSProperties = { width: '100%', padding: '12px 14px', border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: 14, outline: 'none', fontFamily: "'Inter',sans-serif", boxSizing: 'border-box', color: '#0D1F2D', background: 'white', transition: 'border-color 0.2s' };
  const lbl: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, fontFamily: "'Inter',sans-serif" };
  const focus = (e: React.FocusEvent<any>) => { e.target.style.borderColor = VERT; };
  const blur  = (e: React.FocusEvent<any>) => { e.target.style.borderColor = '#E2E8F0'; };

  const initiales = utilisateur ? (utilisateur.prenom?.[0] ?? '') + (utilisateur.nom?.[0] ?? '') : '?';

  return (
    <div style={{ background: '#F8FAFB', minHeight: '100vh', padding: 'clamp(24px,5vw,48px) clamp(16px,4vw,24px)' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: VERT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 24, color: 'white', margin: '0 auto 14px' }}>
            {initiales.toUpperCase()}
          </div>
          <h1 style={{ fontFamily: "'Inter',sans-serif", fontSize: 24, fontWeight: 800, color: '#0D1F2D', margin: '0 0 6px' }}>Mon profil</h1>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, color: '#64748B' }}>TechPro Haiti</p>
        </div>

        <div style={{ background: 'white', borderRadius: 16, padding: 'clamp(24px,4vw,36px)', border: '1px solid #E2E8F0', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <form onSubmit={soumettre} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={lbl}>Prénom *</label>
                <input type="text" value={form.prenom} onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))} required style={inp} onFocus={focus} onBlur={blur} />
              </div>
              <div>
                <label style={lbl}>Nom *</label>
                <input type="text" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} required style={inp} onFocus={focus} onBlur={blur} />
              </div>
            </div>

            <div>
              <label style={lbl}>Biographie professionnelle</label>
              <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3}
                placeholder="Votre spécialité, établissement de santé, années d'expérience…"
                style={{ ...inp, resize: 'vertical' }} onFocus={focus} onBlur={blur} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={lbl}>Ville</label>
                <select value={form.ville} onChange={e => setForm(f => ({ ...f, ville: e.target.value }))} style={{ ...inp, appearance: 'none' as any }} onFocus={focus} onBlur={blur}>
                  <option value="">— Choisir —</option>
                  {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>WhatsApp</label>
                <input type="tel" value={form.whatsapp} onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))} placeholder="+509 XXXX XXXX" style={inp} onFocus={focus} onBlur={blur} />
              </div>
            </div>

            <button type="submit" disabled={chargement}
              style={{ width: '100%', padding: '14px', background: VERT, color: 'white', border: 'none', borderRadius: 10, fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 15, cursor: 'pointer', marginTop: 4 }}>
              {chargement ? 'Enregistrement…' : 'Enregistrer les modifications →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
