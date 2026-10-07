"""Genera la música y los efectos de sonido del video de forma procedural.

Todo el audio sale de osciladores y ruido, así que es 100% libre de derechos.
Los tiempos tienen que coincidir con src/timeline.ts (BPM, drops y duración).

Uso:  python3 scripts/generate_audio.py
Requiere: numpy, scipy
"""

import os
import wave

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

SR = 44100
BPM = 120
BEAT = 60 / BPM  # 0.5 s = 15 frames a 30 fps
BAR = BEAT * 4  # 2 s
DURATION = 38.0
DROP1 = 8.0
DROP2 = 28.0
FADE_START = 35.0

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "audio")
rng = np.random.default_rng(1337)


# ---------------------------------------------------------------- utilidades
def tt(d):
    return np.arange(int(d * SR)) / SR


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def _sos(kind, f, order):
    return butter(order, f, kind, fs=SR, output="sos")


def lp(x, f, order=2):
    return sosfilt(_sos("lowpass", f, order), x, axis=0)


def hp(x, f, order=2):
    return sosfilt(_sos("highpass", f, order), x, axis=0)


def bp(x, lo, hi, order=2):
    return sosfilt(_sos("bandpass", [lo, hi], order), x, axis=0)


def noise(d):
    return rng.standard_normal(int(d * SR))


def saw(freq, d, phase=0.0):
    t = tt(d)
    return 2 * ((freq * t + phase) % 1.0) - 1


def sweep_phase(f):
    return 2 * np.pi * np.cumsum(f) / SR


def supersaw(freq, d, voices=7, detune=0.014):
    out = np.zeros(int(d * SR))
    for i in range(voices):
        k = (i - (voices - 1) / 2) / ((voices - 1) / 2)
        out += saw(freq * (1 + detune * k), d, rng.random())
    return out / voices


def adsr(n, a, r, sustain_end=None):
    env = np.ones(n)
    na = max(1, int(a * SR))
    nr = max(1, int(r * SR))
    env[:na] = np.linspace(0, 1, na)
    if nr < n:
        env[-nr:] *= np.linspace(1, 0, nr)
    return env


def pan(x, p):
    """p: -1 (izq) .. 1 (der), ley de potencia constante."""
    ang = (p + 1) * np.pi / 4
    return np.stack([x * np.cos(ang), x * np.sin(ang)], axis=1)


def stereo(x):
    return pan(x, 0)


def place(buf, x, at, gain=1.0):
    if x.ndim == 1:
        x = stereo(x)
    i = int(round(at * SR))
    if i >= len(buf) or i + len(x) <= 0:
        return
    if i < 0:
        x = x[-i:]
        i = 0
    n = min(len(x), len(buf) - i)
    buf[i : i + n] += x[:n] * gain


def make_ir(d=2.6, decay=2.6, tone=5500, seed=0):
    r = np.random.default_rng(seed)
    t = tt(d)
    left = lp(r.standard_normal(len(t)), tone) * np.exp(-t * decay)
    right = lp(r.standard_normal(len(t)), tone) * np.exp(-t * decay)
    ir = np.stack([left, right], axis=1)
    return ir / np.sqrt(np.sum(ir**2) / 2)


def reverb(x, ir, wet=0.3):
    if x.ndim == 1:
        x = stereo(x)
    out = np.stack(
        [fftconvolve(x[:, c], ir[:, c])[: len(x)] for c in range(2)], axis=1
    )
    return x * (1 - wet) + out * wet


def normalize(x, peak=0.95):
    m = np.max(np.abs(x))
    return x / m * peak if m > 0 else x


def write_wav(name, x, peak=0.95):
    if x.ndim == 1:
        x = stereo(x)
    x = normalize(x, peak)
    data = (np.clip(x, -1, 1) * 32767).astype("<i2")
    os.makedirs(OUT_DIR, exist_ok=True)
    with wave.open(os.path.join(OUT_DIR, name), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())
    print(f"  {name:22s} {len(x) / SR:5.2f}s")


