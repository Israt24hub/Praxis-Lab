"""
More PyTorch / torchvision / pycocotools reference values for the Computer Vision labs.

Run after make_digits.py, with torch, torchvision, scipy and pycocotools installed:
    python tests/fixtures/make_vision_extra.py
It reads the digits and the shipped CNN weights and writes tests/fixtures/torch-vision-extra.json:
  images     the generated 16×16 scene through ToTensor, Normalize, rgb_to_grayscale, avg-pooling
  transforms flips, rotations and shifts of digit images (torchvision.transforms.v2.functional)
  training   20 full-batch Adam steps of the small CNN from a recorded start (all layers / head only)
  explain    Grad-CAM, bilinear resize, occlusion and rank correlations for a few test images
  detection  box IoU and NMS (torchvision.ops) and COCO average precision (pycocotools)
The scene and the detection boxes are re-typed here from the TypeScript, so a change on either
side shows up as a failing test.
"""
import contextlib
import io
import json
import pathlib
import re

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.transforms.v2.functional as TF
from PIL import Image
from pycocotools.coco import COCO
from pycocotools.cocoeval import COCOeval
from scipy.stats import spearmanr
from torchvision import ops, transforms

ROOT = pathlib.Path(__file__).resolve().parents[2]
torch.set_default_dtype(torch.float64)
out = {}

# ---------- Images: the scene of src/lib/images.ts ----------
S = 16
img = np.zeros((S, S, 3), np.uint8)
for y in range(S):
    for x in range(S):
        if y < 10:
            img[y, x] = [70 + 9 * y, 130 + 7 * y, 200 + 3 * y]
            if (x - 11.5) ** 2 + (y - 3.5) ** 2 <= 6.5:
                img[y, x] = [250, 205, 60]
        else:
            img[y, x] = [60 + ((x + y) % 3) * 8, 140 + ((x * 7 + y) % 4) * 6, 70]
for y in range(8, 13):
    for x in range(3, 8):
        img[y, x] = [120, 70, 40] if y == 8 else [200, 60, 50]
for y in (11, 12):
    img[y, 5] = [70, 45, 35]
img[9, 4] = img[9, 6] = [235, 235, 200]

t = transforms.ToTensor()(Image.fromarray(img))          # (3, 16, 16) float32 in [0, 1]
t64 = torch.tensor(img, dtype=torch.float64).permute(2, 0, 1) / 255
assert torch.allclose(t.double(), t64, atol=1e-7)
norm = transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])(t64)
out["images"] = {
    "hwc": img.ravel().tolist(),
    "chw": t64.ravel().tolist(),
    "normalized": norm.ravel().tolist(),
    "grey": TF.rgb_to_grayscale(t64).ravel().tolist(),
    "down2": F.avg_pool2d(torch.tensor(img, dtype=torch.float64).permute(2, 0, 1)[None], 2)[0].permute(1, 2, 0).ravel().tolist(),
    "down4": F.avg_pool2d(torch.tensor(img, dtype=torch.float64).permute(2, 0, 1)[None], 4)[0].permute(1, 2, 0).ravel().tolist(),
    "normMin": norm.min().item(),
    "normMax": norm.max().item(),
}

# ---------- Digits and the shipped weights ----------
d = json.loads((ROOT / "public" / "datasets" / "digits-8x8.json").read_text())
pix = np.array([int(c, 17) for c in d["pixels"]]).reshape(-1, 64) / 16.0
labels = np.array([int(c) for c in d["labels"]])
is_test = np.array([c == "v" for c in d["split"]])
X = torch.tensor(pix.reshape(-1, 1, 8, 8))
train_idx = np.where(~is_test)[0]
test_idx = np.where(is_test)[0]

src_ts = (ROOT / "src" / "content" / "datasets" / "digits-cnn.ts").read_text()


def weights(name):
    block = src_ts[src_ts.index(f"export const {name}") :]
    block = block[: block.index("};")]
    arr = {k: [float(v) for v in vals.split(",") if v.strip()] for k, vals in re.findall(r"(\w+): \[([^\]]*)\]", block)}
    classes = int(re.search(r"classes: (\d+)", block).group(1))
    return classes, arr


