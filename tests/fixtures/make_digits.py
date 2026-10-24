"""
Data and pretrained weights for the Computer Vision labs.

Run with PyTorch and scikit-learn installed:  python tests/fixtures/make_digits.py
It writes:
  public/datasets/digits-8x8.json     the 8×8 digits with a fixed stratified train/test split
  src/content/datasets/digits-cnn.ts  weights of two small CNNs trained here in PyTorch
  tests/fixtures/torch-vision.json    PyTorch reference values for the browser code

The digits are the UCI "Optical Recognition of Handwritten Digits" test set as shipped
with scikit-learn: E. Alpaydin & C. Kaynak (1998), CC BY 4.0, doi:10.24432/C50P49.
"""
import json
import pathlib

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from sklearn.datasets import load_digits

ROOT = pathlib.Path(__file__).resolve().parents[2]
torch.set_default_dtype(torch.float64)

# ---------- Data and split ----------
d = load_digits()
pixels = d.data.astype(int)            # (1797, 64), values 0..16
labels = d.target.astype(int)
rng = np.random.default_rng(2026)
is_test = np.zeros(len(labels), bool)
for c in range(10):
    idx = np.where(labels == c)[0]
    rng.shuffle(idx)
    is_test[idx[: round(len(idx) * 0.3)]] = True

data = {
    "source": "UCI Optical Recognition of Handwritten Digits (test set, as shipped with scikit-learn)",
    "creators": "E. Alpaydin and C. Kaynak, 1998",
    "doi": "10.24432/C50P49",
    "licence": "CC BY 4.0",
    "size": 8,
    "maxValue": 16,
    "pixels": "".join("0123456789abcdefg"[v] for v in pixels.ravel()),
    "labels": "".join(str(v) for v in labels),
    "split": "".join("v" if t else "t" for t in is_test),
}
out = ROOT / "public" / "datasets" / "digits-8x8.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(data))

X = torch.tensor(pixels.reshape(-1, 1, 8, 8) / 16.0)
y = torch.tensor(labels)
train, test = ~torch.tensor(is_test), torch.tensor(is_test)


# ---------- A small CNN: conv 3×3 (8 filters) → ReLU → max-pool 2 → linear ----------
class SmallCNN(nn.Module):
    def __init__(self, n_classes, channels=8):
        super().__init__()
        self.conv = nn.Conv2d(1, channels, 3)      # (N, 1, 8, 8) -> (N, 8, 6, 6)
        self.head = nn.Linear(channels * 9, n_classes)

    def forward(self, x):
        h = F.max_pool2d(F.relu(self.conv(x)), 2)  # -> (N, 8, 3, 3)
        return self.head(h.flatten(1))             # -> (N, n_classes)


def fit(model, Xs, ys, epochs=300, lr=0.01):
    opt = torch.optim.Adam(model.parameters(), lr=lr)
    for _ in range(epochs):
        opt.zero_grad()
        F.cross_entropy(model(Xs), ys).backward()
        opt.step()
    return model


def rounded(model):
    with torch.no_grad():
        for p in model.parameters():
            p.copy_(torch.round(p * 1e6) / 1e6)
    return model


torch.manual_seed(0)
src_mask = train & (y < 5)
source = rounded(fit(SmallCNN(5), X[src_mask], y[src_mask]))
torch.manual_seed(1)
full = rounded(fit(SmallCNN(10), X[train], y[train]))

with torch.no_grad():
    src_acc = (source(X[test & (y < 5)]).argmax(1) == y[test & (y < 5)]).double().mean().item()
    full_logits = full(X[test])
    full_acc = (full_logits.argmax(1) == y[test]).double().mean().item()

