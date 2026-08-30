import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowDown,
  ArrowRight,
  Check,
  CircleHelp,
  Compass,
  Eye,
  Info,
  Layers3,
  LockKeyhole,
  Menu,
  Network,
  Orbit,
  Radio,
  Send,
  Sparkles,
  Terminal,
  X,
} from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

type Stage = {
  index: string;
  name: string;
  detail: string;
  icon: typeof Send;
  color: 'cyan' | 'pink' | 'violet';
};

type SimulationPhase = 'idle' | 'reading' | 'breaking' | 'traveling' | 'paused' | 'arrived';

type SimulationState = {
  phase: SimulationPhase;
  progress: number;
  pausedFrom: Exclude<SimulationPhase, 'paused'>;
};

const stages: Stage[] = [
  { index: '01', name: 'Your device', detail: 'The thought becomes a small, structured bundle of data.', icon: Terminal, color: 'cyan' },
  { index: '02', name: 'Local network', detail: 'Your message asks the nearby network for a way out.', icon: Radio, color: 'pink' },
  { index: '03', name: 'A wider route', detail: 'Independent routers pass the bundle toward its destination.', icon: Network, color: 'violet' },
  { index: '04', name: 'The handoff', detail: 'The receiving service reassembles the pieces into meaning.', icon: Sparkles, color: 'cyan' },
];

const initialSimulation: SimulationState = { phase: 'idle', progress: 0, pausedFrom: 'idle' };

function phaseProgress(simulation: SimulationState) {
  if (simulation.phase === 'idle') return 0;
  if (simulation.phase === 'reading') return 16;
  if (simulation.phase === 'breaking') return 42;
  if (simulation.phase === 'traveling') return 42 + simulation.progress * 58;
  if (simulation.phase === 'arrived') return 100;
  if (simulation.pausedFrom === 'reading') return 16;
  if (simulation.pausedFrom === 'breaking') return 42;
  return 42 + simulation.progress * 58;
}

const navItems = [
  { id: 'home', label: 'Home' },
  { id: 'journey', label: 'Journey' },
  { id: 'packet-view', label: 'Packet View' },
  { id: 'learn', label: 'Learn' },
  { id: 'about', label: 'About' },
];

const reveal = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function SectionReveal({ children, className = '', id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <motion.section
      id={id}
      className={className}
      variants={reveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
    >
      {children}
    </motion.section>
  );
}

function NetworkBackdrop() {
  const nodes = [
    [9, 16], [19, 50], [31, 26], [45, 70], [58, 37], [69, 17], [83, 54], [94, 26],
    [77, 81], [25, 83], [51, 12], [98, 82],
  ];
  const connections = [[0, 1], [0, 2], [1, 3], [2, 4], [2, 6], [3, 9], [4, 5], [4, 7], [5, 7], [6, 8], [7, 11], [8, 9], [9, 10], [10, 5]];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="network-grid absolute inset-0 opacity-60" />
      <svg className="absolute inset-0 h-full w-full opacity-70" preserveAspectRatio="none" viewBox="0 0 100 100">
        {connections.map(([from, to], index) => (
          <motion.line
            key={`${from}-${to}`}
            x1={nodes[from][0]}
            y1={nodes[from][1]}
            x2={nodes[to][0]}
            y2={nodes[to][1]}
            stroke={index % 3 === 0 ? 'hsl(186 92% 58% / .27)' : 'hsl(217 35% 48% / .18)'}
            strokeWidth=".13"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.15, 0.65, 0.15] }}
            transition={{ duration: 4 + index * 0.3, repeat: Infinity, delay: index * 0.16 }}
          />
        ))}
        {nodes.map(([x, y], index) => (
          <g key={`${x}-${y}`}>
            <motion.circle cx={x} cy={y} r={index % 4 === 0 ? 1.1 : 0.55} fill={index % 4 === 0 ? 'hsl(186 92% 58% / .75)' : 'hsl(217 38% 56% / .4)'} animate={{ opacity: [0.25, 0.9, 0.25] }} transition={{ duration: 3.4 + index * 0.25, repeat: Infinity, delay: index * 0.2 }} />
            {index % 4 === 0 && <circle cx={x} cy={y} r="3.5" fill="none" stroke="hsl(186 92% 58% / .16)" strokeWidth=".16" className="pulse-ring" />}
          </g>
        ))}
      </svg>
      <div className="absolute -left-24 top-40 h-72 w-72 rounded-full bg-cyan-400/[0.055] blur-3xl" />
      <div className="absolute -right-32 top-[35rem] h-96 w-96 rounded-full bg-pink-400/[0.045] blur-3xl" />
    </div>
  );
}

