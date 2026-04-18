// app/simulations/page.tsx — TechPro Haiti — Galerie moments forts
'use client';

import { useState, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useTenant } from '@/lib/tenantContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const GALLERY_DEMO = [
  { id:'g1', titre:'Hackathon TechPro 2025',           sousTitre:'Port-au-Prince, Décembre 2025', categorie:'Hackathon', url:'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=85' },
  { id:'g2', titre:'Cérémonie de certification',        sousTitre:'Promotion Novembre 2025',       categorie:'Certification', url:'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=85' },
  { id:'g3', titre:'Atelier Développement Web',         sousTitre:'Bootcamp intensif 3 semaines',  categorie:'Atelier', url:'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=85' },
  { id:'g4', titre:'Formation Comptabilité avancée',    sousTitre:'Entreprises haïtiennes 2025',   categorie:'Formation', url:'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=85' },
  { id:'g5', titre:'Masterclass Marketing Digital',     sousTitre:'Réseaux sociaux & SEO',         categorie:'Masterclass', url:'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=85' },
  { id:'g6', titre:'Cybersécurité — Workshop CTF',      sousTitre:'Ethical Hacking & Pentest',     categorie:'Workshop', url:'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=85' },
  { id:'g7', titre:'Formation Secrétariat professionnel', sousTitre:'Gestion administrative',      categorie:'Formation', url:'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=85' },
  { id:'g8', titre:'Remise de diplômes — Droit des affaires', sousTitre:'Promotion Mars 2025',     categorie:'Certification', url:'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=85' },
  { id:'g9', titre:'Séminaire IA pour professionnels',  sousTitre:'ChatGPT & automatisation',      categorie:'Séminaire', url:'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=85' },
];

const CATS_GALLERY = ['Tous','Hackathon','Certification','Atelier','Formation','Masterclass','Workshop','Séminaire','Autre'];

