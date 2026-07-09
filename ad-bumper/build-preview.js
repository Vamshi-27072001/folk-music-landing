const fs = require('fs');
const path = require('path');

const OUTDIR = path.join(__dirname, 'out');
const THUMBS = path.join(OUTDIR, 'frames', 'thumbs');

const videoB64 = fs.readFileSync(path.join(OUTDIR, 'preview_b64.txt'), 'utf8').trim();

const shots = [
  { file: 'f_1.0.png',  t: '0:01', label: 'Generic app — typing search' },
  { file: 'f_3.2.png',  t: '0:03', label: '"No results found" #1' },
  { file: 'f_8.5.png',  t: '0:08', label: '"No results found" #2' },
  { file: 'f_11.6.png', t: '0:12', label: 'Folk India reveal — instant results' },
  { file: 'f_16.2.png', t: '0:16', label: 'DJ tab — instant remix results' },
  { file: 'f_19.0.png', t: '0:19', label: 'Mainstream tab — instant chart hits' },
  { file: 'f_22.5.png', t: '0:23', label: 'Logo reveal' },
  { file: 'f_27.5.png', t: '0:28', label: 'CTA — Download Now' },
];

const shotCards = shots.map(s => {
  const b64 = fs.readFileSync(path.join(THUMBS, s.file + '.b64'), 'utf8').trim();
  return `<figure class="shot">
    <img src="data:image/png;base64,${b64}" alt="${s.label}">
    <figcaption><span class="t">${s.t}</span>${s.label}</figcaption>
  </figure>`;
}).join('\n');

const html = `<!doctype html>
<title>Folk India — Ad Preview</title>
<style>
  :root{ --bg:#0b0c10; --card:#15171d; --line:#262933; --text:#eef0f4; --muted:#9aa0b0; --accent:#ff8a2b; }
  @media (prefers-color-scheme: light){
    :root{ --bg:#f3f4f7; --card:#ffffff; --line:#e2e4ea; --text:#14161c; --muted:#5c6270; --accent:#e26a10; }
  }
  :root[data-theme="dark"]{ --bg:#0b0c10; --card:#15171d; --line:#262933; --text:#eef0f4; --muted:#9aa0b0; --accent:#ff8a2b; }
  :root[data-theme="light"]{ --bg:#f3f4f7; --card:#ffffff; --line:#e2e4ea; --text:#14161c; --muted:#5c6270; --accent:#e26a10; }
  *{box-sizing:border-box;}
  body{background:var(--bg); color:var(--text); font-family:-apple-system,"Segoe UI",system-ui,sans-serif; margin:0; padding:40px 24px 80px;}
  h1{font-size:28px; margin:0 0 6px;}
  p.sub{color:var(--muted); margin:0 0 32px; font-size:15px;}
  .layout{display:flex; gap:36px; align-items:flex-start; max-width:1200px; margin:0 auto; flex-wrap:wrap;}
  .player{flex:0 0 300px; position:sticky; top:24px;}
  .player video{width:100%; border-radius:18px; border:1px solid var(--line); display:block; background:#000;}
  .player .note{margin-top:14px; font-size:13px; color:var(--muted); line-height:1.5;}
  .right{flex:1; min-width:340px;}
  h2{font-size:18px; margin:0 0 16px;}
  .grid{display:grid; grid-template-columns:repeat(4,1fr); gap:16px;}
  .shot{margin:0; background:var(--card); border:1px solid var(--line); border-radius:12px; overflow:hidden;}
  .shot img{width:100%; display:block;}
  .shot figcaption{padding:8px 10px 10px; font-size:12.5px; color:var(--muted); line-height:1.35;}
  .shot figcaption .t{display:block; font-weight:700; color:var(--accent); font-size:11px; letter-spacing:.5px; margin-bottom:2px;}
  .vo{margin-top:32px; background:var(--card); border:1px solid var(--line); border-radius:12px; padding:20px 22px;}
  .vo h2{margin-bottom:12px;}
  .vo ol{margin:0; padding-left:20px; color:var(--text); font-size:14.5px; line-height:1.9;}
  .vo li b{color:var(--accent); font-weight:700;}
  .audio-tags{display:flex; gap:8px; flex-wrap:wrap; margin-top:16px;}
  .audio-tags span{font-size:12px; background:var(--bg); border:1px solid var(--line); color:var(--muted); padding:5px 12px; border-radius:100px;}
  .path{margin-top:32px; font-size:13px; color:var(--muted); background:var(--card); border:1px solid var(--line); border-radius:10px; padding:14px 16px; word-break:break-all;}
  .path b{color:var(--text);}
  @media (max-width:760px){ .grid{grid-template-columns:repeat(2,1fr);} .player{position:static; flex:1 1 100%;} .player video{max-width:300px; margin:0 auto; } }
</style>

<h1>Folk India — 34s App Ad (local render)</h1>
<p class="sub">Compressed preview below (full 1080×1920 master is on disk). Storyboard on the right shows the key beats.</p>

<div class="layout">
  <div class="player">
    <video controls playsinline>
      <source src="data:video/mp4;base64,${videoB64}" type="video/mp4">
    </video>
    <div class="note">Preview is downscaled (480×854, ~730KB) for embedding. The master file is full HD 1080×1920, H.264/AAC, graded + captioned, 5.8MB.</div>
  </div>

  <div class="right">
    <h2>Storyboard — 8 key frames</h2>
    <div class="grid">
      ${shotCards}
    </div>

    <div class="vo">
      <h2>Voiceover script (Indian-English TTS, synced)</h2>
      <ol>
        <li><b>0:00</b> — "Ever searched for a folk song… and got nothing back?"</li>
        <li><b>0:06</b> — "Or the remix everyone's playing? Same story."</li>
        <li><b>0:11</b> — "Meet Folk India."</li>
        <li><b>0:13</b> — "Every folk track. Every remix. Every chart hit. Instantly."</li>
        <li><b>0:21</b> — "Folk. DJ. Mainstream. Why carry three apps? Folk India. Download now."</li>
      </ol>
      <div class="audio-tags">
        <span>Synthesized tabla-style hit accents</span>
        <span>Low ambient drone bed</span>
        <span>loudnorm mastering pass</span>
        <span>Burned-in captions</span>
      </div>
    </div>

    <div class="path"><b>Full-quality master:</b><br>F:\\Websites\\music landing paga\\ad-bumper\\out\\FolkIndia_Ad_30s.mp4</div>
  </div>
</div>
`;

fs.writeFileSync(path.join(__dirname, 'preview.html'), html);
console.log('Wrote preview.html, size:', fs.statSync(path.join(__dirname, 'preview.html')).size);