# ---------------------------------------------------------------- instrumentos
def kick(big=False):
    d = 1.4 if big else 0.5
    t = tt(d)
    f = 42 + (160 if big else 120) * np.exp(-t * (22 if big else 32))
    body = np.sin(sweep_phase(f)) * np.exp(-t * (2.6 if big else 7.5))
    click = hp(noise(d), 1500) * np.exp(-t * 260) * 0.35
    return np.tanh((body + click) * (2.4 if big else 1.8))


def snare():
    d = 0.5
    t = tt(d)
    tone = np.sin(sweep_phase(200 - 40 * t)) * np.exp(-t * 22) * 0.55
    body = bp(noise(d), 900, 7000) * np.exp(-t * 13)
    clap = np.zeros_like(t)
    for off in (0.0, 0.011, 0.023):
        i = int(off * SR)
        clap[i:] += bp(noise(d), 1000, 3500)[: len(t) - i] * np.exp(-t[: len(t) - i] * 40)
    return np.tanh((tone + body * 0.8 + clap * 0.5) * 1.5)


def taiko():
    d = 0.9
    t = tt(d)
    body = np.sin(sweep_phase(62 + 55 * np.exp(-t * 18))) * np.exp(-t * 5.5)
    skin = lp(noise(d), 900) * np.exp(-t * 26) * 0.6
    return np.tanh((body + skin) * 1.6)


def hat(open_=False):
    d = 0.35 if open_ else 0.07
    t = tt(d)
    return hp(noise(d), 7500, 4) * np.exp(-t * (11 if open_ else 70))


def tick():
    d = 0.05
    t = tt(d)
    return bp(noise(d), 2500, 6000) * np.exp(-t * 120) + np.sin(2 * np.pi * 3200 * t) * np.exp(-t * 90) * 0.3


def braam(root=26, d=4.5):
    """Bronce gigante tipo trailer: D1 + D2 + A2 distorsionado con filtro que se cierra."""
    t = tt(d)
    x = np.zeros(len(t))
    for n, g in ((root, 1.0), (root + 12, 0.8), (root + 19, 0.45), (root + 24, 0.3)):
        x += supersaw(midi(n), d, voices=5, detune=0.008) * g
    x = np.tanh(x * 2.2)
    bright = lp(x, 2400, 2)
    dark = lp(x, 260, 2)
    morph = np.exp(-t * 1.6)
    out = bright * morph + dark * (1 - morph)
    sub = np.sin(2 * np.pi * midi(root) * t) * 0.9
    env = np.minimum(1, t / 0.015) * np.exp(-t * 0.55)
    return (out + sub) * env


def pluck(freq, d=0.22):
    t = tt(d)
    x = supersaw(freq, d, voices=3, detune=0.006)
    bright = lp(x, 3200)
    dark = lp(x, 700)
    m = np.exp(-t * 22)
    return (bright * m + dark * (1 - m)) * np.exp(-t * 11)


def pad_chord(notes, d, cutoff=1100):
    x = np.zeros(int(d * SR))
    for n in notes:
        x += supersaw(midi(n), d, voices=6, detune=0.012)
    x = lp(x / len(notes), cutoff, 2)
    return x * adsr(len(x), 0.35, 0.6)


def bass_note(n, d):
    t = tt(d)
    f = midi(n)
    x = np.sin(2 * np.pi * f * t) + lp(saw(f, d), 380) * 0.5
    return np.tanh(x * 1.4) * adsr(len(t), 0.005, 0.06)