class SmallCNN(nn.Module):
    def __init__(self, n_classes):
        super().__init__()
        self.conv = nn.Conv2d(1, 8, 3)
        self.head = nn.Linear(72, n_classes)

    def forward(self, x):
        self.r = F.relu(self.conv(x))
        if self.r.requires_grad:
            self.r.retain_grad()
        return self.head(F.max_pool2d(self.r, 2).flatten(1))


def load(name):
    classes, w = weights(name)
    m = SmallCNN(classes)
    with torch.no_grad():
        m.conv.weight.copy_(torch.tensor(w["convW"]).view(8, 1, 3, 3))
        m.conv.bias.copy_(torch.tensor(w["convB"]))
        m.head.weight.copy_(torch.tensor(w["headW"]).view(classes, 72))
        m.head.bias.copy_(torch.tensor(w["headB"]))
    return m


full = load("fullCnn")
source = load("sourceCnn")

# ---------- Transforms (augmentations) on 8×8 digits ----------
cases = []
for i in test_idx[:3]:
    x = X[i]  # (1, 8, 8)
    cases.append(
        {
            "index": int(i),
            "flipH": TF.horizontal_flip(x).ravel().tolist(),
            "flipV": TF.vertical_flip(x).ravel().tolist(),
            "rot90": TF.rotate(x, 90).ravel().tolist(),
            "rot180": TF.rotate(x, 180).ravel().tolist(),
            # translate=(dx, dy): right 1 and up 2, nearest pixels, uncovered area filled with 0
            "shift_r1_u2": TF.affine(x, angle=0.0, translate=[1, -2], scale=1.0, shear=[0.0, 0.0]).ravel().tolist(),
            "shift_l2_d1": TF.affine(x, angle=0.0, translate=[-2, 1], scale=1.0, shear=[0.0, 0.0]).ravel().tolist(),
        }
    )
out["transforms"] = cases

# ---------- Training: full-batch Adam from a recorded start ----------
tgt = [i for i in train_idx if labels[i] >= 5][:25]
Xt, yt = X[tgt], torch.tensor(labels[tgt] - 5)
torch.manual_seed(7)
start = SmallCNN(5)
with torch.no_grad():
    start.conv.weight.copy_(source.conv.weight)
    start.conv.bias.copy_(source.conv.bias)
flat = lambda m: {
    "convW": m.conv.weight.detach().ravel().tolist(),
    "convB": m.conv.bias.detach().ravel().tolist(),
    "headW": m.head.weight.detach().ravel().tolist(),
    "headB": m.head.bias.detach().ravel().tolist(),
}
training = {"indices": [int(i) for i in tgt], "start": flat(start), "steps": 20, "lr": 0.01}
for mode in ("all", "head"):
    m = SmallCNN(5)
    m.load_state_dict(start.state_dict())
    params = list(m.parameters()) if mode == "all" else list(m.head.parameters())
    opt = torch.optim.Adam(params, lr=0.01)
    for _ in range(20):
        opt.zero_grad()
        F.cross_entropy(m(Xt), yt).backward()
        opt.step()
    training[mode] = flat(m)
out["training"] = training

# ---------- Augmentation: the same CNN trained on shifted copies ----------
def shifted(x, dx, dy):
    return TF.affine(x, angle=0.0, translate=[dx, dy], scale=1.0, shear=[0.0, 0.0])


SHIFTS = [(0, 0), (1, 0), (-1, 0), (0, 1), (0, -1)]
Xtr, ytr = X[train_idx], torch.tensor(labels[train_idx])
Xaug = torch.cat([shifted(Xtr, dx, dy) for dx, dy in SHIFTS])
yaug = ytr.repeat(len(SHIFTS))
torch.manual_seed(1)  # the seed fullCnn was trained with, so the two differ only in their data
aug = SmallCNN(10)
opt = torch.optim.Adam(aug.parameters(), lr=0.01)
for _ in range(300):
    opt.zero_grad()
    F.cross_entropy(aug(Xaug), yaug).backward()
    opt.step()