function BrandMark() {
  return (
    <button className="group flex items-center gap-3" onClick={() => scrollToSection('home')} data-testid="button-brand-home">
      <span className="relative flex h-8 w-8 items-center justify-center rounded-full border border-cyan-300/50 bg-cyan-300/10">
        <span className="absolute h-4 w-4 rounded-full border border-cyan-200/70" />
        <span className="h-1.5 w-1.5 rounded-full bg-cyan-200 shadow-[0_0_14px_hsl(186_92%_58%)]" />
      </span>
      <span className="font-display text-sm font-semibold tracking-[0.12em] text-slate-100">THE JOURNEY<span className="text-cyan-300">/</span>MESSAGE</span>
    </button>
  );
}

function Header({ activeId, onMenu }: { activeId: string; onMenu: () => void }) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-slate-700/40 bg-[#080c16]/75 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <BrandMark />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`relative rounded-full px-4 py-2 font-mono-ui text-[11px] tracking-[0.08em] transition-colors ${activeId === item.id ? 'text-cyan-200' : 'text-slate-400 hover:text-slate-100'}`}
              data-testid={`button-nav-${item.id}`}
            >
              {item.label}
              {activeId === item.id && <motion.span layoutId="nav-dot" className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-cyan-300" />}
            </button>
          ))}
        </nav>
        <button onClick={onMenu} className="rounded-lg p-2 text-slate-300 hover:bg-slate-800/70 md:hidden" aria-label="Open menu" data-testid="button-open-menu">
          <Menu size={20} />
        </button>
      </div>
    </header>
  );
}

