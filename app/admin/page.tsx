// app/admin/page.tsx — TechPro Haiti
// Interface d'administration : utilisateurs, formations, paiements, sponsors

'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const VERT = '#1B3A6B';
const BLEU = '#FF6B35';

// ── Validation manuelle paiement ────────────────────────────
function ValiderPaiement({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState({ userId: '', plan: 'PREMIUM', reference: '', methode: 'MonCash' });
  const [envoi, setEnvoi] = useState(false);

  const valider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.userId.trim() || !form.reference.trim()) { toast.error('ID et référence requis'); return; }
    setEnvoi(true);
    try {
      await api.post('/paiements/admin/valider', form);
      toast.success('✅ Paiement validé — accès activé !');
      setForm({ userId: '', plan: 'PREMIUM', reference: '', methode: 'MonCash' });
      onSuccess();
    } catch (err: any) { toast.error(err.response?.data?.message ?? 'Erreur lors de la validation'); }
    setEnvoi(false);
  };

  const inp: React.CSSProperties = { width: '100%', padding: '10px 13px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: "'Inter',sans-serif", color: '#0D1F2D', background: 'white', boxSizing: 'border-box' };

  return (
    <form onSubmit={valider} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      {[
        { key: 'userId',    label: 'ID utilisateur *', placeholder: 'UUID utilisateur' },
        { key: 'reference', label: 'Référence paiement *', placeholder: 'N° transaction' },
      ].map(f => (
        <div key={f.key}>
          <label style={{ display: 'block', fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>{f.label}</label>
          <input value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} style={inp} />
        </div>
      ))}
      <div>
        <label style={{ display: 'block', fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Plan</label>
        <select value={form.plan} onChange={e => setForm(p => ({ ...p, plan: e.target.value }))} style={{ ...inp, appearance: 'none' as any }}>
          {['PREMIUM', 'AVANCE', 'INSTITUTION'].map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <div>
        <label style={{ display: 'block', fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Méthode</label>
        <select value={form.methode} onChange={e => setForm(p => ({ ...p, methode: e.target.value }))} style={{ ...inp, appearance: 'none' as any }}>
          {['MonCash', 'PayPal', 'Zelle', 'Visa', 'Autre'].map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <div style={{ gridColumn: '1 / -1' }}>
        <button type="submit" disabled={envoi}
          style={{ width: '100%', padding: '11px', background: VERT, color: 'white', border: 'none', borderRadius: 8, fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
          {envoi ? 'Validation…' : '✅ Valider le paiement'}
        </button>
      </div>
    </form>
  );
}

// ── Page principale ──────────────────────────────────────────
export default function PageAdmin() {
  return <ProtectedRoute rolesAutorises={['ADMIN']}><ContenuAdmin /></ProtectedRoute>;
}

function ContenuAdmin() {
  const router  = useRouter();
  const [onglet, setOnglet]         = useState<'stats' | 'utilisateurs' | 'formations' | 'paiements' | 'sponsors'>('stats');
  const [stats,  setStats]          = useState<any>(null);
  const [utilisateurs, setUtilisateurs] = useState<any[]>([]);
  const [formations,   setFormations]   = useState<any[]>([]);
  const [abonnements,  setAbonnements]  = useState<any[]>([]);
  const [sponsors,     setSponsors]     = useState<any[]>([]);
  const [formSponsor,  setFormSponsor]  = useState({ nom:'', siteWeb:'', typeContrat:'OR', couleur:'#1B3A6B', logoUrl:'' });
  const [preview,      setPreview]      = useState('');
  const [modalSponsor, setModalSponsor] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get('/analytics/admin').then(({ data }) => setStats(data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (onglet === 'utilisateurs') api.get('/utilisateurs?limite=50').then(({ data }) => setUtilisateurs(Array.isArray(data) ? data : data.utilisateurs ?? [])).catch(() => {});
    if (onglet === 'formations')   api.get('/cours?limite=50').then(({ data }) => setFormations(Array.isArray(data) ? data : [])).catch(() => {});
    if (onglet === 'paiements')    api.get('/paiements/admin/liste').then(({ data }) => setAbonnements(Array.isArray(data) ? data : [])).catch(() => {});
    if (onglet === 'sponsors')     api.get('/sponsoring/sponsors').then(({ data }) => setSponsors(Array.isArray(data) ? data : [])).catch(() => {});
  }, [onglet]);

  const changerRole = async (userId: string, role: string) => {
    try { await api.patch(`/utilisateurs/${userId}/role`, { role }); setUtilisateurs(p => p.map(u => u.id === userId ? { ...u, role } : u)); toast.success('Rôle mis à jour'); }
    catch { toast.error('Erreur'); }
  };

  const toggleFormation = async (id: string, publie: boolean) => {
    try { await api.patch(`/cours/${id}`, { publie: !publie }); setFormations(p => p.map(f => f.id === id ? { ...f, publie: !publie } : f)); }
    catch { toast.error('Erreur'); }
  };

  const supprimerSponsor = async (id: string) => {
    if (!confirm('Supprimer ce partenaire ?')) return;
    try { await api.delete(`/sponsoring/sponsors/${id}`); setSponsors(p => p.filter(s => s.id !== id)); toast.success('Supprimé'); }
    catch { toast.error('Erreur'); }
  };

  const ajouterSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/sponsoring/sponsors', { ...formSponsor, logoUrl: preview || formSponsor.logoUrl });
      setSponsors(p => [data, ...p]);
      toast.success('Partenaire ajouté !');
      setModalSponsor(false);
      setFormSponsor({ nom:'', siteWeb:'', typeContrat:'OR', couleur:'#1B3A6B', logoUrl:'' });
      setPreview('');
    } catch { toast.error('Erreur'); }
  };

  const ONGLETS = [
    { id:'stats',        label:'📊 Tableau de bord' },
    { id:'utilisateurs', label:'👥 Utilisateurs' },
    { id:'formations',   label:'📚 Formations' },
    { id:'paiements',    label:'💳 Paiements' },
    { id:'sponsors',     label:'🤝 Partenaires' },
  ];

  const inp: React.CSSProperties = { width: '100%', padding: '10px 13px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: "'Inter',sans-serif", color: '#0D1F2D', background: 'white', boxSizing: 'border-box' };

  return (
    <div style={{ background: '#F8FAFB', minHeight: '100vh' }}>
      {/* Entête */}
      <div style={{ background: `linear-gradient(135deg, ${VERT} 0%, #0D4D2E 100%)`, padding: 'clamp(24px,4vw,36px) clamp(20px,5vw,48px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{ fontFamily: "'Inter',sans-serif", fontSize: 24, fontWeight: 800, color: 'white', margin: '0 0 6px' }}>Administration TechPro Haiti</h1>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.65)', margin: 0 }}>
            Gestion des utilisateurs, formations, paiements et partenaires
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(20px,3vw,32px) clamp(20px,5vw,48px)' }}>
        {/* Onglets */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 28, flexWrap: 'wrap', background: 'white', border: '1px solid #E2E8F0', borderRadius: 12, padding: 6 }}>
          {ONGLETS.map(o => (
            <button key={o.id} onClick={() => setOnglet(o.id as any)}
              style={{ padding: '9px 16px', borderRadius: 8, border: 'none', background: onglet === o.id ? VERT : 'transparent', color: onglet === o.id ? 'white' : '#64748B', fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: onglet === o.id ? 700 : 400, cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
              {o.label}
            </button>
          ))}
        </div>

        {/* ── Tableau de bord ── */}
        {onglet === 'stats' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {[
              { label: 'Utilisateurs',    val: stats?.totalUtilisateurs ?? '—',  couleur: VERT },
              { label: 'Formations',      val: stats?.totalCours ?? '—',          couleur: BLEU },
              { label: 'Abonnés Premium', val: stats?.totalAbonnes ?? '—',        couleur: '#9B59B6' },
              { label: 'Revenus (HTG)',   val: stats?.revenusHTG ?? '—',          couleur: '#E67E22' },
              { label: 'Inscriptions',    val: stats?.totalInscriptions ?? '—',   couleur: '#1ABC9C' },
              { label: 'Simulations IA',  val: stats?.totalSimulations ?? '—',    couleur: '#E74C3C' },
            ].map(s => (
              <div key={s.label} style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 14, padding: '20px 22px' }}>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{s.label}</div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 28, fontWeight: 800, color: s.couleur }}>{s.val}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── Utilisateurs ── */}
        {onglet === 'utilisateurs' && (
          <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontFamily: "'Inter',sans-serif", fontSize: 17, fontWeight: 700, color: '#0D1F2D', margin: 0 }}>Utilisateurs ({utilisateurs.length})</h2>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F8FAFB' }}>
                    {['Nom', 'Email', 'Rôle', 'Abonnement', 'Inscrit le', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {utilisateurs.map(u => (
                    <tr key={u.id} style={{ borderTop: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 16px', fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 600, color: '#0D1F2D' }}>{u.prenom} {u.nom}</td>
                      <td style={{ padding: '12px 16px', fontFamily: "'Inter',sans-serif", fontSize: 12, color: '#64748B' }}>{u.email}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <select value={u.role} onChange={e => changerRole(u.id, e.target.value)}
                          style={{ padding: '4px 8px', border: '1px solid #E2E8F0', borderRadius: 6, fontFamily: "'Inter',sans-serif", fontSize: 12, color: '#374151', outline: 'none' }}>
                          {['APPRENANT', 'FORMATEUR', 'ADMIN', 'SPECTATEUR'].map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: u.abonnement?.statut === 'ACTIF' ? '#EBF3FB' : '#F1F5F9', color: u.abonnement?.statut === 'ACTIF' ? VERT : '#94A3B8', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 100, fontFamily: "'Inter',sans-serif" }}>
                          {u.abonnement?.statut === 'ACTIF' ? `✅ ${u.abonnement.plan}` : 'Gratuit'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: "'Inter',sans-serif", fontSize: 12, color: '#94A3B8' }}>
                        {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <a href={`/profil/${u.id}`} style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: VERT, textDecoration: 'none', fontWeight: 600 }}>Voir →</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Formations ── */}
        {onglet === 'formations' && (
          <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9' }}>
              <h2 style={{ fontFamily: "'Inter',sans-serif", fontSize: 17, fontWeight: 700, color: '#0D1F2D', margin: 0 }}>Formations ({formations.length})</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {formations.map((f, i) => (
                <div key={f.id} style={{ padding: '14px 20px', borderTop: i > 0 ? '1px solid #F1F5F9' : 'none', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 600, color: '#0D1F2D', marginBottom: 3 }}>{f.titre}</div>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: '#94A3B8' }}>
                      {f.categorie} · {f._count?.lecons ?? 0} leçons · {f._count?.inscriptions ?? 0} inscrits
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
                    <button onClick={() => toggleFormation(f.id, f.publie)}
                      style={{ padding: '6px 14px', background: f.publie ? '#EBF3FB' : '#F1F5F9', color: f.publie ? VERT : '#64748B', border: 'none', borderRadius: 8, fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                      {f.publie ? '✅ Publié' : '⬜ Brouillon'}
                    </button>
                    <a href={`/formations/${f.id}`} target="_blank" rel="noreferrer"
                      style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: BLEU, textDecoration: 'none', fontWeight: 600 }}>Voir →</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Paiements ── */}
        {onglet === 'paiements' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              {[
                { label: 'Abonnements actifs', val: abonnements.filter((a: any) => a.statut === 'ACTIF').length,   couleur: VERT },
                { label: 'Expirés',            val: abonnements.filter((a: any) => a.statut === 'EXPIRE').length,  couleur: '#E67E22' },
                { label: 'Annulés',            val: abonnements.filter((a: any) => a.statut === 'ANNULE').length,  couleur: '#DC2626' },
              ].map(s => (
                <div key={s.label} style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 12, padding: '16px 20px', textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 26, fontWeight: 800, color: s.couleur }}>{s.val}</div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: '#64748B', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Validation manuelle */}
            <div style={{ background: 'white', border: `1px solid ${VERT}30`, borderRadius: 14, padding: '20px 24px' }}>
              <h3 style={{ fontFamily: "'Inter',sans-serif", fontSize: 16, fontWeight: 700, color: VERT, margin: '0 0 16px' }}>
                ✅ Valider un paiement manuellement (MonCash / PayPal / Zelle)
              </h3>
              <ValiderPaiement onSuccess={() => api.get('/paiements/admin/liste').then(r => setAbonnements(Array.isArray(r.data) ? r.data : []))} />
            </div>

            {/* Note MonCash */}
            <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 12, padding: '16px 20px' }}>
              <h4 style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 700, color: '#9A3412', margin: '0 0 6px' }}>
                📱 MonCash automatique — configuration requise
              </h4>
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: '#78350F', lineHeight: 1.6, margin: 0 }}>
                Ajoutez <code>MONCASH_CLIENT_ID</code> et <code>MONCASH_SECRET_KEY</code> dans vos variables d'environnement Render pour activer le paiement automatique. En attendant, validez manuellement ci-dessus.
              </p>
            </div>

            {/* Liste abonnements */}
            <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #F1F5F9' }}>
                <h3 style={{ fontFamily: "'Inter',sans-serif", fontSize: 15, fontWeight: 700, color: '#0D1F2D', margin: 0 }}>
                  Tous les abonnements ({abonnements.length})
                </h3>
              </div>
              {abonnements.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: '#94A3B8', fontFamily: "'Inter',sans-serif", fontSize: 14 }}>Aucun abonnement</div>
              ) : abonnements.map((ab: any) => (
                <div key={ab.id} style={{ padding: '14px 20px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 14, color: '#0D1F2D' }}>{ab.user?.prenom} {ab.user?.nom}</div>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: '#94A3B8' }}>{ab.user?.email} · {ab.montant} HTG</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 100, background: ab.statut === 'ACTIF' ? '#EBF3FB' : '#FEF2F2', color: ab.statut === 'ACTIF' ? VERT : '#DC2626', fontFamily: "'Inter',sans-serif" }}>
                      {ab.statut === 'ACTIF' ? '✅ Actif' : ab.statut === 'EXPIRE' ? '⏰ Expiré' : '❌ Annulé'} · {ab.plan}
                    </span>
                    {ab.statut === 'ACTIF' && (
                      <button onClick={async () => {
                        if (!confirm('Révoquer cet abonnement ?')) return;
                        try { await api.patch(`/paiements/admin/revoquer/${ab.userId}`); toast.success('Révoqué'); const r = await api.get('/paiements/admin/liste'); setAbonnements(Array.isArray(r.data) ? r.data : []); }
                        catch { toast.error('Erreur'); }
                      }} style={{ fontSize: 11, background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontFamily: "'Inter',sans-serif", fontWeight: 700 }}>
                        Révoquer
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Partenaires ── */}
        {onglet === 'sponsors' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Inter',sans-serif", fontSize: 20, fontWeight: 700, color: '#0D1F2D', margin: 0 }}>Partenaires ({sponsors.length})</h2>
              <button onClick={() => setModalSponsor(true)}
                style={{ padding: '10px 18px', background: VERT, color: 'white', border: 'none', borderRadius: 8, fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                + Ajouter
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sponsors.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px', color: '#94A3B8', fontFamily: "'Inter',sans-serif" }}>Aucun partenaire</div>
              ) : sponsors.map(s => (
                <div key={s.id} style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 10, background: '#F8FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                    {s.logoUrl ? <img src={s.logoUrl} alt={s.nom} style={{ width: 44, height: 44, objectFit: 'contain' }} /> : <span style={{ fontSize: 18, fontWeight: 800, color: s.couleur ?? VERT }}>{s.nom?.[0]}</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 14, color: '#0D1F2D' }}>{s.nom}</div>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: '#94A3B8' }}>{s.typeContrat} {s.actif ? '· Actif' : ''}</div>
                  </div>
                  <button onClick={() => supprimerSponsor(s.id)}
                    style={{ padding: '6px 12px', background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: 6, fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    🗑 Supprimer
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal sponsor */}
      {modalSponsor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: '28px', width: '100%', maxWidth: 460, boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 14, borderBottom: `2px solid ${VERT}` }}>
              <h2 style={{ fontFamily: "'Inter',sans-serif", fontSize: 17, fontWeight: 800, color: VERT, margin: 0 }}>Ajouter un partenaire</h2>
              <button onClick={() => setModalSponsor(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#64748B' }}>✕</button>
            </div>
            <form onSubmit={ajouterSponsor} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Nom *</label>
                <input value={formSponsor.nom} required onChange={e => setFormSponsor(p => ({ ...p, nom: e.target.value }))} placeholder="Ex : TechPro Partner" style={inp} />
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Site web</label>
                <input type="url" value={formSponsor.siteWeb} onChange={e => setFormSponsor(p => ({ ...p, siteWeb: e.target.value }))} placeholder="https://..." style={inp} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Niveau</label>
                  <select value={formSponsor.typeContrat} onChange={e => setFormSponsor(p => ({ ...p, typeContrat: e.target.value }))} style={{ ...inp, appearance: 'none' as any }}>
                    {['PLATINE','OR','ARGENT','BRONZE'].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Couleur</label>
                  <input type="color" value={formSponsor.couleur} onChange={e => setFormSponsor(p => ({ ...p, couleur: e.target.value }))} style={{ ...inp, height: 42, padding: 4, cursor: 'pointer' }} />
                </div>
              </div>
              <button type="submit" disabled={!formSponsor.nom.trim()}
                style={{ width: '100%', padding: '12px', background: VERT, color: 'white', border: 'none', borderRadius: 8, fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                Ajouter →
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
