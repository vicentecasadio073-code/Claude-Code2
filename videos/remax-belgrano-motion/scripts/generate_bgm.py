"""Música procedural (libre de derechos) para el motion graphics de Belgrano.

120 BPM, Sol mayor (G - D - Em - C). Cortes de escena en 4, 10, 15, 20, 27 y 34 s, todos
sobre el beat: antes de cada corte hay un riser corto y en el corte un crash.
Salida: assets/bgm.wav (40 s, estéreo, 44.1 kHz).
Uso: python3 scripts/generate_bgm.py
"""

import os
import wave

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

SR = 44100
BPM = 120
BEAT = 60 / BPM
BAR = BEAT * 4
DUR = 40.0
CUTS = [4.0, 10.0, 15.0, 20.0, 27.0, 34.0]
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "bgm.wav")
rng = np.random.default_rng(7)


def tt(d):
    return np.arange(int(d * SR)) / SR


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def filt(x, kind, f, order=2):
    return sosfilt(butter(order, f, kind, fs=SR, output="sos"), x)


def noise(d):
    return rng.standard_normal(int(d * SR))


def place(buf, x, at, gain=1.0, pan=0.0):
    i = int(round(at * SR))
    if i >= len(buf) or i < 0:
        return
    n = min(len(x), len(buf) - i)
    a = (pan + 1) * np.pi / 4
    buf[i : i + n, 0] += x[:n] * gain * np.cos(a)
    buf[i : i + n, 1] += x[:n] * gain * np.sin(a)


def kick(big=False):
    d = 0.8 if big else 0.4
    t = tt(d)
    f = 45 + (130 if big else 100) * np.exp(-t * 32)
    return np.tanh(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * (4 if big else 9)) * 1.8)


def clap():
    t = tt(0.3)
    x = np.zeros(len(t))
    for off in (0, 0.008, 0.017):
        i = int(off * SR)
        x[i:] += filt(noise(0.3), "bandpass", [900, 4500])[: len(t) - i] * np.exp(-t[: len(t) - i] * 26)
    return x


def hat(open_=False):
    t = tt(0.25 if open_ else 0.05)
    return filt(noise(len(t) / SR), "highpass", 8000, 4) * np.exp(-t * (13 if open_ else 80))


def crash(d=2.0):
    t = tt(d)
    return filt(noise(d), "highpass", 4500) * np.exp(-t * 2.4)


def riser(d=0.75):
    t = tt(d)
    p = t / d
    lo = filt(noise(d), "bandpass", [500, 2000])
    hi = filt(noise(d), "bandpass", [2500, 9000])
    return (lo * (1 - p) + hi * p) * p**2


def snare_roll(d=0.5):
    out = np.zeros(int(d * SR))
    steps = 8
    for k in range(steps):
        x = clap() * (0.3 + 0.7 * k / steps)
        i = int(k * d / steps * SR)
        n = min(len(x), len(out) - i)
        out[i : i + n] += x[:n]
    return out


def stab(notes, d=0.35):
    """Acorde corto tipo house (saws filtradas)."""
    t = tt(d)
    x = np.zeros(len(t))
    for n in notes:
        for det in (-0.006, 0.0, 0.006):
            x += 2 * ((midi(n) * (1 + det) * t + rng.random()) % 1) - 1
    x = filt(x / (len(notes) * 3), "lowpass", 2400)
    return x * np.minimum(1, t / 0.005) * np.exp(-t * 7)


def pad(notes, d):
    t = tt(d)
    x = sum(np.sin(2 * np.pi * midi(n) * t) + 0.3 * np.sin(4 * np.pi * midi(n) * t) for n in notes)
    return x / len(notes) * np.minimum(1, t / 0.3) * np.minimum(1, (d - t) / 0.4)


def bass(n, d):
    t = tt(d)
    f = midi(n)
    x = np.sin(2 * np.pi * f * t) + 0.3 * np.sign(np.sin(2 * np.pi * f * t)) * 0.4
    return filt(x, "lowpass", 600) * np.minimum(1, t / 0.004) * np.minimum(1, (d - t) / 0.02)


def build():
    n = int(DUR * SR)
    drums = np.zeros((n, 2))
    music = np.zeros((n, 2))
    fx = np.zeros((n, 2))
    duck = np.ones(n)
    prog = [(43, [55, 59, 62, 67]), (38, [54, 57, 62, 66]), (40, [55, 59, 64, 67]), (36, [55, 60, 64, 67])]

    def silent_window(at):
        # medio beat de aire justo antes de cada corte
        return any(c - BEAT / 2 <= at < c for c in CUTS)

    for b in range(int(DUR / BAR)):
        t0 = b * BAR
        root, chord = prog[b % 4]
        outro = t0 >= 38.0
        place(music, pad(chord, BAR + 0.3), t0, 0.22)
        if outro:
            continue
        for s in range(8):
            at = t0 + s * BEAT / 2
            if silent_window(at):
                continue
            place(music, bass(root if s % 2 == 0 else root + 12, BEAT / 2 * 0.8), at, 0.33)
            if s in (1, 4, 6):
                place(music, stab(chord), at, 0.28, pan=-0.2 if s == 4 else 0.2)
        for q in range(4):
            at = t0 + q * BEAT
            if silent_window(at):
                continue
            place(drums, kick(), at, 0.95)
            i = int(at * SR)
            m = min(int(0.2 * SR), n - i)
            duck[i : i + m] = np.minimum(duck[i : i + m], 1 - 0.5 * np.exp(-np.arange(m) / SR / 0.07))
            if q in (1, 3):
                place(drums, clap(), at, 0.45)
            place(drums, hat(), at + BEAT / 2, 0.25, pan=0.25)
            place(drums, hat(), at + BEAT / 4, 0.09, pan=-0.25)
            place(drums, hat(), at + 3 * BEAT / 4, 0.09, pan=-0.25)

    for c in CUTS:
        place(fx, riser(0.75), c - 0.75, 0.55)
        place(drums, snare_roll(0.5), c - 0.5, 0.35)
        place(drums, kick(big=True), c, 1.0)
        place(fx, crash(), c, 0.35)

    # golpe inicial y final
    place(drums, kick(big=True), 0.0, 1.0)
    place(fx, crash(), 0.0, 0.3)
    place(drums, kick(big=True), 38.0, 1.0)
    place(fx, crash(2.0), 38.0, 0.35)
    place(music, pad([55, 59, 62, 67, 71], 2.0), 38.0, 0.35)

    music *= duck[:, None]
    ir_t = tt(1.4)
    ir = filt(noise(1.4), "lowpass", 5000) * np.exp(-ir_t * 4)
    ir /= np.sqrt(np.sum(ir**2))
    wet = np.stack([fftconvolve((music + fx)[:, c], ir)[:n] for c in range(2)], axis=1)
    mix = drums + music + fx + wet * 0.22

    t = np.arange(n) / SR
    fade_out = np.clip((DUR - t) / 1.8, 0, 1)
    mix *= np.sin(fade_out * np.pi / 2)[:, None]
    mix = filt(mix.T, "highpass", 30).T
    mix /= np.max(np.abs(mix))
    return np.tanh(mix * 1.5) / np.tanh(1.5) * 0.9


def main():
    x = build()
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with wave.open(OUT, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype("<i2").tobytes())
    print("ok", os.path.abspath(OUT))


if __name__ == "__main__":
    main()
