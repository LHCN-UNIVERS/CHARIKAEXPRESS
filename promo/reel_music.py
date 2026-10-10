"""Soundtrack for reel.html: 22 s, 128 bpm, energetic, with sound effects synced to the animation.
Synthesised with numpy only (no licensed audio).
Usage: python3 reel_music.py out.wav
"""
import sys, wave
import numpy as np

SR = 44100
DUR = 22.0
N = int(SR * DUR)
BEAT = 60 / 128
rng = np.random.default_rng(11)
t_all = np.arange(N) / SR
DROP, DROP2, BREAK = 6.0, 18.0, (17.4, 18.0)

def midi(m): return 440.0 * 2 ** ((m - 69) / 12)

def env(n, a, r):
    e = np.ones(n); na, nr = int(a * SR), int(r * SR)
    if na: e[:na] = np.linspace(0, 1, na)
    if nr: e[-nr:] *= np.linspace(1, 0, nr)
    return e

def bandpass(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X / (1 + (lo / np.maximum(f, 1)) ** 4) / (1 + (f / hi) ** 4), len(x))

dry = np.zeros((2, N)); wet = np.zeros((2, N))
def add(buf, sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N or i < 0: return
    sig = sig[: N - i]
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[0, i:i + len(sig)] += sig * gain * l * 1.41
    buf[1, i:i + len(sig)] += sig * gain * r * 1.41
in_break = lambda at: BREAK[0] <= at < BREAK[1]

# ---------- chords: Am – F – C – G (one bar each = 4 beats) ----------
chords = [[57, 60, 64, 69], [53, 57, 60, 65], [55, 60, 64, 67], [55, 59, 62, 67]]
roots = [45, 41, 48, 43]
bar = 4 * BEAT
for b in range(int(DUR / bar) + 1):
    st = b * bar
    n = int((bar + .4) * SR); tt = np.arange(n) / SR
    bright = 2.0 if st < DROP else 6.0
    for k, m in enumerate(chords[b % 4]):
        for det, pan in ((-8, -.7), (8, .7)):
            f = midi(m) * 2 ** (det / 1200); sig = np.zeros(n)
            for h in range(1, 12): sig += np.sin(2 * np.pi * f * h * tt + h + k) / h * np.exp(-h / bright)
            sig *= env(n, .05, .4)
            g = .03 if st >= DROP else .04
            add(dry, sig, st, g, pan); add(wet, sig, st, g * .8, pan)
    # pluck arpeggio on 16ths after the drop
    if st >= DROP:
        notes = chords[b % 4] + [chords[b % 4][1] + 12]
        for i in range(16):
            at = st + i * BEAT / 4
            if in_break(at) or at >= DUR - 1: continue
            m = notes[(i * 3) % len(notes)] + 12
            nn = int(.18 * SR); tt2 = np.arange(nn) / SR
            s = (np.sin(2 * np.pi * midi(m) * tt2) + .3 * np.sin(4 * np.pi * midi(m) * tt2)) * np.exp(-tt2 * 22)
            add(dry, s, at, .045, .4 if i % 2 else -.4); add(wet, s, at, .03)

# sidechain pump
ph = (t_all % BEAT) / BEAT
pump = 1 - .5 * np.exp(-ph * 9)
dry *= pump; wet *= pump

# ---------- drums ----------
def kick():
    n = int(.4 * SR); tt = np.arange(n) / SR
    s = np.sin(2 * np.pi * np.cumsum(50 + 120 * np.exp(-tt * 30)) / SR) * np.exp(-tt * 8)
    s[:int(.003 * SR)] += rng.standard_normal(int(.003 * SR)) * .4
    return np.tanh(s * 1.8)
def clap():
    n = int(.25 * SR); tt = np.arange(n) / SR
    nz = bandpass(rng.standard_normal(n), 1000, 5000)
    return nz / np.abs(nz).max() * (np.exp(-tt * 20) + .5 * np.exp(-np.maximum(tt - .01, 0) * 28) * (tt > .01))
def hat(open_=False):
    n = int((.22 if open_ else .06) * SR); tt = np.arange(n) / SR
    nz = bandpass(rng.standard_normal(n), 7500, 16000)
    return nz / np.abs(nz).max() * np.exp(-tt * (14 if open_ else 80))
K, C, Hc, Ho = kick(), clap(), hat(), hat(True)
for i in range(int(DUR / BEAT) + 1):
    at = i * BEAT
    if at >= DUR - 1.2 or in_break(at): continue
    add(dry, K, at, .5 if at >= DROP else .38)
    if at >= DROP and i % 2 == 1: add(dry, C, at, .18, .1); add(wet, C, at, .07)
    add(dry, Hc, at + BEAT / 2, .06 if at < DROP else .05, .35)
    if at >= DROP: add(dry, Ho, at + BEAT / 2, .04, -.3); add(dry, Hc, at + BEAT / 4, .025, -.35); add(dry, Hc, at + 3 * BEAT / 4, .025, .35)

# ---------- bass: offbeat 8ths ----------
for i in range(int(DUR / BEAT) + 1):
    at = i * BEAT + BEAT / 2
    if at >= DUR - 1.2 or in_break(at): continue
    m = roots[int(at // bar) % 4]
    n = int(.26 * SR); tt = np.arange(n) / SR; f = midi(m)
    s = (np.sin(2 * np.pi * f * tt) + .4 * np.sin(4 * np.pi * f * tt) + .15 * np.sin(6 * np.pi * f * tt)) * np.exp(-tt * 10) * env(n, .004, .04)
    add(dry, np.tanh(s * 1.6), at, .24 if at >= DROP else .16)

# ---------- FX ----------
def riser(d):
    n = int(d * SR); tt = np.arange(n) / SR; p = tt / d
    nz = bandpass(rng.standard_normal(n), 1500, 12000) * p ** 2.4
    sw = np.sin(2 * np.pi * np.cumsum(300 + 1700 * p ** 2) / SR) * p ** 2 * .3
    return nz / np.abs(nz).max() + sw
def impact():
    n = int(1.8 * SR); tt = np.arange(n) / SR
    boom = np.sin(2 * np.pi * np.cumsum(36 + 70 * np.exp(-tt * 9)) / SR) * np.exp(-tt * 2.6)
    nz = bandpass(rng.standard_normal(n), 200, 7000) * np.exp(-tt * 7)
    return np.tanh(boom * 1.5) + .3 * nz / np.abs(nz).max()
def whoosh(d=.35, lo=500, hi=8000):
    n = int(d * SR); p = np.arange(n) / n
    nz = bandpass(rng.standard_normal(n), lo, hi)
    return nz / np.abs(nz).max() * np.where(p < .6, (p / .6) ** 2, (1 - (p - .6) / .4) ** 1.5)
def pop(f=900, d=.08):
    n = int(d * SR); tt = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(f * (1 + .7 * np.exp(-tt * 70))) / SR) * np.exp(-tt * 50)
def chime(m1, m2):
    n = int(1.0 * SR); tt = np.arange(n) / SR
    s = np.sin(2 * np.pi * midi(m1) * tt) * np.exp(-tt * 6); o = int(.08 * SR)
    s[o:] += np.sin(2 * np.pi * midi(m2) * tt[:n - o]) * np.exp(-tt[:n - o] * 5)
    return s * .5
def swipe():
    n = int(.22 * SR); tt = np.arange(n) / SR
    nz = bandpass(rng.standard_normal(n), 2500, 9000)
    return nz / np.abs(nz).max() * np.sin(np.pi * tt / tt[-1]) ** 2

for i in range(7):                                    # hook words
    add(dry, pop(700 + i * 90), .05 + i * .19, .12, (-1) ** i * .3)
add(dry, whoosh(.4), 2.35, .14)                        # cut to S2
for i in range(4):                                    # stickers fly in, get crossed, fall
    add(dry, whoosh(.3, 800, 9000), 2.6 + .2 + i * .3 - .1, .1, -.5 if i % 2 == 0 else .5)
    add(dry, swipe(), 2.6 + 1.9 + i * .18, .12, .2)
add(dry, whoosh(.6, 300, 4000), 2.6 + 2.75, .14)
add(dry, riser(1.6), DROP - 1.6, .16); add(wet, riser(1.6), DROP - 1.6, .08)
for at in (DROP, DROP2):
    add(dry, impact(), at, .55); add(wet, impact(), at, .25)
add(dry, whoosh(.45), 9.0 - .3, .12)
for i, s0 in enumerate((.6, 1.6, 2.6, 3.6)):          # notifications
    add(dry, chime(83 + (i % 2) * 2, 90 + (i % 2) * 2), 9.0 + s0, .11, .25); add(wet, chime(83, 90), 9.0 + s0, .07)
add(dry, whoosh(.45), 14.2 - .3, .12)
for i in range(14):                                   # price count-up ticks
    add(dry, pop(1400 + i * 40, .03), 14.35 + i * .065, .07)
add(dry, chime(88, 95), 15.3, .14); add(wet, chime(88, 95), 15.3, .1)
add(dry, riser(.6), BREAK[0], .12)
add(dry, pop(800), 18.9, .14); add(dry, pop(1000), 19.3, .14)

# ---------- reverb + master ----------
irn = int(1.4 * SR); tt = np.arange(irn) / SR
size = 1 << int(np.ceil(np.log2(N + irn)))
def conv(x, ir): return np.fft.irfft(np.fft.rfft(x, size) * np.fft.rfft(ir, size), size)[:N]
rev = np.vstack([conv(wet[c], rng.standard_normal(irn) * np.exp(-tt * 3.5)) for c in (0, 1)])
rev /= np.abs(rev).max() + 1e-9
mixd = dry + rev * .2
fade = np.ones(N); fo = int(1.2 * SR); fade[-fo:] = np.linspace(1, 0, fo) ** 1.4
mixd *= fade
mixd /= np.abs(mixd).max()
mixd = np.tanh(mixd * 1.4) / np.tanh(1.4) * .89
with wave.open(sys.argv[1] if len(sys.argv) > 1 else 'reel_music.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mixd.T * 32767).astype(np.int16).tobytes())
print('ok', mixd.shape)