def riser(d, f0=180, f1=2200):
    t = tt(d)
    prog = t / d
    # ruido que se abre por bandas
    bands = [(200, 800), (600, 2000), (1500, 5000), (4000, 12000)]
    nz = np.zeros(len(t))
    for i, (lo, hi) in enumerate(bands):
        c = i / (len(bands) - 1)
        w = np.clip(1 - np.abs(prog - c) * 2.2, 0, 1)
        nz += bp(noise(d), lo, hi) * w
    f = f0 * (f1 / f0) ** (prog**1.6)
    tone = np.zeros(len(t))
    for k, g in ((1, 1.0), (1.5, 0.5), (2, 0.4)):
        ph = sweep_phase(f * k)
        tone += np.sign(np.sin(ph)) * 0.25 * g + np.sin(ph) * 0.5 * g
    tone = lp(tone, 4000)
    return (nz * 0.8 + tone * 0.35) * prog**2.2


def reverse_crash(d=1.5):
    t = tt(d)
    return hp(noise(d), 3500) * (t / d) ** 3


def crash(d=2.5):
    t = tt(d)
    return hp(noise(d), 4000) * np.exp(-t * 2.2) + bp(noise(d), 300, 3000) * np.exp(-t * 8) * 0.5


# ---------------------------------------------------------------- música
def build_music():
    n = int((DURATION + 0.01) * SR)
    drums = np.zeros((n, 2))
    music = np.zeros((n, 2))  # pads / bajos / ostinato (sidechain)
    fx = np.zeros((n, 2))
    verb_send = np.zeros((n, 2))
    duck = np.ones(n)

    def kick_at(at, big=False, g=1.0):
        place(drums, kick(big), at, g)
        i = int(at * SR)
        dd = int(0.28 * SR)
        if i < n:
            m = min(dd, n - i)
            duck[i : i + m] = np.minimum(
                duck[i : i + m], 1 - 0.65 * np.exp(-np.arange(m) / SR / 0.09)
            )

    # Progresión: Dm  Bb  C  A  (i VI VII V) en re menor, un acorde por compás
    prog = [
        (38, [50, 53, 57]),  # Dm
        (34, [50, 53, 58]),  # Bb
        (36, [52, 55, 60]),  # C
        (33, [49, 52, 57]),  # A
    ]

    # 0-3 s  GANCHO: drone grave + viento, casi silencio
    d = 8.2
    t = tt(d)
    drone = np.sin(2 * np.pi * midi(26) * t) * 0.6 + lp(saw(midi(38), d), 220) * 0.25
    drone *= np.clip(t / 2.5, 0, 1) * np.where(t > 7.8, np.clip((8.0 - t) / 0.2, 0, 1), 1)
    wind = bp(noise(d), 300, 1400) * (0.15 + 0.1 * np.sin(2 * np.pi * 0.4 * t))
    wind *= np.clip(t / 3, 0, 1) * np.where(t > 7.8, 0, 1)
    place(music, drone, 0, 0.55)
    place(fx, wind, 0, 0.18)
    ring = np.sin(2 * np.pi * 1180 * tt(3)) * np.exp(-tt(3) * 1.2) * 0.04
    place(fx, ring, 0.0)

    # 3-8 s  INTRO: golpe del logo + pad + tic-tac + build
    place(fx, braam(26, 4.5), 3.0, 0.3)
    place(verb_send, taiko(), 3.0, 0.5)
    for i, (root, chord) in enumerate([prog[0], prog[1]]):
        place(music, pad_chord(chord, 2.4, 800), 3.5 + i * 2.0, 0.22)
    for b in np.arange(3.0, 7.875, BEAT / 2):
        place(drums, tick(), b, 0.35 if (b / BEAT) % 1 == 0 else 0.2)
    for b in np.arange(4.0, 7.875, BEAT / 2):
        place(music, bass_note(38, BEAT / 2 * 0.9), b, 0.22)
    for b in np.arange(5.0, 7.0, BEAT):
        place(verb_send, taiko(), b, 0.4)
    for b in np.arange(7.0, 7.75, BEAT / 4):
        place(verb_send, taiko(), b, 0.3 + (b - 7.0) * 0.5)
    place(fx, riser(2.875), 5.0, 0.6)
    place(fx, reverse_crash(1.5), DROP1 - 1.5, 0.35)

    # 8-20 s  DROP 1 (halftime épico)
    def groove_halftime(start, bars):
        for bar in range(bars):
            b0 = start + bar * BAR
            kick_at(b0, big=(bar % 4 == 0))
            kick_at(b0 + BEAT * 1.5, g=0.8)
            place(verb_send, snare(), b0 + BEAT * 2, 0.9)
            kick_at(b0 + BEAT * 3.5, g=0.7)
            for s in range(8):
                place(drums, hat(), b0 + s * BEAT / 2, 0.18 if s % 2 else 0.3)
            for s in (1, 3):
                place(verb_send, taiko(), b0 + s * BEAT, 0.45)
            place(verb_send, taiko(), b0 + BEAT * 3.75, 0.35)

    def harmony(start, bars, octave=0, ost_gain=0.32, pad_gain=0.28):
        for bar in range(bars):
            root, chord = prog[bar % 4]
            b0 = start + bar * BAR
            place(music, pad_chord(chord, BAR + 0.3, 1300), b0, pad_gain)
            for s in range(8):
                place(music, bass_note(root, BEAT / 2 * 0.92), b0 + s * BEAT / 2, 0.42)
            # ostinato en semicorcheas (tercera menor sólo en Dm)
            pattern = [0, 12, 7, 12, 0, 15 if root == 38 else 16, 7, 12]
            for s in range(16):
                semis = pattern[s % 8]
                nn = root + 24 + semis + octave
                place(music, pan(pluck(midi(nn)), -0.35 if s % 2 else 0.35), b0 + s * BEAT / 4, ost_gain)

    place(fx, braam(26, 5.0), DROP1, 0.85)
    place(fx, crash(), DROP1, 0.4)
    groove_halftime(DROP1, 6)
    harmony(DROP1, 6)
    place(fx, braam(22, 3.5), 16.0, 0.5)  # Bb grave a mitad de sección

    # 20-28 s  SECCIÓN RÁPIDA (four-on-the-floor) + build
    start = 20.0
    for bar in range(4):
        b0 = start + bar * BAR
        last = bar == 3
        for q in range(4):
            if last and q >= 2:
                break
            kick_at(b0 + q * BEAT, big=(q == 0 and bar == 0))
        if not last:
            place(verb_send, snare(), b0 + BEAT, 0.8)
            place(verb_send, snare(), b0 + BEAT * 3, 0.8)
        for s in range(16):
            place(drums, hat(), b0 + s * BEAT / 4, 0.12 + (0.12 if s % 4 == 2 else 0))
        place(drums, hat(True), b0 + BEAT * 1.5, 0.15)
        place(drums, hat(True), b0 + BEAT * 3.5, 0.15)
    harmony(start, 3, octave=12, ost_gain=0.3, pad_gain=0.3)
    # compás 26-28: redoble acelerando + riser + hueco antes del drop
    b0 = 26.0
    t_roll = b0
    step = BEAT / 2
    while t_roll < DROP2 - 0.13:
        g = 0.3 + 0.6 * (t_roll - b0) / 2
        place(verb_send, snare(), t_roll, g)
        t_roll += step
        if t_roll >= b0 + 1.0:
            step = BEAT / 4
        if t_roll >= b0 + 1.5:
            step = BEAT / 8
    place(music, pad_chord(prog[3][1], 1.9, 900), b0, 0.3)
    place(fx, riser(1.875, 220, 3200), b0, 0.8)
    place(fx, reverse_crash(1.2), DROP2 - 1.2, 0.4)

    # 28-36 s  DROP 2 + final
    place(fx, braam(26, 6.0), DROP2, 0.95)
    place(fx, crash(), DROP2, 0.45)
    groove_halftime(DROP2, 4)
    harmony(DROP2, 4, octave=12, ost_gain=0.3, pad_gain=0.32)
    place(verb_send, taiko(), 33.5, 0.8)
    place(fx, braam(26, 5.0), 36.0, 0.6)
    place(verb_send, taiko(), 36.0, 1.0)
    place(music, pad_chord([50, 53, 57, 62], 3.0, 900), 36.0, 0.35)

    # hueco de silencio justo antes de cada drop (más impacto)
    for drop in (DROP1, DROP2):
        a = int((drop - BEAT / 4) * SR)
        bnd = int(drop * SR)
        for buf in (drums, music, verb_send):
            buf[a:bnd] *= np.linspace(1, 0, bnd - a)[:, None] ** 0.3

    music *= duck[:, None]

    ir = make_ir(2.4, 2.4, 5000, seed=3)
    wet = reverb(verb_send, ir, 0.35)
    music_v = reverb(music, make_ir(1.8, 3.0, 4500, seed=5), 0.2)
    fx_v = reverb(fx, ir, 0.25)

    mix = drums * 0.85 + wet * 0.9 + music_v * 0.9 + fx_v * 0.9
    mix = hp(mix, 28)

    # fade out suave (curva de potencia constante)
    t = np.arange(n) / SR
    fade = np.clip((DURATION - t) / (DURATION - FADE_START), 0, 1)
    mix *= (np.sin(fade * np.pi / 2) ** 1.5)[:, None]

    mix = normalize(mix, 1.0)
    mix = np.tanh(mix * 1.6) / np.tanh(1.6)
    return mix[: int(DURATION * SR)]


