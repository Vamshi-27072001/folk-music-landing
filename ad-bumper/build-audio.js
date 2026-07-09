const { spawnSync } = require('child_process');
const path = require('path');

const DIR = path.join(__dirname, 'audio');
const OUT = path.join(__dirname, 'out', 'final_audio.wav');
const TOTAL = 34.0;

// [inputIndex info] we build inputs in order, then reference by index
const inputs = [];
function addInput(args) { inputs.push(args); return inputs.length - 1; }

// 0: ambient drone bed (built inline via filter, not a separate input file)
// VO files
const voFiles = ['vo1.wav', 'vo2.wav', 'vo3.wav', 'vo4.wav', 'vo5.wav'];
const voStarts = [0.35, 5.789, 10.820, 13.301, 20.772]; // seconds

const bigHits = [0.0, 10.44, 20.58, 26.0];
const smallHits = [10.65, 10.85, 11.05, 15.6, 18.0];

let cmd = ['ffmpeg', '-y', '-loglevel', 'error'];

// bed oscillators (3 drone tones) — generated via lavfi, duration = TOTAL
cmd.push('-f', 'lavfi', '-i', `sine=frequency=73.4:duration=${TOTAL}`);
cmd.push('-f', 'lavfi', '-i', `sine=frequency=110:duration=${TOTAL}`);
cmd.push('-f', 'lavfi', '-i', `sine=frequency=146.8:duration=${TOTAL}`);
const BED_D2 = 0, BED_A2 = 1, BED_D3 = 2;
let nextIdx = 3;

// VO inputs
const voIdx = [];
for (const f of voFiles) {
  cmd.push('-i', path.join(DIR, f));
  voIdx.push(nextIdx++);
}

// hit inputs
const bigHitIdx = [];
for (const t of bigHits) {
  cmd.push('-i', path.join(DIR, 'hitBig.wav'));
  bigHitIdx.push(nextIdx++);
}
const smallHitIdx = [];
for (const t of smallHits) {
  cmd.push('-i', path.join(DIR, 'hitSmall.wav'));
  smallHitIdx.push(nextIdx++);
}

// ---- filter_complex ----
const filters = [];

// bed: mix 3 drones, slow tremolo, lowpass, low volume, fade in/out
filters.push(`[${BED_D2}]volume=0.6[d2]`);
filters.push(`[${BED_A2}]volume=0.45[d3]`);
filters.push(`[${BED_D3}]volume=0.35[d4]`);
filters.push(`[d2][d3][d4]amix=inputs=3:duration=longest[beda]`);
filters.push(`[beda]tremolo=f=0.15:d=0.3,lowpass=f=900,volume=0.11,afade=t=in:st=0:d=1.2,afade=t=out:st=${TOTAL - 1.5}:d=1.5[bed]`);

const mixLabels = ['[bed]'];

// VO
voIdx.forEach((idx, i) => {
  const ms = Math.round(voStarts[i] * 1000);
  const lbl = `vo${i}`;
  filters.push(`[${idx}]volume=1.6,adelay=${ms}|${ms}[${lbl}]`);
  mixLabels.push(`[${lbl}]`);
});

// big hits
bigHitIdx.forEach((idx, i) => {
  const ms = Math.round(bigHits[i] * 1000);
  const lbl = `bh${i}`;
  filters.push(`[${idx}]volume=0.8,adelay=${ms}|${ms}[${lbl}]`);
  mixLabels.push(`[${lbl}]`);
});

// small hits
smallHitIdx.forEach((idx, i) => {
  const ms = Math.round(smallHits[i] * 1000);
  const lbl = `sh${i}`;
  filters.push(`[${idx}]volume=0.55,adelay=${ms}|${ms}[${lbl}]`);
  mixLabels.push(`[${lbl}]`);
});

filters.push(`${mixLabels.join('')}amix=inputs=${mixLabels.length}:duration=longest:normalize=0[premix]`);
filters.push(`[premix]alimiter=limit=0.9,loudnorm=I=-16:TP=-1.5:LRA=11[out]`);

cmd.push('-filter_complex', filters.join(';'));
cmd.push('-map', '[out]');
cmd.push('-t', String(TOTAL));
cmd.push(OUT);

const [bin, ...args] = cmd;
const res = spawnSync(bin, args, { stdio: 'inherit' });
if (res.status !== 0) {
  console.error('ffmpeg failed with status', res.status, res.error);
  process.exit(res.status || 1);
}
console.log('Done ->', OUT);
