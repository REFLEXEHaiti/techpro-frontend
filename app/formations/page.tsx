// app/formations/page.tsx — TechPro Haiti
// Catalogue complet + CRUD Admin (upload PC ou URL)
'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useTenant } from '@/lib/tenantContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const BLEU = '#1B3A6B'; const ORANGE = '#FF6B35';

const CATEGORIES = [
  { id: 'tous', label: 'Tous', icone: '🎯' },
  { id: 'informatique', label: 'Bureautique & IT', icone: '💻' },
  { id: 'web', label: 'Développement Web', icone: '🌐' },
  { id: 'cyber', label: 'Cybersécurité', icone: '🔒' },
  { id: 'compta', label: 'Comptabilité & Finance', icone: '📊' },
  { id: 'droit', label: 'Droit & Juridique', icone: '⚖️' },
  { id: 'secretariat', label: 'Secrétariat & RH', icone: '📋' },
  { id: 'immobilier', label: 'Immobilier', icone: '🏠' },
  { id: 'communication', label: 'Communication & Marketing', icone: '📣' },
  { id: 'caissier', label: 'Caissier & Commerce', icone: '🏪' },
  { id: 'gestion', label: 'Gestion de Projet', icone: '📈' },
  { id: 'ia', label: 'IA pour professionnels', icone: '🤖' },
];