# ---------------------------------------------------------------- efectos
def sfx_heartbeat():
    d = 0.75
    t = tt(d)
    out = np.zeros(len(t))
    for at, g, f0 in ((0.0, 1.0, 62), (0.2, 0.7, 70)):
        i = int(at * SR)
        tl = t[: len(t) - i]
        thump = np.sin(sweep_phase(f0 * (0.55 + 0.45 * np.exp(-tl * 25)))) * np.exp(-tl * 14)
        thump += lp(noise(len(tl) / SR), 180) * np.exp(-tl * 30) * 0.5
        out[i:] += thump * g
    return np.tanh(out * 2.2)


def sfx_heart_break():
    d = 1.1
    t = tt(d)
    crack = hp(noise(d), 2500) * np.exp(-t * 90) * 1.3
    thump = np.sin(sweep_phase(90 * (0.5 + 0.5 * np.exp(-t * 20)))) * np.exp(-t * 9)
    hurt = np.sin(sweep_phase(520 * np.exp(-t * 3.5) + 110)) * np.exp(-t * 6) * 0.35
    shards = np.zeros(len(t))
    for _ in range(14):
        at = rng.uniform(0.01, 0.45)
        i = int(at * SR)
        dd = rng.uniform(0.06, 0.2)
        tl = tt(dd)
        f = rng.uniform(2200, 6500)
        g = (np.sin(2 * np.pi * f * tl) + np.sin(2 * np.pi * f * 1.47 * tl) * 0.5) * np.exp(-tl * 30)
        m = min(len(g), len(t) - i)
        shards[i : i + m] += g[:m] * rng.uniform(0.15, 0.35)
    x = crack + thump + hurt + shards
    return reverb(x, make_ir(1.2, 4, 7000, 11), 0.2)


