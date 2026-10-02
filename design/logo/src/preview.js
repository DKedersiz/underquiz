const fs=require('fs'),path=require('path');
// Writes preview.html next to the SVGs. Called from build.js.
function writePreview(OUT,M){
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
function card(m,bg){
  const big=m.kind==='seal'?`<img src="${m.name}" style="height:180px" alt="">`:`<img src="${m.name}" style="height:${m.group==='C'?110:130}px;max-width:100%" alt="">`;
  const sizes=[64,32,16].map(s=>`<figure><img src="${m.name}" style="height:${s}px" alt=""><figcaption>${s}px</figcaption></figure>`).join('');
  return `<article class="card"><div class="big">${big}</div><div class="sizes">${sizes}</div><p class="lbl"><code>${m.name}</code><br>${esc(m.idea)}</p></article>`;
}
function section(title,bg,items){
  return `<section class="${bg}"><h2>${title}</h2><div class="grid">${items.map(m=>card(m,bg)).join('')}</div></section>`;
}
// light section: light wordmarks + all seals; dark section: dark wordmarks + all seals
const light=M.filter(m=>!m.dark), dark=M.filter(m=>m.dark||(m.kind==='seal'&&!m.large));
const html=`<!doctype html>
<html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>underquiz logo</title>
<link rel="icon" href="b2-seal-waveq-favicon.svg" type="image/svg+xml">
<style>
:root{--paper:#F2E8D5;--ink:#1E3557;--ver:#C0502E;--night:#14213A}
*{box-sizing:border-box}
body{margin:0;font:15px/1.45 Georgia,"Times New Roman",serif;background:var(--paper);color:var(--ink)}
header{padding:28px 24px 8px;max-width:1200px;margin:auto}
header h1{margin:0 0 4px;font-weight:600;font-size:26px}
header p{margin:0;opacity:.8}
section{padding:24px}
section.paper{background:var(--paper);color:var(--ink)}
section.night{background:var(--night);color:var(--paper)}
section h2{max-width:1200px;margin:0 auto 16px;font-weight:600;font-size:20px;letter-spacing:.02em}
.grid{max-width:1200px;margin:auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(520px,1fr));gap:20px}
.card{border:1px solid color-mix(in srgb,currentColor 18%,transparent);border-radius:6px;padding:18px}
.big{min-height:190px;display:flex;align-items:center;justify-content:center}
.sizes{display:flex;gap:22px;align-items:flex-end;margin-top:12px;flex-wrap:wrap}
figure{margin:0;display:flex;flex-direction:column;align-items:flex-start;gap:4px}
figcaption{font-size:11px;opacity:.6;font-family:ui-monospace,Consolas,monospace}
.lbl{margin:12px 0 0;font-size:14px}
code{font-family:ui-monospace,Consolas,monospace;font-size:12.5px;color:var(--ver)}
.night code{color:#D8653F}
.tab{display:flex;align-items:center;gap:8px;background:#DFE3EA;border-radius:8px 8px 0 0;padding:7px 12px;width:240px;font:13px system-ui,sans-serif;color:#222}
.tab.dk{background:#2B2F36;color:#ddd}
.tabs{display:flex;gap:12px;flex-wrap:wrap;max-width:1200px;margin:auto}
@media (max-width:600px){.grid{grid-template-columns:1fr}}
</style></head><body>
<header><h1>underquiz — logo konseptleri</h1><p>A: dalga altçizgili wordmark · B: hanko mühür · C: lockup. Her varyant büyük boyda ve 64 / 32 / 16 px yükseklikte.</p></header>
<section class="paper"><h2>Tarayıcı sekmesinde favicon</h2><div class="tabs">
${['b2-seal-waveq-favicon.svg','b1-seal-uq.svg','b3-sun-waveq.svg'].map(f=>`<div class="tab"><img src="${f}" width="16" height="16" alt="">underquiz · Seviyeni ölç</div><div class="tab dk"><img src="${f}" width="16" height="16" alt="">underquiz · Seviyeni ölç</div>`).join('')}
</div></section>
${section('Eski kâğıt zemin (light)','paper',light)}
${section('Ay ışığı gece zemin (dark)','night',dark)}
</body></html>`;
fs.writeFileSync(path.join(OUT,'preview.html'),html);
console.log('preview.html written');
}
module.exports={writePreview};
