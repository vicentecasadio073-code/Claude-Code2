"""Música de fondo procedural (libre de derechos) para el video de Belgrano.

120 BPM en Sol mayor (G - D - Em - C). Los cortes de escena (4, 10, 15, 20, 27, 34 s)
caen sobre beats. Salida: assets/bgm.wav (40 s, estéreo, 44.1 kHz).
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
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "bgm.wav")
rng = np.random.default_rng(42)


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
    if i >= len(buf):
        return
    n = min(len(x), len(buf) - i)
    a = (pan + 1) * np.pi / 4
    buf[i : i + n, 0] += x[:n] * gain * np.cos(a)
    buf[i : i + n, 1] += x[:n] * gain * np.sin(a)


def kick():
    t = tt(0.4)
    f = 48 + 90 * np.exp(-t * 35)
    return np.tanh(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9) * 1.6)


def clap():
    t = tt(0.3)
    x = np.zeros(len(t))
    for off in (0, 0.009, 0.019):
        i = int(off * SR)
        x[i:] += filt(noise(0.3), "bandpass", [900, 4000])[: len(t) - i] * np.exp(-t[: len(t) - i] * 28)
    return x * 0.8


def hat(open_=False):
    t = tt(0.25 if open_ else 0.05)
    return filt(noise(len(t) / SR), "highpass", 8000, 4) * np.exp(-t * (14 if open_ else 80))


def keys(notes, d):
    """Acorde tipo e-piano: senos con armónicos suaves y trémolo."""
    t = tt(d)
    x = np.zeros(len(t))
    for n in notes:
        f = midi(n)
        x += np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 3)
    env = np.minimum(1, t / 0.01) * np.exp(-t * 1.1)
    return x / len(notes) * env * (1 + 0.08 * np.sin(2 * np.pi * 5 * t))


def pluck(f, d=0.25):
    t = tt(d)
    x = 2 * ((f * t) % 1) - 1
    return filt(x, "lowpass", 2600) * np.exp(-t * 14)


def bass(n, d):
    t = tt(d)
    f = midi(n)
    x = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t)
    env = np.minimum(1, t / 0.005) * np.minimum(1, (d - t) / 0.03)
    return x * env


def build():
    n = int(DUR * SR)
    drums = np.zeros((n, 2))
    music = np.zeros((n, 2))
    duck = np.ones(n)
    prog = [(43, [55, 59, 62, 67]), (38, [54, 57, 62, 66]), (40, [55, 59, 64, 67]), (36, [55, 60, 64, 67])]
    arp = [0, 7, 12, 16, 12, 7, 19, 12]

    bars = int(DUR / BAR)
    for b in range(bars):
        t0 = b * BAR
        root, chord = prog[b % 4]
        intro = t0 < 4.0
        outro = t0 >= 36.0
        place(music, keys(chord, BAR + 0.5), t0, 0.32)
        if not intro:
            for s in range(8):
                place(music, bass(root, BEAT / 2 * 0.85), t0 + s * BEAT / 2, 0.35 if s % 2 == 0 else 0.22)
        for s in range(8):
            nn = chord[0] + arp[s] + 12
            place(music, pluck(midi(nn)), t0 + s * BEAT / 2, 0.12 if intro else 0.16, pan=-0.4 if s % 2 else 0.4)
        if intro or outro:
            continue
        for q in range(4):
            at = t0 + q * BEAT
            place(drums, kick(), at, 0.9)
            i = int(at * SR)
            m = min(int(0.22 * SR), n - i)
            duck[i : i + m] = np.minimum(duck[i : i + m], 1 - 0.45 * np.exp(-np.arange(m) / SR / 0.08))
            if q in (1, 3):
                place(drums, clap(), at, 0.5)
            place(drums, hat(), at + BEAT / 2, 0.22, pan=0.2)
            place(drums, hat(), at + BEAT / 4, 0.08, pan=-0.2)
            place(drums, hat(), at + 3 * BEAT / 4, 0.08, pan=-0.2)
        place(drums, hat(True), t0 + BEAT * 3.5, 0.12)

    # golpe final en 36 s y acorde que se apaga
    place(drums, kick(), 36.0, 1.0)
    place(music, keys([55, 59, 62, 67, 71], 4.0), 36.0, 0.35)

    music *= duck[:, None]
    ir_t = tt(1.6)
    ir = filt(noise(1.6), "lowpass", 5000) * np.exp(-ir_t * 3.5)
    ir /= np.sqrt(np.sum(ir**2))
    wet = np.stack([fftconvolve(music[:, c], ir)[:n] for c in range(2)], axis=1)
    mix = drums + music * 0.85 + wet * 0.25

    t = np.arange(n) / SR
    fade_in = np.clip(t / 0.6, 0, 1)
    fade_out = np.clip((DUR - t) / 3.5, 0, 1)
    mix *= (fade_in * np.sin(fade_out * np.pi / 2))[:, None]
    mix = filt(mix.T, "highpass", 30).T
    mix /= np.max(np.abs(mix))
    return np.tanh(mix * 1.3) / np.tanh(1.3) * 0.9


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
