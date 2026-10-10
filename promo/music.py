"""Soundtrack for promo.html: 36 s, 120 bpm (one bar = 2 s, scene cuts land on bars).
Everything is synthesised with numpy, so there is no licensing question.
Usage: python3 music.py out.wav
"""
import sys, wave
import numpy as np

SR = 44100
DUR = 36.0
N = int(SR * DUR)
rng = np.random.default_rng(7)
t_all = np.arange(N) / SR

def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)

def env_adsr(n, a, r, sr=SR):
    e = np.ones(n)
    na, nr = int(a * sr), int(r * sr)
    if na: e[:na] = np.linspace(0, 1, na)
    if nr: e[-nr:] *= np.linspace(1, 0, nr)
    return e

def bandpass(x, lo, hi):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    m = 1 / (1 + (lo / np.maximum(f, 1)) ** 4) / (1 + (f / hi) ** 4)
    return np.fft.irfft(X * m, len(x))

def add(buf, sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N: return
    sig = sig[: N - i]
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[0, i:i + len(sig)] += sig * gain * l * 1.41
    buf[1, i:i + len(sig)] += sig * gain * r * 1.41

dry = np.zeros((2, N))
wet = np.zeros((2, N))   # sent to reverb

# ---------- Pad: Fmaj7 – Am7 – Dm7 – Bbmaj7 ----------
chords = [[53, 57, 60, 64], [57, 60, 64, 67], [50, 57, 60, 65], [46, 53, 57, 62]]
bar = 2.0
for b in range(int(DUR / bar)):
    start = b * bar
    notes = chords[b % 4]
    n = int((bar + .6) * SR)
    tt = np.arange(n) / SR
    # brightness opens after the logo reveal at 4 s
    bright = 2.2 if start < 4 else (5.5 if start < 32 else 4.0)
    for k, m in enumerate(notes):
        for det, pan in ((-7, -.6), (7, .6)):
            f = midi(m) * 2 ** (det / 1200)
            sig = np.zeros(n)
            for h in range(1, 11):
                sig += np.sin(2 * np.pi * f * h * tt + h * 1.3 + k) / h * np.exp(-h / bright)
            sig *= env_adsr(n, .45, .7)
            g = 2.0 if start < 4 else 1.0       # intro has no drums: lift the pad
            add(dry, sig, start, .035 * g, pan)
            add(wet, sig, start, .03 * g, pan)

# Sidechain pump on the pad once the beat starts
beat = .5
ph = (t_all % beat) / beat
pump = np.where(t_all >= 4, 1 - .45 * np.exp(-ph * 9), 1.0)
pump = np.where(t_all >= 34, 1.0, pump)
dry *= pump; wet *= pump

# ---------- Drums ----------
def kick():
    n = int(.45 * SR); tt = np.arange(n) / SR
    f = 48 + 110 * np.exp(-tt * 28)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 7.5)
    s[:int(.004 * SR)] += rng.standard_normal(int(.004 * SR)) * .3
    return np.tanh(s * 1.6)

def clap():
    n = int(.25 * SR); tt = np.arange(n) / SR
    nz = bandpass(rng.standard_normal(n), 900, 4500)
    e = np.exp(-tt * 22) + .6 * np.exp(-np.maximum(tt - .012, 0) * 30) * (tt > .012)
    return nz * e / np.abs(nz).max()

def hat():
    n = int(.08 * SR); tt = np.arange(n) / SR
    nz = bandpass(rng.standard_normal(n), 7000, 16000)
    return nz * np.exp(-tt * 70) / np.abs(nz).max()

K, C, H = kick(), clap(), hat()
for i in range(int(DUR / beat)):
    at = i * beat
    if 4 <= at < 34:
        if not (31.0 <= at < 32):          # short break before the end card
            add(dry, K, at, .45)
    if 8 <= at < 34 and i % 2 == 1 and not (31.0 <= at < 32):
        add(dry, C, at, .16, .1); add(wet, C, at, .06)
    if 8 <= at < 34 and not (31.0 <= at < 32):
        add(dry, H, at + beat / 2, .07, .35)
        if at >= 14: add(dry, H, at + beat / 4, .03, -.35)

