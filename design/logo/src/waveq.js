const L=require('./lib');const D=Math.PI/180;
const smooth=t=>t<=0?0:t>=1?1:t*t*(3-2*t);
// Question mark whose hook is a breaking-wave crest. Coordinates for a 100x100 seal.
function waveQ(o={}){
  const c=o.c||{x:50,y:36},R=o.R||20,asp=o.asp||1.05,thJ=o.thJ??25,turn=o.turn||300,inner=o.inner??0.32,ease=o.ease||1.15;
  const wS=o.wStem||12,wM=o.wMax||13;
  const pt=th=>({x:c.x+R*asp*Math.cos(th*D),y:c.y+R*Math.sin(th*D)});
  const j=pt(thJ);let tan={x:asp*Math.sin(thJ*D),y:-Math.cos(thJ*D)};{const l=Math.hypot(tan.x,tan.y);tan={x:tan.x/l,y:tan.y/l};}
  const sb=o.stemBottom||{x:50,y:68};
  const st=o.stemTop||{x:50,y:60};
  const k=o.k||10;
  const lead=L.join(L.bez(sb,{x:sb.x,y:sb.y-3},{x:st.x,y:st.y+3},st,10),L.bez(st,{x:st.x,y:st.y-k*0.8},{x:j.x-tan.x*k,y:j.y-tan.y*k},j,40));
  const curl=L.spiral(c,R,R*inner,thJ,thJ-turn,140,ease,asp);
  const pts=L.join(lead,curl);
  const lens=[0];for(let i=1;i<pts.length;i++)lens.push(lens[i-1]+Math.hypot(pts[i].x-pts[i-1].x,pts[i].y-pts[i-1].y));
  const tot=lens[lens.length-1];const sJ=lens[lead.length-1]/tot;
  const wfn=s=>{if(s<sJ){const t=s/sJ;return wS+(wM-wS)*smooth(t);}
    const t=(s-sJ)/(1-sJ);return wM*(1+0.1*Math.sin(Math.PI*Math.min(1,t*3)))*Math.pow(1-t,o.endPow||0.75);};
  let d=L.brush(pts,wfn,0.9,{smooth:o.smoothIt??8,flatStart:true});
  (o.clawAngles||[]).forEach((A,i)=>{
    const t=(thJ-A)/turn;const r=R+(R*inner-R)*Math.pow(t,ease);const wl=wM*Math.pow(1-t,o.endPow||0.75);
    const th=A*D;const out={x:Math.cos(th),y:Math.sin(th)};const fw={x:Math.sin(th),y:-Math.cos(th)};
    const sc=o.clawScale?o.clawScale[i]:1;const len=(o.clawLen||R*0.5)*sc;
    const base={x:c.x+(r*asp+wl*0.1)*out.x-fw.x*wl*0.3,y:c.y+(r+wl*0.1)*out.y-fw.y*wl*0.3};
    const P1={x:base.x+out.x*len*0.75,y:base.y+out.y*len*0.75};
    const P2={x:base.x+out.x*len*1.15+fw.x*len*0.55,y:base.y+out.y*len*1.15+fw.y*len*0.55};
    const P3={x:base.x+out.x*len*0.75+fw.x*len*0.9,y:base.y+out.y*len*0.75+fw.y*len*0.9};
    const bw=(o.clawW||wl*1.2)*Math.sqrt(sc);
    d+=L.brush(L.bez(base,P1,P2,P3,30),s=>bw*Math.pow(1-s,o.clawPow||0.8),0.6,{smooth:3});
  });
  const dot=o.dot||{x:50,y:82,r:7.5};
  // slightly brush-like dot: ellipse via 4 cubic arcs, a touch tilted
  d+='|'+ell(dot.x,dot.y,dot.r*1.06,dot.r*0.96);
  return d;
}
function ell(dx,dy,rx,ry){const k4=0.5523;const f=v=>Math.round(v*100)/100;dx=f(dx);dy=f(dy);rx=f(rx);ry=f(ry);
  return `M${dx+rx} ${dy}C${dx+rx} ${(dy+ry*k4).toFixed(2)} ${(dx+rx*k4).toFixed(2)} ${dy+ry} ${dx} ${dy+ry}C${(dx-rx*k4).toFixed(2)} ${dy+ry} ${dx-rx} ${(dy+ry*k4).toFixed(2)} ${dx-rx} ${dy}C${dx-rx} ${(dy-ry*k4).toFixed(2)} ${(dx-rx*k4).toFixed(2)} ${dy-ry} ${dx} ${dy-ry}C${(dx+rx*k4).toFixed(2)} ${dy-ry} ${dx+rx} ${(dy-ry*k4).toFixed(2)} ${dx+rx} ${dy}Z`;
}
module.exports={waveQ};
