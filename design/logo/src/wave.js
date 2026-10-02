const L=require('./lib');
const D=Math.PI/180;
const smooth=t=>t<=0?0:t>=1?1:t*t*(3-2*t);
// Breaking-wave underline: thin tail at x0, line at y, rises into a face at the right and curls back left (ccw).
function waveRight(o){
  const {x0,cx,y,R,turn=300,wMax=8,tail=1,inner=0.3,gaps=[],lift=R*1.5,thJ=8,sag=1.5,wLine=4.5}=o;
  const c={x:cx,y:y-lift};
  const asp=o.asp||1;const pt=th=>({x:c.x+R*asp*Math.cos(th*D),y:c.y+R*Math.sin(th*D)});
  const j=pt(thJ); let tan={x:asp*Math.sin(thJ*D),y:-Math.cos(thJ*D)};{const l=Math.hypot(tan.x,tan.y);tan={x:tan.x/l,y:tan.y/l};}
  const ax=c.x-R*(o.faceBack??0.2); // where line starts turning up
  const span=ax-x0;
  const segA=L.bez({x:x0,y:y-sag*0.4},{x:x0+span*0.33,y:y+sag},{x:x0+span*0.66,y:y+sag},{x:ax,y:y},60);
  const k1=(j.x-ax)*(o.k1||0.75), k2=(y-j.y)*(o.k2||0.55);
  const segB=L.bez({x:ax,y:y},{x:ax+k1,y:y},{x:j.x-tan.x*k2,y:j.y-tan.y*k2},j,50);
  const segC=L.spiral(c,R,R*inner,thJ,thJ-turn,140,o.ease||1.15,asp);
  const pts=L.join(segA,segB,segC);
  const lens=[0];for(let i=1;i<pts.length;i++)lens.push(lens[i-1]+Math.hypot(pts[i].x-pts[i-1].x,pts[i].y-pts[i-1].y));
  const tot=lens[lens.length-1];const sA=lens[segA.length-1]/tot,sJ=lens[segA.length+segB.length-2]/tot;
  const wfn=(s,p)=>{let w;
    if(s<sA){const t=s/sA;w=tail+(wLine-tail)*Math.pow(t,o.pw||0.7);w*=0.3+0.7*smooth(t/0.06);}
    else if(s<sJ){const t=(s-sA)/(sJ-sA);w=wLine+(wMax-wLine)*smooth(t);}
    else{const t=(s-sJ)/(1-sJ);w=wMax*(1+0.12*Math.sin(Math.PI*Math.min(1,t*3)))*Math.pow(1-t,o.endPow||0.8);}
    for(const g of gaps){if(p.y>g.yTop){const dx=Math.abs(p.x-g.x);w*=smooth((dx-g.half)/g.fade);}}
    return w;};
  let d=L.brush(pts,wfn,1.6,{smooth:o.smoothIt??8});
  const angs=o.clawAngles||[-140,-172,-204];
  angs.forEach((A,i)=>{
    const t=(thJ-A)/turn; const r=R+(R*inner-R)*Math.pow(t,o.ease||1.15);
    const wl=wMax*Math.pow(1-t,o.endPow||0.8);
    const th=A*D; const out={x:Math.cos(th),y:Math.sin(th)}; const fw={x:Math.sin(th),y:-Math.cos(th)};
    const sc=o.clawScale?o.clawScale[i]:1;
    const len=(o.clawLen||R*0.5)*sc;
    const base={x:c.x+(r*asp+wl*0.1)*out.x-fw.x*wl*0.3,y:c.y+(r+wl*0.1)*out.y-fw.y*wl*0.3};
    const P1={x:base.x+out.x*len*0.75,y:base.y+out.y*len*0.75};
    const P2={x:base.x+out.x*len*1.15+fw.x*len*0.55,y:base.y+out.y*len*1.15+fw.y*len*0.55};
    const P3={x:base.x+out.x*len*0.75+fw.x*len*0.9,y:base.y+out.y*len*0.75+fw.y*len*0.9};
    const cp=L.bez(base,P1,P2,P3,30);
    const bw=(o.clawW||wl*1.15)*Math.sqrt(sc);
    d+=L.brush(cp,s=>bw*Math.pow(1-s,o.clawPow||0.9),0.7,{smooth:3});
  });
  return d;
}
function mirrorX(d,m){return d.replace(/([MLC])([^MLCZ]+)/g,(all,cmd,nums)=>{const n=nums.trim().split(/[\s,]+/).map(Number);for(let i=0;i<n.length;i+=2)n[i]=Math.round((2*m-n[i])*100)/100;return cmd+n.join(' ');});}
module.exports={waveRight,mirrorX};