ts = ROOT / "src" / "content" / "datasets" / "digits-cnn.ts"
lst = lambda t: json.dumps([round(v, 6) for v in t.detach().flatten().tolist()])
ts.write_text(
    "/*\n"
    " * Weights of two small CNNs (conv 3×3 with 8 filters → ReLU → max-pool 2 → linear), trained in\n"
    " * PyTorch by tests/fixtures/make_digits.py on the training split of the 8×8 digits. Flat arrays in\n"
    " * PyTorch's order: conv weight (8, 1, 3, 3), conv bias (8), head weight (classes, 72), head bias.\n"
    " * Generated file — do not edit by hand.\n"
    " */\n"
    "export const sourceCnn = {\n"
    "  // Trained on digits 0–4 only (the source task for transfer learning).\n"
    f"  classes: 5,\n  convW: {lst(source.conv.weight)},\n  convB: {lst(source.conv.bias)},\n"
    f"  headW: {lst(source.head.weight)},\n  headB: {lst(source.head.bias)},\n"
    f"  testAccuracy: {round(src_acc, 6)},\n}};\n\n"
    "export const fullCnn = {\n"
    "  // Trained on all ten digits.\n"
    f"  classes: 10,\n  convW: {lst(full.conv.weight)},\n  convB: {lst(full.conv.bias)},\n"
    f"  headW: {lst(full.head.weight)},\n  headB: {lst(full.head.bias)},\n"
    f"  testAccuracy: {round(full_acc, 6)},\n}};\n"
)

# ---------- Reference values for the browser code ----------
ref = {"torch": torch.__version__}
ref["fullTestLogits"] = full_logits.tolist()
ref["fullTestAccuracy"] = full_acc
ref["sourceTestAccuracy"] = src_acc

g = torch.Generator().manual_seed(3)
convs = []
for (c_in, c_out, h, w, k, s, p) in [(1, 2, 6, 6, 3, 1, 0), (2, 3, 7, 5, 3, 2, 1), (1, 1, 8, 8, 3, 1, 1), (3, 2, 9, 9, 2, 2, 0)]:
    x = torch.randn(1, c_in, h, w, generator=g, requires_grad=True)
    wt = torch.randn(c_out, c_in, k, k, generator=g, requires_grad=True)
    b = torch.randn(c_out, generator=g, requires_grad=True)
    o = F.conv2d(x, wt, b, stride=s, padding=p)
    go = torch.randn(o.shape, generator=g)
    o.backward(go)
    convs.append({"cin": c_in, "cout": c_out, "h": h, "w": w, "k": k, "stride": s, "padding": p,
                  "x": x.detach().flatten().tolist(), "weight": wt.detach().flatten().tolist(), "bias": b.detach().tolist(),
                  "out": o.detach().flatten().tolist(), "outShape": list(o.shape[1:]), "gradOut": go.flatten().tolist(),
                  "dx": x.grad.flatten().tolist(), "dw": wt.grad.flatten().tolist(), "db": b.grad.tolist()})
ref["conv"] = convs

pools = []
for kind in ["max", "avg"]:
    x = torch.randn(1, 2, 6, 6, generator=g, requires_grad=True)
    o = (F.max_pool2d if kind == "max" else F.avg_pool2d)(x, 2)
    go = torch.randn(o.shape, generator=g)
    o.backward(go)
    pools.append({"kind": kind, "x": x.detach().flatten().tolist(), "out": o.detach().flatten().tolist(),
                  "gradOut": go.flatten().tolist(), "dx": x.grad.flatten().tolist()})
ref["pool"] = pools

# Gradients of the full CNN's loss on a small batch, for the training code.
xb, yb = X[test][:6].clone(), y[test][:6]
model = SmallCNN(10)
model.load_state_dict(full.state_dict())
F.cross_entropy(model(xb), yb).backward()
ref["cnnGrads"] = {"idx": list(range(6)), "convW": model.conv.weight.grad.flatten().tolist(),
                   "convB": model.conv.bias.grad.tolist(), "headW": model.head.weight.grad.flatten().tolist(),
                   "headB": model.head.bias.grad.tolist()}
xg = xb.clone().requires_grad_()
model(xg)[0, yb[0]].backward()
ref["inputGrad"] = xg.grad[0].flatten().tolist()

(ROOT / "tests" / "fixtures" / "torch-vision.json").write_text(json.dumps(ref))
print("train", int(train.sum()), "test", int(test.sum()), "source acc", round(src_acc, 4), "full acc", round(full_acc, 4))
