const L=require('./lib'),{waveRight}=require('./wave'),{waveQ}=require('./waveq'),fs=require('fs'),path=require('path');
// Usage: node build.js [outDir]   (default: design/logo, i.e. the parent folder)
const OUT=path.resolve(process.argv[2]||path.join(__dirname,'..'));fs.mkdirSync(OUT,{recursive:true});
const C={paper:'#F2E8D5',ink:'#1E3557',ver:'#C0502E',night:'#14213A',verN:'#D8653F'};
const F=n=>path.join(__dirname,'fonts',n);
const FONTS={eb600:F('EB-600.ttf'),fr600:F('Fr-600.ttf'),fr400:F('Fr-400.ttf'),fr800:F('Fr-800.ttf')};
for(const f of Object.values(FONTS))if(!fs.existsSync(f)){console.error('Missing font '+f+' - run: python make_fonts.py (see README.md)');process.exit(1);}
const r=v=>Math.round(v*100)/100;
function bboxOf(ds){let x1=1e9,y1=1e9,x2=-1e9,y2=-1e9;for(const d of ds)for(const [x,y] of L.pathPoints(d)){x1=Math.min(x1,x);y1=Math.min(y1,y);x2=Math.max(x2,x);y2=Math.max(y2,y);}return {x1,y1,x2,y2};}
function svg(vb,inner,title){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.map(r).join(' ')}" role="img" aria-label="${title}">\n<title>${title}</title>\n${inner}\n</svg>\n`;}
function write(name,s){fs.writeFileSync(path.join(OUT,name),s);}
const manifest=[];

// ---------- A: wave-underline wordmarks ----------
const WAVE={faceBack:1.8,k1:0.55,k2:0.8,thJ:30,asp:1.25,turn:330,sag:3,inner:0.25,clawAngles:[-150,-180,-212],clawPow:0.75};
function wordmark(key,o={}){
  const S=L.shape(FONTS[key],'underquiz',100);const g=S.glyphs;
  const q=g.find(x=>x.ch==='q');const qd=L.pathPoints(q.d).filter(p=>p[1]>3).map(p=>p[0]);
  const zEnd=g[g.length-1].bb[2];const xh=S.xh;
  let text='',dot='';
  for(const x of g){
    if(x.ch==='i'&&o.redDot){
      const parts=x.d.split('M').filter(Boolean).map(p=>'M'+p);
      const ys=parts.map(p=>Math.max(...L.pathPoints(p).map(v=>v[1])));const k=ys.indexOf(Math.min(...ys));
      parts.forEach((p,i)=>{if(i===k)dot+=p;else text+=p;});
    } else text+=x.d;
  }
  const R=(o.Rk||0.62)*xh, y=o.y??Math.max(15,q.bb[3]*0.62);
  const cx=zEnd+(o.gapZ||4)+R*1.25*1.45;
  const wave=waveRight({x0:1,cx,y,R,lift:R*1.35,wMax:o.wMax||11,wLine:o.wLine||5.2,...WAVE,...(o.wave||{}),
    gaps:[{x:(Math.min(...qd)+Math.max(...qd))/2,half:(Math.max(...qd)-Math.min(...qd))/2+(o.qpad||5),fade:2.5,yTop:-100}]});
  const bb=bboxOf([text,dot,wave]);const pad=2;
  return {text,dot,wave,vb:[bb.x1-pad,bb.y1-pad,bb.x2-bb.x1+2*pad,bb.y2-bb.y1+2*pad],S};
}
const A=[
  {file:'a1-wave-eb600',key:'eb600',idea:'EB Garamond 600 + mürekkep dalga altçizgi; q kuyruğunda fırça kalkıyor',o:{}},
  {file:'a2-wave-fraunces600',key:'fr600',idea:'Fraunces 600 + dalga altçizgi; i noktası vermilion (kırmızı ay)',o:{redDot:true}},
  {file:'a3-wave-fraunces400',key:'fr400',idea:'Fraunces 400, daha ince yazı + vermilion dalga',o:{redWave:true,wMax:10,wLine:4.6}},
];
for(const a of A){const w=wordmark(a.key,a.o);
  for(const dark of [false,true]){
    const ink=dark?C.paper:C.ink, ver=dark?C.verN:C.ver;
    const inner=`<path fill="${ink}" d="${w.text}"/>`+(w.dot?`\n<path fill="${ver}" d="${w.dot}"/>`:'')+`\n<path fill="${a.o.redWave?ver:ink}" d="${w.wave}"/>`;
    const name=a.file+(dark?'-dark':'')+'.svg';write(name,svg(w.vb,inner,'underquiz'));
    manifest.push({name,group:'A',dark,idea:a.idea+(dark?' (gece zemini için açık renk)':''),kind:'wordmark',w:w.vb[2],h:w.vb[3]});
  }
}

