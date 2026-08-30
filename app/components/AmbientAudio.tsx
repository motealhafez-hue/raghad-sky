'use client';

import { useEffect, useRef, useState } from 'react';

type AudioGraph = {
  context: AudioContext;
  gain: GainNode;
  sources: AudioScheduledSourceNode[];
};

export function AmbientAudio({ labels }: { labels: { play: string; pause: string } }) {
  const [playing, setPlaying] = useState(false);
  const graphRef = useRef<AudioGraph | null>(null);

  const buildGraph = () => {
    const AudioContextClass = window.AudioContext;
    const context = new AudioContextClass();
    const gain = context.createGain();
    gain.gain.value = 0.0001;
    gain.connect(context.destination);

    const noiseBuffer = context.createBuffer(1, context.sampleRate * 3, context.sampleRate);
    const channel = noiseBuffer.getChannelData(0);
    for (let index = 0; index < channel.length; index += 1) {
      channel[index] = (Math.random() * 2 - 1) * 0.12;
    }
    const noise = context.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    const noiseFilter = context.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 520;
    const noiseGain = context.createGain();
    noiseGain.gain.value = 0.17;
    noise.connect(noiseFilter).connect(noiseGain).connect(gain);

    const tones = [110, 164.81].map((frequency, index) => {
      const oscillator = context.createOscillator();
      const toneGain = context.createGain();
      oscillator.type = index === 0 ? 'sine' : 'triangle';
      oscillator.frequency.value = frequency;
      toneGain.gain.value = index === 0 ? 0.018 : 0.007;
      oscillator.connect(toneGain).connect(gain);
      oscillator.start();
      return oscillator;
    });

    noise.start();
    graphRef.current = { context, gain, sources: [noise, ...tones] };
    return graphRef.current;
  };

  const toggle = async () => {
    const graph = graphRef.current ?? buildGraph();
    await graph.context.resume();
    const next = !playing;
    graph.gain.gain.cancelScheduledValues(graph.context.currentTime);
    graph.gain.gain.exponentialRampToValueAtTime(next ? 0.42 : 0.0001, graph.context.currentTime + 1.2);
    setPlaying(next);
  };

  useEffect(() => () => {
    const graph = graphRef.current;
    graph?.sources.forEach((source) => {
      try { source.stop(); } catch { /* already stopped */ }
    });
    void graph?.context.close();
  }, []);

  return (
    <button
      type="button"
      className="audio-toggle"
      aria-pressed={playing}
      aria-label={playing ? labels.pause : labels.play}
      title={playing ? labels.pause : labels.play}
      onClick={toggle}
    >
      <span className={playing ? 'sound-bars is-playing' : 'sound-bars'} aria-hidden="true">
        <i /><i /><i />
      </span>
      <span>{playing ? labels.pause : labels.play}</span>
    </button>
  );
}