# ---------- Bass: offbeat eighths on the chord root ----------
roots = [41, 45, 38, 34]
for i in range(int(DUR / beat)):
    at = i * beat + beat / 2
    if 4 <= at < 34 and not (31.0 <= at < 32):
        m = roots[int(at // bar) % 4]
        n = int(.32 * SR); tt = np.arange(n) / SR
        f = midi(m)
        s = (np.sin(2 * np.pi * f * tt) + .35 * np.sin(4 * np.pi * f * tt)) * np.exp(-tt * 9)
        s *= env_adsr(n, .005, .05)
        add(dry, np.tanh(s * 1.4), at, .22)

# ---------- FX ----------
def riser(d):
    n = int(d * SR); tt = np.arange(n) / SR; p = tt / d
    nz = bandpass(rng.standard_normal(n), 2000, 12000) * p ** 2.2
    sw = np.sin(2 * np.pi * np.cumsum(220 + 1400 * p ** 2) / SR) * p ** 2 * .25
    return (nz / np.abs(nz).max() + sw)

def impact():
    n = int(2.2 * SR); tt = np.arange(n) / SR
    boom = np.sin(2 * np.pi * np.cumsum(38 + 60 * np.exp(-tt * 10)) / SR) * np.exp(-tt * 2.4)
    nz = bandpass(rng.standard_normal(n), 200, 6000) * np.exp(-tt * 6)
    return np.tanh(boom * 1.4) + .25 * nz / np.abs(nz).max()

def whoosh(d=.6):
    n = int(d * SR); tt = np.arange(n) / SR; p = tt / d
    nz = bandpass(rng.standard_normal(n), 400, 7000)
    e = np.where(p < .7, (p / .7) ** 2, (1 - (p - .7) / .3) ** 1.5)
    return nz / np.abs(nz).max() * e

def pop(f=900):
    n = int(.09 * SR); tt = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(f * (1 + .6 * np.exp(-tt * 60))) / SR) * np.exp(-tt * 45)

def chime(m1=84, m2=91):
    n = int(1.2 * SR); tt = np.arange(n) / SR
    s = np.sin(2 * np.pi * midi(m1) * tt) * np.exp(-tt * 5)
    s2 = np.zeros(n); o = int(.09 * SR)
    s2[o:] = np.sin(2 * np.pi * midi(m2) * tt[:n - o]) * np.exp(-tt[:n - o] * 4.5)
    return (s + s2) * .5

add(dry, riser(2.4), 1.6, .16); add(wet, riser(2.4), 1.6, .08)
for at in (4.0, 32.0):
    add(dry, impact(), at, .5); add(wet, impact(), at, .25)
for at in (8, 14, 20, 24, 28):
    add(dry, whoosh(), at - .45, .12, -.2); add(wet, whoosh(), at - .45, .08)
for lt in (1.0, 1.75, 4.1, 4.5, 4.85):               # taps on the phone (scene 3)
    add(dry, pop(1100), 8 + lt, .12, .3)
add(dry, chime(84, 96), 13.0, .1, .3); add(wet, chime(84, 96), 13.0, .08)   # request sent
for i, lt in enumerate((.7, 1.9, 3.1, 4.3)):         # notifications (scene 4)
    add(dry, chime(84 + 2 * (i % 2), 91 + 2 * (i % 2)), 14 + lt, .09, .3); add(wet, chime(), 14 + lt, .07)
for lt, f in ((.5, 700), (1.3, 950), (2.6, 700)):     # chat bubbles (scene 5)
    add(dry, pop(f), 20 + lt, .14, .2)

# ---------- Reverb (convolution with decaying noise) ----------
ir_n = int(1.8 * SR); tt = np.arange(ir_n) / SR
irL = rng.standard_normal(ir_n) * np.exp(-tt * 3.2)
irR = rng.standard_normal(ir_n) * np.exp(-tt * 3.2)
size = 1 << int(np.ceil(np.log2(N + ir_n)))
def conv(x, ir):
    return np.fft.irfft(np.fft.rfft(x, size) * np.fft.rfft(ir, size), size)[:N]
rev = np.vstack([conv(wet[0], irL), conv(wet[1], irR)])
rev /= np.abs(rev).max() + 1e-9
mixd = dry + rev * .22

# ---------- Master ----------
fade = np.ones(N)
fo = int(2.0 * SR); fade[-fo:] = np.linspace(1, 0, fo) ** 1.5
fi = int(.05 * SR); fade[:fi] = np.linspace(0, 1, fi)
mixd *= fade
mixd /= np.abs(mixd).max()
mixd = np.tanh(mixd * 1.3) / np.tanh(1.3) * .89

pcm = (mixd.T * 32767).astype(np.int16)
with wave.open(sys.argv[1] if len(sys.argv) > 1 else 'music.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok', pcm.shape)