function MobileMenu({ open, close }: { open: boolean; close: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 bg-[#080c16]/95 p-6 backdrop-blur-xl md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="flex items-center justify-between">
            <BrandMark />
            <button onClick={close} className="rounded-lg p-2 text-slate-300" aria-label="Close menu" data-testid="button-close-menu"><X size={22} /></button>
          </div>
          <nav className="mt-20 flex flex-col gap-2">
            {navItems.map((item, index) => (
              <motion.button
                key={item.id}
                onClick={() => { close(); scrollToSection(item.id); }}
                className="flex items-center justify-between border-b border-slate-700/40 py-5 text-left font-display text-3xl text-slate-200"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.06 }}
                data-testid={`button-mobile-nav-${item.id}`}
              >
                <span>{item.label}</span><ArrowRight className="text-cyan-300" size={20} />
              </motion.button>
            ))}
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Hero({ message, setMessage, start, simulation, composerHint }: { message: string; setMessage: (value: string) => void; start: () => void; simulation: SimulationState; composerHint: string }) {
  const active = simulation.phase === 'reading' || simulation.phase === 'breaking' || simulation.phase === 'traveling';
  const canSubmit = simulation.phase === 'idle' || simulation.phase === 'arrived';
  const buttonLabel = simulation.phase === 'reading' ? 'Reading' : simulation.phase === 'breaking' ? 'Breaking apart' : simulation.phase === 'traveling' ? 'In motion' : simulation.phase === 'paused' ? 'Paused' : simulation.phase === 'arrived' ? 'Send again' : 'Send message';
  return (
    <section id="home" className="relative flex min-h-[760px] items-center overflow-hidden pt-24 sm:min-h-[850px]">
      <NetworkBackdrop />
      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-14 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1.02fr_.98fr] lg:gap-24 lg:pt-20">
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.12 } } }}>
          <motion.div variants={reveal} className="mb-7 flex items-center gap-3">
            <span className="h-px w-9 bg-cyan-300/70" />
            <span className="font-mono-ui text-[10px] uppercase tracking-[0.22em] text-cyan-300">An interactive visual story</span>
          </motion.div>
          <motion.h1 variants={reveal} className="max-w-4xl font-display text-[clamp(3.5rem,8.4vw,7.8rem)] font-semibold leading-[0.9] tracking-[-0.075em] text-slate-100">
            Where does<br /><span className="text-cyan-300">your message</span><br />go?
          </motion.h1>
          <motion.p variants={reveal} className="mt-9 max-w-lg text-base leading-7 text-slate-400 sm:text-lg">
            Press send and follow a thought as it becomes data, finds a route, and arrives as meaning. We are revealing the invisible journey beneath an everyday ritual.
          </motion.p>
          <motion.button variants={reveal} onClick={() => scrollToSection('journey')} className="group mt-9 flex items-center gap-3 font-mono-ui text-xs uppercase tracking-[0.15em] text-slate-300 transition-colors hover:text-cyan-200" data-testid="button-explore-journey">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-600 transition-colors group-hover:border-cyan-300/70 group-hover:bg-cyan-300/10"><ArrowDown size={15} /></span>
            Explore the path
          </motion.button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42, duration: 0.8 }} className="relative lg:justify-self-end">
          <div className="absolute -inset-5 rounded-[2rem] border border-cyan-300/[0.08] sm:-inset-8" />
          <div className="absolute -inset-14 rounded-[3rem] border border-slate-700/20" />
          <form onSubmit={(event) => { event.preventDefault(); if (canSubmit) start(); }} className="relative w-full max-w-[500px] overflow-hidden rounded-2xl border border-slate-600/70 bg-[#0d1422]/90 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-700/60 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_hsl(186_92%_58%)]" />
                <span className="font-mono-ui text-[10px] uppercase tracking-[0.18em] text-slate-400">Compose a signal</span>
              </div>
              <span className="font-mono-ui text-[10px] text-slate-600">LOCAL SIMULATION</span>
            </div>
            <div className="p-5 sm:p-7">
              <label htmlFor="message-input" className="mb-3 block font-mono-ui text-[10px] uppercase tracking-[0.16em] text-slate-500">Your message</label>
              <textarea id="message-input" value={message} onChange={(event) => setMessage(event.target.value)} rows={5} maxLength={180} placeholder="Type something worth sending..." className="w-full resize-none bg-transparent font-display text-xl leading-8 text-slate-100 outline-none placeholder:text-slate-700" data-testid="input-message" />
              <div className="mt-3 flex items-center justify-between border-t border-slate-700/50 pt-4">
                <span className="font-mono-ui text-[10px] text-slate-600">{message.length.toString().padStart(3, '0')} / 180</span>
                <button type="submit" disabled={!canSubmit} className="group flex items-center gap-3 rounded-full bg-cyan-300 px-5 py-3 font-mono-ui text-[11px] font-medium uppercase tracking-[0.12em] text-[#081019] transition-all hover:bg-cyan-200 hover:shadow-[0_0_30px_hsl(186_92%_58%_/_0.28)] disabled:cursor-wait disabled:opacity-70" data-testid="button-send-message">
                  {buttonLabel}
                  <motion.span animate={active ? { x: [0, 5, 0] } : { x: 0 }} transition={{ repeat: active ? Infinity : 0, duration: 0.8 }}><Send size={14} /></motion.span>
                </button>
              </div>
            </div>
            <AnimatePresence>
              {simulation.phase === 'arrived' && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="border-t border-cyan-300/20 bg-cyan-300/[0.06] px-5 py-3 font-mono-ui text-[10px] tracking-[0.06em] text-cyan-200">
                  <Check size={13} className="mr-2 inline-block" /> FIRST HANDOFF COMPLETE · FOLLOW IT BELOW
                </motion.div>
              )}
            </AnimatePresence>
          </form>
          <AnimatePresence>
            {composerHint && (
              <motion.p role="alert" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-3 flex items-center gap-2 px-1 font-mono-ui text-[10px] tracking-[0.04em] text-pink-200" data-testid="text-composer-instruction">
                <Info size={13} /> {composerHint}
              </motion.p>
            )}
          </AnimatePresence>
          <div className="mt-5 flex items-center gap-2 px-1 font-mono-ui text-[10px] text-slate-600"><LockKeyhole size={12} /> Nothing leaves this page. This is a safe, local simulation.</div>
        </motion.div>
      </div>
    </section>
  );
}

