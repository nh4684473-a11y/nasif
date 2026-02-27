/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Square, 
  Circle, 
  SkipBack, 
  SkipForward, 
  Plus, 
  Search, 
  Bell, 
  Settings, 
  Music, 
  Waves, 
  Grid3X3, 
  Zap, 
  Download, 
  History, 
  Heart,
  Cpu,
  Cable,
  Volume2,
  Maximize2,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Note, HarmonySet, ProjectState, KEYS, SCALES } from './types';
import { getSmartSuggestions, generateMelody } from './services/geminiService';

const HARMONY_SETS: HarmonySet[] = [
  {
    id: '1',
    name: "SongWish's Bach Chorale",
    category: 'Classical',
    description: 'Authentic 4-part harmonies transcribed from Johann Sebastian Bach’s complete chorales.',
    progressions: 420,
    size: '1.2 GB',
    imageUrl: 'https://picsum.photos/seed/bach/400/225'
  },
  {
    id: '2',
    name: 'Open Hymnal',
    category: 'Gospel',
    description: 'A massive collection of public domain hymns with rich, traditional voicing.',
    progressions: 120,
    size: '450 MB',
    imageUrl: 'https://picsum.photos/seed/gospel/400/225'
  },
  {
    id: '3',
    name: "Musician Paradise's Neo-Soul",
    category: 'Neo-Soul',
    description: 'Deep, buttery chord extensions, secondary dominants, and soulful chromatic movements.',
    progressions: 85,
    size: '800 MB',
    imageUrl: 'https://picsum.photos/seed/soul/400/225'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'Piano Roll' | 'Library' | 'Tools'>('Piano Roll');
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState(124);
  const [key, setKey] = useState('C');
  const [scale, setScale] = useState('Minor');
  const [notes, setNotes] = useState<Note[]>([
    { id: '1', pitch: 60, start: 480, duration: 480, velocity: 100 },
    { id: '2', pitch: 64, start: 960, duration: 480, velocity: 80 },
    { id: '3', pitch: 67, start: 1440, duration: 960, velocity: 110 },
  ]);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [timingJitter, setTimingJitter] = useState(15);
  const [velocityRandom, setVelocityRandom] = useState(25);
  const [durationVariance, setDurationVariance] = useState(10);

  const pianoRollRef = useRef<HTMLDivElement>(null);

  const handleGenerateMelody = async (type: 'Arpeggiate' | 'Lead' | 'Motif') => {
    setIsGenerating(true);
    const newNotes = await generateMelody({ 
      tempo, 
      key, 
      scale, 
      notes,
      humanization: {
        timingJitter,
        velocityRandom,
        durationVariance
      }
    }, type);
    if (newNotes.length > 0) {
      setNotes(prev => [...prev, ...newNotes.map((n: any, i: number) => ({ ...n, id: `gen-${Date.now()}-${i}` }))]);
    }
    setIsGenerating(false);
  };

  const loadAiSuggestion = async () => {
    const suggestion = await getSmartSuggestions({ tempo, key, scale, notes });
    setAiSuggestion(suggestion || "Try adding a bassline in C minor.");
  };

  useEffect(() => {
    loadAiSuggestion();
  }, [key, scale]);

  return (
    <div className="flex flex-col h-screen bg-[#0a050f] text-slate-100 font-sans overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between border-b border-white/5 px-6 py-3 bg-[#120d18]/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="bg-[#8c2bee] p-1.5 rounded-lg shadow-[0_0_15px_rgba(140,43,238,0.4)]">
              <Music className="text-white size-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight uppercase">HarmonyGrid <span className="text-[#8c2bee]">Pro</span></h1>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                <span className="text-[#8c2bee]">V2.4.0</span>
                <span>•</span>
                <span>PROJECT_ALPHA_STAGED</span>
              </div>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {['Composition', 'Library', 'Performance', 'Settings'].map((item) => (
              <button 
                key={item}
                onClick={() => item === 'Library' ? setActiveTab('Library') : setActiveTab('Piano Roll')}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  (activeTab === 'Library' && item === 'Library') || (activeTab !== 'Library' && item === 'Composition')
                    ? 'text-[#8c2bee] bg-[#8c2bee]/10' 
                    : 'hover:bg-white/5'
                }`}
              >
                {item}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-black/20 rounded-lg px-4 py-1.5 gap-6 border border-white/5">
            <div className="text-center">
              <p className="text-[10px] uppercase text-slate-500 font-bold">Tempo</p>
              <input 
                type="number" 
                value={tempo} 
                onChange={(e) => setTempo(Number(e.target.value))}
                className="bg-transparent border-none text-sm font-mono font-bold text-[#8c2bee] w-12 p-0 focus:ring-0"
              />
            </div>
            <div className="text-center border-l border-white/10 pl-6">
              <p className="text-[10px] uppercase text-slate-500 font-bold">Key</p>
              <select 
                value={key} 
                onChange={(e) => setKey(e.target.value)}
                className="bg-transparent border-none text-sm font-mono font-bold text-[#8c2bee] p-0 focus:ring-0 cursor-pointer"
              >
                {KEYS.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-black/20 p-1 rounded-lg border border-white/5">
            <button className="p-2 hover:text-[#8c2bee] transition-colors"><SkipBack size={18} /></button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-2 transition-transform hover:scale-110 ${isPlaying ? 'text-red-500' : 'text-[#8c2bee]'}`}
            >
              {isPlaying ? <Square size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
            </button>
            <button className="p-2 hover:text-red-600 transition-colors"><Circle size={18} fill="currentColor" /></button>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-400 hover:text-white transition-colors"><Bell size={20} /></button>
            <div className="w-10 h-10 rounded-full border-2 border-[#8c2bee]/30 p-0.5 overflow-hidden">
              <img 
                src="https://picsum.photos/seed/user/100/100" 
                alt="User" 
                className="w-full h-full rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 shrink-0 border-r border-white/5 bg-[#120d18]/50 px-4 py-6 overflow-y-auto custom-scrollbar">
          <div className="mb-8">
            <h2 className="mb-4 px-2 text-xs font-bold uppercase tracking-widest text-slate-500">Melody Tool</h2>
            <ul className="space-y-1">
              {[
                { name: 'Generator', icon: Zap, active: activeTab === 'Piano Roll' },
                { name: 'Effects', icon: Waves, active: false },
                { name: 'Routing', icon: Grid3X3, active: false },
                { name: 'Presets', icon: History, active: false },
              ].map((item) => (
                <li key={item.name}>
                  <button 
                    onClick={() => setActiveTab('Piano Roll')}
                    className={`flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                      item.active 
                        ? 'bg-[#8c2bee] text-white shadow-lg shadow-[#8c2bee]/20' 
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <item.icon size={18} />
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="mb-4 px-2 text-xs font-bold uppercase tracking-widest text-slate-500">Categories</h2>
            <ul className="space-y-1">
              {['Classical', 'Gospel', 'Neo-Soul', 'Jazz'].map((cat) => (
                <li key={cat}>
                  <button className="flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-all">
                    <Music size={16} />
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* AI Suggestion Card */}
          <div className="mt-auto rounded-xl bg-gradient-to-br from-[#8c2bee]/20 to-transparent p-4 border border-[#8c2bee]/20">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} className="text-[#8c2bee]" />
              <p className="text-[10px] font-bold text-[#8c2bee] uppercase tracking-wider">AI Suggestion</p>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed italic">
              {aiSuggestion || "Analyzing your project..."}
            </p>
            <button 
              onClick={loadAiSuggestion}
              className="mt-3 w-full py-1.5 bg-[#8c2bee]/20 hover:bg-[#8c2bee]/30 text-[#8c2bee] text-[10px] font-bold rounded transition-colors uppercase"
            >
              Refresh Idea
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden flex flex-col p-4 gap-4">
          <AnimatePresence mode="wait">
            {activeTab === 'Piano Roll' ? (
              <motion.div 
                key="piano-roll"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col flex-1 gap-4 overflow-hidden"
              >
                {/* Performance Controls */}
                <section className="bg-white/5 border border-white/5 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Zap className="text-[#8c2bee]" size={20} />
                      <h2 className="text-lg font-bold">Performance Tools</h2>
                    </div>
                    <div className="flex bg-black/30 p-1 rounded-lg">
                      <button 
                        onClick={() => handleGenerateMelody('Arpeggiate')}
                        disabled={isGenerating}
                        className="px-4 py-1.5 text-xs font-bold bg-[#8c2bee] rounded shadow-lg disabled:opacity-50"
                      >
                        {isGenerating ? 'GENERATING...' : 'ARPEGGIATE'}
                      </button>
                      <button 
                        onClick={() => handleGenerateMelody('Lead')}
                        disabled={isGenerating}
                        className="px-4 py-1.5 text-xs font-bold hover:bg-white/5 rounded transition-colors disabled:opacity-50"
                      >
                        LEAD
                      </button>
                      <button 
                        onClick={() => handleGenerateMelody('Motif')}
                        disabled={isGenerating}
                        className="px-4 py-1.5 text-xs font-bold hover:bg-white/5 rounded transition-colors disabled:opacity-50"
                      >
                        MOTIF
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-[10px] mb-1.5 text-slate-500 uppercase font-bold tracking-wider">
                          <span>Timing Jitter</span>
                          <span className="text-[#8c2bee]">{timingJitter}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={timingJitter}
                          onChange={(e) => setTimingJitter(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-[#8c2bee]"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] mb-1.5 text-slate-500 uppercase font-bold tracking-wider">
                          <span>Velocity Random</span>
                          <span className="text-[#8c2bee]">{velocityRandom}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={velocityRandom}
                          onChange={(e) => setVelocityRandom(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-[#8c2bee]"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] mb-1.5 text-slate-500 uppercase font-bold tracking-wider">
                          <span>Duration Variance</span>
                          <span className="text-[#8c2bee]">{durationVariance}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={durationVariance}
                          onChange={(e) => setDurationVariance(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-[#8c2bee]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                          <p className="text-[10px] text-slate-500 font-bold mb-2 uppercase">Quantize</p>
                          <select className="w-full bg-transparent border-none text-xs focus:ring-0 p-0 font-bold text-[#8c2bee]">
                            <option>1/16 Strict</option>
                            <option>1/8 Swing</option>
                            <option>None</option>
                          </select>
                        </div>
                        <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                          <p className="text-[10px] text-slate-500 font-bold mb-2 uppercase">Voicing</p>
                          <select className="w-full bg-transparent border-none text-xs focus:ring-0 p-0 font-bold text-[#8c2bee]">
                            <option>Close Position</option>
                            <option>Drop 2</option>
                            <option>Open Spread</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-2 relative h-32 bg-black/40 rounded-lg border border-white/5 p-4 overflow-hidden">
                      <p className="absolute top-2 left-3 text-[10px] text-slate-500 uppercase font-bold z-10">Velocity Curve</p>
                      <svg className="w-full h-full text-[#8c2bee] opacity-40" viewBox="0 0 400 100">
                        <path d="M0,100 Q100,0 400,0" fill="none" stroke="currentColor" strokeWidth="3" />
                        <circle cx="100" cy="50" fill="currentColor" r="4" />
                      </svg>
                      <div className="absolute bottom-4 right-4 flex items-end gap-1">
                        {[20, 40, 60, 80, 100, 70, 50].map((h, i) => (
                          <motion.div 
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: h }}
                            className="w-1 bg-[#8c2bee]/60 rounded-t"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Piano Roll Grid */}
                <section className="flex-1 bg-[#120d18] border border-white/5 rounded-xl flex flex-col overflow-hidden relative shadow-2xl">
                  <div className="flex h-10 border-b border-white/5 bg-black/20 shrink-0">
                    <div className="w-16 border-r border-white/5 flex items-center justify-center">
                      <Maximize2 size={14} className="text-slate-500" />
                    </div>
                    <div className="flex-1 flex overflow-hidden">
                      {Array.from({ length: 16 }).map((_, i) => (
                        <div key={i} className="flex-1 border-r border-white/5 flex items-end justify-start px-2 pb-1 text-[9px] text-slate-600 font-mono">
                          00{Math.floor(i/4) + 1}.{ (i%4) + 1 }
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-1 overflow-hidden">
                    {/* Piano Keys */}
                    <div className="w-16 bg-black/40 border-r border-white/5 flex flex-col overflow-y-auto no-scrollbar">
                      {Array.from({ length: 24 }).map((_, i) => {
                        const pitch = 72 - i;
                        const isBlack = [1, 3, 6, 8, 10].includes(pitch % 12);
                        return (
                          <div 
                            key={pitch} 
                            className={`h-8 border-b border-white/5 flex items-center justify-end px-2 text-[9px] font-bold ${
                              isBlack ? 'bg-black/60 text-slate-500' : 'bg-white/5 text-slate-400'
                            }`}
                          >
                            {pitch % 12 === 0 ? `C${pitch/12 - 1}` : ''}
                          </div>
                        );
                      })}
                    </div>

                    {/* Grid Area */}
                    <div 
                      ref={pianoRollRef}
                      className="flex-1 relative piano-roll-grid overflow-auto custom-scrollbar"
                    >
                      {/* Playhead */}
                      {isPlaying && (
                        <motion.div 
                          initial={{ left: 0 }}
                          animate={{ left: '100%' }}
                          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                          className="absolute top-0 bottom-0 w-px bg-[#8c2bee] z-20 shadow-[0_0_10px_#8c2bee]"
                        />
                      )}

                      {/* Notes */}
                      {notes.map((note) => (
                        <motion.div
                          key={note.id}
                          layoutId={note.id}
                          className="absolute h-6 bg-[#8c2bee]/40 border-l-4 border-[#8c2bee] rounded-sm flex items-center px-2 shadow-[0_0_15px_rgba(140,43,238,0.3)] group cursor-pointer hover:bg-[#8c2bee]/60 transition-colors"
                          style={{
                            top: (72 - note.pitch) * 32 + 4,
                            left: (note.start / 480) * 100,
                            width: (note.duration / 480) * 100,
                          }}
                        >
                          <span className="text-[8px] font-bold text-white uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                            {note.velocity}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </section>
              </motion.div>
            ) : (
              <motion.div 
                key="library"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col flex-1 gap-6 overflow-y-auto pr-2 custom-scrollbar"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Harmony Set Library</h2>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input 
                        type="text" 
                        placeholder="Search sets..."
                        className="bg-white/5 border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-[#8c2bee] focus:border-[#8c2bee]"
                      />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors">
                      Most Popular <ChevronDown size={14} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {HARMONY_SETS.map((set) => (
                    <motion.div 
                      key={set.id}
                      whileHover={{ y: -5 }}
                      className="group flex flex-col rounded-xl border border-white/5 bg-white/5 p-4 hover:border-[#8c2bee]/40 hover:bg-white/10 transition-all duration-300"
                    >
                      <div className="relative mb-4 aspect-video overflow-hidden rounded-lg">
                        <img 
                          src={set.imageUrl} 
                          alt={set.name} 
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all" />
                        <div className="absolute bottom-2 left-2">
                          <span className="rounded bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-md uppercase">
                            {set.category}
                          </span>
                        </div>
                      </div>
                      <div className="mb-4 flex-1">
                        <h4 className="text-base font-bold text-white group-hover:text-[#8c2bee] transition-colors">{set.name}</h4>
                        <p className="mt-3 text-sm text-slate-400 line-clamp-2 leading-relaxed">{set.description}</p>
                        <div className="mt-4 flex items-center gap-3">
                          <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                            <Music size={12} /> {set.progressions} Progressions
                          </span>
                          <span className="h-1 w-1 rounded-full bg-slate-700" />
                          <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                            <Download size={12} /> {set.size}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button className="flex items-center justify-center gap-2 rounded-lg border border-white/10 py-2 text-xs font-bold text-slate-300 hover:bg-white/5 transition-all">
                          Preview
                        </button>
                        <button className="rounded-lg bg-[#8c2bee] py-2 text-xs font-bold text-white hover:bg-[#8c2bee]/90 transition-all shadow-lg shadow-[#8c2bee]/20">
                          Load Set
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Footer Status & Mini Player */}
      <footer className="bg-[#120d18] border-t border-white/5 px-6 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6 text-[10px] font-medium text-slate-500 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
            <span>Engine Ready</span>
          </div>
          <div className="flex items-center gap-2">
            <Cpu size={12} />
            <span>CPU: 14%</span>
          </div>
          <div className="flex items-center gap-2">
            <Cable size={12} />
            <span>Latency: 2.4ms</span>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Volume2 size={14} className="text-slate-500" />
              <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="bg-[#8c2bee] w-3/4 h-full shadow-[0_0_5px_#8c2bee]"></div>
              </div>
            </div>
            <div className="h-4 w-[1px] bg-white/10"></div>
            <p className="text-[10px] font-mono text-slate-500">{new Date().toLocaleTimeString()}</p>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-[#8c2bee] px-5 py-1.5 text-xs font-bold text-white shadow-lg shadow-[#8c2bee]/20 hover:bg-[#8c2bee]/90 transition-all active:scale-95">
            <Download size={14} /> EXPORT MIDI
          </button>
        </div>
      </footer>
    </div>
  );
}
