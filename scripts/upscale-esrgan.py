"""
Tiled 4x Real-ESRGAN upscale with feathered overlaps (CPU, onnxruntime).

Used once to make scripts/assets/diwali-hero-mpf-4x.webp from the 2172x724
banner artwork, so the Diwali hero stays sharp on high-DPI screens.

  pip install onnxruntime pillow numpy
  # model (not committed, 67 MB):
  # https://huggingface.co/bukuroo/RealESRGAN-ONNX/resolve/main/real-esrgan-x4plus-128.onnx
  python scripts/upscale-esrgan.py real-esrgan-x4plus-128.onnx in.png out.png
"""
import sys, time
import numpy as np
import onnxruntime as ort
from PIL import Image

model, src, dst = sys.argv[1:4]
T, OV, S = 128, 24, 4
sess = ort.InferenceSession(model, providers=["CPUExecutionProvider"])
img = np.asarray(Image.open(src).convert("RGB"), dtype=np.float32) / 255.0
H, W, _ = img.shape
out = np.zeros((H * S, W * S, 3), np.float32)
acc = np.zeros((H * S, W * S, 1), np.float32)

# feather window (linear ramp over the overlap) for seamless blending
ramp = np.minimum(np.arange(T * S) + 1, np.arange(T * S)[::-1] + 1).astype(np.float32)
ramp = np.clip(ramp / (OV * S), 0, 1)
win = (ramp[:, None] * ramp[None, :])[..., None] + 1e-4

def starts(n):
    st = list(range(0, max(n - T, 0) + 1, T - OV))
    if st[-1] != n - T: st.append(n - T)
    return st

ys, xs = starts(H), starts(W)
t0 = time.time()
for i, y in enumerate(ys):
    for x in xs:
        tile = img[y:y + T, x:x + T].transpose(2, 0, 1)[None]
        up = sess.run(None, {"image": tile})[0][0].transpose(1, 2, 0)
        out[y*S:(y+T)*S, x*S:(x+T)*S] += up * win
        acc[y*S:(y+T)*S, x*S:(x+T)*S] += win
    print(f"row {i+1}/{len(ys)}  {time.time()-t0:.0f}s", flush=True)

res = np.clip(out / acc, 0, 1)
Image.fromarray((res * 255 + 0.5).astype(np.uint8)).save(dst)
print("saved", dst, res.shape)