function SimulationControls({ simulation, start, pause, continueSimulation, reset }: { simulation: SimulationState; start: () => void; pause: () => void; continueSimulation: () => void; reset: () => void }) {
  const canPause = simulation.phase === 'reading' || simulation.phase === 'breaking' || simulation.phase === 'traveling';
  return (
    <div className="mt-6 flex flex-wrap items-center gap-2" data-testid="simulation-controls">
      {simulation.phase === 'idle' && <button onClick={start} className="rounded-full bg-cyan-300 px-4 py-2.5 font-mono-ui text-[10px] uppercase tracking-[0.12em] text-[#081019] transition-colors hover:bg-cyan-200" data-testid="button-simulation-start"><Send size={12} className="mr-2 inline-block" /> Start</button>}
      {canPause && <button onClick={pause} className="rounded-full border border-slate-600 px-4 py-2.5 font-mono-ui text-[10px] uppercase tracking-[0.12em] text-slate-300 transition-colors hover:border-pink-300/60 hover:text-pink-200" data-testid="button-simulation-pause">Pause</button>}
      {simulation.phase === 'paused' && <button onClick={continueSimulation} className="rounded-full bg-cyan-300 px-4 py-2.5 font-mono-ui text-[10px] uppercase tracking-[0.12em] text-[#081019] transition-colors hover:bg-cyan-200" data-testid="button-simulation-continue"><ArrowRight size={12} className="mr-2 inline-block" /> Continue</button>}
      {simulation.phase !== 'idle' && <button onClick={reset} className="rounded-full border border-slate-700 px-4 py-2.5 font-mono-ui text-[10px] uppercase tracking-[0.12em] text-slate-500 transition-colors hover:border-slate-500 hover:text-slate-200" data-testid="button-simulation-reset">Reset</button>}
    </div>
  );
}