// ---------- B: hanko seals ----------
function rrectPath(x,y,w,h,rad){const k=0.5523*rad;return `M${x+rad} ${y}H${x+w-rad}C${r(x+w-rad+k)} ${y} ${x+w} ${r(y+rad-k)} ${x+w} ${y+rad}V${y+h-rad}C${x+w} ${r(y+h-rad+k)} ${r(x+w-rad+k)} ${y+h} ${x+w-rad} ${y+h}H${x+rad}C${r(x+rad-k)} ${y+h} ${x} ${r(y+h-rad+k)} ${x} ${y+h-rad}V${y+rad}C${x} ${r(y+rad-k)} ${r(x+rad-k)} ${y} ${x+rad} ${y}Z`;}
// rough outline for the stamped version: perimeter jittered with smooth noise + a few nicks
function roughShape(kind,seed,amp=0.8){const rnd=L.rng(seed);const N=220;const ph=[...Array(6)].map(()=>rnd()*6.283);
  const pts=[];
  for(let i=0;i<N;i++){const t=i/N;const a=t*6.2832;const c=Math.cos(a),s=Math.sin(a);let p,n;
    if(kind==='circle'){p={x:50+46*c,y:50+46*s};n={x:c,y:s};}
    else{const ex=7;const rr=1/Math.pow(Math.pow(Math.abs(c),ex)+Math.pow(Math.abs(s),ex),1/ex);
      p={x:50+46*rr*c,y:50+46*rr*s};const nx=Math.sign(c)*Math.pow(Math.abs(c),ex-1),ny=Math.sign(s)*Math.pow(Math.abs(s),ex-1);const l=Math.hypot(nx,ny);n={x:nx/l,y:ny/l};}
    let j=amp*(0.5*Math.sin(a*7+ph[0])+0.3*Math.sin(a*19+ph[1])+0.2*Math.sin(a*43+ph[2]));
    if(rnd()<0.035)j-=amp*(0.8+rnd()*1.2);
    pts.push({x:p.x+n.x*j,y:p.y+n.y*j});}
  return L.crPath([...pts,pts[0]])+'Z';}
function sealUQ(){const S=L.shape(FONTS.fr800,'uq',100);const d=S.glyphs.map(g=>g.d).join('');const bb=bboxOf([d]);
  const sc=80/(bb.x2-bb.x1);const tx=50-(bb.x1+bb.x2)/2*sc;const ty=50-((bb.y1+bb.y2)/2)*sc+1;
  return `<path transform="translate(${r(tx)} ${r(ty)}) scale(${r(sc*1000)/1000})" d="${d}"/>`;}
const Q_FULL={R:22,c:{x:50,y:37},wStem:13,wMax:15,clawAngles:[-155,-190],clawScale:[1,0.9],stemBottom:{x:50,y:69},stemTop:{x:50,y:61},dot:{x:50,y:83,r:7.8}};
const Q_FAV={R:21.5,c:{x:50,y:37},wStem:16,wMax:18,inner:0.42,turn:265,stemBottom:{x:50,y:68},stemTop:{x:50,y:61},dot:{x:50,y:84,r:9}};
const P=d=>d.split('|').map(p=>`<path d="${p}"/>`).join('');
const glyphs={uq:sealUQ(),waveq:P(waveQ(Q_FULL)),waveqFav:P(waveQ(Q_FAV)),
  waveqSun:P(waveQ({...Q_FULL,R:20,c:{x:50,y:38},dot:{x:50,y:81,r:7.2},stemBottom:{x:50,y:67},stemTop:{x:50,y:60}}))};
function sealClean(shape,g){const body=shape==='circle'?`<circle cx="50" cy="50" r="46" fill="${C.ver}"/>`:`<path fill="${C.ver}" d="${rrectPath(4,4,92,92,13)}"/>`;
  return `${body}\n<g fill="${C.paper}">${g}</g>`;}