def sfx_fuse():
    d = 0.7
    t = tt(d)
    hiss = hp(noise(d), 3000) * 0.4
    crackle = (rng.random(len(t)) > 0.996) * rng.standard_normal(len(t)) * 3
    crackle = bp(crackle, 1500, 6000)
    return (hiss + crackle) * adsr(len(t), 0.02, 0.1)


def sfx_explosion():
    d = 3.0
    t = tt(d)
    boom = np.sin(sweep_phase(28 + 70 * np.exp(-t * 6))) * np.exp(-t * 2.2) * 1.4
    blast = lp(noise(d), 1400) * np.exp(-t * 3.2)
    burst = noise(d) * np.exp(-t * 40) * 0.8
    deb = (rng.random(len(t)) > 0.997) * rng.standard_normal(len(t)) * 4
    debris = bp(deb, 400, 4000) * np.exp(-t * 1.5) * (t > 0.15)
    x = np.tanh((boom + blast + burst + debris * 0.5) * 2.0)
    return reverb(x, make_ir(2.5, 2.2, 3000, 21), 0.3)


def sfx_sword():
    d = 1.6
    t = tt(d)
    swish_f = np.clip(t / 0.12, 0, 1)
    swish = bp(noise(d), 1500, 9000) * np.sin(np.pi * swish_f) * (t < 0.12) * 0.5
    clang_t = np.clip(t - 0.11, 0, None)
    on = t >= 0.11
    ring = np.zeros(len(t))
    for ratio, g, dec in ((1.0, 1.0, 4), (2.76, 0.7, 5), (5.40, 0.5, 7), (8.93, 0.35, 9), (1.02, 0.6, 3.5)):
        ring += np.sin(2 * np.pi * 1180 * ratio * clang_t) * np.exp(-clang_t * dec) * g
    hit = hp(noise(d), 2000) * np.exp(-clang_t * 60) * 1.2
    x = swish + (ring * 0.35 + hit) * on
    return reverb(pan(x, 0.1), make_ir(1.6, 3, 8000, 31), 0.25)