function PacketRoute({ message, simulation, start, pause, continueSimulation, reset }: { message: string; simulation: SimulationState; start: () => void; pause: () => void; continueSimulation: () => void; reset: () => void }) {
  const packetLabels = useMemo(() => {
    const clean = message.trim();
    if (!clean) return [];
    const count = Math.min(6, Math.max(3, Math.ceil(clean.length / 16)));
    const size = Math.ceil(clean.length / count);
    return Array.from({ length: count }, (_, index) => clean.slice(index * size, (index + 1) * size) || `chunk ${index + 1}`);
  }, [message]);
  const isPaused = simulation.phase === 'paused';
  const showPackets = simulation.phase === 'breaking' || simulation.phase === 'traveling' || simulation.phase === 'arrived' || isPaused;
  const packetProgress = simulation.phase === 'arrived' ? 1 : simulation.progress;
  const packetOffsets = [[0, -24], [7, 18], [-6, 42], [11, -43], [-11, 0], [4, 61]];
  const routeProgress = phaseProgress(simulation);
  return (
    <div className="relative min-h-[410px] overflow-hidden rounded-2xl border border-slate-700/70 bg-[#0b1220] p-5 sm:p-8" data-testid="panel-packet-route">
      <div className="network-grid absolute inset-0 opacity-40" />
      <div className="relative flex items-start justify-between gap-4">
        <div><div className="font-mono-ui text-[10px] uppercase tracking-[0.15em] text-cyan-300">Live route / local only</div><div className="mt-2 font-display text-2xl text-slate-100">From thought to packets</div></div>
        <div className="rounded-full border border-slate-700 bg-slate-900/50 px-3 py-2 font-mono-ui text-[10px] text-slate-500" data-testid="text-simulation-progress">{Math.round(routeProgress).toString().padStart(3, '0')}%</div>
      </div>
      <div className="relative mt-9 h-[180px] sm:h-[205px]" data-testid="visual-packet-transformation">
        <div className={`absolute left-0 top-[54px] z-10 w-[43%] min-w-[112px] rounded-xl border p-3 transition-colors sm:top-[60px] sm:min-w-[168px] sm:p-4 ${simulation.phase === 'reading' ? 'border-cyan-300/70 bg-cyan-300/[0.1]' : 'border-slate-700 bg-slate-900/75'}`} data-testid="visual-readable-message">
          <div className="mb-2 flex items-center gap-2 font-mono-ui text-[9px] uppercase tracking-[0.12em] text-slate-500"><span className="h-1.5 w-1.5 rounded-full bg-pink-300" /> readable message</div>
          <p className={`line-clamp-3 font-display text-xs leading-5 transition-opacity sm:text-sm ${simulation.phase === 'traveling' || simulation.phase === 'arrived' ? 'text-slate-500 opacity-60' : 'text-slate-200'}`}>{message || 'Your message will appear here.'}</p>
        </div>
        <div className="absolute left-[45%] right-[19%] top-[82px] h-px bg-gradient-to-r from-slate-700 via-cyan-300/35 to-cyan-300/60 sm:left-[44%] sm:right-[20%]" />
        <div className="absolute right-0 top-[39px] z-10 flex w-[20%] min-w-[68px] flex-col items-center gap-2 sm:top-[45px] sm:min-w-[92px]" data-testid="visual-first-network-stage">
          <div className={`flex h-14 w-14 items-center justify-center rounded-full border transition-all sm:h-[68px] sm:w-[68px] ${simulation.phase === 'arrived' ? 'border-cyan-200 bg-cyan-300 text-[#081019] shadow-[0_0_30px_hsl(186_92%_58%_/_0.26)]' : 'border-slate-600 bg-slate-900 text-slate-500'}`}><Radio size={19} /></div>
          <span className="text-center font-mono-ui text-[9px] uppercase leading-4 tracking-[0.08em] text-slate-500">local<br />network</span>
        </div>
        {showPackets && packetLabels.map((label, index) => {
          const [x, y] = packetOffsets[index % packetOffsets.length];
          return <motion.div key={`${label}-${index}`} className="absolute left-[41%] top-[75px] z-20 flex items-center gap-1.5 rounded-full border border-cyan-200/60 bg-[#0d1d2c] px-2 py-1 font-mono-ui text-[8px] text-cyan-100 shadow-[0_0_16px_hsl(186_92%_58%_/_0.2)] sm:px-2.5 sm:text-[9px]" initial={{ opacity: 0, scale: 0.4, x: 0, y: 0 }} animate={{ opacity: 1, scale: simulation.phase === 'breaking' ? [0.8, 1.06, 0.96] : 1, x: packetProgress * (index % 2 === 0 ? 190 + x : 165 + x), y: packetProgress * y }} transition={{ delay: index * 0.08, duration: simulation.phase === 'breaking' ? 0.5 : 0.8 }} data-testid={`visual-packet-${index + 1}`}><span className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />{label.slice(0, 14)}</motion.div>;
        })}
      </div>
      <div className="relative border-t border-slate-700/60 pt-4">
        <div className="mb-3 flex items-center justify-between font-mono-ui text-[9px] uppercase tracking-[0.12em] text-slate-600"><span data-testid="text-simulation-phase">{simulation.phase === 'idle' ? 'Ready when you are' : simulation.phase === 'reading' ? 'Holding the thought intact' : simulation.phase === 'breaking' ? 'Breaking one thought into small packets' : simulation.phase === 'traveling' ? 'Packets moving toward the first handoff' : simulation.phase === 'paused' ? 'Paused exactly here' : 'Packets reached the first handoff'}</span><span>{packetLabels.length || 0} packets</span></div>
        <div className="h-1 overflow-hidden rounded-full bg-slate-800" aria-label={`Simulation progress ${Math.round(routeProgress)} percent`}><motion.div className="h-full origin-left rounded-full bg-gradient-to-r from-pink-300 via-cyan-300 to-cyan-200" animate={{ scaleX: routeProgress / 100 }} transition={{ duration: 0.35 }} /></div>
        <SimulationControls simulation={simulation} start={start} pause={pause} continueSimulation={continueSimulation} reset={reset} />
      </div>
    </div>
  );
}

