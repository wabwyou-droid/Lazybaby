import { useState, useEffect, useRef } from “react”;

/* ─── Constants ────────────────────────────────────────────────── */
const SK = “bbt-v4”;
const TYPES = {
uyku:     { label:“Uyku”,     emoji:“🌙”, color:”#8B7FD4”, bg:”#F0EEFF”, glow:“rgba(139,127,212,0.3)” },
beslenme: { label:“Beslenme”, emoji:“🍼”, color:”#F5924E”, bg:”#FFF3EB”, glow:“rgba(245,146,78,0.3)”  },
cis:      { label:“Çiş”,      emoji:“💧”, color:”#5BAAEE”, bg:”#EBF6FF”, glow:“rgba(91,170,238,0.3)”  },
gaz:      { label:“Gaz”,      emoji:“💨”, color:”#6BBF6B”, bg:”#EDFAED”, glow:“rgba(107,191,107,0.3)”  },
kaka:     { label:“Kaka”,     emoji:“🟤”, color:”#A87858”, bg:”#F7EEE6”, glow:“rgba(168,120,88,0.3)”  },
};
const DAYS_TR   = [“Paz”,“Pzt”,“Sal”,“Çar”,“Per”,“Cum”,“Cmt”];
const MONTHS_TR = [“Oca”,“Şub”,“Mar”,“Nis”,“May”,“Haz”,“Tem”,“Ağu”,“Eyl”,“Eki”,“Kas”,“Ara”];
const WAKE_WW = [
{maxW:6,  ideal:60,  max:75 },
{maxW:12, ideal:75,  max:100},
{maxW:16, ideal:90,  max:120},
{maxW:24, ideal:105, max:135},
{maxW:999,ideal:120, max:150},
];
const WHO = {
kilo:{weeks:[0,2,4,6,8,10,12,16,20,24],p3:[2.5,2.9,3.5,3.9,4.3,4.7,5.0,5.5,5.9,6.2],p50:[3.3,3.9,4.5,5.0,5.6,6.0,6.4,7.0,7.5,7.9],p97:[4.3,5.0,5.7,6.4,7.0,7.5,7.9,8.7,9.3,9.7],unit:“kg”,label:“Kilo”,emoji:“⚖️”,color:”#8B7FD4”},
boy: {weeks:[0,2,4,6,8,10,12,16,20,24],p3:[46,48,51,53,54,56,58,60,62,64],p50:[50,52,55,57,58,60,61,64,66,68],p97:[54,56,59,61,62,64,66,68,70,72],unit:“cm”,label:“Boy”,emoji:“📏”,color:”#F5924E”},
bas: {weeks:[0,2,4,6,8,10,12,16,20,24],p3:[32,33,35,36,37,38,39,40,41,42],p50:[35,36,37,38,40,41,41,43,44,45],p97:[37,38,40,41,42,43,44,45,46,47],unit:“cm”,label:“Baş”,emoji:“🔵”,color:”#5BAAEE”},
};

/* ─── Helpers ──────────────────────────────────────────────────── */
function dateKey(d) { return d.toISOString().slice(0,10); }
function todayK()   { return dateKey(new Date()); }
function fmtT(iso)  { return new Date(iso).toLocaleTimeString(“tr-TR”,{hour:“2-digit”,minute:“2-digit”}); }
function fmtMs(ms)  { const m=Math.floor(ms/60000); return m<60?`${m}dk`:`${Math.floor(m/60)}s ${m%60}dk`; }
function nDays(n)   { return Array.from({length:n},(_,i)=>{ const d=new Date(); d.setDate(d.getDate()-i); return dateKey(d); }); }
function getWW(w)   { return WAKE_WW.find(x=>w<=x.maxW)||WAKE_WW[WAKE_WW.length-1]; }
function ls(k,fb)   { try{const v=localStorage.getItem(k); return v?JSON.parse(v):fb;}catch{return fb;} }
function lss(k,v)   { try{localStorage.setItem(k,JSON.stringify(v));}catch{} }

/* ─── CSS ──────────────────────────────────────────────────────── */
const CSS = `@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Comfortaa:wght@700&display=swap'); *{box-sizing:border-box;margin:0;padding:0;} html,body{background:#E8E0F0;font-family:'Nunito',sans-serif;} .shell{width:100%;max-width:480px;margin:0 auto;min-height:100vh;background:#FFF9F5;position:relative;overflow:hidden;} @media(min-width:500px){.shell{box-shadow:0 0 60px rgba(90,62,90,0.2);}} .btn{border:none;cursor:pointer;font-family:inherit;transition:transform .15s;} .btn:active{transform:scale(0.93);} .card{background:white;border-radius:20px;box-shadow:0 2px 16px rgba(120,90,140,0.07);} .dscroll{display:flex;gap:7px;overflow-x:auto;padding:0 16px 16px;scrollbar-width:none;} .dscroll::-webkit-scrollbar{display:none;} .tab{flex:1;padding:10px 4px;border:none;cursor:pointer;font-family:inherit;font-weight:800;font-size:16px;transition:all .2s;} .abtn{border-radius:16px;padding:13px 12px;font-weight:800;font-size:13px;display:flex;align-items:center;gap:8px;border:none;cursor:pointer;font-family:inherit;transition:transform .15s;} .abtn:active{transform:scale(0.93);} .ov{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(50,20,50,.4);display:flex;align-items:flex-end;justify-content:center;z-index:999;backdrop-filter:blur(5px);} .mb{background:white;border-radius:24px 24px 0 0;padding:28px 22px 44px;width:100%;max-width:480px;animation:sup .25s ease;} .fi{animation:fin .3s ease;} .pi{animation:pin .35s cubic-bezier(.34,1.56,.64,1);} .pu{animation:pul 1.5s ease-in-out infinite;} @keyframes fin{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}} @keyframes pin{from{opacity:0;transform:scale(.87)}to{opacity:1;transform:scale(1)}} @keyframes sup{from{transform:translateY(100%)}to{transform:translateY(0)}} @keyframes pul{0%,100%{opacity:1}50%{opacity:.35}} @keyframes flt{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}} @keyframes bbl{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-5px) rotate(1deg)}} @keyframes twk{0%,100%{opacity:.9;transform:scale(1)}50%{opacity:.2;transform:scale(.5)}} @keyframes zup{0%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-18px)}} @keyframes spk{0%{transform:rotate(var(--a)) translateX(0);opacity:1}100%{transform:rotate(var(--a)) translateX(26px);opacity:0}}`;

/* ─── Baby Illustration ─────────────────────────────────────────── */
function Baby({sleeping}) {
return (
<div style={{position:“relative”,width:190,height:126,margin:“0 auto”,flexShrink:0}}>
{/* stars */}
{[[8,6,.9,0],[172,10,.8,.8],[4,52,1,1.5],[180,44,1,.4],[152,4,.7,1.1]].map(([x,y,s,d],i)=>(
<div key={i} style={{position:“absolute”,left:x,top:y,width:s*7,height:s*7,borderRadius:“50%”,background:”#FFE082”,
animation:`twk ${1.6+d}s ease-in-out ${d}s infinite`,opacity:.85}}/>
))}
{/* moon */}
<div style={{position:“absolute”,left:“50%”,top:34,transform:“translateX(-50%)”,
width:96,height:76,background:“linear-gradient(135deg,#FFE082,#FFD54F)”,
borderRadius:“50%”,animation:“flt 4s ease-in-out infinite”,
boxShadow:“0 6px 20px rgba(255,200,0,.25)”}}/>
{/* baby */}
<div style={{position:“absolute”,left:“50%”,top:16,transform:“translateX(-50%)”,
animation:“bbl 3s ease-in-out infinite”,width:76,textAlign:“center”}}>
{/* head */}
<div style={{width:54,height:54,borderRadius:“50%”,background:“linear-gradient(160deg,#FFCCBC,#FFAB91)”,
margin:“0 auto”,position:“relative”,boxShadow:“0 3px 10px rgba(255,120,60,.15)”}}>
<div style={{position:“absolute”,top:-3,left:“50%”,transform:“translateX(-50%)”,fontSize:14}}>🌀</div>
<div style={{position:“absolute”,left:5,top:28,width:11,height:7,borderRadius:“50%”,background:”#FFAB91”,opacity:.65}}/>
<div style={{position:“absolute”,right:5,top:28,width:11,height:7,borderRadius:“50%”,background:”#FFAB91”,opacity:.65}}/>
<div style={{position:“absolute”,top:19,left:10,width:9,height:4,borderBottom:“2.5px solid #795548”,borderRadius:“0 0 50% 50%”,transform:“scaleY(-1)”}}/>
<div style={{position:“absolute”,top:19,right:10,width:9,height:4,borderBottom:“2.5px solid #795548”,borderRadius:“0 0 50% 50%”,transform:“scaleY(-1)”}}/>
<div style={{position:“absolute”,bottom:9,left:“50%”,transform:“translateX(-50%)”,width:13,height:6,borderBottom:“2px solid #E64A19”,borderRadius:“0 0 50% 50%”,opacity:.75}}/>
</div>
{/* body */}
<div style={{width:50,height:26,borderRadius:“40% 40% 50% 50%”,background:“linear-gradient(160deg,#E1BEE7,#CE93D8)”,margin:”-3px auto 0”}}/>
{/* blanket */}
<div style={{width:62,height:14,borderRadius:16,background:“linear-gradient(135deg,#CE93D8,#BA68C8)”,margin:”-3px auto 0”,opacity:.9}}/>
</div>
{/* zzz */}
{sleeping&&<>
<div style={{position:“absolute”,right:28,top:18,fontWeight:900,fontSize:12,color:”#8B7FD4”,animation:“zup 2s ease-in-out infinite”}}>z</div>
<div style={{position:“absolute”,right:16,top:8, fontWeight:900,fontSize:15,color:”#8B7FD4”,animation:“zup 2s ease-in-out .5s infinite”}}>z</div>
<div style={{position:“absolute”,right:2, top:-1,fontWeight:900,fontSize:19,color:”#8B7FD4”,animation:“zup 2s ease-in-out 1s infinite”}}>Z</div>
</>}
</div>
);
}

/* ─── Sparkle ──────────────────────────────────────────────────── */
function Sparkle({x,y,color,onDone}) {
useEffect(()=>{const t=setTimeout(onDone,700);return()=>clearTimeout(t);},[]);
return (
<div style={{position:“fixed”,left:x,top:y,pointerEvents:“none”,zIndex:1000}}>
{[0,45,90,135,180,225,270,315].map((a,i)=>(
<div key={i} style={{position:“absolute”,width:5,height:5,borderRadius:“50%”,background:color,
[”–a”]:a+“deg”,animation:`spk .6s ${i*.03}s ease-out forwards`}}/>
))}
</div>
);
}

/* ─── Timeline Chart ───────────────────────────────────────────── */
function Timeline({recs}) {
const W=320,TY=26,TH=18,DY=TY+TH+10;
const mx=m=>(m/1440)*W;
const sleeps=recs.filter(r=>r.type===“uyku”&&r.baslangic).map(r=>{
const s=new Date(r.baslangic),e=new Date(r.time);
const sm=s.getHours()*60+s.getMinutes(),em=e.getHours()*60+e.getMinutes();
return{sm,em:em<sm?1440:em};
});
const evts=recs.filter(r=>r.type!==“uyku”).map(r=>{const d=new Date(r.time);return{m:d.getHours()*60+d.getMinutes(),t:r.type};});
return (
<svg viewBox={`0 0 ${W} 56`} style={{width:“100%”,overflow:“visible”}}>
<rect x={0} y={TY} width={W} height={TH} rx={TH/2} fill="#F0EBF8"/>
{[0,4,8,12,16,20,24].map(h=>(
<g key={h}>
<line x1={mx(h*60)} y1={TY-3} x2={mx(h*60)} y2={TY+TH+3} stroke="#E8E0F0" strokeWidth={1}/>
{h<24&&<text x={mx(h*60)+1} y={TY-5} fontSize={6} fill="#C8B8D8" fontFamily="Nunito">{`${String(h).padStart(2,"0")}:00`}</text>}
</g>
))}
{sleeps.map((s,i)=><rect key={i} x={mx(s.sm)} y={TY} width={Math.max(3,mx(s.em-s.sm))} height={TH} rx={4} fill="#8B7FD4" opacity=".85"/>)}
{evts.map((e,i)=><circle key={i} cx={mx(e.m)} cy={DY} r={4} fill={TYPES[e.t].color} opacity=".9"/>)}
{[[”#8B7FD4”,“Uyku”],[”#F5924E”,“Beslenme”],[”#5BAAEE”,“Çiş”],[”#A87858”,“Kaka”]].map(([c,l],i)=>(
<g key={l} transform={`translate(${i*79},47)`}>
<circle cx={4} cy={0} r={3} fill={c}/>
<text x={9} y={4} fontSize={7} fill="#B0A0C0" fontFamily="Nunito" fontWeight="700">{l}</text>
</g>
))}
</svg>
);
}

/* ─── Bar Chart ────────────────────────────────────────────────── */
function Bars({data,color,unit=””,h=72}) {
const bw=28,g=8,max=Math.max(…data.map(d=>d.v),1);
return (
<svg viewBox={`0 0 ${data.length*(bw+g)-g} ${h+22}`} style={{width:“100%”,overflow:“visible”}}>
{data.map((d,i)=>{
const x=i*(bw+g),bh=Math.max(3,(d.v/max)*h),y=h-bh;
return (
<g key={i}>
<rect x={x} y={0} width={bw} height={h} rx={7} fill="#F5F0FC"/>
<rect x={x} y={y} width={bw} height={bh} rx={7} fill={d.today?color:color+“88”}/>
{d.v>0&&<text x={x+bw/2} y={y-4} textAnchor=“middle” fontSize={8} fontFamily=“Nunito” fontWeight=“800” fill={d.today?color:color+“BB”}>
{unit===“h”?(d.v>=60?`${Math.floor(d.v/60)}s`:d.v+“dk”):d.v}
</text>}
<text x={x+bw/2} y={h+14} textAnchor=“middle” fontSize={9} fontFamily=“Nunito” fontWeight={d.today?“800”:“600”} fill={d.today?color:”#C0B0C0”}>{d.lbl}</text>
{d.today&&<circle cx={x+bw/2} cy={h+20} r={2} fill={color}/>}
</g>
);
})}
</svg>
);
}

/* ─── Growth Chart ─────────────────────────────────────────────── */
function GrowthChart({metric,entries,weeks}) {
const ref=WHO[metric],W=290,H=110,P={l:28,r:8,t:10,b:24};
const cW=W-P.l-P.r,cH=H-P.t-P.b;
const maxW=Math.max(weeks+2,…ref.weeks);
const all=[…ref.p3,…ref.p97,…entries.map(e=>e[metric]).filter(Boolean)];
const minV=Math.min(…all)*.97,maxV=Math.max(…all)*1.03;
const xo=w=>P.l+(w/maxW)*cW, yo=v=>P.t+cH-((v-minV)/(maxV-minV))*cH;
const poly=arr=>arr.map((v,i)=>`${xo(ref.weeks[i])},${yo(v)}`).join(” “);
const pts=entries.filter(e=>e[metric]!=null).sort((a,b)=>a.hafta-b.hafta).map(e=>({x:xo(e.hafta),y:yo(e[metric])}));
const range=maxV-minV,step=range>5?2:range>2?1:.5;
const ticks=[];for(let v=Math.ceil(minV/step)*step;v<=maxV;v+=step)ticks.push(v);
return (
<svg viewBox={`0 0 ${W} ${H}`} style={{width:“100%”,overflow:“visible”}}>
<polygon points={[…ref.weeks.map((w,i)=>`${xo(w)},${yo(ref.p97[i])}`),
…[…ref.weeks].reverse().map((w,i,a)=>`${xo(w)},${yo(ref.p3[a.length-1-i])}`)].join(” “)} fill={ref.color+“18”}/>
<polyline points={poly(ref.p97)} fill=“none” stroke={ref.color+“55”} strokeWidth={1} strokeDasharray=“3,3”/>
<polyline points={poly(ref.p50)} fill=“none” stroke={ref.color+“99”} strokeWidth={1.5} strokeDasharray=“4,2”/>
<polyline points={poly(ref.p3)}  fill=“none” stroke={ref.color+“55”} strokeWidth={1} strokeDasharray=“3,3”/>
{ticks.map(v=>(<g key={v}><line x1={P.l-2} y1={yo(v)} x2={P.l} y2={yo(v)} stroke="#DDD" strokeWidth={1}/><text x={P.l-4} y={yo(v)+3} textAnchor="end" fontSize={7} fill="#C0B0D0" fontFamily="Nunito">{v}</text></g>))}
{[0,4,8,12,16,20,24].filter(w=>w<=maxW).map(w=>(<g key={w}><text x={xo(w)} y={P.t+cH+12} textAnchor="middle" fontSize={7} fill="#C0B0D0" fontFamily="Nunito">{w}h</text></g>))}
{pts.length>1&&<polyline points={pts.map(p=>`${p.x},${p.y}`).join(” “)} fill=“none” stroke={ref.color} strokeWidth={2} strokeLinejoin=“round”/>}
{pts.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r={4} fill={ref.color} stroke="white" strokeWidth={1.5}/>)}
</svg>
);
}

/* ─── Wake Window Card ──────────────────────────────────────────── */
function WakeCard({recs,activeUyku,now,weeks}) {
const ww=getWW(weeks);
const moodEmoji={happy:“😊”,sleepy:“😴”,tired:“🥱”,overtired:“😫”};
if(activeUyku) {
return (
<div style={{background:“linear-gradient(135deg,#EDE7FF,#E1D5F8)”,borderRadius:20,padding:“14px 16px”,display:“flex”,alignItems:“center”,gap:12}}>
<div style={{fontSize:40}}>😴</div>
<div>
<div style={{fontSize:9,fontWeight:800,letterSpacing:2,color:”#8B7FD4”,textTransform:“uppercase”}}>Şu an uyuyor</div>
<div style={{fontWeight:900,fontSize:20,color:”#5A3E8A”}}>{fmtMs(now-new Date(activeUyku).getTime())}</div>
<div style={{fontSize:11,color:”#9C80CC”,marginTop:2}}>başlangıç: {fmtT(activeUyku)}</div>
</div>
<div style={{marginLeft:“auto”,fontWeight:900,fontSize:22,color:”#8B7FD4”,animation:“zup 2s ease-in-out infinite”}}>💤</div>
</div>
);
}
const last=recs.filter(r=>r.type===“uyku”&&r.time).sort((a,b)=>new Date(b.time)-new Date(a.time))[0];
if(!last) return <div className=“card” style={{padding:“14px 16px”,display:“flex”,alignItems:“center”,gap:12}}><div style={{fontSize:32}}>😊</div><div style={{fontSize:12,color:”#B0A0C0”}}>Henüz uyku kaydı yok</div></div>;
const awMs=now-new Date(last.time).getTime(), awM=Math.floor(awMs/60000);
const pct=Math.min(100,(awM/ww.max)*100), idealPct=(ww.ideal/ww.max)*100;
let mood,barCol,status,hint;
if(awM<ww.ideal*.7){mood=“happy”;barCol=”#52C97A”;status=“😊 Dinç”;hint=`İdeal uyku ~${ww.ideal} dk sonra`;}
else if(awM<ww.ideal){mood=“sleepy”;barCol=”#A8E063”;status=“🙂 İyi”;hint=“Uyku vakti yaklaşıyor”;}
else if(awM<ww.max){mood=“tired”;barCol=”#FFB347”;status=“😴 Yorgun”;hint=“Uyutma vakti!”;}
else{mood=“overtired”;barCol=”#FF6B6B”;status=“😫 Çok yorgun”;hint=“Maksimum aşıldı”;}
const sleepAt=new Date(new Date(last.time).getTime()+ww.ideal*60000);
return (
<div className=“card” style={{padding:“14px 16px”}}>
<div style={{display:“flex”,alignItems:“center”,gap:12}}>
<div style={{fontSize:44}}>{moodEmoji[mood]}</div>
<div style={{flex:1}}>
<div style={{fontSize:9,fontWeight:800,letterSpacing:1.5,color:”#C0B0D0”,textTransform:“uppercase”}}>Uyanıklık</div>
<div style={{fontWeight:900,fontSize:22,color:”#3A2A3A”,lineHeight:1}}>{fmtMs(awMs)}</div>
<div style={{fontSize:11,color:”#9C7C9C”,marginTop:2}}>{status}</div>
</div>
<div style={{textAlign:“right”}}>
<div style={{fontSize:9,fontWeight:800,color:”#C0B0D0”,textTransform:“uppercase”}}>🎯 Uyku tahmini</div>
<div style={{fontWeight:900,fontSize:18,color:”#8B7FD4”,lineHeight:1.2,marginTop:2}}>{fmtT(sleepAt.toISOString())}</div>
<div style={{fontSize:10,color:”#C0B0D0”}}>{awM>=ww.ideal?“Şimdi”:ww.ideal-awM+” dk kaldı”}</div>
</div>
</div>
<div style={{position:“relative”,height:9,background:”#F0EBF8”,borderRadius:9,overflow:“hidden”,marginTop:12}}>
<div style={{height:“100%”,width:`${pct}%`,background:`linear-gradient(90deg,${barCol}88,${barCol})`,borderRadius:9,transition:“width .6s ease”}}/>
</div>
<div style={{position:“relative”,height:0}}>
<div style={{position:“absolute”,bottom:0,left:`${idealPct}%`,transform:“translateX(-50%) translateY(-21px)”,width:2,height:13,background:”#8B7FD4”,borderRadius:2}}/>
</div>
<div style={{display:“flex”,justifyContent:“space-between”,marginTop:5}}>
<span style={{fontSize:9,color:”#D0C0E0”}}>0</span>
<span style={{fontSize:9,color:”#8B7FD4”,fontWeight:800}}>İdeal: {ww.ideal}dk</span>
<span style={{fontSize:9,color:”#D0C0E0”}}>Max: {ww.max}dk</span>
</div>
<div style={{fontSize:10,color:”#9C7C9C”,marginTop:4,fontStyle:“italic”}}>{hint}</div>
</div>
);
}

/* ─── Weekly Stats ──────────────────────────────────────────────── */
function Weekly({recs}) {
const [off,setOff]=useState(0);
const L=[“Pzt”,“Sal”,“Çar”,“Per”,“Cum”,“Cmt”,“Paz”];
function wDays(o){
const days=[],t=new Date(),dow=t.getDay(),md=dow===0?-6:1-dow;
for(let i=0;i<7;i++){const d=new Date(t);d.setDate(t.getDate()+md+i+o*7);days.push(dateKey(d));}
return days;
}
const wd=wDays(off),tk=todayK();
function ds(k){
const r=recs.filter(x=>x.time.slice(0,10)===k);
return{u:r.filter(x=>x.type===“uyku”).reduce((s,x)=>s+(x.sure||0),0),b:r.filter(x=>x.type===“beslenme”).length,z:r.filter(x=>x.type===“cis”||x.type===“kaka”).length};
}
const st=wd.map((k,i)=>({k,lbl:L[i],today:k===tk,…ds(k)}));
const act=st.filter(s=>s.u>0||s.b>0);
const avgU=act.length?Math.round(act.reduce((s,d)=>s+d.u,0)/act.length):0;
const avgB=act.length?(act.reduce((s,d)=>s+d.b,0)/act.length).toFixed(1):”—”;
const avgZ=act.length?(act.reduce((s,d)=>s+d.z,0)/act.length).toFixed(1):”—”;
const best=st.filter(s=>s.u>0).reduce((a,b)=>a.u>b.u?a:b,{u:0});
const tw=wDays(0).map(k=>ds(k)),lw=wDays(-1).map(k=>ds(k));
const delta=tw.reduce((s,d)=>s+d.u,0)/7-lw.reduce((s,d)=>s+d.u,0)/7;
const ws=new Date(wd[0]+“T12:00:00”),we=new Date(wd[6]+“T12:00:00”);
const wlbl=off===0?“Bu Hafta”:off===-1?“Geçen Hafta”:`${ws.getDate()} ${MONTHS_TR[ws.getMonth()]}–${we.getDate()} ${MONTHS_TR[we.getMonth()]}`;
return (
<div className=“fi” style={{display:“flex”,flexDirection:“column”,gap:12}}>
<div style={{display:“flex”,alignItems:“center”,justifyContent:“space-between”}}>
<button className=“btn” onClick={()=>setOff(o=>o-1)} style={{background:”#F0EEFF”,color:”#8B7FD4”,borderRadius:12,padding:“7px 14px”,fontWeight:800,fontSize:14}}>‹</button>
<div style={{fontWeight:800,fontSize:14,color:”#5A3E5A”}}>{wlbl}</div>
<button className=“btn” onClick={()=>setOff(o=>Math.min(0,o+1))} disabled={off>=0} style={{background:off<0?”#F0EEFF”:”#EEE”,color:off<0?”#8B7FD4”:”#CCC”,borderRadius:12,padding:“7px 14px”,fontWeight:800,fontSize:14}}>›</button>
</div>
<div style={{display:“flex”,gap:8}}>
{[{e:“🌙”,l:“Ort. Uyku”,c:”#8B7FD4”,v:avgU?`${Math.floor(avgU/60)}s ${avgU%60}dk`:”—”},{e:“🍼”,l:“Ort. Beslenme”,c:”#F5924E”,v:avgB},{e:“🚿”,l:“Ort. Bez”,c:”#5BAAEE”,v:avgZ}].map(x=>(
<div key={x.l} className=“card” style={{flex:1,padding:“10px 6px”,textAlign:“center”}}>
<div style={{fontSize:18}}>{x.e}</div>
<div style={{fontWeight:900,fontSize:13,color:x.c,lineHeight:1.1,marginTop:2}}>{x.v}</div>
<div style={{fontSize:9,color:”#C0B0C0”,fontWeight:700,marginTop:1}}>{x.l}</div>
</div>
))}
</div>
{[{lbl:“🌙 Günlük Uyku”,col:”#8B7FD4”,data:st.map(s=>({v:s.u,lbl:s.lbl,today:s.today})),unit:“h”},
{lbl:“🍼 Günlük Beslenme”,col:”#F5924E”,data:st.map(s=>({v:s.b,lbl:s.lbl,today:s.today}))},
{lbl:“💧 Günlük Bez”,col:”#5BAAEE”,data:st.map(s=>({v:s.z,lbl:s.lbl,today:s.today}))},
].map(({lbl,col,data,unit})=>(
<div key={lbl} className=“card” style={{padding:“14px 14px 10px”}}>
<div style={{fontSize:10,fontWeight:800,color:”#9C7C9C”,letterSpacing:1,textTransform:“uppercase”,marginBottom:12}}>{lbl}</div>
<Bars data={data} color={col} unit={unit||””}/>
</div>
))}
{best.u>0&&<div style={{background:“linear-gradient(135deg,#FFF8E1,#FFF3CD)”,borderRadius:16,padding:“11px 14px”,fontSize:12,color:”#8B6914”}}>✨ En iyi uyku: <strong>{best.lbl}</strong> — {Math.floor(best.u/60)}s {best.u%60}dk</div>}
{off===0&&lw.reduce((s,d)=>s+d.u,0)>0&&(
<div style={{background:delta>=0?”#F0FFF4”:”#FFF5F5”,borderRadius:16,padding:“11px 14px”,display:“flex”,alignItems:“center”,gap:10}}>
<div style={{fontSize:22}}>{delta>=0?“📈”:“📉”}</div>
<div>
<div style={{fontSize:12,fontWeight:800,color:delta>=0?”#2D7D4F”:”#C0392B”}}>{delta>=0?“Uyku iyileşiyor! 🎉”:“Uyku azaldı”}</div>
<div style={{fontSize:11,color:”#9C7C9C”,marginTop:1}}>Geçen haftaya göre ~{Math.abs(Math.round(delta))} dk {delta>=0?“fazla”:“az”}</div>
</div>
</div>
)}
</div>
);
}

/* ─── Growth Tracker ────────────────────────────────────────────── */
function Growth({grecs,onAdd,onDel,weeks}) {
const [m,setM]=useState(“kilo”);
const [show,setShow]=useState(false);
const [form,setForm]=useState({hafta:String(weeks),kilo:””,boy:””,bas:””,tarih:todayK()});
function submit(){
const e={id:Date.now(),tarih:form.tarih||todayK(),hafta:parseInt(form.hafta)||weeks,
kilo:form.kilo?parseFloat(form.kilo):null,boy:form.boy?parseFloat(form.boy):null,bas:form.bas?parseFloat(form.bas):null};
if(!e.kilo&&!e.boy&&!e.bas)return;
onAdd(e);setShow(false);setForm({hafta:String(weeks),kilo:””,boy:””,bas:””,tarih:todayK()});
}
function pct(val,wk,key){
const d=WHO[key],idx=d.weeks.findIndex(w=>w>=wk),i=idx<0?d.weeks.length-1:Math.max(0,idx);
if(val<=d.p3[i])return”3. prs altı ⚠️”; if(val<=d.p50[i])return`~${Math.round(3+(val-d.p3[i])/(d.p50[i]-d.p3[i])*47)}. prs`;
if(val<=d.p97[i])return`~${Math.round(50+(val-d.p50[i])/(d.p97[i]-d.p50[i])*47)}. prs`; return”97. prs üstü”;
}
const sorted=[…grecs].sort((a,b)=>b.hafta-a.hafta),latest=sorted[0];
return (
<div className=“fi” style={{display:“flex”,flexDirection:“column”,gap:12}}>
{latest&&<div style={{display:“flex”,gap:8}}>
{[[“kilo”,“⚖️”,”#8B7FD4”],[“boy”,“📏”,”#F5924E”],[“bas”,“🔵”,”#5BAAEE”]].map(([k,e,c])=>latest[k]&&(
<div key={k} className=“card” style={{flex:1,padding:“10px 8px”,textAlign:“center”}}>
<div style={{fontSize:16}}>{e}</div>
<div style={{fontWeight:900,fontSize:14,color:c}}>{latest[k]} {WHO[k].unit}</div>
<div style={{fontSize:9,color:”#B0A0C0”,marginTop:2}}>{pct(latest[k],latest.hafta,k)}</div>
</div>
))}
</div>}
<div className=“card” style={{padding:“14px”}}>
<div style={{display:“flex”,gap:6,marginBottom:14}}>
{Object.entries(WHO).map(([k,v])=>(
<button key={k} className=“btn” style={{flex:1,padding:“7px 4px”,borderRadius:10,fontWeight:700,fontSize:10,background:m===k?v.color:”#F5F0FC”,color:m===k?“white”:”#9C7C9C”}} onClick={()=>setM(k)}>{v.emoji} {v.label}</button>
))}
</div>
{grecs.filter(e=>e[m]!=null).length===0
?<div style={{textAlign:“center”,color:”#C0A0C0”,padding:“18px 0”,fontSize:12}}><div style={{fontSize:26,marginBottom:4}}>📊</div>Henüz {WHO[m].label.toLowerCase()} ölçümü yok</div>
:<><GrowthChart metric={m} entries={grecs} weeks={weeks}/><div style={{fontSize:9,color:”#C0B0D0”,marginTop:5,textAlign:“center”}}>Gölgeli alan: WHO 3.–97. persentil</div></>}
</div>
{show?(
<div className=“card” style={{padding:“16px”}}>
<div style={{fontWeight:800,fontSize:14,color:”#5A3E5A”,marginBottom:12}}>➕ Ölçüm Ekle</div>
<div style={{display:“flex”,gap:8,marginBottom:10}}>
<div style={{flex:1}}><div style={{fontSize:10,fontWeight:700,color:”#9C7C9C”,marginBottom:3}}>HAFTA</div>
<input type=“number” value={form.hafta} onChange={e=>setForm(f=>({…f,hafta:e.target.value}))} style={{width:“100%”,border:“2px solid #F0E0F0”,borderRadius:10,padding:“9px 10px”,fontSize:14,outline:“none”,fontFamily:“Nunito”}}/></div>
<div style={{flex:1.5}}><div style={{fontSize:10,fontWeight:700,color:”#9C7C9C”,marginBottom:3}}>TARİH</div>
<input type=“date” value={form.tarih} onChange={e=>setForm(f=>({…f,tarih:e.target.value}))} style={{width:“100%”,border:“2px solid #F0E0F0”,borderRadius:10,padding:“9px 10px”,fontSize:13,outline:“none”,fontFamily:“Nunito”}}/></div>
</div>
<div style={{display:“flex”,gap:8,marginBottom:12}}>
{[[“kilo”,“⚖️ Kilo”,”#8B7FD4”],[“boy”,“📏 Boy”,”#F5924E”],[“bas”,“🔵 Baş”,”#5BAAEE”]].map(([k,l,c])=>(
<div key={k} style={{flex:1}}><div style={{fontSize:9,fontWeight:700,color:c,marginBottom:3}}>{l}</div>
<input type=“number” step=“0.01” placeholder=”—” value={form[k]} onChange={e=>setForm(f=>({…f,[k]:e.target.value}))}
style={{width:“100%”,border:`2px solid ${c}44`,borderRadius:10,padding:“9px 8px”,fontSize:14,outline:“none”,fontFamily:“Nunito”,color:c,fontWeight:700}}/></div>
))}
</div>
<div style={{display:“flex”,gap:8}}>
<button className=“btn” onClick={()=>setShow(false)} style={{flex:1,padding:“11px”,borderRadius:12,background:”#F5F0FC”,color:”#9C7C9C”,fontWeight:700,fontSize:13}}>İptal</button>
<button className=“btn” onClick={submit} style={{flex:2,padding:“11px”,borderRadius:12,background:“linear-gradient(135deg,#8B7FD4,#6B5FB4)”,color:“white”,fontWeight:800,fontSize:13}}>Kaydet</button>
</div>
</div>
):(
<button className=“btn” onClick={()=>setShow(true)} style={{width:“100%”,padding:“13px”,borderRadius:16,background:“white”,border:“2.5px dashed #D8C8E8”,color:”#9C7C9C”,fontWeight:700,fontSize:13}}>
✨ Yeni Ölçüm Ekle
</button>
)}
{sorted.length>0&&(
<div className=“card” style={{padding:“14px”}}>
<div style={{fontSize:10,fontWeight:800,color:”#9C7C9C”,letterSpacing:1,textTransform:“uppercase”,marginBottom:10}}>Geçmiş</div>
{sorted.map((e,i)=>(
<div key={e.id} style={{display:“flex”,alignItems:“center”,gap:10,padding:“8px 0”,borderBottom:i<sorted.length-1?“1px solid #F8F4FF”:“none”}}>
<div style={{width:34,height:34,borderRadius:10,background:“linear-gradient(135deg,#EDE7FF,#E1D5F8)”,display:“flex”,alignItems:“center”,justifyContent:“center”,fontWeight:800,fontSize:11,color:”#8B7FD4”,flexShrink:0}}>{e.hafta}h</div>
<div style={{flex:1}}>
<div style={{display:“flex”,gap:8,flexWrap:“wrap”}}>
{e.kilo&&<span style={{fontSize:12,fontWeight:700,color:”#8B7FD4”}}>⚖️ {e.kilo}kg</span>}
{e.boy&&<span style={{fontSize:12,fontWeight:700,color:”#F5924E”}}>📏 {e.boy}cm</span>}
{e.bas&&<span style={{fontSize:12,fontWeight:700,color:”#5BAAEE”}}>🔵 {e.bas}cm</span>}
</div>
<div style={{fontSize:10,color:”#C0B0C0”,marginTop:1}}>{new Date(e.tarih+“T12:00:00”).toLocaleDateString(“tr-TR”,{day:“numeric”,month:“long”})}</div>
</div>
{i>0&&e.kilo&&sorted[i-1].kilo&&<div style={{fontSize:10,fontWeight:700,color:e.kilo>sorted[i-1].kilo?”#52C97A”:”#FF6B6B”}}>{e.kilo>sorted[i-1].kilo?“▲”:“▼”} {Math.abs((e.kilo-sorted[i-1].kilo)*1000).toFixed(0)}g</div>}
<button className=“btn” onClick={()=>onDel(e.id)} style={{color:”#DDD”,fontSize:14,background:“none”,padding:“0 2px”}}>✕</button>
</div>
))}
</div>
)}
</div>
);
}

/* ─── AI Assistant ──────────────────────────────────────────────── */
function AI({recs,grecs,weeks,activeUyku}) {
const [msgs,setMsgs]=useState([{role:“assistant”,text:`Merhaba! 👶✨ Rena'nın kayıtlarına bakarak sorularınızı yanıtlayabilirim. Ne öğrenmek istersiniz?`}]);
const [inp,setInp]=useState(””);
const [loading,setLoading]=useState(false);
const bot=useRef(null);
useEffect(()=>{bot.current?.scrollIntoView({behavior:“smooth”});},[msgs]);
function ctx(){
const d7=nDays(7).map(k=>{
const r=recs.filter(x=>x.time.slice(0,10)===k);
const um=r.filter(x=>x.type===“uyku”).reduce((s,x)=>s+(x.sure||0),0);
const b=r.filter(x=>x.type===“beslenme”).length,cis=r.filter(x=>x.type===“cis”).length,kk=r.filter(x=>x.type===“kaka”).length;
const dd=new Date(k+“T12:00:00”);
return `${dd.getDate()} ${MONTHS_TR[dd.getMonth()]}: uyku ${Math.floor(um/60)}s${um%60}dk, beslenme ${b}x, çiş ${cis}, kaka ${kk}`;
}).join(”\n”);
const gr=grecs.length>0?”\n\nBüyüme:\n”+[…grecs].sort((a,b)=>b.hafta-a.hafta).slice(0,4).map(e=>`${e.hafta}h: ${e.kilo?e.kilo+"kg":""}${e.boy?" "+e.boy+"cm":""}${e.bas?" baş"+e.bas+"cm":""}`).join(”\n”):””;
const sw=activeUyku?`\nŞu an uyuyor (${Math.round((Date.now()-new Date(activeUyku).getTime())/60000)} dk)`:
(()=>{const l=recs.filter(r=>r.type===“uyku”).sort((a,b)=>new Date(b.time)-new Date(a.time))[0];return l?`\nSon uykudan ${Math.round((Date.now()-new Date(l.time).getTime())/60000)} dk geçti`:””})();
return `Sen yenidoğan bakım asistanısın. Türkçe, sıcak ve pratik yanıt ver. Kısa madde madde yaz. Tıbbi tavsiye değil genel rehberlik.\n\nBebek adı Rena, ${weeks} haftalık.${sw}\n\nSon 7 gün:\n${d7}${gr}`;
}
async function send(txt){
const msg=(txt||inp).trim();if(!msg||loading)return;
setInp(””);setMsgs(m=>[…m,{role:“user”,text:msg}]);setLoading(true);
try{
const res=await fetch(“https://api.anthropic.com/v1/messages”,{method:“POST”,headers:{“Content-Type”:“application/json”},body:JSON.stringify({model:“claude-sonnet-4-20250514”,max_tokens:900,system:ctx(),messages:[…msgs.filter(x=>x.role!==“system”).slice(-6).map(x=>({role:x.role,content:x.text})),{role:“user”,content:msg}]})});
const data=await res.json();
setMsgs(m=>[…m,{role:“assistant”,text:data.content?.[0]?.text||“Hata oluştu.”}]);
}catch{setMsgs(m=>[…m,{role:“assistant”,text:“Bağlantı hatası.”}]);}
setLoading(false);
}
const QS=[“Bugünü analiz et 📊”,“Uyku düzenim nasıl? 🌙”,“Beslenme yeterli mi? 🍼”,“Bu haftayı değerlendir 📈”,“Bez sayısı normal mi? 💧”,“Ne zaman uyutmalıyım? 🎯”];
function Bubble({msg}){
const ai=msg.role===“assistant”;
const lines=msg.text.split(”\n”).filter(Boolean);
return(
<div style={{display:“flex”,gap:8,justifyContent:ai?“flex-start”:“flex-end”,marginBottom:10,animation:“pin .3s ease”}}>
{ai&&<div style={{width:30,height:30,borderRadius:“50%”,background:“linear-gradient(135deg,#8B7FD4,#6B5FB4)”,display:“flex”,alignItems:“center”,justifyContent:“center”,fontSize:14,flexShrink:0,marginTop:2}}>✨</div>}
<div style={{maxWidth:“80%”,background:ai?“white”:“linear-gradient(135deg,#8B7FD4,#6B5FB4)”,borderRadius:ai?“6px 16px 16px 16px”:“16px 6px 16px 16px”,
padding:“10px 13px”,boxShadow:ai?“0 2px 10px rgba(120,90,140,.07)”:“0 4px 14px rgba(107,95,180,.28)”,color:ai?”#3A2A3A”:“white”}}>
{lines.map((ln,i)=>{
const bl=ln.startsWith(”- “)||ln.startsWith(”• “);
const tx=bl?ln.slice(2):ln;
const parts=tx.split(/**(.*?)**/g);
return(
<div key={i} style={{display:“flex”,gap:bl?5:0,marginBottom:i<lines.length-1?3:0,fontSize:13,lineHeight:1.5}}>
{bl&&<span style={{color:ai?”#8B7FD4”:“rgba(255,255,255,.7)”,fontWeight:800,flexShrink:0}}>•</span>}
<span>{parts.map((p,j)=>j%2===1?<strong key={j}>{p}</strong>:p)}</span>
</div>
);
})}
</div>
</div>
);
}
return(
<div className=“fi” style={{display:“flex”,flexDirection:“column”,height:“calc(100vh - 360px)”,minHeight:360}}>
<div style={{display:“flex”,gap:6,overflowX:“auto”,paddingBottom:10,scrollbarWidth:“none”}}>
{QS.map(q=><button key={q} className=“btn” onClick={()=>send(q)} style={{flexShrink:0,background:“white”,border:“2px solid #EDE7FF”,borderRadius:12,padding:“6px 11px”,fontSize:11,fontWeight:700,color:”#8B7FD4”,whiteSpace:“nowrap”}}>{q}</button>)}
</div>
<div style={{flex:1,overflowY:“auto”,padding:“2px 0 8px”,scrollbarWidth:“none”}}>
{msgs.map((m,i)=><Bubble key={i} msg={m}/>)}
{loading&&<div style={{display:“flex”,gap:8,alignItems:“center”,marginBottom:10}}>
<div style={{width:30,height:30,borderRadius:“50%”,background:“linear-gradient(135deg,#8B7FD4,#6B5FB4)”,display:“flex”,alignItems:“center”,justifyContent:“center”,fontSize:14}}>✨</div>
<div style={{background:“white”,borderRadius:“6px 16px 16px 16px”,padding:“11px 14px”,boxShadow:“0 2px 10px rgba(120,90,140,.07)”}}>
<div style={{display:“flex”,gap:4}}>{[0,.2,.4].map((d,i)=><div key={i} style={{width:6,height:6,borderRadius:“50%”,background:”#C4A8E0”,animation:`pul 1.2s ${d}s ease-in-out infinite`}}/>)}</div>
</div>
</div>}
<div ref={bot}/>
</div>
<div style={{display:“flex”,gap:8,paddingTop:8,borderTop:“2px solid #F5F0FA”}}>
<input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key===“Enter”&&send()}
placeholder=“Soru sorun…”
style={{flex:1,border:“2.5px solid #EDE7FF”,borderRadius:14,padding:“11px 13px”,fontSize:13,outline:“none”,fontFamily:“Nunito”,color:”#3A2A3A”,background:“white”}}/>
<button className=“btn” onClick={()=>send()} style={{width:42,height:42,borderRadius:12,background:“linear-gradient(135deg,#8B7FD4,#6B5FB4)”,color:“white”,fontSize:18,display:“flex”,alignItems:“center”,justifyContent:“center”,flexShrink:0,boxShadow:“0 4px 12px rgba(107,95,180,.32)”}}>↑</button>
</div>
</div>
);
}

/* ─── Record Item ──────────────────────────────────────────────── */
function RItem({r,onDel}) {
const t=TYPES[r.type];
let det=””;
if(r.type===“uyku”)det=r.sure!=null?`${Math.floor(r.sure/60)}s ${r.sure%60}dk uyudu`:””;
if(r.type===“beslenme”){
const tarafLbl=r.taraf===“sol”?“◀ Sol”:r.taraf===“sag”?“Sağ ▶”:r.taraf===“iki”?“↔ Her İkisi”:null;
det=[r.tur,tarafLbl,r.miktar?r.miktar+” ml”:null].filter(Boolean).join(” · “);
}
if(r.type===“gaz”){
const gazLbl={süper:“🏆 Süper Gaz! Adeta bir profesyonel”,iyi:“😌 Güzel çıktı, rahatlamış”,biraz:“🤏 Biraz çıktı”,zorlu:“😤 Zorlandı, gaz sancısı vardı”};
det=gazLbl[r.gazdurumu]||””;
}
if(r.type===“kaka”)det=r.renk?r.renk+” renk”:””;
const st=r.type===“uyku”&&r.baslangic?r.baslangic:r.time;
return(
<div className=“pi” style={{display:“flex”,alignItems:“center”,gap:12,padding:“12px 14px”,marginBottom:8,background:“white”,borderRadius:20,boxShadow:“0 2px 12px rgba(120,90,140,.05)”}}>
<div style={{width:42,height:42,borderRadius:14,background:t.bg,display:“flex”,alignItems:“center”,justifyContent:“center”,fontSize:21,flexShrink:0,boxShadow:`0 2px 8px ${t.glow}`}}>{t.emoji}</div>
<div style={{flex:1}}>
<div style={{fontWeight:800,fontSize:14,color:”#3A2A3A”}}>{t.label}</div>
{det&&<div style={{fontSize:11,color:”#B0A0B0”,marginTop:2}}>{det}</div>}
</div>
<div style={{textAlign:“right”,flexShrink:0}}>
<div style={{fontSize:13,fontWeight:800,color:t.color}}>{fmtT(st)}</div>
{r.type===“uyku”&&r.baslangic&&<div style={{fontSize:10,color:”#C0B0C0”}}>→ {fmtT(r.time)}</div>}
</div>
<button className=“btn” onClick={()=>onDel(r.id)} style={{color:”#DDD”,fontSize:15,background:“none”,padding:“0 2px”,flexShrink:0}}>✕</button>
</div>
);
}

/* ─── Main App ──────────────────────────────────────────────────── */
export default function App() {
const [recs,    setRecs]    = useState(()=>ls(SK,[]));
const [grecs,   setGrecs]   = useState(()=>ls(SK+”-g”,[]));
const [selDay,  setSelDay]  = useState(todayK());
const [tab,     setTab]     = useState(“liste”);
const [modal,   setModal]   = useState(null);
const [uyku,    setUyku]    = useState(()=>ls(SK+”-u”,null));
const [weeks,   setWeeks]   = useState(()=>ls(SK+”-w”,6));
const [form,    setForm]    = useState({});
const [now,     setNow]     = useState(Date.now());
const [showW,   setShowW]   = useState(false);
const [sparks,  setSparks]  = useState([]);

useEffect(()=>lss(SK,recs),[recs]);
useEffect(()=>lss(SK+”-g”,grecs),[grecs]);
useEffect(()=>lss(SK+”-u”,uyku),[uyku]);
useEffect(()=>lss(SK+”-w”,weeks),[weeks]);
useEffect(()=>{const t=setInterval(()=>setNow(Date.now()),15000);return()=>clearInterval(t);},[]);

const rDays=[…new Set(recs.map(r=>r.time.slice(0,10)))];
const allDays=[…new Set([…nDays(14),…rDays])].sort((a,b)=>b.localeCompare(a));
const dayRecs=recs.filter(r=>r.time.slice(0,10)===selDay).sort((a,b)=>new Date(b.time)-new Date(a.time));
const isToday=selDay===todayK();

function addRec(type,extra={},evt){
const r={id:Date.now(),type,time:new Date().toISOString(),…extra};
setRecs(p=>[r,…p]);setSelDay(todayK());
if(evt){const x=evt.clientX||200,y=evt.clientY||200,id=Date.now();setSparks(s=>[…s,{id,x,y,col:TYPES[type].color}]);}
}
function doUyku(evt){
if(uyku){const dur=Math.round((Date.now()-new Date(uyku).getTime())/60000);addRec(“uyku”,{baslangic:uyku,sure:dur},evt);setUyku(null);}
else{setUyku(new Date().toISOString());setSelDay(todayK());}
}
function delRec(id){setRecs(p=>p.filter(r=>r.id!==id));}

const uMin=dayRecs.filter(r=>r.type===“uyku”).reduce((s,r)=>s+(r.sure||0),0);
const bCnt=dayRecs.filter(r=>r.type===“beslenme”).length;
const cCnt=dayRecs.filter(r=>r.type===“cis”).length;
const kCnt=dayRecs.filter(r=>r.type===“kaka”).length;

function dlbl(k){const df=Math.round((new Date(todayK()+“T12:00:00”)-new Date(k+“T12:00:00”))/86400000);if(df===0)return”Bugün”;if(df===1)return”Dün”;return DAYS_TR[new Date(k+“T12:00:00”).getDay()];}
function hasR(k){return recs.some(r=>r.time.slice(0,10)===k);}

return (
<div style={{minHeight:“100vh”,background:”#E8E0F0”}}>
<style>{CSS}</style>
<div className="shell">
{/* ── HEADER ── */}
<div style={{background:“linear-gradient(160deg,#FFE8D6 0%,#F0E8FF 50%,#E8F4FF 100%)”}}>
<div style={{padding:“18px 18px 0”,display:“flex”,alignItems:“center”,justifyContent:“space-between”}}>
<div>
<div style={{fontSize:9,fontWeight:800,letterSpacing:3,color:”#C0A0A0”,textTransform:“uppercase”}}>Lazy Baby</div>
<div style={{fontFamily:”‘Comfortaa’,cursive”,fontSize:21,fontWeight:700,color:”#5A3E5A”,lineHeight:1.2}}>Rena’nın Takibi 🌸</div>
</div>
<button className=“btn” onClick={()=>setShowW(true)} style={{background:“rgba(255,255,255,.75)”,borderRadius:14,padding:“8px 12px”,textAlign:“center”,boxShadow:“0 2px 10px rgba(90,62,90,.1)”}}>
<div style={{fontSize:20}}>👶</div>
<div style={{fontSize:11,fontWeight:900,color:”#5A3E5A”}}>{weeks} hafta</div>
</button>
</div>
<div style={{display:“flex”,justifyContent:“center”,padding:“6px 0 2px”}}>
<Baby sleeping={!!uyku}/>
</div>
<div className="dscroll">
{allDays.map(k=>{
const sel=k===selDay,d=new Date(k+“T12:00:00”);
return(
<button key={k} style={{flexShrink:0,display:“flex”,flexDirection:“column”,alignItems:“center”,borderRadius:16,padding:“8px 10px 6px”,cursor:“pointer”,border:“none”,fontFamily:“Nunito”,minWidth:52,
background:sel?“linear-gradient(135deg,#8B7FD4,#6B5FB4)”:“rgba(255,255,255,.68)”,
color:sel?“white”:”#7A5A7A”,
boxShadow:sel?“0 5px 18px rgba(107,95,180,.38)”:“none”,
transform:sel?“scale(1.08)”:“scale(1)”,transition:“all .2s cubic-bezier(.34,1.56,.64,1)”}}
onClick={()=>setSelDay(k)}>
<span style={{fontSize:9,fontWeight:700,opacity:sel?.9:.6}}>{dlbl(k)}</span>
<span style={{fontSize:18,fontWeight:900,lineHeight:1.15,marginTop:1}}>{d.getDate()}</span>
<span style={{fontSize:8,fontWeight:600,opacity:.65,marginTop:1}}>{MONTHS_TR[d.getMonth()]}</span>
<span style={{width:5,height:5,borderRadius:“50%”,marginTop:4,background:hasR(k)?(sel?“rgba(255,255,255,.8)”:”#C896C8”):“transparent”}}/>
</button>
);
})}
</div>
</div>

```
    {/* ── STATS ── */}
    <div style={{display:"flex",gap:8,padding:"12px 16px 0"}}>
      {[{e:"🌙",v:uMin?`${Math.floor(uMin/60)}s ${uMin%60}dk`:"—",l:"Uyku",c:"#8B7FD4"},
        {e:"🍼",v:bCnt||"—",l:"Beslenme",c:"#F5924E"},
        {e:"💧",v:cCnt||"—",l:"Çiş",c:"#5BAAEE"},
        {e:"🟤",v:kCnt||"—",l:"Kaka",c:"#A87858"}].map((s,i)=>(
        <div key={s.l} className="card pi" style={{flex:"1 1 0",padding:"10px 5px",textAlign:"center",animationDelay:i*.06+"s"}}>
          <div style={{fontSize:16}}>{s.e}</div>
          <div style={{fontWeight:900,fontSize:13,color:s.c,lineHeight:1.2,marginTop:1}}>{s.v}</div>
          <div style={{fontSize:9,color:"#C0B0C0",fontWeight:700,marginTop:1}}>{s.l}</div>
        </div>
      ))}
    </div>

    {/* ── WAKE WINDOW ── */}
    {isToday&&<div style={{padding:"12px 16px 0"}}><WakeCard recs={recs} activeUyku={uyku} now={now} weeks={weeks}/></div>}

    {/* ── QUICK ACTIONS ── */}
    {isToday&&(
      <div style={{padding:"12px 16px 0"}}>
        <div style={{fontSize:10,fontWeight:800,letterSpacing:2,color:"#C8B0C8",textTransform:"uppercase",marginBottom:8}}>Hızlı Ekle</div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          <button className="abtn" onClick={e=>doUyku(e)}
            style={{background:uyku?"linear-gradient(135deg,#8B7FD4,#6B5FB4)":TYPES.uyku.bg,color:uyku?"white":TYPES.uyku.color,boxShadow:uyku?`0 4px 16px ${TYPES.uyku.glow}`:"none",padding:"17px 18px",fontSize:15,borderRadius:18}}>
            <span style={{fontSize:26}}>🌙</span>
            <span style={{flex:1,textAlign:"left",lineHeight:1.3}}>
              {uyku?(<><span className="pu" style={{fontSize:13,display:"block",fontWeight:900}}>● Uyuyor</span><span style={{fontSize:12,fontWeight:600}}>{fmtMs(now-new Date(uyku).getTime())} — Bitir</span></>):<span style={{fontWeight:900}}>Uyku Başlat</span>}
            </span>
          </button>
          <button className="abtn" onClick={()=>setModal("beslenme")} style={{background:TYPES.beslenme.bg,color:TYPES.beslenme.color,padding:"17px 18px",fontSize:15,borderRadius:18}}>
            <span style={{fontSize:26}}>🍼</span><span style={{fontWeight:900}}>Beslenme Ekle</span>
          </button>
          <button className="abtn" onClick={e=>addRec("cis",{},e)} style={{background:TYPES.cis.bg,color:TYPES.cis.color,padding:"17px 18px",fontSize:15,borderRadius:18}}>
            <span style={{fontSize:26}}>💧</span><span style={{fontWeight:900}}>Çiş Bezi</span>
          </button>
          <button className="abtn" onClick={()=>setModal("kaka")} style={{background:TYPES.kaka.bg,color:TYPES.kaka.color,padding:"17px 18px",fontSize:15,borderRadius:18}}>
            <span style={{fontSize:26}}>🟤</span><span style={{fontWeight:900}}>Kaka Bezi</span>
          </button>
          <button className="abtn" onClick={()=>setModal("gaz")} style={{background:TYPES.gaz.bg,color:TYPES.gaz.color,padding:"17px 18px",fontSize:15,borderRadius:18}}>
            <span style={{fontSize:26}}>💨</span><span style={{fontWeight:900}}>Gaz Çıkarma</span>
          </button>
        </div>
      </div>
    )}

    {/* ── TABS ── */}
    <div style={{margin:"14px 16px 0"}} className="card">
      <div style={{display:"flex",borderRadius:20,overflow:"hidden"}}>
        {[["liste","📋"],["grafik","📊"],["haftalik","📈"],["buyume","📏"],["ai","🤖"]].map(([v,lbl])=>(
          <button key={v} className="tab" style={{background:tab===v?"linear-gradient(135deg,#6B5FB4,#8B7FD4)":"transparent",color:tab===v?"white":"#C0A8D8"}}
            onClick={()=>setTab(v)}>{lbl}</button>
        ))}
      </div>
    </div>

    {/* ── CONTENT ── */}
    <div style={{padding:"10px 16px 110px"}}>

      {tab==="liste"&&(
        <div className="fi">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{fontSize:11,fontWeight:800,color:"#9C7C9C"}}>{isToday?"Bugünkü Kayıtlar":`${new Date(selDay+"T12:00:00").getDate()} ${MONTHS_TR[new Date(selDay+"T12:00:00").getMonth()]} Kayıtları`}</div>
            <div style={{fontSize:11,color:"#C0B0C0",fontWeight:700}}>{dayRecs.length} kayıt</div>
          </div>
          {dayRecs.length===0
            ?<div style={{textAlign:"center",color:"#C0A0C0",padding:"40px 0"}}><div style={{fontSize:44,marginBottom:8,animation:"flt 3s ease-in-out infinite"}}>🌸</div><div style={{fontSize:13,fontWeight:700}}>{isToday?"Rena için henüz kayıt yok":"Bu güne ait kayıt yok"}</div></div>
            :dayRecs.map(r=><RItem key={r.id} r={r} onDel={delRec}/>)}
        </div>
      )}

      {tab==="grafik"&&(
        <div className="card fi" style={{padding:"16px"}}>
          <div style={{fontSize:10,fontWeight:800,color:"#9C7C9C",letterSpacing:1,textTransform:"uppercase",marginBottom:12}}>📅 24 Saatlik Zaman Çizelgesi</div>
          {dayRecs.length===0?<div style={{textAlign:"center",color:"#C0A0C0",padding:"18px 0",fontSize:12}}>Bu güne ait kayıt yok</div>:<Timeline recs={dayRecs}/>}
          {dayRecs.filter(r=>r.type==="uyku"&&r.baslangic).length>0&&(
            <div style={{marginTop:14}}>
              <div style={{fontSize:10,fontWeight:700,color:"#C0B0D0",letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Uyku Blokları</div>
              {dayRecs.filter(r=>r.type==="uyku"&&r.baslangic).sort((a,b)=>new Date(a.baslangic)-new Date(b.baslangic)).map(r=>(
                <div key={r.id} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:"1px solid #F8F4FF"}}>
                  <div style={{width:7,height:7,borderRadius:"50%",background:"#8B7FD4",flexShrink:0}}/>
                  <div style={{flex:1,fontSize:12,color:"#5A3E5A",fontWeight:700}}>{fmtT(r.baslangic)} → {fmtT(r.time)}</div>
                  <div style={{fontSize:11,color:"#9C7C9C",fontWeight:600}}>{r.sure!=null?`${Math.floor(r.sure/60)}s ${r.sure%60}dk`:""}</div>
                </div>
              ))}
              <div style={{marginTop:7,fontSize:12,fontWeight:900,color:"#5A3E5A"}}>Toplam: {Math.floor(uMin/60)}s {uMin%60}dk</div>
            </div>
          )}
        </div>
      )}

      {tab==="haftalik"&&<Weekly recs={recs}/>}

      {tab==="buyume"&&<Growth grecs={grecs} onAdd={e=>setGrecs(p=>[e,...p])} onDel={id=>setGrecs(p=>p.filter(e=>e.id!==id))} weeks={weeks}/>}

      {tab==="ai"&&(
        <div className="card fi" style={{padding:"16px"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
            <div style={{width:40,height:40,borderRadius:14,background:"linear-gradient(135deg,#8B7FD4,#6B5FB4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>✨</div>
            <div><div style={{fontWeight:900,fontSize:15,color:"#5A3E5A"}}>AI Bebek Asistanı</div><div style={{fontSize:10,color:"#B0A0C0",marginTop:1}}>Kayıtlarınıza göre kişisel analiz</div></div>
          </div>
          <AI recs={recs} grecs={grecs} weeks={weeks} activeUyku={uyku}/>
        </div>
      )}
    </div>

    {/* ── SPARKLES ── */}
    {sparks.map(s=><Sparkle key={s.id} x={s.x} y={s.y} color={s.col} onDone={()=>setSparks(p=>p.filter(x=>x.id!==s.id))}/>)}

    {/* ── MODAL ── */}
    {modal&&(
      <div className="ov" onClick={()=>setModal(null)}>
        <div className="mb" onClick={e=>e.stopPropagation()}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
            <div style={{width:42,height:42,borderRadius:14,background:TYPES[modal].bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,boxShadow:`0 3px 10px ${TYPES[modal].glow}`}}>{TYPES[modal].emoji}</div>
            <div style={{fontFamily:"'Comfortaa',cursive",fontSize:19,fontWeight:700,color:"#5A3E5A"}}>{TYPES[modal].label} Ekle</div>
          </div>
          {modal==="beslenme"&&(
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div style={{fontSize:10,fontWeight:800,color:"#C0B0C0",letterSpacing:1.5,textTransform:"uppercase"}}>Tür</div>
              <div style={{display:"flex",gap:8}}>
                {["anne-sütü","mama","formül"].map(t=>(
                  <button key={t} className="btn" style={{flex:1,padding:"10px 4px",borderRadius:12,fontWeight:800,fontSize:11,
                    background:(form.tur||"anne-sütü")===t?"linear-gradient(135deg,#F5924E,#E07030)":TYPES.beslenme.bg,
                    color:(form.tur||"anne-sütü")===t?"white":TYPES.beslenme.color,
                    boxShadow:(form.tur||"anne-sütü")===t?`0 3px 12px ${TYPES.beslenme.glow}`:"none"}}
                    onClick={()=>setForm(f=>({...f,tur:t,taraf:null}))}>
                    {t==="anne-sütü"?"Anne Sütü":t==="mama"?"Mama":"Formül"}
                  </button>
                ))}
              </div>

              {(form.tur||"anne-sütü")==="anne-sütü"&&(
                <>
                  <div style={{fontSize:10,fontWeight:800,color:"#C0B0C0",letterSpacing:1.5,textTransform:"uppercase"}}>Meme</div>
                  <div style={{display:"flex",gap:8}}>
                    {[["sol","◀ Sol"],["sag","Sağ ▶"],["iki","↔ Her İkisi"]].map(([v,lbl])=>(
                      <button key={v} className="btn" style={{flex:1,padding:"12px 4px",borderRadius:12,fontWeight:800,fontSize:12,
                        background:form.taraf===v?"linear-gradient(135deg,#F5924E,#E07030)":TYPES.beslenme.bg,
                        color:form.taraf===v?"white":TYPES.beslenme.color,
                        boxShadow:form.taraf===v?`0 3px 12px ${TYPES.beslenme.glow}`:"none"}}
                        onClick={()=>setForm(f=>({...f,taraf:v}))}>
                        {lbl}
                      </button>
                    ))}
                  </div>
                </>
              )}

              <div style={{fontSize:10,fontWeight:800,color:"#C0B0C0",letterSpacing:1.5,textTransform:"uppercase"}}>Miktar (ml) — isteğe bağlı</div>
              <input type="number" placeholder="örn. 60"
                style={{border:"2.5px solid #FFDFC8",borderRadius:12,padding:"12px 13px",fontSize:15,color:"#3A2A3A",outline:"none",fontFamily:"Nunito",fontWeight:700}}
                value={form.miktar||""} onChange={e=>setForm(f=>({...f,miktar:e.target.value}))}/>
            </div>
          )}
          {modal==="gaz"&&(
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{textAlign:"center",fontSize:11,color:"#9C9C9C",marginBottom:4}}>Rena bugün ne kadar rahatladı? 😄</div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {[
                  {v:"süper",  e:"🏆", lbl:"Süper Gaz!",     sub:"Adeta bir profesyonel"},
                  {v:"iyi",    e:"😌", lbl:"Güzel Çıktı",    sub:"Rahatlamış görünüyor"},
                  {v:"biraz",  e:"🤏", lbl:"Biraz Çıktı",    sub:"Daha fazla gaz olabilir"},
                  {v:"zorlu",  e:"😤", lbl:"Zorlandı",       sub:"Gaz sancısı vardı"},
                ].map(({v,e,lbl,sub})=>(
                  <button key={v} className="btn" onClick={()=>setForm(f=>({...f,gazdurumu:v}))}
                    style={{display:"flex",alignItems:"center",gap:14,padding:"13px 16px",borderRadius:16,fontFamily:"Nunito",
                      background:form.gazdurumu===v?"linear-gradient(135deg,#6BBF6B,#4CAF50)":TYPES.gaz.bg,
                      color:form.gazdurumu===v?"white":TYPES.gaz.color,
                      boxShadow:form.gazdurumu===v?`0 4px 14px ${TYPES.gaz.glow}`:"none",
                      border:"none",textAlign:"left"}}>
                    <span style={{fontSize:28,lineHeight:1}}>{e}</span>
                    <div>
                      <div style={{fontWeight:800,fontSize:14}}>{lbl}</div>
                      <div style={{fontSize:11,opacity:.75,marginTop:1}}>{sub}</div>
                    </div>
                    {form.gazdurumu===v&&<span style={{marginLeft:"auto",fontSize:18}}>✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
          {modal==="kaka"&&(
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div style={{fontSize:10,fontWeight:800,color:"#C0B0C0",letterSpacing:1.5,textTransform:"uppercase"}}>Renk (isteğe bağlı)</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {["sarı","yeşil","kahve","siyah"].map(r=>(
                  <button key={r} className="btn" style={{padding:"9px 16px",borderRadius:12,fontWeight:800,fontSize:13,
                    background:form.renk===r?"linear-gradient(135deg,#A87858,#886040)":TYPES.kaka.bg,
                    color:form.renk===r?"white":TYPES.kaka.color}}
                    onClick={()=>setForm(f=>({...f,renk:r}))}>{r}</button>
                ))}
              </div>
            </div>
          )}
          <button className="btn" onClick={e=>{
            if(modal==="beslenme")addRec("beslenme",{miktar:form.miktar||null,tur:form.tur||"anne-sütü",taraf:form.taraf||null},e);
            else if(modal==="kaka")addRec("kaka",{renk:form.renk||null},e);
            else if(modal==="gaz")addRec("gaz",{gazdurumu:form.gazdurumu||"iyi"},e);
            setModal(null);
          }} style={{width:"100%",marginTop:22,padding:"15px",borderRadius:16,background:`linear-gradient(135deg,${TYPES[modal].color},${TYPES[modal].color}CC)`,color:"white",fontWeight:900,fontSize:15,fontFamily:"Nunito",boxShadow:`0 5px 18px ${TYPES[modal].glow}`}}>
            {modal==="gaz"?form.gazdurumu==="süper"?"🏆 Tebrikler Rena! Kaydet":form.gazdurumu==="iyi"?"😌 Güzel! Kaydet":form.gazdurumu==="biraz"?"🤏 Kaydet":form.gazdurumu==="zorlu"?"😤 Geçer Rena! Kaydet":"💨 Kaydet":"✓ Kaydet"}
          </button>
        </div>
      </div>
    )}

    {/* ── HAFTA MODAL ── */}
    {showW&&(
      <div className="ov" onClick={()=>setShowW(false)}>
        <div className="mb" onClick={e=>e.stopPropagation()}>
          <div style={{fontFamily:"'Comfortaa',cursive",fontSize:19,fontWeight:700,color:"#5A3E5A",marginBottom:6}}>👶 Bebeğin Yaşı</div>
          <div style={{fontSize:12,color:"#9C7C9C",marginBottom:18}}>Wake window hesaplaması için</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {[1,2,3,4,5,6,8,10,12,16,20,24].map(w=>(
              <button key={w} className="btn" style={{padding:"10px 13px",borderRadius:12,fontWeight:800,fontSize:13,
                background:weeks===w?"linear-gradient(135deg,#8B7FD4,#6B5FB4)":"#F5F0FC",
                color:weeks===w?"white":"#7A5A7A",
                boxShadow:weeks===w?"0 4px 12px rgba(107,95,180,.32)":"none"}}
                onClick={()=>{setWeeks(w);setShowW(false);}}>
                {w} hafta
              </button>
            ))}
          </div>
        </div>
      </div>
    )}
  </div>
</div>
```

);
}
