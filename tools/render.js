const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const items = JSON.parse(fs.readFileSync('specs.json', 'utf8'));
const only = process.argv[2];
const out = process.argv[3] || 'out';
fs.mkdirSync(out, { recursive: true });
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const img64 = p => 'data:image/png;base64,' + fs.readFileSync(p).toString('base64');
const logo = img64('logo.png');
function page(it){
  const dim = it.rows.find(r => r[0].startsWith('외형'))[1].replace(' mm', '');
  const [w, d, h] = dim.split('×').map(s => s.trim());
  const g = it.geo;
  const photo = img64(g ? `3d/${it.id}.png` : `/home/user/greenvalley/img/prod/cut/${it.photo}.png`);
  let stage;
  if(g){
    const S = 440 / g.H, Wd = g.W * S, fw = g.fw * S, fh = g.fh * S, dx = g.dx * S, dy = g.dy * S;
    const x1 = fw + 14, y1 = 440 + 8, x2 = fw + dx + 14, y2 = fh + 8;
    stage = `<div class="stage" style="width:${Wd}px;margin:0 150px 64px 96px">
      <img src="${photo}" style="width:${Wd}px;height:440px;max-width:none">
      <div class="ah" style="top:${dy}px"></div><div class="lh" style="top:${dy + fh / 2}px">높이 ${esc(h)} mm</div>
      <div class="aw" style="right:auto;width:${fw}px"></div><div class="lw" style="right:auto;width:${fw}px">가로 ${esc(w)} mm</div>
      <svg style="position:absolute;left:0;top:0;overflow:visible" width="${Wd}" height="440"><defs><marker id="m" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#1d2733"/></marker></defs><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#1d2733" stroke-width="2.4" marker-start="url(#m)" marker-end="url(#m)"/></svg>
      <div class="ld" style="left:${(x1 + x2) / 2 + 22}px;right:auto;top:${(y1 + y2) / 2 - 6}px;bottom:auto">세로(깊이)<br>${esc(d)} mm</div>
    </div>`;
  }
  const rows = [['모델명', it.model], ...it.rows].map(([k, v]) =>
    `<tr><th>${esc(k.replace('외형 (', '외형 치수 ('))}</th><td>${esc(v)}</td></tr>`).join('');
  const isWasher = it.group.startsWith('washer');
  const note = isWasher ? '모터 소비전력은 장비 전체의 총소비전력을 뜻하지 않습니다. ' : '';
  return `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;800&display=block" rel="stylesheet">
<style>
*{box-sizing:border-box}
body{margin:0;width:860px;background:#fff;font-family:'Noto Sans KR',sans-serif;color:#1d2733;word-break:keep-all}
.top{background:#eef1ec;padding:44px 40px 34px}
h1{margin:0;font-size:34px;font-weight:800;letter-spacing:-.5px}
.sub{margin:8px 0 22px;font-size:17px;color:#5d6873}
.card{background:#fff;border-radius:6px;padding:46px 40px 22px;text-align:center}
.stage{position:relative;display:inline-block;margin:0 110px 64px 96px}
.stage img{display:block;height:440px;width:auto;max-width:520px;object-fit:contain}
.ah{position:absolute;left:-62px;top:0;bottom:0;width:2px;background:#1d2733}
.ah:before,.ah:after,.aw:before,.aw:after{content:'';position:absolute;border:7px solid transparent}
.ah:before{top:-12px;left:-6px;border-bottom:12px solid #1d2733;border-top:0}
.ah:after{bottom:-12px;left:-6px;border-top:12px solid #1d2733;border-bottom:0}
.lh{position:absolute;left:-100px;top:50%;transform:translateY(-50%) rotate(-90deg);font-size:21px;font-weight:700;white-space:nowrap}
.aw{position:absolute;left:0;right:0;bottom:-26px;height:2px;background:#1d2733}
.aw:before{left:-12px;top:-6px;border-right:12px solid #1d2733;border-left:0}
.aw:after{right:-12px;top:-6px;border-left:12px solid #1d2733;border-right:0}
.lw{position:absolute;left:0;right:0;bottom:-66px;font-size:21px;font-weight:700}
.dep{position:absolute;right:-104px;bottom:-18px;width:100px;height:100px}
.ld{white-space:nowrap;position:absolute;right:-150px;bottom:-72px;font-size:19px;font-weight:700;text-align:left;line-height:1.3}
.cap{font-size:13px;color:#7b858f;margin-top:4px}
.warn{font-size:13px;color:#6b7580;margin-top:14px}
.spec{padding:42px 40px 30px}
h2{margin:0;font-size:30px;font-weight:800;letter-spacing:-.5px}
.sub2{margin:8px 0 4px;font-size:17px;color:#5d6873}
.src{margin:0 0 16px;font-size:14px;color:#8a939c}
table{width:100%;border-collapse:collapse;font-size:18px}
th,td{padding:13px 16px;border-bottom:1px solid #dde2e6;text-align:left;vertical-align:middle}
th{width:40%;background:#f3f5f4;font-weight:700}
td{font-weight:500}
tr:first-child td{font-weight:800}
.fn{font-size:13.5px;color:#6b7580;margin-top:12px}
.foot{display:flex;align-items:center;justify-content:space-between;border-top:3px solid #1f6b3a;margin:0 40px;padding:18px 0 30px}
.foot img{height:40px}
.foot span{font-size:19px;font-weight:700;color:#1d2733}
.foot small{display:block;font-size:14px;font-weight:500;color:#5d6873;text-align:right}
</style></head><body>
<div class="top">
  <h1>설치 전, 치수부터 확인하세요.</h1>
  <div class="sub">${esc(it.model)} 외형 치수 · 가로 × 세로(깊이) × 높이</div>
  <div class="card">
    ${stage || `<div class="stage">
      <img src="${photo}">
      <div class="ah"></div><div class="lh">높이 ${esc(h)} mm</div>
      <div class="aw"></div><div class="lw">가로 ${esc(w)} mm</div>
      <svg class="dep" viewBox="0 0 100 100"><defs><marker id="m" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#1d2733"/></marker></defs><line x1="12" y1="88" x2="88" y2="12" stroke="#1d2733" stroke-width="2.4" marker-start="url(#m)" marker-end="url(#m)"/></svg>
      <div class="ld">세로(깊이)<br>${esc(d)} mm</div>
    </div>`}
    <div class="cap">치수 안내용 연출 이미지 · 단위 mm · 실측 비례 도면이 아닙니다.</div>
  </div>
  <div class="warn">외형 치수와 별도로 문 개방, 배관 연결, 점검에 필요한 여유 공간을 확인해야 합니다.</div>
</div>
<div class="spec">
  <h2>${esc(it.model)} 전체 제품 사양</h2>
  <div class="sub2">${esc(it.title)}</div>
  <div class="src">그린벨리 홈페이지 공개 사양 기준</div>
  <table>${rows}</table>
  <div class="fn">${note}제품 사양은 성능 개선을 위해 예고 없이 변경될 수 있습니다. 최종 공급 제품과 설치 조건은 견적 시 확인해 주세요.</div>
</div>
<div class="foot"><img src="${logo}"><span>문의 010-4461-2300<small>greenvalley.co.kr</small></span></div>
</body></html>`;
}
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 860, height: 1000 }, deviceScaleFactor: 1.5 });
  for(const it of items){
    if(only && only !== 'all' && !it.id.includes(only)) continue;
    await p.setContent(page(it), { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: path.join(out, it.id + '.jpg'), fullPage: true, type: 'jpeg', quality: 82 });
    console.log(it.id);
  }
  await b.close();
})();