function Journey({ message, simulation, start, pause, continueSimulation, reset }: { message: string; simulation: SimulationState; start: () => void; pause: () => void; continueSimulation: () => void; reset: () => void }) {
  const currentStage = simulation.phase === 'arrived' ? 1 : 0;
  const sent = simulation.phase !== 'idle';
  return (
    <SectionReveal id="journey" className="relative mx-auto max-w-7xl scroll-mt-20 px-5 py-28 sm:px-8 sm:py-36">
      <div className="mb-16 flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
        <div>
          <p className="mb-4 font-mono-ui text-[10px] uppercase tracking-[0.2em] text-cyan-300">01 / The journey</p>
          <h2 className="max-w-2xl font-display text-4xl font-semibold tracking-[-0.05em] text-slate-100 sm:text-6xl">A message is never just a message.</h2>
        </div>
        <p className="max-w-sm text-sm leading-6 text-slate-500">It is a compact traveler. Every stop makes a decision, leaves a trace, and moves it a little closer to being understood.</p>
      </div>
      <div className="relative grid gap-8 lg:grid-cols-[.85fr_1.15fr]">
        <div className="relative">
          <div className="absolute bottom-10 left-[20px] top-10 w-px bg-gradient-to-b from-cyan-300/60 via-pink-300/40 to-slate-700/30" />
          <div className="space-y-3">
            {stages.map((stage, index) => {
              const active = sent && index === currentStage;
              const complete = sent && index < currentStage;
              const Icon = stage.icon;
              return (
                <motion.div key={stage.name} className={`group relative flex w-full items-start gap-5 rounded-xl p-3 text-left transition-all ${active ? 'bg-slate-800/75' : 'hover:bg-slate-800/35'}`} data-testid={`item-stage-${index + 1}`}>
                  <span className={`relative z-10 flex h-4 w-4 shrink-0 translate-y-2 items-center justify-center rounded-full border ${active ? 'border-cyan-200 bg-cyan-300 shadow-[0_0_18px_hsl(186_92%_58%_/_0.7)]' : complete ? 'border-pink-300 bg-pink-300' : 'border-slate-600 bg-[#080c16]'} transition-colors`}>
                    {complete && <Check size={10} className="text-[#081019]" />}
                  </span>
                  <span className="flex-1 pb-5">
                    <span className="flex items-center gap-3">
                      <span className={`font-mono-ui text-[10px] ${active ? 'text-cyan-300' : 'text-slate-600'}`}>{stage.index}</span>
                      <span className={`font-display text-lg ${active ? 'text-slate-100' : 'text-slate-400'}`}>{stage.name}</span>
                    </span>
                    <span className="mt-1 block max-w-sm text-xs leading-5 text-slate-600 group-hover:text-slate-500">{stage.detail}</span>
                  </span>
                  <Icon size={17} className={active ? 'mt-1 text-cyan-300' : 'mt-1 text-slate-700'} />
                </motion.div>
              );
            })}
          </div>
        </div>
        <div className="relative">
          <AnimatePresence mode="wait">
            {simulation.phase === 'idle' ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative flex min-h-[390px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-slate-700/70 bg-[#0b1220] p-5 text-center sm:p-8">
                <div className="network-grid absolute inset-0 opacity-40" />
                <div className="relative mb-8 flex h-28 w-28 items-center justify-center rounded-full border border-slate-600/70">
                  <div className="absolute inset-3 rounded-full border border-dashed border-slate-600" />
                  <Orbit size={28} className="text-slate-500" />
                  <span className="absolute -right-2 top-5 h-2 w-2 rounded-full bg-pink-300" />
                  <span className="absolute -bottom-1 left-7 h-1.5 w-1.5 rounded-full bg-cyan-300" />
                </div>
                <p className="relative font-display text-xl text-slate-300">The route is waiting.</p>
                <p className="relative mt-2 max-w-xs text-sm leading-6 text-slate-600">Send a message above to wake up the network and watch the handoffs happen.</p>
                <button onClick={() => scrollToSection('home')} className="relative mt-6 flex items-center gap-2 font-mono-ui text-[10px] uppercase tracking-[0.15em] text-cyan-300 hover:text-cyan-200" data-testid="button-return-to-compose">Return to compose <ArrowRight size={13} /></button>
              </motion.div>
            ) : <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><PacketRoute message={message} simulation={simulation} start={start} pause={pause} continueSimulation={continueSimulation} reset={reset} /></motion.div>}
          </AnimatePresence>
        </div>
      </div>
    </SectionReveal>
  );
}

function PacketView({ message }: { message: string }) {
  const packetBits = useMemo(() => [
    { label: 'origin', value: 'your device', tone: 'cyan' },
    { label: 'destination', value: 'a waiting service', tone: 'pink' },
    { label: 'payload', value: message || 'a thought, not yet sent', tone: 'violet' },
  ], [message]);
  return (
    <SectionReveal id="packet-view" className="scroll-mt-20 border-y border-slate-700/50 bg-[#0a101c] py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-start gap-16 lg:grid-cols-[.9fr_1.1fr] lg:gap-24">
          <div>
            <p className="mb-4 font-mono-ui text-[10px] uppercase tracking-[0.2em] text-pink-300">02 / Packet view</p>
            <h2 className="font-display text-4xl font-semibold tracking-[-0.05em] text-slate-100 sm:text-6xl">The message<br /><span className="text-pink-300">gets smaller.</span></h2>
            <p className="mt-7 max-w-md text-sm leading-7 text-slate-500">Before it travels, your message is wrapped in the information a network needs to carry it. Meaning on the inside. Instructions on the outside.</p>
            <div className="mt-10 flex items-center gap-3 font-mono-ui text-[10px] uppercase tracking-[0.14em] text-slate-600"><Layers3 size={14} className="text-pink-300" /> One message · many small packets</div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-2xl border border-pink-300/[0.08] sm:-inset-7" />
            <div className="relative overflow-hidden rounded-xl border border-slate-600/80 bg-[#0d1422] p-4 sm:p-6">
              <div className="mb-5 flex items-center justify-between border-b border-slate-700/60 pb-4"><span className="font-mono-ui text-[10px] uppercase tracking-[0.15em] text-slate-500">packet / 0001</span><span className="flex items-center gap-2 font-mono-ui text-[10px] text-pink-300"><span className="h-1.5 w-1.5 rounded-full bg-pink-300" /> assembled locally</span></div>
              <div className="space-y-3">
                {packetBits.map((bit) => (
                  <div key={bit.label} className="grid gap-2 rounded-lg border border-slate-700/70 bg-slate-900/60 p-4 sm:grid-cols-[130px_1fr] sm:items-center">
                    <span className="font-mono-ui text-[10px] uppercase tracking-[0.13em] text-slate-600">{bit.label}</span>
                    <span className={`font-display text-sm ${bit.tone === 'cyan' ? 'text-cyan-200' : bit.tone === 'pink' ? 'text-pink-200' : 'text-violet-200'}`}>{bit.value}</span>
                  </div>
                ))}
              </div>
              <div className="relative mt-3 overflow-hidden rounded-lg border border-dashed border-slate-700 bg-slate-900/40 px-4 py-5">
                <div className="scanline absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-transparent via-cyan-300/10 to-transparent" />
                <div className="flex items-center gap-3"><Info size={14} className="text-slate-600" /><span className="font-mono-ui text-[10px] leading-5 text-slate-600">The payload is not the whole story. A route is a conversation between many layers.</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionReveal>
  );
}

function Learn() {
  const cards = [
    { icon: Compass, number: '01', title: 'Routes are decisions', text: 'A message does not follow one fixed road. Each network node chooses the next useful direction.' },
    { icon: Eye, number: '02', title: 'Invisible is not instant', text: 'A tap feels immediate because thousands of tiny handoffs happen faster than we can notice.' },
    { icon: CircleHelp, number: '03', title: 'The cloud is a place', text: 'Behind the metaphor are real machines, rooms, cables, and people keeping the exchange alive.' },
  ];
  return (
    <SectionReveal id="learn" className="scroll-mt-20 mx-auto max-w-7xl px-5 py-28 sm:px-8 sm:py-36">
      <div className="flex flex-col justify-between gap-8 border-b border-slate-700/60 pb-12 lg:flex-row lg:items-end">
        <div><p className="mb-4 font-mono-ui text-[10px] uppercase tracking-[0.2em] text-violet-300">03 / Learn to see it</p><h2 className="max-w-xl font-display text-4xl font-semibold tracking-[-0.05em] text-slate-100 sm:text-6xl">Make the invisible<br />feel <span className="text-violet-300">close.</span></h2></div>
        <p className="max-w-sm text-sm leading-6 text-slate-500">A gentle field guide to the ideas behind the animation. No jargon required — just a little more wonder.</p>
      </div>
      <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-700/70 md:grid-cols-3">
        {cards.map(({ icon: Icon, number, title, text }) => (
          <article key={number} className="group bg-[#0b1220] p-7 transition-colors hover:bg-[#101a2b] sm:p-9" data-testid={`card-learn-${number}`}>
            <div className="flex items-center justify-between"><span className="font-mono-ui text-[10px] text-slate-600">{number}</span><Icon size={21} className="text-violet-300 transition-transform group-hover:-translate-y-1" /></div>
            <h3 className="mt-16 font-display text-2xl text-slate-200">{title}</h3><p className="mt-4 text-sm leading-6 text-slate-500">{text}</p>
          </article>
        ))}
      </div>
    </SectionReveal>
  );
}

function About() {
  return (
    <SectionReveal id="about" className="relative scroll-mt-20 overflow-hidden border-t border-slate-700/50 bg-[#0a101c]">
      <NetworkBackdrop />
      <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
        <div className="grid gap-12 lg:grid-cols-[1fr_.72fr] lg:items-end">
          <div><p className="mb-4 font-mono-ui text-[10px] uppercase tracking-[0.2em] text-cyan-300">04 / About this story</p><h2 className="max-w-3xl font-display text-4xl font-semibold tracking-[-0.055em] text-slate-100 sm:text-6xl">Curiosity is a<br /><span className="text-cyan-300">better interface.</span></h2><p className="mt-7 max-w-lg text-sm leading-7 text-slate-500">The Journey of a Message is a safe visual explanation of a thing we all do, constantly, without thinking about it. Every route in this experience is simulated right here in your browser.</p></div>
          <div className="rounded-xl border border-cyan-300/15 bg-cyan-300/[0.045] p-6"><LockKeyhole size={20} className="text-cyan-300" /><h3 className="mt-5 font-display text-lg text-slate-200">Private by design</h3><p className="mt-2 text-sm leading-6 text-slate-500">No real network tracking, IP addresses, or external networking APIs. Just an invitation to look a little closer.</p></div>
        </div>
        <div className="mt-24 flex flex-col justify-between gap-8 border-t border-slate-700/50 pt-7 sm:flex-row sm:items-center"><BrandMark /><span className="font-mono-ui text-[10px] uppercase tracking-[0.15em] text-slate-600">Visualizing the Invisible · 2025</span></div>
      </div>
    </SectionReveal>
  );
}

function Home() {
  const [message, setMessage] = useState('');
  const [simulation, setSimulation] = useState<SimulationState>(initialSimulation);
  const [composerHint, setComposerHint] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState('home');

  useEffect(() => {
    if (simulation.phase === 'reading') {
      const timeout = window.setTimeout(() => setSimulation((current) => current.phase === 'reading' ? { ...current, phase: 'breaking' } : current), 900);
      return () => window.clearTimeout(timeout);
    }
    if (simulation.phase === 'breaking') {
      const timeout = window.setTimeout(() => setSimulation((current) => current.phase === 'breaking' ? { ...current, phase: 'traveling', progress: 0 } : current), 1050);
      return () => window.clearTimeout(timeout);
    }
    if (simulation.phase === 'traveling') {
      const interval = window.setInterval(() => setSimulation((current) => {
        if (current.phase !== 'traveling') return current;
        const nextProgress = Math.min(1, current.progress + 0.025);
        return nextProgress >= 1 ? { ...current, phase: 'arrived', progress: 1, pausedFrom: 'arrived' } : { ...current, progress: nextProgress };
      }), 70);
      return () => window.clearInterval(interval);
    }
    return undefined;
  }, [simulation.phase]);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) setActiveId(entry.target.id); }), { rootMargin: '-35% 0px -55% 0px' });
    navItems.forEach(({ id }) => { const element = document.getElementById(id); if (element) observer.observe(element); });
    return () => observer.disconnect();
  }, []);

  const start = () => {
    if (!message.trim()) {
      setComposerHint('Write a few words first — the route needs a message to carry.');
      scrollToSection('home');
      return;
    }
    setComposerHint('');
    setSimulation({ phase: 'reading', progress: 0, pausedFrom: 'reading' });
    scrollToSection('journey');
  };
  const pause = () => setSimulation((current) => {
    if (current.phase !== 'reading' && current.phase !== 'breaking' && current.phase !== 'traveling') return current;
    return { ...current, phase: 'paused', pausedFrom: current.phase };
  });
  const continueSimulation = () => setSimulation((current) => current.phase === 'paused' ? { ...current, phase: current.pausedFrom } : current);
  const reset = () => {
    setSimulation(initialSimulation);
    setMessage('');
    setComposerHint('');
  };

  return (
    <div className="noise min-h-[100dvh] overflow-x-hidden">
      <Header activeId={activeId} onMenu={() => setMenuOpen(true)} />
      <MobileMenu open={menuOpen} close={() => setMenuOpen(false)} />
      <main>
        <Hero message={message} setMessage={(value) => { setMessage(value); if (composerHint) setComposerHint(''); }} start={start} simulation={simulation} composerHint={composerHint} />
        <Journey message={message} simulation={simulation} start={start} pause={pause} continueSimulation={continueSimulation} reset={reset} />
        <PacketView message={message} />
        <Learn />
        <About />
      </main>
    </div>
  );
}

function Router() {
  return (
    <ErrorBoundary resetKey={useLocation()[0]}>
      <Switch><Route path="/" component={Home} /><Route component={NotFound} /></Switch>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;