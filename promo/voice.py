"""French voiceover for promo.html, generated offline with Kokoro TTS (open-source, Apache-2.0).
Each line is fitted inside its scene window, then mixed over the music with the music ducked under the voice.

Usage: python3 voice.py music.wav out.wav MODEL_DIR
MODEL_DIR holds kokoro-v1.0.onnx and voices-v1.0.bin from
https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0
Needs: pip install kokoro-onnx soundfile
"""
import sys, wave, os
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

SR = 44100
VOICE, LANG = 'ff_siwis', 'fr-fr'

# (start s, end s, text): windows follow the scenes in promo.html.
# Some words are respelled so the French voice pronounces them the French way:
# "Expresse" (not the English "Express"), "Ouatsape" (WhatsApp), "imèle" (e-mail).
LINES = [
    (0.35, 3.85, "Créer sa société au Maroc… c'était des semaines de démarches."),
    (4.55, 7.85, "Avec Charika Expresse, c'est cent pour cent en ligne."),
    (8.55, 13.85, "Votre demande se fait en cinq minutes. Forme juridique, nom, formule… et c'est envoyé."),
    (14.5, 19.85, "Ensuite, vous suivez chaque étape en temps réel, sur Ouatsape et par imèle."),
    (20.4, 23.85, "Et un vrai juriste vous accompagne, du début à la fin."),
    (24.4, 27.85, "Sept à quinze jours. Paiement en deux fois. Garantie anti-rejet."),
    (28.45, 31.85, "Le tout, dès deux mille neuf cents dirhams."),
    (32.4, 35.75, "Charika Expresse. Lancez votre société aujourd'hui."),
]

def trim(x, thr=.01):
    idx = np.where(np.abs(x) > thr * np.abs(x).max())[0]
    return x[max(idx[0] - 200, 0): idx[-1] + 2400] if len(idx) else x

def resample(x, sr_in):
    n = int(len(x) * SR / sr_in)
    return np.interp(np.linspace(0, len(x) - 1, n), np.arange(len(x)), x)

def main(music_path, out_path, model_dir):
    k = Kokoro(os.path.join(model_dir, 'kokoro-v1.0.onnx'), os.path.join(model_dir, 'voices-v1.0.bin'))
    music, msr = sf.read(music_path, always_2d=True)
    assert msr == SR
    n = len(music)
    voice = np.zeros(n)
    for start, end, text in LINES:
        speed = 1.0
        for _ in range(4):                      # speed up a little if the line is longer than its window
            s, sr = k.create(text, voice=VOICE, speed=speed, lang=LANG)
            s = trim(np.asarray(s, dtype=np.float64))
            d = len(s) / sr
            if d <= end - start or speed >= 1.3: break
            speed = min(1.3, speed * d / (end - start) * 1.02)
        s = resample(s, sr)
        i = int(start * SR)
        s = s[: n - i]
        voice[i:i + len(s)] += s / np.abs(s).max()
        print(f'{start:5.2f}s  {len(s) / SR:4.2f}s / {end - start:4.2f}s  speed {speed:.2f}  {text}')

    # light compression + presence: soft-clip, then a gentle high-shelf via FFT
    voice = np.tanh(voice * 1.6) / np.tanh(1.6)
    X = np.fft.rfft(voice); f = np.fft.rfftfreq(n, 1 / SR)
    X *= 1 + .35 / (1 + (3500 / np.maximum(f, 1)) ** 2) - .5 / (1 + (f / 90) ** 4) * (f < 90)
    voice = np.fft.irfft(X, n)

    # duck the music under the voice (smoothed envelope, about -16 dB) so the voice sits ~8-10 dB above it
    env = np.abs(voice)
    w = int(.12 * SR); env = np.convolve(env, np.ones(w) / w, mode='same')
    env = np.clip(env / (env.max() + 1e-9) * 6, 0, 1)
    # hold: keep the music down through the short pauses inside a sentence (sliding max over 0.5 s at 100 Hz)
    hop = SR // 100; e = env[: len(env) // hop * hop].reshape(-1, hop).max(1)
    hw = 25; e = np.array([e[max(0, i - hw): i + hw].max() for i in range(len(e))])
    env = np.interp(np.arange(n), np.arange(len(e)) * hop, e)
    a = int(.25 * SR); env = np.convolve(env, np.ones(a) / a, mode='same')
    duck = 1 - .84 * np.clip(env, 0, 1)

    mix = music * duck[:, None] * .8 + voice[:, None] * .7
    mix /= np.abs(mix).max()
    mix = np.tanh(mix * 1.2) / np.tanh(1.2) * .89
    with wave.open(out_path, 'wb') as wf:
        wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR)
        wf.writeframes((mix * 32767).astype(np.int16).tobytes())
    sf.write(out_path.replace('.wav', '-voice-only.wav'), voice / np.abs(voice).max() * .9, SR)
    print('ok', out_path)

if __name__ == '__main__':
    main(*sys.argv[1:4])