def sfx_whoosh():
    d = 0.55
    t = tt(d)
    prog = t / d
    env = np.sin(np.pi * prog) ** 2
    lo = bp(noise(d), 300, 1200)
    hi = bp(noise(d), 1500, 6000)
    x = (lo * (1 - prog) + hi * prog) * env
    left = x * (1 - prog * 0.7)
    right = x * (0.3 + prog * 0.7)
    return np.stack([left, right], axis=1)


def sfx_impact():
    d = 2.2
    t = tt(d)
    body = np.sin(sweep_phase(30 + 90 * np.exp(-t * 14))) * np.exp(-t * 2.6)
    snap = hp(noise(d), 1000) * np.exp(-t * 45) * 0.6
    tail = lp(noise(d), 600) * np.exp(-t * 4) * 0.4
    x = np.tanh((body + snap + tail) * 2)
    return reverb(x, make_ir(2.4, 2.0, 4000, 41), 0.3)


def sfx_glitch():
    d = 0.45
    out = np.zeros(int(d * SR))
    pos = 0
    while pos < len(out):
        seg = int(rng.uniform(0.012, 0.045) * SR)
        f = rng.choice([110, 220, 440, 880, 1760, 3520]) * rng.uniform(0.9, 1.1)
        tl = np.arange(seg) / SR
        kind = rng.integers(0, 3)
        if kind == 0:
            g = np.sign(np.sin(2 * np.pi * f * tl))
        elif kind == 1:
            g = noise(seg / SR)
        else:
            g = np.zeros(seg)
        g = np.round(g * 4) / 4  # bitcrush
        m = min(seg, len(out) - pos)
        out[pos : pos + m] = g[:m] * rng.uniform(0.3, 0.8)
        pos += seg
    out *= np.linspace(1, 0.2, len(out))
    return lp(out, 9000)


def sfx_pop():
    d = 0.18
    t = tt(d)
    body = np.sin(sweep_phase(110 + 260 * np.exp(-t * 40))) * np.exp(-t * 22)
    click = hp(noise(d), 3000) * np.exp(-t * 200) * 0.5
    return np.tanh((body + click) * 1.5)


def main():
    print("Generando audio en", os.path.abspath(OUT_DIR))
    write_wav("music.wav", build_music(), 0.97)
    write_wav("heartbeat.wav", sfx_heartbeat())
    write_wav("heart-break.wav", sfx_heart_break())
    write_wav("tnt-fuse.wav", sfx_fuse())
    write_wav("explosion.wav", sfx_explosion())
    write_wav("sword.wav", sfx_sword())
    write_wav("whoosh.wav", sfx_whoosh())
    write_wav("impact.wav", sfx_impact())
    write_wav("glitch.wav", sfx_glitch())
    write_wav("pop.wav", sfx_pop())


if __name__ == "__main__":
    main()
