"""Denoise Cycles keyframes and render two-view depth-aware 1080p24 H.264 exhibition clips.

Usage: python tools/exhibition/encode.py cbd --keys 9
Requirements: NumPy, Pillow, a C++17 compiler, FFmpeg with libx264, Intel Open Image Denoise.
"""
import argparse
import ctypes
import hashlib
import json
import math
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile

import numpy as np
from PIL import Image

HERE = Path(__file__).resolve().parent
OUTPUT = HERE.parents[1] / "dist" / "exhibit"
WIDTH, HEIGHT, FPS = 1920, 1080, 24


def write_pfm(filename, rgb):
    h, w, _ = rgb.shape
    with open(filename, "wb") as stream:
        stream.write(f"PF\n{w} {h}\n-1.0\n".encode("ascii"))
        np.ascontiguousarray(rgb[::-1], dtype="<f4").tofile(stream)


def read_pfm(filename):
    with open(filename, "rb") as stream:
        if stream.readline().strip() != b"PF":
            raise ValueError("OIDN did not return an RGB PFM")
        w, h = map(int, stream.readline().split())
        scale = float(stream.readline().strip())
        rgb = np.fromfile(stream, "<f4" if scale < 0 else ">f4")
        return rgb.reshape(h, w, 3)[::-1] * abs(scale)


def denoised(source, cache, oidn, threads):
    # Digest the input and denoiser binary identity. Render jobs can replace
    # preview frames with final frames of the same name.
    identity = f"oidn-srgb-high-v1|{oidn}|{oidn.stat().st_mtime_ns}"
    digest = hashlib.sha256(identity.encode() + source.read_bytes()).hexdigest()[:18]
    dest = cache / f"{source.stem}-{digest}.npy"
    if dest.exists():
        return np.load(dest, mmap_mode="r")
    with tempfile.TemporaryDirectory(dir=cache, prefix="filter-") as td:
        temp = Path(td)
        with Image.open(source) as image:
            rgb = np.asarray(image.convert("RGB"), dtype=np.float32) / 255
        write_pfm(temp / "input.pfm", rgb)
        subprocess.run([str(oidn), "--device", "cpu", "--ldr", str(temp / "input.pfm"),
                        "--srgb", "--quality", "high", "--maxmem", "480", "--threads", str(threads),
                        "-o", str(temp / "output.pfm")], check=True)
        filtered = read_pfm(temp / "output.pfm")
        if rgb.shape != filtered.shape or not np.isfinite(filtered).all():
            raise ValueError(f"Invalid denoised frame {source}")
        pixels = np.clip(np.rint(filtered * 255), 0, 255).astype(np.uint8)
        np.save(temp / "frame.npy", pixels)
        os.replace(temp / "frame.npy", dest)
    return np.load(dest, mmap_mode="r")


def load_warper(cache):
    source = HERE / "reproject.cpp"
    key = hashlib.sha256(source.read_bytes()).hexdigest()[:16]
    result = cache / f"reproject-{key}.so"
    if not result.exists():
        with tempfile.TemporaryDirectory(dir=cache) as td:
            built = Path(td) / "renderer.so"
            subprocess.run([os.environ.get("CXX", "c++"), "-std=c++17", "-O3",
                            "-fPIC", "-shared", str(source), "-o", str(built)], check=True)
            os.replace(built, result)
    lib = ctypes.CDLL(str(result))
    rgb_array = np.ctypeslib.ndpointer(dtype=np.uint8, flags="C_CONTIGUOUS")
    float_array = np.ctypeslib.ndpointer(dtype=np.float32, flags="C_CONTIGUOUS")
    lib.render_pair.argtypes = [rgb_array, float_array, rgb_array, float_array,
                                *([ctypes.c_int] * 4), *([ctypes.c_float] * 2),
                                float_array, ctypes.c_float, rgb_array]
    lib.render_pair.restype = ctypes.c_int
    return lib.render_pair


def pose(item):
    eye = np.asarray(item["eye"], dtype="f8")
    axes = np.array([item["right"], item["down"], item["forward"]], dtype="f8").T
    if eye.shape != (3,) or axes.shape != (3, 3) or not np.isfinite(eye).all() or not np.isfinite(axes).all():
        raise ValueError("Camera pose contains invalid coordinates")
    if not np.allclose(axes.T @ axes, np.eye(3), atol=2e-4) or abs(np.linalg.det(axes) - 1) > 2e-4:
        raise ValueError("Camera axes must form a right-handed orthonormal frame")
    return eye, axes


def interpolate(a, b, t):
    eye = (1 - t) * a[0] + t * b[0]
    # Rodrigues interpolation on SO(3). Shot intervals follow the shortest
    # rotation between the two supplied Blender orientation matrices.
    delta = a[1].T @ b[1]
    angle = math.acos(float(np.clip((np.trace(delta) - 1) / 2, -1, 1)))
    if angle < 1e-5:
        return eye, a[1]
    if abs(math.sin(angle)) < 1e-5:
        eigenvalues, eigenvectors = np.linalg.eigh((delta + delta.T) / 2)
        axis = eigenvectors[:, np.argmax(eigenvalues)]
    else:
        axis = np.array([delta[2, 1] - delta[1, 2], delta[0, 2] - delta[2, 0],
                         delta[1, 0] - delta[0, 1]]) / (2 * math.sin(angle))
    axis /= max(1e-12, np.linalg.norm(axis))
    x, y, z = axis
    cross = np.array([[0, -z, y], [z, 0, -x], [-y, x, 0]])
    rot = np.eye(3) + math.sin(angle*t)*cross + (1-math.cos(angle*t))*(cross @ cross)
    return eye, a[1] @ rot