const FORMATIONS_DEMO = [
  { id: 'd1',  titre: 'Bureautique & Microsoft Office 365', description: 'Word, Excel, PowerPoint, Outlook et Teams — maîtrisez la suite Office pour le bureau haïtien.', niveau: 'DEBUTANT',      cat: 'informatique', gratuit: true,  img: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600', inscrits: 842 },
  { id: 'd2',  titre: 'Développement Web Full Stack',        description: 'HTML, CSS, JavaScript, React, Node.js et PostgreSQL — devenez développeur full stack.', niveau: 'INTERMEDIAIRE', cat: 'web',          gratuit: false, img: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600', inscrits: 512 },
  { id: 'd3',  titre: 'Cybersécurité & Protection des données', description: 'Sécurité des réseaux, RGPD haïtien, ethical hacking et réponse aux incidents.', niveau: 'INTERMEDIAIRE', cat: 'cyber',        gratuit: false, img: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600', inscrits: 298 },
  { id: 'd4',  titre: 'Comptabilité générale haïtienne',     description: 'Plan comptable haïtien, écritures courantes, bilan et compte de résultat.', niveau: 'DEBUTANT',      cat: 'compta',       gratuit: true,  img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600', inscrits: 634 },
  { id: 'd5',  titre: 'Finance d\'entreprise & Analyse financière', description: 'États financiers, ratios, budget prévisionnel et gestion de trésorerie.', niveau: 'INTERMEDIAIRE', cat: 'compta',       gratuit: false, img: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600', inscrits: 289 },
  { id: 'd6',  titre: 'Fiscalité haïtienne & DGI',           description: 'Obligations fiscales, déclarations DGI, TVA, CFPB et conformité fiscale en Haïti.', niveau: 'AVANCE',        cat: 'compta',       gratuit: false, img: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600', inscrits: 187 },
  { id: 'd7',  titre: 'Droit des affaires haïtien',          description: 'Création d\'entreprise, contrats commerciaux, sociétés et résolution de litiges.', niveau: 'INTERMEDIAIRE', cat: 'droit',        gratuit: false, img: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600', inscrits: 256 },
  { id: 'd8',  titre: 'Droit foncier & Transactions immobilières', description: 'Titres fonciers, actes notariés, procédures d\'acquisition et litiges fonciers haïtiens.', niveau: 'AVANCE', cat: 'droit',        gratuit: false, img: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600', inscrits: 198 },
  { id: 'd9',  titre: 'Secrétariat professionnel & Administration', description: 'Accueil, rédaction professionnelle, gestion d\'agenda et archivage documentaire.', niveau: 'DEBUTANT', cat: 'secretariat',  gratuit: true,  img: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600', inscrits: 723 },
  { id: 'd10', titre: 'Ressources humaines & Droit du travail haïtien', description: 'Recrutement, contrats, paie, congés et code du travail haïtien.', niveau: 'INTERMEDIAIRE', cat: 'secretariat',  gratuit: false, img: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600', inscrits: 341 },
  { id: 'd11', titre: 'Agent immobilier professionnel',       description: 'Estimation, prospection, négociation, mandats et réglementation immobilière haïtienne.', niveau: 'DEBUTANT', cat: 'immobilier',   gratuit: false, img: 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=600', inscrits: 312 },
  { id: 'd12', titre: 'Communication professionnelle & Prise de parole', description: 'Rédaction, communication orale, présentation et image de marque personnelle.', niveau: 'DEBUTANT', cat: 'communication', gratuit: true,  img: 'https://images.unsplash.com/photo-1557838923-2985c318be48?w=600', inscrits: 541 },
  { id: 'd13', titre: 'Marketing digital & Réseaux sociaux',  description: 'Stratégie digitale, Facebook/Instagram, publicité et SEO pour le marché haïtien.', niveau: 'INTERMEDIAIRE', cat: 'communication', gratuit: false, img: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600', inscrits: 467 },
  { id: 'd14', titre: 'Caissier professionnel & Point de vente', description: 'Opérations de caisse, rendu de monnaie, logiciels POS et contrôle des encaissements.', niveau: 'DEBUTANT', cat: 'caissier',      gratuit: true,  img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600', inscrits: 789 },
  { id: 'd15', titre: 'Gestion de projet & Leadership',        description: 'Scrum, Kanban, JIRA, planification et livraison de projets en contexte haïtien.', niveau: 'INTERMEDIAIRE', cat: 'gestion',       gratuit: false, img: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=600', inscrits: 378 },
  { id: 'd16', titre: 'IA pour les professionnels haïtiens',   description: 'ChatGPT, outils IA appliqués aux entreprises haïtiennes : comptabilité, marketing, service client.', niveau: 'DEBUTANT', cat: 'ia', gratuit: true, img: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600', inscrits: 923 },
];

const NIV: Record<string,{label:string;bg:string;color:string}> = {
  DEBUTANT:      { label:'🟢 Débutant',      bg:'#DCFCE7', color:'#166534' },
  INTERMEDIAIRE: { label:'🔵 Intermédiaire', bg:'#DBEAFE', color:'#1E40AF' },
  AVANCE:        { label:'🔴 Avancé',         bg:'#FCE7F3', color:'#9D174D' },
};

const FORM_VIDE = {
  titre:'', description:'', cat:'informatique', niveau:'DEBUTANT', gratuit:false, publie:true,
  typeContenu:'VIDEO' as 'VIDEO'|'DOCUMENT', sourceVideo:'URL' as 'URL'|'UPLOAD', videoUrl:'',
  sourceDoc:'URL' as 'URL'|'UPLOAD', pdfUrl:'', imageUrl:'',
};

export default function PageFormations() {
  const { utilisateur } = useAuthStore();
  const { config } = useTenant();
  const primaire   = config?.couleursTheme.primaire   ?? BLEU;
  const secondaire = config?.couleursTheme.secondaire ?? ORANGE;
  const estAdmin   = ['ADMIN','FORMATEUR'].includes(utilisateur?.role ?? '');

  const [formations, setFormations] = useState<any[]>(FORMATIONS_DEMO);
  const [filtreCat, setFiltreCat]   = useState('tous');
  const [recherche, setRecherche]   = useState('');
  const [modal, setModal]           = useState(false);
  const [editing, setEditing]       = useState<any>(null);
  const [form, setForm]             = useState<any>(FORM_VIDE);
  const [videoFile, setVideoFile]   = useState<File|null>(null);
  const [pdfFile, setPdfFile]       = useState<File|null>(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [envoi, setEnvoi]           = useState(false);
  const videoRef = useRef<HTMLInputElement>(null);
  const pdfRef   = useRef<HTMLInputElement>(null);
  const imgRef   = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get('/cours').then(({data}) => { if(Array.isArray(data) && data.length) setFormations(data); }).catch(()=>{});
  }, []);

  const filtrees = formations.filter(f => {
    const catLabel = CATEGORIES.find(c => c.id === filtreCat)?.label ?? '';
    const fCat = (f.cat ?? f.categorie ?? '').toLowerCase();
    const catMatch = filtreCat === 'tous' ||
      fCat === filtreCat ||
      fCat.includes(filtreCat) ||
      fCat.includes(catLabel.split(' ')[0].toLowerCase().replace(/[^a-zàâäéèêëîïôöùûüç]/g, ''));
    const recMatch = !recherche || (f.titre + ' ' + (f.description ?? '')).toLowerCase().includes(recherche.toLowerCase());
    return catMatch && recMatch;
  });

  const b64 = (file: File) => new Promise<string>((res,rej) => { const r=new FileReader(); r.onload=()=>res(r.result as string); r.onerror=rej; r.readAsDataURL(file); });

  const ouvrirAjout = () => { setEditing(null); setForm(FORM_VIDE); setVideoFile(null); setVideoPreview(''); setPdfFile(null); setModal(true); };
  const ouvrirEdit  = (f: any) => { setEditing(f); setForm({...FORM_VIDE,...f}); setVideoFile(null); setVideoPreview(''); setPdfFile(null); setModal(true); };

  const soumettre = async (e: React.FormEvent) => {
    e.preventDefault(); setEnvoi(true);
    try {
      let payload = {...form};
      if (videoFile && form.sourceVideo==='UPLOAD') payload.videoUrl = await b64(videoFile);
      if (pdfFile   && form.sourceDoc  ==='UPLOAD') payload.pdfUrl   = await b64(pdfFile);
      if (editing) {
        await api.put(`/cours/${editing.id}`, payload);
        setFormations(prev => prev.map(f => f.id===editing.id ? {...f,...payload} : f));
        toast.success('Formation mise à jour !');
      } else {
        const {data} = await api.post('/cours', payload);
        setFormations(prev => [{...payload, id:data.id||'local_'+Date.now(), _count:{lecons:0,inscriptions:0}}, ...prev]);
        toast.success('Formation créée !');
      }
      setModal(false);
    } catch {
      if(!editing) setFormations(prev => [{...form, id:'local_'+Date.now(), _count:{lecons:0,inscriptions:0},...(videoFile?{videoUrl:URL.createObjectURL(videoFile)}:{})}, ...prev]);
      else setFormations(prev => prev.map(f => f.id===editing.id ? {...f,...form} : f));
      toast.success(editing ? 'Formation mise à jour !' : 'Formation créée !');
      setModal(false);
    }
    setEnvoi(false);
  };

  const supprimer = async (id: string) => {
    if (!confirm('Supprimer cette formation ?')) return;
    await api.delete(`/cours/${id}`).catch(()=>{});
    setFormations(prev => prev.filter(f => f.id!==id));
    toast.success('Supprimée');
  };

  const inp: React.CSSProperties = { width:'100%', padding:'10px 12px', border:'1.5px solid #CBD5E1', borderRadius:8, fontSize:13, outline:'none', boxSizing:'border-box' as const, fontFamily:"'Helvetica Neue',Arial,sans-serif", color:'#0D1B2A', background:'white' };
  const lbl: React.CSSProperties = { display:'block', fontSize:12, fontWeight:700, color:'#374151', marginBottom:5, fontFamily:"'Helvetica Neue',Arial,sans-serif" };
  const btnToggle = (active: boolean, color: string): React.CSSProperties => ({
    flex:1, padding:'9px 8px', border:`1.5px solid ${active ? color : '#CBD5E1'}`, borderRadius:6,
    background: active ? `${color}10` : 'white', color: active ? color : '#94A3B8',
    fontFamily:"'Helvetica Neue',Arial,sans-serif", fontSize:12, fontWeight:active?700:400, cursor:'pointer',
  });

  return (
    <div style={{background:'#F0F4FA', minHeight:'100vh'}}>
      {/* ── MODAL ── */}
      {modal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
          <div style={{background:'white',borderRadius:16,padding:'28px 32px',width:'100%',maxWidth:620,maxHeight:'92vh',overflowY:'auto',boxShadow:'0 24px 64px rgba(0,0,0,0.25)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20,paddingBottom:14,borderBottom:`2px solid ${primaire}`}}>
              <h2 style={{fontFamily:"'Helvetica Neue',Arial,sans-serif",fontSize:18,fontWeight:800,color:primaire,margin:0}}>{editing ? '✏️ Modifier' : '➕ Nouvelle formation'}</h2>
              <button onClick={()=>setModal(false)} style={{background:'none',border:'none',cursor:'pointer',fontSize:20,color:'#64748B'}}>✕</button>
            </div>
            <form onSubmit={soumettre} style={{display:'flex',flexDirection:'column',gap:14}}>
              <div><label style={lbl}>Titre *</label><input required value={form.titre} onChange={e=>setForm((p:any)=>({...p,titre:e.target.value}))} placeholder="Ex : Comptabilité générale haïtienne" style={inp}/></div>
              <div><label style={lbl}>Description *</label><textarea required value={form.description} onChange={e=>setForm((p:any)=>({...p,description:e.target.value}))} rows={3} placeholder="Décrivez le contenu de la formation…" style={{...inp,resize:'none' as const}}/></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div><label style={lbl}>Catégorie</label>
                  <select value={form.cat} onChange={e=>setForm((p:any)=>({...p,cat:e.target.value}))} style={{...inp,appearance:'none' as any}}>
                    {CATEGORIES.filter(c=>c.id!=='tous').map(c=><option key={c.id} value={c.id}>{c.icone} {c.label}</option>)}
                  </select>
                </div>
                <div><label style={lbl}>Niveau</label>
                  <select value={form.niveau} onChange={e=>setForm((p:any)=>({...p,niveau:e.target.value}))} style={{...inp,appearance:'none' as any}}>
                    <option value="DEBUTANT">🟢 Débutant</option>
                    <option value="INTERMEDIAIRE">🔵 Intermédiaire</option>
                    <option value="AVANCE">🔴 Avancé</option>
                  </select>
                </div>
              </div>

              {/* Image couverture */}
              <div>
                <label style={lbl}>Image de couverture</label>
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <input value={form.imageUrl?.startsWith('data:') ? '' : (form.imageUrl??'')} onChange={e=>setForm((p:any)=>({...p,imageUrl:e.target.value}))} placeholder="URL image (https://…)" style={{...inp,flex:1}}/>
                  <span style={{fontSize:12,color:'#94A3B8',whiteSpace:'nowrap' as const}}>ou</span>
                  <button type="button" onClick={()=>imgRef.current?.click()} style={{padding:'9px 14px',background:`${primaire}10`,color:primaire,border:`1px solid ${primaire}40`,borderRadius:8,cursor:'pointer',fontFamily:"'Helvetica Neue',Arial,sans-serif",fontSize:12,fontWeight:700,whiteSpace:'nowrap' as const}}>📁 PC</button>
                  <input ref={imgRef} type="file" accept="image/*" onChange={async e=>{const f=e.target.files?.[0];if(f)setForm((p:any)=>({...p,imageUrl:URL.createObjectURL(f)}));}} style={{display:'none'}}/>
                </div>
                {form.imageUrl && <img src={form.imageUrl} alt="" style={{width:'100%',height:90,objectFit:'cover',borderRadius:8,marginTop:8}}/>}
              </div>

              {/* Contenu */}
              <div style={{background:'#F8FAFF',border:`1px solid ${primaire}20`,borderRadius:10,padding:'14px 16px'}}>
                <label style={{...lbl,marginBottom:10}}>Type de contenu</label>
                <div style={{display:'flex',gap:8,marginBottom:14}}>
                  {[{v:'VIDEO',l:'🎬 Vidéo'},{v:'DOCUMENT',l:'📄 PDF / Document'}].map(t=>(
                    <button type="button" key={t.v} onClick={()=>setForm((p:any)=>({...p,typeContenu:t.v}))} style={btnToggle(form.typeContenu===t.v, primaire)}>{t.l}</button>
                  ))}
                </div>

                {form.typeContenu==='VIDEO' && (
                  <>
                    <div style={{display:'flex',gap:8,marginBottom:10}}>
                      {[{v:'URL',l:'🔗 URL (YouTube/Lien direct)'},{v:'UPLOAD',l:'📁 Upload depuis PC'}].map(s=>(
                        <button type="button" key={s.v} onClick={()=>setForm((p:any)=>({...p,sourceVideo:s.v}))} style={btnToggle(form.sourceVideo===s.v, secondaire)}>{s.l}</button>
                      ))}
                    </div>
                    {form.sourceVideo==='URL'
                      ? <input value={form.videoUrl} onChange={e=>setForm((p:any)=>({...p,videoUrl:e.target.value}))} placeholder="https://www.youtube.com/watch?v=… ou lien direct MP4" style={inp}/>
                      : <div>
                          <button type="button" onClick={()=>videoRef.current?.click()} style={{width:'100%',padding:'14px',background:videoFile?'#DCFCE7':`${primaire}08`,border:`2px dashed ${videoFile?'#16A34A':primaire}`,borderRadius:8,cursor:'pointer',fontFamily:"'Helvetica Neue',Arial,sans-serif",fontSize:13,fontWeight:700,color:videoFile?'#16A34A':primaire}}>
                            {videoFile ? `✅ ${videoFile.name}` : '📁 Cliquez pour choisir une vidéo (MP4, WebM — max 500MB)'}
                          </button>
                          <input ref={videoRef} type="file" accept="video/*" onChange={e=>{const f=e.target.files?.[0];if(f){setVideoFile(f);setVideoPreview(URL.createObjectURL(f));}}} style={{display:'none'}}/>
                          {videoPreview && <video src={videoPreview} controls style={{width:'100%',marginTop:8,borderRadius:8,maxHeight:160}}/>}
                        </div>
                    }
                  </>
                )}

                {form.typeContenu==='DOCUMENT' && (
                  <>
                    <div style={{display:'flex',gap:8,marginBottom:10}}>
                      {[{v:'URL',l:'🔗 URL du PDF'},{v:'UPLOAD',l:'📁 Upload depuis PC'}].map(s=>(
                        <button type="button" key={s.v} onClick={()=>setForm((p:any)=>({...p,sourceDoc:s.v}))} style={btnToggle(form.sourceDoc===s.v, secondaire)}>{s.l}</button>
                      ))}
                    </div>
                    {form.sourceDoc==='URL'
                      ? <input value={form.pdfUrl} onChange={e=>setForm((p:any)=>({...p,pdfUrl:e.target.value}))} placeholder="https://exemple.com/cours.pdf" style={inp}/>
                      : <div>
                          <button type="button" onClick={()=>pdfRef.current?.click()} style={{width:'100%',padding:'14px',background:pdfFile?'#DCFCE7':`${primaire}08`,border:`2px dashed ${pdfFile?'#16A34A':primaire}`,borderRadius:8,cursor:'pointer',fontFamily:"'Helvetica Neue',Arial,sans-serif",fontSize:13,fontWeight:700,color:pdfFile?'#16A34A':primaire}}>
                            {pdfFile ? `✅ ${pdfFile.name}` : '📁 Cliquez pour choisir un PDF (max 50MB)'}
                          </button>
                          <input ref={pdfRef} type="file" accept=".pdf" onChange={e=>setPdfFile(e.target.files?.[0]??null)} style={{display:'none'}}/>
                        </div>
                    }
                  </>
                )}
              </div>

              <div style={{display:'flex',gap:20}}>
                {[{k:'gratuit',l:'Gratuit'},{k:'publie',l:'Publier immédiatement'}].map(o=>(
                  <label key={o.k} style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontFamily:"'Helvetica Neue',Arial,sans-serif",fontSize:13,color:'#374151'}}>
                    <input type="checkbox" checked={!!form[o.k]} onChange={e=>setForm((p:any)=>({...p,[o.k]:e.target.checked}))} style={{accentColor:primaire,width:16,height:16}}/>{o.l}
                  </label>
                ))}
              </div>

              <div style={{display:'flex',gap:10}}>
                <button type="button" onClick={()=>setModal(false)} style={{flex:1,padding:'13px',background:'white',color:primaire,border:`2px solid ${primaire}`,borderRadius:10,fontFamily:"'Helvetica Neue',Arial,sans-serif",fontWeight:700,fontSize:14,cursor:'pointer'}}>Annuler</button>
                <button type="submit" disabled={envoi} style={{flex:2,padding:'13px',background:envoi?'#64748B':primaire,color:'white',border:'none',borderRadius:10,fontFamily:"'Helvetica Neue',Arial,sans-serif",fontWeight:700,fontSize:15,cursor:'pointer'}}>
                  {envoi ? '⏳ Enregistrement…' : editing ? '💾 Sauvegarder' : '✅ Créer la formation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hero */}
      <section style={{background:`linear-gradient(135deg, #0D1B2A 0%, ${primaire} 100%)`,padding:'clamp(40px,5vw,64px) clamp(20px,5vw,48px)'}}>
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:24,flexWrap:'wrap',gap:16}}>
            <div>
              <div style={{fontFamily:"'Helvetica Neue',Arial,sans-serif",fontSize:11,letterSpacing:'0.12em',textTransform:'uppercase',color:secondaire,fontWeight:700,marginBottom:8}}>Formation professionnelle continue</div>
              <h1 style={{fontFamily:"'Helvetica Neue',Arial,sans-serif",fontSize:'clamp(26px,3vw,40px)',fontWeight:900,color:'white',margin:'0 0 8px',letterSpacing:'-0.5px'}}>Catalogue TechPro Haiti</h1>
              <p style={{fontFamily:"'Helvetica Neue',Arial,sans-serif",fontSize:14,color:'rgba(255,255,255,0.7)',margin:0}}>
                {formations.length} formations · Informatique, Comptabilité, Droit, Secrétariat, Immobilier & plus
              </p>
            </div>
            {estAdmin && (
              <button onClick={ouvrirAjout} style={{padding:'13px 24px',background:secondaire,color:'white',border:'none',borderRadius:8,fontFamily:"'Helvetica Neue',Arial,sans-serif",fontWeight:800,fontSize:13,cursor:'pointer'}}>
                ➕ Nouvelle formation
              </button>
            )}
          </div>
          <div style={{position:'relative',maxWidth:500}}>
            <span style={{position:'absolute',left:16,top:'50%',transform:'translateY(-50%)',fontSize:16}}>🔍</span>
            <input value={recherche} onChange={e=>setRecherche(e.target.value)} placeholder="Rechercher une formation, un domaine…"
              style={{width:'100%',padding:'13px 16px 13px 46px',background:'rgba(255,255,255,0.12)',border:'1.5px solid rgba(255,255,255,0.2)',borderRadius:10,color:'white',fontFamily:"'Helvetica Neue',Arial,sans-serif",fontSize:14,outline:'none',boxSizing:'border-box' as const}}/>
          </div>
        </div>
      </section>

      {/* Filtres */}
      <div style={{background:'white',borderBottom:'1px solid #E2E8F0',padding:'12px clamp(20px,5vw,48px)',overflowX:'auto'}}>
        <div style={{display:'flex',gap:8,maxWidth:1200,margin:'0 auto',flexWrap:'wrap'}}>
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={()=>setFiltreCat(cat.id)}
              style={{padding:'7px 14px',borderRadius:100,border:`1.5px solid ${filtreCat===cat.id?primaire:'#E2E8F0'}`,background:filtreCat===cat.id?primaire:'white',color:filtreCat===cat.id?'white':'#374151',fontFamily:"'Helvetica Neue',Arial,sans-serif",fontSize:12,fontWeight:filtreCat===cat.id?700:400,cursor:'pointer',whiteSpace:'nowrap' as const}}>
              {cat.icone} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grille */}
      <div style={{maxWidth:1200,margin:'0 auto',padding:'clamp(32px,4vw,48px) clamp(20px,5vw,48px)'}}>
        <p style={{fontFamily:"'Helvetica Neue',Arial,sans-serif",fontSize:14,color:'#64748B',margin:'0 0 24px'}}><strong style={{color:primaire}}>{filtrees.length}</strong> formation{filtrees.length>1?'s':''} trouvée{filtrees.length>1?'s':''}</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))',gap:20}}>
          {filtrees.map(f => {
            const niv = NIV[f.niveau ?? 'DEBUTANT'];
            return (
              <div key={f.id} style={{background:'white',borderRadius:14,overflow:'hidden',border:'1px solid #E2E8F0',position:'relative',transition:'transform 0.2s, box-shadow 0.2s'}}
                onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.transform='translateY(-3px)';el.style.boxShadow=`0 10px 40px rgba(27,58,107,0.12)`;}}
                onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.transform='none';el.style.boxShadow='none';}}>
                {estAdmin && (
                  <div style={{position:'absolute',top:8,right:8,display:'flex',gap:4,zIndex:2}}>
                    <button onClick={()=>ouvrirEdit(f)} title="Modifier" style={{width:30,height:30,borderRadius:'50%',background:'rgba(255,255,255,0.92)',border:'none',cursor:'pointer',fontSize:13,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 2px 8px rgba(0,0,0,0.15)'}}>✏️</button>
                    <button onClick={()=>supprimer(f.id)} title="Supprimer" style={{width:30,height:30,borderRadius:'50%',background:'rgba(255,255,255,0.92)',border:'none',cursor:'pointer',fontSize:13,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 2px 8px rgba(0,0,0,0.15)'}}>🗑️</button>
                  </div>
                )}
                {(f.img || f.imageUrl) && (
                  <div style={{height:150,overflow:'hidden',position:'relative'}}>
                    <img src={f.img||f.imageUrl} alt={f.titre} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                    {f.gratuit !== false && <div style={{position:'absolute',top:10,left:10,background:'#059669',color:'white',fontSize:10,fontWeight:700,padding:'3px 10px',borderRadius:100,fontFamily:"'Helvetica Neue',Arial,sans-serif"}}>GRATUIT</div>}
                  </div>
                )}
                <div style={{padding:'16px 18px'}}>
                  <div style={{display:'flex',gap:8,marginBottom:10,flexWrap:'wrap'}}>
                    {niv && <span style={{fontSize:11,fontWeight:700,background:niv.bg,color:niv.color,padding:'3px 10px',borderRadius:100,fontFamily:"'Helvetica Neue',Arial,sans-serif"}}>{niv.label}</span>}
                  </div>
                  <h3 style={{fontFamily:"'Helvetica Neue',Arial,sans-serif",fontSize:15,fontWeight:800,color:primaire,lineHeight:1.35,margin:'0 0 8px'}}>{f.titre}</h3>
                  <p style={{fontFamily:"'Helvetica Neue',Arial,sans-serif",fontSize:12,color:'#64748B',lineHeight:1.5,margin:'0 0 12px'}}>{(f.description||'').slice(0,90)}{(f.description||'').length>90?'…':''}</p>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'#94A3B8',marginBottom:14,fontFamily:"'Helvetica Neue',Arial,sans-serif"}}>
                    <span>📚 {f._count?.lecons ?? 0} leçons</span>
                    <span>👥 {f._count?.inscriptions ?? f.inscrits ?? 0} inscrits</span>
                  </div>
                  <Link href={f.id?.startsWith('d') ? '#' : `/formations/${f.id}`} style={{display:'block',textAlign:'center',padding:'11px',background:primaire,color:'white',borderRadius:8,textDecoration:'none',fontFamily:"'Helvetica Neue',Arial,sans-serif",fontWeight:700,fontSize:13}}>
                    {f.gratuit !== false ? 'Commencer gratuitement →' : 'Voir la formation →'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