function sealStamped(shape,g,seed){
  const id='s'+seed;
  const frame=shape==='circle'?`<circle cx="50" cy="50" r="40.5" fill="none" stroke="#000" stroke-width="1.6"/>`:`<path fill="none" stroke="#000" stroke-width="1.6" d="${rrectPath(9.5,9.5,81,81,9)}"/>`;
  return `<defs>
<mask id="${id}m" maskUnits="userSpaceOnUse" x="-2" y="-2" width="104" height="104"><rect x="-2" y="-2" width="104" height="104" fill="#fff"/><g fill="#000">${g}</g>${frame}</mask>
<filter id="${id}f" x="-4%" y="-4%" width="108%" height="108%" color-interpolation-filters="sRGB">
<feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="${seed}" result="warp"/>
<feDisplacementMap in="SourceGraphic" in2="warp" scale="1.4" xChannelSelector="R" yChannelSelector="G" result="d"/>
<feTurbulence type="fractalNoise" baseFrequency="0.32" numOctaves="3" seed="${seed+5}" result="grain"/>
<feColorMatrix in="grain" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -50 36.5" result="speck"/>
<feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="1" seed="${seed+9}" result="blot"/>
<feColorMatrix in="blot" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -1.4 1.6" result="dens"/>
<feComposite in="speck" in2="dens" operator="arithmetic" k1="1" k2="0" k3="0" k4="0" result="m"/>
<feComposite in="d" in2="m" operator="in"/>
</filter>
</defs>
<g filter="url(#${id}f)"><path fill="${C.ver}" mask="url(#${id}m)" transform="rotate(-1.5 50 50)" d="${roughShape(shape,seed)}"/></g>`;}
const B=[
  {file:'b1-seal-uq',shape:'square',g:'uq',idea:'Kare hanko, "uq" oyulmuş (Fraunces 800)'},
  {file:'b2-seal-waveq',shape:'square',g:'waveq',idea:'Kare hanko; soru işaretinin kancası pençeli Hokusai dalgası'},
  {file:'b2-seal-waveq-favicon',shape:'square',g:'waveqFav',idea:'b2’nin favicon sadeleştirmesi: kalın, pençesiz (16/32 px)',noStamp:true},
  {file:'b3-sun-waveq',shape:'circle',g:'waveqSun',idea:'Yuvarlak kırmızı güneş/ay mührü + dalga soru işareti'},
];
let seed=3;
for(const b of B){const g=glyphs[b.g];
  write(b.file+'.svg',svg([0,0,100,100],sealClean(b.shape,g),'underquiz'));manifest.push({name:b.file+'.svg',group:'B',idea:b.idea,kind:'seal',w:100,h:100});
  if(!b.noStamp){const nm=b.file+'-stamped.svg';write(nm,svg([-2,-2,104,104],sealStamped(b.shape,glyphs[b.g==='uq'?'uq':b.g],seed+=4),'underquiz'));manifest.push({name:nm,group:'B',idea:'Baskı dokulu büyük sürüm: kâğıt zeminde oyuklar kâğıdı gösterir (SVG filtreli; favicon için değil)',kind:'seal',w:104,h:104,large:true});}
}

// ---------- C: lockup (seal + wordmark) ----------
{const S=L.shape(FONTS.fr600,'underquiz',100);const text=S.glyphs.map(g=>g.d).join('');const tb=bboxOf([text]);
 const h=tb.y2-tb.y1+6;const sc=h/100;const sy=tb.y1-3;const gap=h*0.26;const tx=h+gap-tb.x1;
 for(const dark of [false,true]){
  const inner=`<g transform="translate(0 ${r(sy)}) scale(${r(sc*1000)/1000})">${sealClean('square',glyphs.waveqFav)}</g>\n<path fill="${dark?C.paper:C.ink}" transform="translate(${r(tx)} 0)" d="${text}"/>`;
  const W=h+gap+(tb.x2-tb.x1)+2;
  const name='c1-lockup'+(dark?'-dark':'')+'.svg';write(name,svg([-1,sy-1,W,h+2],inner,'underquiz'));
  manifest.push({name,group:'C',dark,idea:'Mühür (b2 favicon) + Fraunces 600 yan yana'+(dark?' (gece)':''),kind:'wordmark',w:W,h:h+2});}
}
require('./preview').writePreview(OUT,manifest);
console.log(manifest.map(m=>m.name).join('\n'));
module.exports={manifest};
