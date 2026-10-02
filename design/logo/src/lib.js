// Geometry helpers for the underquiz logo generator (brush strokes, spirals, path parsing).
const path=require('path');
const r2=v=>Math.round(v*10)/10;
// sampling helpers
function bez(p0,p1,p2,p3,n){const a=[];for(let i=0;i<=n;i++){const t=i/n,u=1-t;a.push({x:u*u*u*p0.x+3*u*u*t*p1.x+3*u*t*t*p2.x+t*t*t*p3.x,y:u*u*u*p0.y+3*u*u*t*p1.y+3*u*t*t*p2.y+t*t*t*p3.y});}return a;}
function spiral(c,R0,R1,t0,t1,n,ease=1,asp=1){const a=[];for(let i=0;i<=n;i++){const t=i/n;const th=(t0+(t1-t0)*t)*Math.PI/180;const r=R0+(R1-R0)*Math.pow(t,ease);a.push({x:c.x+r*asp*Math.cos(th),y:c.y+r*Math.sin(th)});}return a;}
function join(...segs){const a=[];for(const s of segs){for(let i=0;i<s.length;i++){if(a.length&&i==0)continue;a.push(s[i]);}}return a;}
function resample(pts,step){ // even arc length
  const L=[0];for(let i=1;i<pts.length;i++)L.push(L[i-1]+Math.hypot(pts[i].x-pts[i-1].x,pts[i].y-pts[i-1].y));
  const tot=L[L.length-1];const n=Math.max(2,Math.round(tot/step));const out=[];let j=0;
  for(let k=0;k<=n;k++){const s=tot*k/n;while(j<pts.length-2&&L[j+1]<s)j++;const t=(s-L[j])/((L[j+1]-L[j])||1);out.push({x:pts[j].x+(pts[j+1].x-pts[j].x)*t,y:pts[j].y+(pts[j+1].y-pts[j].y)*t,s:s/tot});}
  return out;
}
function crPath(pts,move=true){ // catmull-rom -> cubic
  let d=move?`M${r2(pts[0].x)} ${r2(pts[0].y)}`:`L${r2(pts[0].x)} ${r2(pts[0].y)}`;
  for(let i=0;i<pts.length-1;i++){const p0=pts[i-1]||pts[i],p1=pts[i],p2=pts[i+1],p3=pts[i+2]||p2;
    d+=`C${r2(p1.x+(p2.x-p0.x)/6)} ${r2(p1.y+(p2.y-p0.y)/6)} ${r2(p2.x-(p3.x-p1.x)/6)} ${r2(p2.y-(p3.y-p1.y)/6)} ${r2(p2.x)} ${r2(p2.y)}`;}
  return d;
}
// brush: centerline pts, width fn(s, pt) -> filled outline path(s). splits where width<=eps
function brush(pts,wfn,step=1.2,opts={}){
  let P=resample(pts,step);
  for(let it=0;it<(opts.smooth||0);it++){P=P.map((p,i)=>i==0||i==P.length-1?p:{x:(P[i-1].x+2*p.x+P[i+1].x)/4,y:(P[i-1].y+2*p.y+P[i+1].y)/4,s:p.s});}const W=P.map((p,i)=>wfn(p.s,p,i));
  const segs=[];let cur=[];
  for(let i=0;i<P.length;i++){if(W[i]>0.05){cur.push(i);}else{if(cur.length>2)segs.push(cur);cur=[];}}
  if(cur.length>2)segs.push(cur);
  let d='';
  for(const seg of segs){const L=[],R=[];
    for(const i of seg){const a=P[Math.max(0,i-1)],b=P[Math.min(P.length-1,i+1)];let tx=b.x-a.x,ty=b.y-a.y;const l=Math.hypot(tx,ty)||1;tx/=l;ty/=l;const nx=-ty,ny=tx;const w=W[i]/2;
      L.push({x:P[i].x+nx*w,y:P[i].y+ny*w});R.push({x:P[i].x-nx*w,y:P[i].y-ny*w});}
    // round-ish caps by meeting at end centre
    const s0=P[seg[0]],s1=P[seg[seg.length-1]];
    if(opts.flatStart){const left=[...L.slice(0,-1),s1];const right=[s1,...R.slice(0,-1).reverse()];const r0=right[right.length-1];d+=`M${r2(r0.x)} ${r2(r0.y)}`+crPath(left,false)+crPath(right,false).replace(/^L[^C]*/,"")+"Z";}
    else{const left=[s0,...L.slice(1,-1),s1];const right=R.slice(1,-1).reverse();d+=crPath([...left,...right,s0])+"Z";}
  }
  return d;
}
// seeded rng
function rng(seed){let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
module.exports={bez,spiral,join,resample,crPath,brush,rng,r2};
const {execFileSync}=require('child_process');
// Text shaping + glyph outlines come from shape.py (HarfBuzz + fontTools). Set PYTHON to pick the interpreter.
const PY=process.env.PYTHON||(process.platform==='win32'?'python':'python3');
function shape(fontFile,text,size){return JSON.parse(execFileSync(PY,[path.join(__dirname,'shape.py'),fontFile,text,String(size)]).toString());}
module.exports.shape=shape;
function pathPoints(d){const t=d.match(/[MLHVQCZ]|-?[0-9.]+/g)||[];const pts=[];let i=0,cmd='',x=0,y=0;
 const num=()=>Number(t[i++]);
 while(i<t.length){if(/[A-Z]/.test(t[i])){cmd=t[i++];if(cmd=='Z')continue;}
  if(cmd=='M'||cmd=='L'){x=num();y=num();pts.push([x,y]);}
  else if(cmd=='H'){x=num();pts.push([x,y]);}else if(cmd=='V'){y=num();pts.push([x,y]);}
  else if(cmd=='Q'){const a=num(),b=num();x=num();y=num();pts.push([a,b],[x,y]);}
  else if(cmd=='C'){const a=num(),b=num(),c=num(),e=num();x=num();y=num();pts.push([a,b],[c,e],[x,y]);}
  else i++;}
 return pts;}
module.exports.pathPoints=pathPoints;
