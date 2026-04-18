// app/formations/[id]/lecons/[leconId]/page.tsx — TechPro Haiti

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

const NAVY = '#1B3A6B'; const ORANGE = '#FF6B35'; const DARK = '#0D1F3C';

export default function PageLecon() {
  const { id, leconId } = useParams() as { id: string; leconId: string };
  const { estConnecte } = useAuthStore();
  const router = useRouter();
  const [lecon, setLecon] = useState<any>(null);
  const [formation, setFormation] = useState<any>(null);
  const [chargement, setChargement] = useState(true);
  const [termine, setTermine] = useState(false);
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    if (!estConnecte) { router.push('/auth/connexion'); return; }
    Promise.all([
      api.get(`/lecons/${leconId}`).then(({data}) => setLecon(data)).catch(()=>{}),
      api.get(`/cours/${id}`).then(({data}) => setFormation(data)).catch(()=>{}),
    ]).finally(() => setChargement(false));
  }, [id, leconId, estConnecte]);

  const marquerTermine = async () => {
    setEnvoi(true);
    try { await api.post(`/lecons/${leconId}/terminer`, {}); setTermine(true); } catch { setTermine(true); }
    setEnvoi(false);
  };

  const suivante = () => {
    if (!formation?.lecons) return null;
    const idx = formation.lecons.findIndex((l:any) => l.id === leconId);
    return idx >= 0 && idx < formation.lecons.length - 1 ? formation.lecons[idx + 1] : null;
  };

  if (chargement) return <div style={{minHeight:'60vh',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{width:36,height:36,border:`3px solid #F1F5F9`,borderTopColor:ORANGE,borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;

  const leconSuivante = suivante();
  const total = formation?.lecons?.length ?? 0;
  const idx   = formation?.lecons?.findIndex((l:any) => l.id === leconId) ?? 0;
  const pct   = total > 0 ? Math.round(((idx + (termine ? 1 : 0)) / total) * 100) : 0;

  return (
    <div style={{background:'white',minHeight:'100vh'}}>
      {/* Barre progression orange */}
      <div style={{height:4,background:'#F1F5F9',position:'sticky',top:64,zIndex:10}}>
        <div style={{height:'100%',width:`${pct}%`,background:ORANGE,transition:'width 0.6s ease',borderRadius:'0 2px 2px 0'}}/>
      </div>

      {/* Breadcrumb */}
      <div style={{padding:'12px clamp(20px,5vw,56px)',borderBottom:'1px solid #E2E8F0',display:'flex',alignItems:'center',gap:8,fontFamily:"'Inter',sans-serif",fontSize:12,color:'#94A3B8',background:'white',position:'sticky',top:68,zIndex:9}}>
        <Link href="/formations" style={{color:'#94A3B8',textDecoration:'none'}}>Formations</Link>
        <span>/</span>
        <Link href={`/formations/${id}`} style={{color:'#94A3B8',textDecoration:'none'}}>{formation?.titre ?? 'Formation'}</Link>
        <span>/</span>
        <span style={{color:NAVY,fontWeight:700}}>{lecon?.titre ?? 'Leçon'}</span>
        <span style={{marginLeft:'auto',background:`${ORANGE}15`,color:ORANGE,padding:'2px 10px',borderRadius:100,fontSize:11,fontWeight:800}}>
          {idx + 1}/{total}
        </span>
      </div>

      <div style={{maxWidth:860,margin:'0 auto',padding:'clamp(24px,4vw,48px) clamp(20px,5vw,56px)',display:'grid',gridTemplateColumns:'1fr 220px',gap:40}}>
        <div>
          <h1 style={{fontFamily:"'Inter',sans-serif",fontSize:'clamp(22px,3.5vw,30px)',fontWeight:900,color:DARK,lineHeight:1.2,marginBottom:8,letterSpacing:'-0.03em'}}>
            {lecon?.titre ?? 'Chargement…'}
          </h1>
          {lecon?.dureeMin && <p style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:'#94A3B8',marginBottom:28}}>⏱ {lecon.dureeMin} min</p>}

          {lecon?.videoUrl && (
            <div style={{position:'relative',paddingTop:'56.25%',background:'#000',borderRadius:14,overflow:'hidden',marginBottom:28}}>
              <iframe src={lecon.videoUrl} title={lecon.titre} style={{position:'absolute',inset:0,width:'100%',height:'100%',border:'none'}} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/>
            </div>
          )}

          <div style={{fontFamily:"'Inter',sans-serif",fontSize:16,color:'#374151',lineHeight:1.85}}>
            {lecon?.contenu ? (
              <div dangerouslySetInnerHTML={{__html: lecon.contenu.replace(/\n/g,'<br/>')}}/>
            ) : (
              <div>
                <div style={{background:`${ORANGE}08`,border:`1px solid ${ORANGE}25`,borderRadius:12,padding:'16px 20px',marginBottom:24}}>
                  <div style={{fontFamily:"'Inter',sans-serif",fontSize:12,fontWeight:800,color:ORANGE,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:8}}>Points clés</div>
                  {['Comprendre le cadre réglementaire BRH','Appliquer les procédures en pratique','Identifier les risques de conformité','Documenter correctement les opérations'].map((p,i)=>(
                    <div key={i} style={{display:'flex',gap:8,alignItems:'flex-start',marginBottom:6}}>
                      <span style={{color:ORANGE,fontWeight:800,flexShrink:0}}>✓</span>
                      <span style={{fontSize:14,color:'#374151'}}>{p}</span>
                    </div>
                  ))}
                </div>
                <p>Cette leçon vous guide à travers les concepts essentiels avec des cas pratiques adaptés au contexte professionnel haïtien.</p>
              </div>
            )}
          </div>

          <div style={{display:'flex',gap:14,marginTop:32,flexWrap:'wrap'}}>
            {!termine ? (
              <button onClick={marquerTermine} disabled={envoi} style={{flex:1,padding:'14px',background:ORANGE,color:'white',border:'none',borderRadius:10,fontFamily:"'Inter',sans-serif",fontWeight:900,fontSize:15,cursor:'pointer',boxShadow:`0 4px 16px ${ORANGE}40`}}>
                {envoi?'Enregistrement…':'✓ Marquer comme terminé'}
              </button>
            ) : (
              <div style={{flex:1,padding:'14px',background:`${ORANGE}12`,color:'#92400E',borderRadius:10,fontFamily:"'Inter',sans-serif",fontWeight:800,fontSize:15,textAlign:'center'}}>✅ Terminé !</div>
            )}
            {leconSuivante && (
              <Link href={`/formations/${id}/lecons/${leconSuivante.id}`}
                style={{flex:1,padding:'14px',background:DARK,color:'white',borderRadius:10,textDecoration:'none',fontFamily:"'Inter',sans-serif",fontWeight:900,fontSize:15,textAlign:'center'}}>
                Leçon suivante →
              </Link>
            )}
          </div>
        </div>

        {/* Plan sidebar */}
        <div style={{position:'sticky',top:100,height:'fit-content'}}>
          <div style={{background:'#F8FAFB',border:'2px solid #F1F5F9',borderRadius:14,overflow:'hidden'}}>
            <div style={{padding:'12px 16px',background:NAVY}}>
              <span style={{fontFamily:"'Inter',sans-serif",fontSize:11,fontWeight:800,color:'rgba(255,255,255,0.9)',letterSpacing:'0.08em',textTransform:'uppercase'}}>Plan du cours</span>
            </div>
            <div style={{maxHeight:400,overflowY:'auto'}}>
              {formation?.lecons?.map((l:any,i:number) => {
                const actif = l.id === leconId;
                return (
                  <Link key={l.id??i} href={`/formations/${id}/lecons/${l.id}`}
                    style={{display:'flex',gap:10,padding:'11px 14px',borderBottom:'1px solid #F1F5F9',textDecoration:'none',background:actif?`${ORANGE}08`:'white',transition:'background 0.1s'}}>
                    <div style={{width:24,height:24,borderRadius:'50%',background:actif?ORANGE:'#F1F5F9',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,color:actif?'white':'#94A3B8',fontWeight:800,flexShrink:0}}>
                      {i+1}
                    </div>
                    <span style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:actif?ORANGE:'#374151',fontWeight:actif?800:400,lineHeight:1.4}}>
                      {l.titre}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <style>{`@media(max-width:768px){div[style*="grid-template-columns: 1fr 220px"]{grid-template-columns:1fr!important;}}`}</style>
    </div>
  );
}
