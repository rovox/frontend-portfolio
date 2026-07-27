import { useEffect, useRef, useState, useCallback } from 'react';

type ToneModule = typeof import('tone');

export default function AudioController() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(-12);
  const [isReady, setIsReady] = useState(false);
  const [needsInteraction, setNeedsInteraction] = useState(false);
  const [bars, setBars] = useState([0, 0, 0]);
  const toneModuleRef = useRef<ToneModule | null>(null);

  const toneRef = useRef<{
    bassSynth: InstanceType<ToneModule['AMSynth']> | null;
    leadSynth: InstanceType<ToneModule['Synth']> | null;
    drumSynth: InstanceType<ToneModule['NoiseSynth']> | null;
    loop: InstanceType<ToneModule['Loop']> | null;
    reverb: InstanceType<ToneModule['Reverb']> | null;
    bitCrusher: InstanceType<ToneModule['BitCrusher']> | null;
    filter: InstanceType<ToneModule['Filter']> | null;
    analyzer: InstanceType<ToneModule['Analyser']> | null;
    meterInterval: number | null;
  }>({
    bassSynth: null,
    leadSynth: null,
    drumSynth: null,
    loop: null,
    reverb: null,
    bitCrusher: null,
    filter: null,
    analyzer: null,
    meterInterval: null,
  });

  const disposeAudio = useCallback(() => {
    const Tone = toneModuleRef.current;
    const t = toneRef.current;
    if (t.meterInterval) clearInterval(t.meterInterval);
    t.bassSynth?.dispose();
    t.leadSynth?.dispose();
    t.drumSynth?.dispose();
    t.loop?.dispose();
    t.reverb?.dispose();
    t.bitCrusher?.dispose();
    t.filter?.dispose();
    t.analyzer?.dispose();
    Tone?.Transport.stop();
    Tone?.Transport.cancel();
  }, []);

  const loadTone = useCallback(async () => {
    if (!toneModuleRef.current) {
      toneModuleRef.current = await import('tone');
    }

    return toneModuleRef.current;
  }, []);

  const startAudio = useCallback(async () => {
    try {
      const Tone = await loadTone();
      await Tone.start();
      setIsReady(true);
      setNeedsInteraction(false);

      disposeAudio();

      // Master effects chain
      const reverb = new Tone.Reverb({ decay: 2, wet: 0.3 }).toDestination();
      const bitCrusher = new Tone.BitCrusher(4).connect(reverb);
      const filter = new Tone.Filter(1200, 'lowpass').connect(bitCrusher);
      const analyzer = new Tone.Analyser('fft', 64).connect(filter);

      // Bassline (square wave for chiptune feel)
      const bassSynth = new Tone.AMSynth({
        harmonicity: 1,
        oscillator: { type: 'square' },
        envelope: { attack: 0.05, decay: 0.2, sustain: 0.4, release: 0.4 },
        modulation: { type: 'square' },
        modulationEnvelope: { attack: 0.05, decay: 0.2, sustain: 0.4, release: 0.4 },
      }).connect(filter);

      // Lead melody (triangle wave, softer)
      const leadSynth = new Tone.Synth({
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.1, decay: 0.3, sustain: 0.2, release: 1 },
      }).connect(reverb);
      leadSynth.volume.value = -15;

      // Drums (noise for kick + snare)
      const drumSynth = new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 },
      }).connect(filter);
      drumSynth.volume.value = -20;

      // Patterns
      const bassPattern = [
        { time: '0:0', note: 'C2', dur: '8n' },
        { time: '0:2', note: 'G2', dur: '8n' },
        { time: '1:0', note: 'F2', dur: '8n' },
        { time: '1:2', note: 'A#2', dur: '8n' },
        { time: '2:0', note: 'C2', dur: '8n' },
        { time: '2:2', note: 'G2', dur: '8n' },
        { time: '3:0', note: 'F2', dur: '8n' },
        { time: '3:2', note: 'A#2', dur: '8n' },
      ];

      const leadPattern = [
        { time: '0:1', note: 'E4', dur: '16n' },
        { time: '0:3', note: 'G4', dur: '16n' },
        { time: '1:1', note: 'F4', dur: '16n' },
        { time: '1:3', note: 'A4', dur: '16n' },
        { time: '2:0', note: 'C5', dur: '8n' },
        { time: '2:3', note: 'G4', dur: '16n' },
        { time: '3:1', note: 'F4', dur: '16n' },
        { time: '3:2', note: 'E4', dur: '16n' },
      ];

      const drumPattern = [
        { time: '0:0', type: 'kick' },
        { time: '1:0', type: 'snare' },
        { time: '2:0', type: 'kick' },
        { time: '3:0', type: 'snare' },
      ];

      // Transport setup
      Tone.Transport.bpm.value = 80;
      Tone.Transport.swing = 0.12;
      Tone.Transport.swingSubdivision = '8n';

      // Sequencer loop
      const loop = new Tone.Loop((time) => {
        const measure = Math.floor(Tone.Transport.seconds / (60 / 80) / 4) % 4;
        const beat = Math.floor((Tone.Transport.seconds / (60 / 80)) % 4);

        // Bass
        bassPattern.forEach((evt) => {
          const [m, b] = evt.time.split(':').map(Number);
          if (m === measure && b === beat) {
            bassSynth.triggerAttackRelease(evt.note, evt.dur, time);
          }
        });

        // Lead (30% ghost notes for lo-fi feel)
        leadPattern.forEach((evt) => {
          const [m, b] = evt.time.split(':').map(Number);
          if (m === measure && b === beat && Math.random() > 0.3) {
            leadSynth.triggerAttackRelease(evt.note, evt.dur, time);
          }
        });

        // Drums
        drumPattern.forEach((evt) => {
          const [m, b] = evt.time.split(':').map(Number);
          if (m === measure && b === beat) {
            if (evt.type === 'kick') {
              drumSynth.triggerAttackRelease('16n', time);
            } else {
              drumSynth.triggerAttackRelease('8n', time);
            }
          }
        });
      }, '4n');

      // Master volume
      Tone.Destination.volume.value = volume;

      // Visualizer
      const meterInterval = window.setInterval(() => {
        if (!analyzer) return;
        const values = analyzer.getValue() as Float32Array;
        const avg1 = values.slice(0, 20).reduce((a, b) => a + b, 0) / 20;
        const avg2 = values.slice(20, 40).reduce((a, b) => a + b, 0) / 20;
        const avg3 = values.slice(40, 64).reduce((a, b) => a + b, 0) / 24;
        setBars([
          Math.max(0, (avg1 + 100) / 100 * 100),
          Math.max(0, (avg2 + 100) / 100 * 100),
          Math.max(0, (avg3 + 100) / 100 * 100),
        ]);
      }, 100);

      // Store refs
      toneRef.current = {
        bassSynth,
        leadSynth,
        drumSynth,
        loop,
        reverb,
        bitCrusher,
        filter,
        analyzer,
        meterInterval,
      };

      Tone.Transport.start();
      loop.start(0);
      setIsPlaying(true);
    } catch (err) {
      console.warn('Audio start failed:', err);
      setNeedsInteraction(true);
    }
  }, [volume, disposeAudio, loadTone]);

  const togglePlay = useCallback(async () => {
    if (!isReady) {
      await startAudio();
      return;
    }

    const Tone = toneModuleRef.current;
    if (!Tone) return;

    if (isPlaying) {
      Tone.Transport.pause();
      setIsPlaying(false);
    } else {
      Tone.Transport.start();
      setIsPlaying(true);
    }
  }, [isReady, isPlaying, startAudio]);

  // Listen for preloader:done
  useEffect(() => {
    const handlePreloaderDone = () => {
      // Only surface the prompt here; actual audio start must come from a user gesture.
      const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (!mql.matches) {
        setNeedsInteraction(true);
      }
    };

    // If preloader already done
    if ((window as any).__portfolioLoaderDone) {
      handlePreloaderDone();
    }

    window.addEventListener('preloader:done', handlePreloaderDone);
    return () => window.removeEventListener('preloader:done', handlePreloaderDone);
  }, [startAudio]);

  // Fallback: click anywhere to resume AudioContext
  useEffect(() => {
    if (!needsInteraction) return;

    const handleClick = () => {
      startAudio();
    };
    document.addEventListener('click', handleClick, { once: true });
    return () => document.removeEventListener('click', handleClick);
  }, [needsInteraction, startAudio]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disposeAudio();
    };
  }, [disposeAudio]);

  // Volume control
  useEffect(() => {
    if (isReady) {
      toneModuleRef.current?.Destination.volume.rampTo(volume, 0.1);
    }
  }, [volume, isReady]);

  return (
    <div
      className="audio-controller"
      style={{
        position: 'fixed',
        bottom: '1rem',
        right: '1rem',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.6rem 1rem',
        background: 'var(--surface)',
        border: '1px solid color-mix(in srgb, var(--primary-container) 30%, transparent)',
        borderRadius: 'var(--radius-lg)',
        backdropFilter: 'blur(10px)',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.8rem',
        color: 'var(--muted)',
      }}
    >
      {needsInteraction && (
        <span style={{ color: 'var(--primary)', fontSize: '0.75rem', marginRight: '0.5rem' }}>
          🔊 Click for music
        </span>
      )}

      <button
        onClick={togglePlay}
        aria-label={isPlaying ? 'Pause music' : 'Play music'}
        style={{
          background: 'none',
          border: '1px solid color-mix(in srgb, var(--primary-container) 40%, transparent)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.35rem 0.6rem',
          color: 'var(--primary)',
          cursor: 'pointer',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '2rem',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'color-mix(in srgb, var(--primary-container) 10%, transparent)';
          e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--primary-container) 70%, transparent)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'none';
          e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--primary-container) 40%, transparent)';
        }}
      >
        {isPlaying ? '⏸' : '▶'}
      </button>

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '2px',
          height: '1rem',
        }}
      >
        {bars.map((h, i) => (
          <div
            key={i}
            style={{
              width: '3px',
              height: `${Math.min(h, 100)}%`,
              background: 'var(--primary)',
              borderRadius: '1px',
              transition: 'height 0.1s ease',
              opacity: isPlaying ? 1 : 0.3,
            }}
          />
        ))}
      </div>

      <input
        type="range"
        min="-30"
        max="0"
        value={volume}
        onChange={(e) => setVolume(Number(e.target.value))}
        aria-label="Volume"
        style={{
          width: '60px',
          height: '3px',
          accentColor: 'var(--primary)',
          cursor: 'pointer',
        }}
      />
    </div>
  );
}