export default function PageGalerie() {
  const { utilisateur } = useAuthStore();
  const { config } = useTenant();
  const primaire   = config?.couleursTheme.primaire   ?? '#1B3A6B';
  const secondaire = config?.couleursTheme.secondaire ?? '#FF6B35';
  const estAdmin   = ['ADMIN','FORMATEUR'].includes(utilisateur?.role ?? '');

  const [gallery, setGallery]   = useState(GALLERY_DEMO);
  const [filtre, setFiltre]     = useState('Tous');
  const [modal, setModal]       = useState(false);
  const [lightbox, setLightbox] = useState<any>(null);
  const [form, setForm]         = useState({ titre:'', sousTitre:'', categorie:'Formation', url:'', source:'URL' as 'URL'|'UPLOAD' });
  const [imgFile, setImgFile]   = useState<File|null>(null);
  const imgRef = useRef<HTMLInputElement>(null);

  const filtrees = gallery.filter(g => filtre === 'Tous' || g.categorie === filtre);

  const ajouterPhoto = async () => {
    if (!form.titre) { toast.error('Titre requis'); return; }
    let url = form.url;
    if (form.source === 'UPLOAD' && imgFile) {
      url = await new Promise<string>(res => { const r=new FileReader(); r.onload=()=>res(r.result as string); r.readAsDataURL(imgFile!); });
    }
    if (!url) { toast.error('Ajoutez une image (URL ou fichier)'); return; }
    try {
      const { data } = await api.post('/galerie', { ...form, url });
      setGallery(prev => [data, ...prev]);
    } catch {
      setGallery(prev => [{ ...form, url, id:'g'+Date.now() }, ...prev]);
    }
    toast.success('Photo ajoutée !');
    setModal(false);
    setForm({ titre:'', sousTitre:'', categorie:'Formation', url:'', source:'URL' });
    setImgFile(null);
  };

  const supprimer = async (id: string) => {
    if (!confirm('Supprimer cette photo ?')) return;
    await api.delete(`/galerie/${id}`).catch(()=>{});
    setGallery(prev => prev.filter(g => g.id !== id));
    toast.success('Photo supprimée');
  };

  const inp: React.CSSProperties = { width:'100%', padding:'10px 12px', border:'1.5px solid #CBD5E1', borderRadius:8, fontSize:13, outline:'none', boxSizing:'border-box' as const, fontFamily:"'Helvetica Neue',Arial,sans-serif", color:'#0D1B2A', background:'white' };
  const lbl: React.CSSProperties = { display:'block', fontSize:12, fontWeight:700, color:'#374151', marginBottom:5, fontFamily:"'Helvetica Neue',Arial,sans-serif" };

  return (
    <div style={{background:'#F0F4FA', minHeight:'100vh'}}>

      {/* Lightbox */}
      {lightbox && (
        <div onClick={()=>setLightbox(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.9)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center',padding:24,cursor:'pointer'}}>
          <div onClick={e=>e.stopPropagation()} style={{maxWidth:900,width:'100%',position:'relative'}}>
            <img src={lightbox.url} alt={lightbox.titre} style={{width:'100%',borderRadius:12,maxHeight:'70vh',objectFit:'contain'}}/>
            <div style={{textAlign:'center',marginTop:16}}>
              <div style={{fontFamily:"'Helvetica Neue',Arial,sans-serif",fontSize:18,fontWeight:800,color:'white'}}>{lightbox.titre}</div>
              {lightbox.sousTitre && <div style={{fontFamily:"'Helvetica Neue',Arial,sans-serif",fontSize:13,color:'rgba(255,255,255,0.65)',marginTop:4}}>{lightbox.sousTitre}</div>}
            </div>
            <button onClick={()=>setLightbox(null)} style={{position:'absolute',top:-40,right:0,background:'none',border:'none',color:'white',fontSize:28,cursor:'pointer'}}>✕</button>
          </div>
        </div>
      )}

      {/* Modal ajout */}
      {modal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
          <div style={{background:'white',borderRadius:16,padding:'28px 32px',width:'100%',maxWidth:480,boxShadow:'0 24px 64px rgba(0,0,0,0.25)'}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:20,paddingBottom:14,borderBottom:`2px solid ${primaire}`}}>
              <h3 style={{fontFamily:"'Helvetica Neue',Arial,sans-serif",fontSize:18,fontWeight:800,color:primaire,margin:0}}>📸 Ajouter une photo</h3>
              <button onClick={()=>setModal(false)} style={{background:'none',border:'none',cursor:'pointer',fontSize:20,color:'#64748B'}}>✕</button>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              <div><label style={lbl}>Titre *</label><input value={form.titre} onChange={e=>setForm(p=>({...p,titre:e.target.value}))} placeholder="Ex : Hackathon TechPro 2026" style={inp}/></div>
              <div><label style={lbl}>Sous-titre</label><input value={form.sousTitre} onChange={e=>setForm(p=>({...p,sousTitre:e.target.value}))} placeholder="Ex : Port-au-Prince, Juin 2026" style={inp}/></div>
              <div><label style={lbl}>Catégorie</label>
                <select value={form.categorie} onChange={e=>setForm(p=>({...p,categorie:e.target.value}))} style={{...inp,appearance:'none' as any}}>
                  {CATS_GALLERY.filter(c=>c!=='Tous').map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{...lbl,marginBottom:8}}>Source de l'image</label>
                <div style={{display:'flex',gap:8,marginBottom:10}}>
                  {[{v:'URL',l:'🔗 URL'},{v:'UPLOAD',l:'📁 Depuis PC'}].map(s=>(
                    <button type="button" key={s.v} onClick={()=>setForm(p=>({...p,source:s.v as any}))}
                      style={{flex:1,padding:'9px',border:`1.5px solid ${form.source===s.v?primaire:'#CBD5E1'}`,borderRadius:6,background:form.source===s.v?`${primaire}08`:'white',color:form.source===s.v?primaire:'#64748B',fontFamily:"'Helvetica Neue',Arial,sans-serif",fontSize:12,fontWeight:600,cursor:'pointer'}}>
                      {s.l}
                    </button>
                  ))}
                </div>
                {form.source==='URL'
                  ? <input value={form.url} onChange={e=>setForm(p=>({...p,url:e.target.value}))} placeholder="https://exemple.com/photo.jpg" style={inp}/>
                  : <button type="button" onClick={()=>imgRef.current?.click()}
                      style={{width:'100%',padding:'14px',background:imgFile?'#DCFCE7':`${primaire}08`,border:`2px dashed ${imgFile?'#16A34A':primaire}`,borderRadius:8,cursor:'pointer',fontFamily:"'Helvetica Neue',Arial,sans-serif",fontSize:13,fontWeight:700,color:imgFile?'#16A34A':primaire}}>
                      {imgFile ? `✅ ${imgFile.name}` : '📁 Cliquez pour choisir une image'}
                    </button>
                }
                <input ref={imgRef} type="file" accept="image/*" onChange={e=>setImgFile(e.target.files?.[0]??null)} style={{display:'none'}}/>
              </div>
              <button onClick={ajouterPhoto} style={{padding:'13px',background:primaire,color:'white',border:'none',borderRadius:10,fontFamily:"'Helvetica Neue',Arial,sans-serif",fontWeight:700,fontSize:15,cursor:'pointer',marginTop:4}}>
                ✅ Ajouter à la galerie
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <section style={{background:`linear-gradient(135deg, #0D1B2A 0%, ${primaire} 100%)`,padding:'clamp(48px,6vw,72px) clamp(20px,5vw,48px)'}}>
        <div style={{maxWidth:1200,margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'flex-end',flexWrap:'wrap',gap:20}}>
          <div>
            <div style={{fontFamily:"'Helvetica Neue',Arial,sans-serif",fontSize:11,letterSpacing:'0.14em',textTransform:'uppercase',color:secondaire,fontWeight:700,marginBottom:12}}>GALERIE — MOMENTS FORTS</div>
            <h1 style={{fontFamily:"'Helvetica Neue',Arial,sans-serif",fontSize:'clamp(28px,4vw,48px)',fontWeight:900,color:'white',margin:'0 0 10px',letterSpacing:'-1px'}}>
              TechPro Haiti <span style={{color:secondaire}}>en images</span>
            </h1>
            <p style={{fontFamily:"'Helvetica Neue',Arial,sans-serif",fontSize:14,color:'rgba(255,255,255,0.7)',margin:0}}>
              Formations, hackathons, certifications et événements professionnels
            </p>
          </div>
          {estAdmin && (
            <button onClick={()=>setModal(true)} style={{padding:'13px 24px',background:secondaire,color:'white',border:'none',borderRadius:8,fontFamily:"'Helvetica Neue',Arial,sans-serif",fontWeight:800,fontSize:13,cursor:'pointer'}}>
              📸 Ajouter une photo
            </button>
          )}
        </div>
        {/* Filtres */}
        <div style={{maxWidth:1200,margin:'20px auto 0',display:'flex',gap:8,flexWrap:'wrap'}}>
          {CATS_GALLERY.map(cat => (
            <button key={cat} onClick={()=>setFiltre(cat)}
              style={{padding:'8px 16px',borderRadius:8,border:'none',background:filtre===cat?secondaire:'rgba(255,255,255,0.15)',color:'white',fontFamily:"'Helvetica Neue',Arial,sans-serif",fontSize:12,fontWeight:filtre===cat?700:400,cursor:'pointer'}}>
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Grille galerie */}
      <div style={{maxWidth:1200,margin:'0 auto',padding:'clamp(32px,4vw,48px) clamp(20px,5vw,48px)'}}>
        <p style={{fontFamily:"'Helvetica Neue',Arial,sans-serif",fontSize:14,color:'#64748B',margin:'0 0 24px'}}>
          <strong style={{color:primaire}}>{filtrees.length}</strong> photo{filtrees.length>1?'s':''}
        </p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))',gap:20}}>
          {filtrees.map(g => (
            <div key={g.id} style={{borderRadius:14,overflow:'hidden',border:'1px solid #E2E8F0',background:'white',position:'relative',cursor:'pointer',transition:'transform 0.2s, box-shadow 0.2s'}}
              onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.transform='translateY(-3px)';el.style.boxShadow=`0 10px 40px rgba(27,58,107,0.15)`;}}
              onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.transform='none';el.style.boxShadow='none';}}>
              {estAdmin && (
                <button onClick={e=>{e.stopPropagation();supprimer(g.id);}} title="Supprimer"
                  style={{position:'absolute',top:8,right:8,zIndex:2,width:28,height:28,borderRadius:'50%',background:'rgba(255,255,255,0.92)',border:'none',cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 2px 8px rgba(0,0,0,0.15)'}}>🗑️</button>
              )}
              <div onClick={()=>setLightbox(g)} style={{height:200,overflow:'hidden',position:'relative'}}>
                <img src={g.url} alt={g.titre} style={{width:'100%',height:'100%',objectFit:'cover',transition:'transform 0.3s'}}
                  onMouseEnter={e=>{(e.currentTarget as HTMLImageElement).style.transform='scale(1.05)';}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLImageElement).style.transform='scale(1)';}}/>
                <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.5))'}}/>
                <div style={{position:'absolute',bottom:10,left:12,fontFamily:"'Helvetica Neue',Arial,sans-serif",fontSize:10,color:'white',background:'rgba(0,0,0,0.5)',padding:'2px 8px',borderRadius:100}}>{g.categorie}</div>
              </div>
              <div style={{padding:'12px 16px'}}>
                <div style={{fontFamily:"'Helvetica Neue',Arial,sans-serif",fontSize:14,fontWeight:800,color:primaire,lineHeight:1.3}}>{g.titre}</div>
                {g.sousTitre && <div style={{fontFamily:"'Helvetica Neue',Arial,sans-serif",fontSize:12,color:'#64748B',marginTop:3}}>{g.sousTitre}</div>}
              </div>
            </div>
          ))}
        </div>
        {filtrees.length===0 && (
          <div style={{textAlign:'center',padding:'64px 24px'}}>
            <div style={{fontSize:48,marginBottom:12}}>📸</div>
            <p style={{fontFamily:"'Helvetica Neue',Arial,sans-serif",fontSize:16,color:'#64748B'}}>Aucune photo dans cette catégorie.</p>
          </div>
        )}
      </div>
    </div>
  );
}
