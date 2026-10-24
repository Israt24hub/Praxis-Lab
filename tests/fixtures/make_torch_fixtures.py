"""
Reference values from PyTorch for the Deep Learning labs (src/lib/nn.ts).

Run with PyTorch installed:  python tests/fixtures/make_torch_fixtures.py
It writes tests/fixtures/torch-nn.json, which tests/deep-learning.test.ts compares
against the browser implementation. Everything is in float64 so the comparison can be tight.
"""
import json
import pathlib

import numpy as np
import torch
import torch.nn.functional as F

torch.set_default_dtype(torch.float64)
out = {"torch": torch.__version__}

# 1. Activations and their slopes.
z = torch.linspace(-4, 4, 33, requires_grad=True)
acts = {"relu": torch.relu, "sigmoid": torch.sigmoid, "tanh": torch.tanh, "gelu": F.gelu}
out["activations"] = {"z": z.detach().tolist()}
for name, fn in acts.items():
    y = fn(z)
    (g,) = torch.autograd.grad(y.sum(), z)
    out["activations"][name] = {"f": y.detach().tolist(), "df": g.tolist()}

# 2. Forward and backward through small networks, with each loss.
rng = np.random.default_rng(7)
cases = []
for act in ["tanh", "relu", "sigmoid", "gelu"]:
    for loss_name in ["cross_entropy", "bce", "mse"]:
        sizes = [3, 5, 4, 2 if loss_name != "bce" else 1]
        Ws = [rng.normal(0, 0.8, (a, b)) for a, b in zip(sizes[:-1], sizes[1:])]  # in x out
        bs = [rng.normal(0, 0.3, b) for b in sizes[1:]]
        X = rng.normal(0, 1, (6, 3))
        if loss_name == "cross_entropy":
            y = rng.integers(0, 2, 6)
        elif loss_name == "bce":
            y = rng.integers(0, 2, 6).astype(float)
        else:
            y = rng.normal(0, 1, (6, 2))
        tW = [torch.tensor(W, requires_grad=True) for W in Ws]
        tb = [torch.tensor(b, requires_grad=True) for b in bs]
        A = torch.tensor(X)
        for i in range(3):
            A = A @ tW[i] + tb[i]
            if i < 2:
                A = acts[act](A)
        if loss_name == "cross_entropy":
            loss = F.cross_entropy(A, torch.tensor(y))
        elif loss_name == "bce":
            loss = F.binary_cross_entropy_with_logits(A.squeeze(1), torch.tensor(y))
        else:
            loss = F.mse_loss(A, torch.tensor(y))
        loss.backward()
        cases.append({
            "act": act, "loss": loss_name, "X": X.tolist(), "y": np.asarray(y).tolist(),
            "W": [W.tolist() for W in Ws], "b": [b.tolist() for b in bs],
            "out": A.detach().tolist(), "lossValue": loss.item(),
            "dW": [t.grad.tolist() for t in tW], "db": [t.grad.tolist() for t in tb],
        })
out["networks"] = cases

# 3. Optimizers: 25 steps on a fixed quadratic L(w) = 0.5 wᵀAw − bᵀw, from a fixed start.
A = torch.tensor([[3.0, 0.5, 0.0], [0.5, 1.0, -0.3], [0.0, -0.3, 0.2]])
bvec = torch.tensor([1.0, -2.0, 0.5])
start = [1.5, -1.0, 2.0]
configs = {
    "sgd": lambda p: torch.optim.SGD(p, lr=0.1),
    "momentum": lambda p: torch.optim.SGD(p, lr=0.05, momentum=0.9),
    "adam": lambda p: torch.optim.Adam(p, lr=0.1),
    "adam_l2": lambda p: torch.optim.Adam(p, lr=0.1, weight_decay=0.1),
    "adamw": lambda p: torch.optim.AdamW(p, lr=0.1, weight_decay=0.1),
    "sgd_l2": lambda p: torch.optim.SGD(p, lr=0.1, weight_decay=0.05),
}
out["optimizers"] = {"A": A.tolist(), "b": bvec.tolist(), "start": start, "steps": 25, "paths": {}}
for name, make in configs.items():
    w = torch.tensor(start, requires_grad=True)
    opt = make([w])
    path = [w.detach().tolist()]
    for _ in range(25):
        opt.zero_grad()
        (0.5 * w @ A @ w - bvec @ w).backward()
        opt.step()
        path.append(w.detach().tolist())
    out["optimizers"]["paths"][name] = path

path = pathlib.Path(__file__).with_name("torch-nn.json")
path.write_text(json.dumps(out))
print("wrote", path, "with PyTorch", torch.__version__)