def matrix(src, dst):
    rot = dst[1].T @ src[1]
    tr = dst[1].T @ (src[0] - dst[0])
    return np.column_stack([rot, tr])


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("id")
    ap.add_argument("--input-root", type=Path, default=Path("/tmp/jg-render"))
    ap.add_argument("--out", type=Path, default=OUTPUT)
    ap.add_argument("--keys", type=int, help="Require this many finished keyframes")
    ap.add_argument("--seconds", type=float, help="Override the chapter's nominal length")
    ap.add_argument("--threads", type=int, default=3)
    ap.add_argument("--oidn", default=os.environ.get("OIDN_DENOISE") or shutil.which("oidnDenoise") or
                    "/tmp/oidn-2.5.1.x86_64.linux/bin/oidnDenoise")
    args = ap.parse_args()
    if not args.id.replace("-", "").replace("_", "").isalnum():
        ap.error("id must be a single chapter name")
    folder = args.input_root / args.id
    meta = json.loads((folder / "cameras.json").read_text())
    poses = [pose(p) for p in meta["poses"]]
    if len(poses) < 2 or (args.keys is not None and args.keys != len(poses)):
        raise ValueError(f"Found {len(poses)} camera keyframes; expected {args.keys or 'at least two'}")
    w, h = int(meta["width"]), int(meta["height"])
    if w < 2 or h < 2 or abs(w/h - WIDTH/HEIGHT) > .005:
        raise ValueError(f"Expected 16:9 source frames, got {w}×{h}")
    fov = float(meta["fov"])
    if not 0 < fov < 179:
        raise ValueError(f"Unsupported horizontal FOV {fov}")
    sf = w / (2*math.tan(math.radians(fov)*.5))
    tf = sf*WIDTH/w
    seconds = args.seconds if args.seconds is not None else float(meta["shot"]["duration"])
    frames = round(seconds * FPS)
    if frames < 2 or args.threads < 1:
        ap.error("Duration must allow at least two frames and threads must be positive")
    cache = folder / ".encode"
    cache.mkdir(exist_ok=True)
    oidn = Path(args.oidn).resolve(strict=True)
    keys = []
    for i in range(len(poses)):
        stem = f"frame-{i:02}"
        zfile = folder / (stem + ".z")
        if zfile.stat().st_size != w*h*4:
            raise ValueError(f"Invalid Z dimensions for {zfile}")
        depth = np.memmap(zfile, dtype="<f4", mode="r", shape=(h, w))
        rgb = denoised(folder / (stem + ".png"), cache, oidn, args.threads)
        if rgb.shape != (h,w,3):
            raise ValueError(f"Invalid RGB dimensions for {stem}")
        keys.append((rgb, depth))
    render = load_warper(cache)
    args.out.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix=f".{args.id}-", dir=args.out) as td:
        temp = Path(td)
        mp4 = temp / f"{args.id}.mp4"
        cmd = ["ffmpeg", "-hide_banner", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
               "-s", f"{WIDTH}x{HEIGHT}", "-r", str(FPS), "-i", "pipe:0", "-an",
               "-vf", "scale=out_color_matrix=bt709:out_range=tv,format=yuv420p",
               "-c:v", "libx264", "-threads", str(args.threads), "-preset", "fast", "-crf", "16",
               "-g", "48", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
               "-movflags", "+faststart", str(mp4)]
        proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
        out = np.empty((HEIGHT, WIDTH, 3), np.uint8)
        max_holes = 0
        try:
            for j in range(frames):
                position = j*(len(poses)-1)/(frames-1)
                i = min(len(poses)-2, int(position))
                t = position - i
                if t < 1e-8 or t > 1-1e-8:
                    anchor = keys[i+int(t>.5)][0]
                    out[:] = Image.fromarray(anchor).resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS)
                else:
                    target = interpolate(poses[i], poses[i+1], t)
                    transforms = np.ascontiguousarray([matrix(poses[i],target),matrix(target,poses[i]),
                                                       matrix(poses[i+1],target),matrix(target,poses[i+1])], dtype="f4")
                    holes = render(*keys[i], *keys[i+1], w,h,WIDTH,HEIGHT,sf,tf,transforms,t,out)
                    if holes == WIDTH*HEIGHT:
                        raise RuntimeError(f"No jointly visible geometry for frame {j}")
                    max_holes = max(max_holes, holes)
                proc.stdin.write(memoryview(out).cast("B"))
                if j == frames//2:
                    cover = Image.fromarray(out)
                    cover.save(temp / f"{args.id}.webp", quality=94, method=6)
                    cover.resize((480,270), Image.Resampling.LANCZOS).save(temp / f"{args.id}-thumb.webp", quality=86,method=6)
                if j % FPS == 0:
                    print(f"{args.id}: {j+1}/{frames}", flush=True)
            proc.stdin.close()
            if proc.wait():
                raise RuntimeError("FFmpeg could not finish the clip")
        except BaseException:
            proc.kill()
            proc.wait()
            raise
        for name in (f"{args.id}.webp", f"{args.id}-thumb.webp", f"{args.id}.mp4"):
            os.replace(temp / name, args.out / name)
    print(f"{args.id}: {frames} frames, 1080p24. Maximum spatially repaired fraction {max_holes/(WIDTH*HEIGHT):.4%}.", flush=True)


if __name__ == "__main__":
    main()