with torch.no_grad():
    for prm in aug.parameters():
        prm.copy_(torch.round(prm * 1e6) / 1e6)

TEST_SHIFTS = [(0, 0), (1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (2, 0)]
Xte, yte = X[test_idx], torch.tensor(labels[test_idx])
with torch.no_grad():
    acc = lambda m, dx, dy: (m(shifted(Xte, dx, dy)).argmax(1) == yte).double().mean().item()
    out["augmentation"] = {
        "shifts": TEST_SHIFTS,
        "fullCnn": [acc(full, dx, dy) for dx, dy in TEST_SHIFTS],
        "augCnn": [acc(aug, dx, dy) for dx, dy in TEST_SHIFTS],
        "augTestLogits": aug(Xte).tolist(),
    }
lst = lambda t: json.dumps([round(v, 6) for v in t.detach().flatten().tolist()])
(ROOT / "src" / "content" / "datasets" / "digits-cnn-aug.ts").write_text(
    "/*\n"
    " * Weights of the small digits CNN trained with shift augmentation: the training images plus four\n"
    " * copies moved one pixel left, right, up and down. Same architecture, seed, optimiser and number\n"
    " * of steps as fullCnn in digits-cnn.ts, so the two differ only in their training data. Trained in\n"
    " * PyTorch by tests/fixtures/make_vision_extra.py. Generated file — do not edit by hand.\n"
    " */\n"
    "export const augCnn = {\n"
    f"  classes: 10,\n  convW: {lst(aug.conv.weight)},\n  convB: {lst(aug.conv.bias)},\n"
    f"  headW: {lst(aug.head.weight)},\n  headB: {lst(aug.head.bias)},\n"
    f"  testAccuracy: {round(out['augmentation']['augCnn'][0], 6)},\n}};\n"
)

# ---------- Explanations: Grad-CAM, occlusion, gradient saliency ----------
def occlusion_map(model, x, k, patch=2, fill=0.0):
    with torch.no_grad():
        base = model(x[None])[0, k].item()
        s = torch.zeros(8, 8)
        n = torch.zeros(8, 8)
        for yy in range(8 - patch + 1):
            for xx in range(8 - patch + 1):
                z = x.clone()
                z[0, yy : yy + patch, xx : xx + patch] = fill
                drop = base - model(z[None])[0, k].item()
                s[yy : yy + patch, xx : xx + patch] += drop
                n[yy : yy + patch, xx : xx + patch] += 1
    return (s / n).ravel()


explain = []
for i in test_idx[:5]:
    x = X[i].clone().requires_grad_(True)
    logits = full(x[None])
    k = int(labels[i])
    logits[0, k].backward()
    r, dr = full.r.detach()[0], full.r.grad[0]
    alpha = dr.mean((1, 2))
    cam = F.relu((alpha[:, None, None] * r).sum(0))
    up = F.interpolate(cam[None, None], size=(8, 8), mode="bilinear", align_corners=False)[0, 0]
    sal = x.grad[0].ravel()
    occ = occlusion_map(full, X[i], k)
    explain.append(
        {
            "index": int(i),
            "label": k,
            "probs": F.softmax(logits, 1)[0].detach().tolist(),
            "alpha": alpha.tolist(),
            "cam": cam.ravel().tolist(),
            "camUp": up.ravel().tolist(),
            "inputGrad": sal.tolist(),
            "occlusion": occ.tolist(),
            "rhoSalOcc": spearmanr(np.round(sal.abs().numpy(), 9), np.round(occ.numpy(), 9)).statistic,
            "rhoCamOcc": spearmanr(np.round(up.numpy().ravel(), 9), np.round(occ.numpy(), 9)).statistic,
        }
    )
out["explain"] = explain
out["resize"] = {
    "src": list(range(36)),
    "dst": F.interpolate(torch.arange(36.0).view(1, 1, 6, 6), size=(8, 8), mode="bilinear", align_corners=False).ravel().tolist(),
}

# ---------- Detection: the made-up scene of src/lib/detection-scene.ts ----------
GT = [[40, 60, 90, 110], [120, 40, 170, 92], [200, 90, 246, 136], [260, 30, 300, 72], [150, 130, 196, 176], [172, 134, 216, 178]]
RAW = [
    ([42, 62, 92, 112], 0.96),
    ([36, 56, 88, 106], 0.81),
    ([118, 42, 168, 90], 0.92),
    ([126, 48, 176, 98], 0.70),
    ([204, 94, 252, 142], 0.88),
    ([262, 34, 298, 74], 0.75),
    ([70, 20, 110, 56], 0.66),
    ([255, 24, 296, 68], 0.55),
    ([151, 131, 197, 177], 0.62),
    ([173, 135, 217, 179], 0.85),
    ([10, 150, 50, 190], 0.38),
    ([205, 88, 240, 128], 0.30),
    ([222, 20, 252, 50], 0.22),
]
boxes = torch.tensor([b for b, _ in RAW], dtype=torch.float64)
scores = torch.tensor([s for _, s in RAW], dtype=torch.float64)
gts = torch.tensor(GT, dtype=torch.float64)


def coco_ap(det_idx):
    gt_json = {
        "images": [{"id": 1, "width": 320, "height": 200}],
        "categories": [{"id": 1, "name": "apple"}],
        "annotations": [
            {"id": j + 1, "image_id": 1, "category_id": 1, "bbox": [b[0], b[1], b[2] - b[0], b[3] - b[1]], "area": (b[2] - b[0]) * (b[3] - b[1]), "iscrowd": 0}
            for j, b in enumerate(GT)
        ],
    }
    with contextlib.redirect_stdout(io.StringIO()):
        coco = COCO()
        coco.dataset = gt_json
        coco.createIndex()
        dets = coco.loadRes([{"image_id": 1, "category_id": 1, "bbox": [RAW[i][0][0], RAW[i][0][1], RAW[i][0][2] - RAW[i][0][0], RAW[i][0][3] - RAW[i][0][1]], "score": RAW[i][1]} for i in det_idx])
        ev = COCOeval(coco, dets, "bbox")
        ev.evaluate()
        ev.accumulate()
        ev.summarize()
    # precision[T, R, K, A, M]: IoU thresholds × 101 recall levels × class × area "all" × maxDets 100
    per = [float(np.mean(ev.eval["precision"][t, :, 0, 0, 2])) for t in range(10)]
    return {"ap": ev.stats[0], "ap50": ev.stats[1], "ap75": ev.stats[2], "perThreshold": per}


det = {"gt": GT, "raw": [b for b, _ in RAW], "scores": [s for _, s in RAW], "iou": ops.box_iou(boxes, gts).tolist(), "nms": {}, "coco": {}}
for thr in (0.3, 0.4, 0.5, 0.6, 0.7, 0.8):
    keep = ops.nms(boxes, scores, thr).tolist()
    det["nms"][str(thr)] = keep
    det["coco"][str(thr)] = coco_ap(keep)
det["coco"]["none"] = coco_ap(list(range(len(RAW))))
out["detection"] = det

path = ROOT / "tests" / "fixtures" / "torch-vision-extra.json"
path.write_text(json.dumps(out))
print("wrote", path)
print("augmentation", [round(v, 4) for v in out["augmentation"]["fullCnn"]], [round(v, 4) for v in out["augmentation"]["augCnn"]])
print("norm range", out["images"]["normMin"], out["images"]["normMax"])
for k, v in det["coco"].items():
    print("NMS", k, {a: round(b, 4) for a, b in v.items() if a != "perThreshold"}, [round(p, 3) for p in v["perThreshold"]])
for e in explain:
    print("explain", e["index"], e["label"], round(max(e["probs"]), 4), "rho sal/occ", round(e["rhoSalOcc"], 3), "cam/occ", round(e["rhoCamOcc"], 3))
