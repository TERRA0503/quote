"""정면 실사 사진에 옆판·윗판을 만들어 붙여 비스듬히 본 모습으로 만든다.
python3 make3d.py <photo> <깊이/가로 비율> <out.png> [옆판색 r,g,b]  → 기하 정보 JSON 출력"""
import sys, json, math
import numpy as np
from PIL import Image
from scipy.ndimage import median_filter, uniform_filter1d
src, ratio, out = sys.argv[1], float(sys.argv[2]), sys.argv[3]
force = np.array([float(v) for v in sys.argv[4].split(',')]) if len(sys.argv) > 4 else None
im = Image.open(src).convert('RGBA'); im = im.crop(im.getbbox())
a = np.asarray(im).astype(np.float32); H, W = a.shape[:2]
al = a[..., 3] > 128
# 본체 오른쪽 끝·위쪽 끝 (배관 등 튀어나온 것 무시)
colcov = al.mean(0); rowcov = al.mean(1)
R = int(np.where(colcov > 0.6)[0][-1]) + 1
T = int(np.where(rowcov > 0.6)[0][0])
a = a[:, :R]; al = al[:, :R]; W = R
ANG = math.radians(28); L = W * ratio * 0.33
dx, dy = int(round(L * math.cos(ANG))), int(round(L * math.sin(ANG)))
OW, OH = W + dx + 2, H + dy + 2
o = np.zeros((OH, OW, 4), np.float32)
# 옆판 색: 오른쪽 끝에서 조금 안쪽 띠의 행별 색 → 세로로 부드럽게
x0 = max(0, W - max(6, W // 30)); band = a[:, x0:W - 2, :3]
m = al[:, x0:W - 2]
rc = np.array([np.median(band[y][m[y]], 0) if m[y].sum() > 1 else [0, 0, 0] for y in range(H)])
valid = m.sum(1) > 1
rc = median_filter(rc, size=(9, 1)); rc = uniform_filter1d(rc, 5, axis=0)
if force is not None: rc[:] = force; rc[-int(H * 0.03):] = a[-int(H * 0.03):, W // 2, :3].mean(0)
bottom = np.where(valid)[0][-1]
for y in range(T, bottom + 1):
    c = rc[y]
    for t in range(dx + 1):
        f = t / max(dx, 1); X = W - 1 + t
        Y0 = y + dy - f * dy
        for Y in (int(Y0), int(Y0) + 1):
            if 0 <= Y < OH and Y - dy <= bottom - f * 0 :
                o[Y, X, :3] = np.clip(c * (0.82 - 0.14 * f) + (8 if t < 2 else 0), 0, 255); o[Y, X, 3] = 255
# 윗판: 위쪽 띠 평균색 (열별, 가로로 부드럽게)
tc = np.median(a[T + 2:T + 12, :, :3], 0); tc = uniform_filter1d(median_filter(tc, size=(15, 1)), 9, axis=0)
if force is not None: tc[:] = force
for x in range(W):
    for t in range(dy + 1):
        f = t / max(dy, 1); X = x + int(round(f * dx)); Y = T + dy - t
        o[Y, X, :3] = np.clip(tc[x] * (1.04 - 0.05 * f) + 6, 0, 255); o[Y, X, 3] = 255
# 오른쪽 위 모서리 삼각형 채우기 (윗판과 옆판 사이)
for t in range(dx + 1):
    f = t / max(dx, 1); X = W - 1 + t; Ytop = int(T + dy - f * dy)
    if o[Ytop, X, 3] == 0: o[Ytop, X, :3] = tc[-1] * 1.0; o[Ytop, X, 3] = 255
reg = o[dy:dy + H, :W]; mm = a[..., 3:4] / 255.0
reg[..., :3] = reg[..., :3] * (1 - mm) + a[..., :3] * mm
reg[..., 3] = np.maximum(reg[..., 3], a[..., 3])
Image.fromarray(o.clip(0, 255).astype(np.uint8), 'RGBA').save(out)
print(json.dumps({'W': OW, 'H': OH, 'fw': W, 'fh': H, 'dx': dx, 'dy': dy}))
