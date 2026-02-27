export interface Note {
  id: string;
  pitch: number; // MIDI pitch 0-127
  start: number; // Start time in ticks or bars
  duration: number; // Duration in ticks or bars
  velocity: number; // 0-127
}

export interface HarmonySet {
  id: string;
  name: string;
  category: 'Classical' | 'Gospel' | 'Neo-Soul' | 'Jazz' | 'Techno';
  description: string;
  progressions: number;
  size: string;
  imageUrl: string;
}

export interface ProjectState {
  tempo: number;
  key: string;
  scale: string;
  notes: Note[];
  humanization?: {
    timingJitter: number;
    velocityRandom: number;
    durationVariance: number;
  };
}

export const SCALES = [
  'Major',
  'Minor',
  'Dorian',
  'Phrygian',
  'Lydian',
  'Mixolydian',
  'Locrian',
  'Minor Pentatonic',
  'Major Pentatonic'
];

export const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
