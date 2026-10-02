// Optional: node shot.js <file.html|svg> <out.png> <width> <height>  - headless Chrome screenshot for visual checks.
// Set CHROME to your Chrome/Edge executable if it is not at the default Windows path.
// node shot.js file.html out.png W H
const {execFileSync}=require('child_process');const path=require('path');
const [f,o,w,h]=process.argv.slice(2);
const abs=path.resolve(f).split(path.sep).join('/');
execFileSync(process.env.CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--disable-gpu','--hide-scrollbars','--user-data-dir='+path.join(require('os').tmpdir(),'underquiz-logo-chrome'),'--screenshot='+path.resolve(o),`--window-size=${w},${h}`,'--force-device-scale-factor=1','file:///'+abs],{stdio:'ignore',timeout:60000});
