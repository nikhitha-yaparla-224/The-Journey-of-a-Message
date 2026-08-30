import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
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
  Zap,
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

const stages: Stage[] = [
  { index: '01', name: 'Your device', detail: 'The thought becomes a small, structured bundle of data.', icon: Terminal, color: 'cyan' },
  { index: '02', name: 'Local network', detail: 'Your message asks the nearby network for a way out.', icon: Radio, color: 'pink' },
  { index: '03', name: 'A wider route', detail: 'Independent routers pass the bundle toward its destination.', icon: Network, color: 'violet' },
  { index: '04', name: 'The handoff', detail: 'The receiving service reassembles the pieces into meaning.', icon: Sparkles, color: 'cyan' },
];

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

function Hero({ message, setMessage, send, isSending, sent }: { message: string; setMessage: (value: string) => void; send: () => void; isSending: boolean; sent: boolean }) {
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
          <form onSubmit={(event) => { event.preventDefault(); send(); }} className="relative w-full max-w-[500px] overflow-hidden rounded-2xl border border-slate-600/70 bg-[#0d1422]/90 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl">
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
                <button type="submit" disabled={isSending} className="group flex items-center gap-3 rounded-full bg-cyan-300 px-5 py-3 font-mono-ui text-[11px] font-medium uppercase tracking-[0.12em] text-[#081019] transition-all hover:bg-cyan-200 hover:shadow-[0_0_30px_hsl(186_92%_58%_/_0.28)] disabled:cursor-wait disabled:opacity-70" data-testid="button-send-message">
                  {isSending ? 'Launching' : sent ? 'Send again' : 'Send message'}
                  <motion.span animate={isSending ? { x: [0, 5, 0] } : { x: 0 }} transition={{ repeat: isSending ? Infinity : 0, duration: 0.8 }}><Send size={14} /></motion.span>
                </button>
              </div>
            </div>
            <AnimatePresence>
              {sent && !isSending && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="border-t border-cyan-300/20 bg-cyan-300/[0.06] px-5 py-3 font-mono-ui text-[10px] tracking-[0.06em] text-cyan-200">
                  <Check size={13} className="mr-2 inline-block" /> SIGNAL CAPTURED · FOLLOW IT BELOW
                </motion.div>
              )}
            </AnimatePresence>
          </form>
          <div className="mt-5 flex items-center gap-2 px-1 font-mono-ui text-[10px] text-slate-600"><LockKeyhole size={12} /> Nothing leaves this page. This is a safe, local simulation.</div>
        </motion.div>
      </div>
    </section>
  );
}

function Journey({ sent, currentStage, replay }: { sent: boolean; currentStage: number; replay: () => void }) {
  const progress = sent ? ((currentStage + 1) / stages.length) * 100 : 0;
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
                <motion.button key={stage.name} onClick={replay} className={`group relative flex w-full items-start gap-5 rounded-xl p-3 text-left transition-all ${active ? 'bg-slate-800/75' : 'hover:bg-slate-800/35'}`} data-testid={`button-stage-${index + 1}`}>
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
                </motion.button>
              );
            })}
          </div>
        </div>
        <div className="relative min-h-[390px] overflow-hidden rounded-2xl border border-slate-700/70 bg-[#0b1220] p-5 sm:p-8">
          <div className="network-grid absolute inset-0 opacity-40" />
          <AnimatePresence mode="wait">
            {!sent ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative flex min-h-[330px] flex-col items-center justify-center text-center">
                <div className="relative mb-8 flex h-28 w-28 items-center justify-center rounded-full border border-slate-600/70">
                  <div className="absolute inset-3 rounded-full border border-dashed border-slate-600" />
                  <Orbit size={28} className="text-slate-500" />
                  <span className="absolute -right-2 top-5 h-2 w-2 rounded-full bg-pink-300" />
                  <span className="absolute -bottom-1 left-7 h-1.5 w-1.5 rounded-full bg-cyan-300" />
                </div>
                <p className="font-display text-xl text-slate-300">The route is waiting.</p>
                <p className="mt-2 max-w-xs text-sm leading-6 text-slate-600">Send a message above to wake up the network and watch the handoffs happen.</p>
                <button onClick={() => scrollToSection('home')} className="mt-6 flex items-center gap-2 font-mono-ui text-[10px] uppercase tracking-[0.15em] text-cyan-300 hover:text-cyan-200" data-testid="button-return-to-compose">Return to compose <ArrowRight size={13} /></button>
              </motion.div>
            ) : (
              <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
                <div className="mb-12 flex items-center justify-between">
                  <div><div className="font-mono-ui text-[10px] uppercase tracking-[0.15em] text-cyan-300">Live route / local only</div><div className="mt-2 font-display text-2xl text-slate-100">Signal in motion</div></div>
                  <button onClick={replay} className="rounded-full border border-slate-600 px-3 py-2 font-mono-ui text-[10px] text-slate-400 hover:border-cyan-300/50 hover:text-cyan-200" data-testid="button-replay-journey">Replay</button>
                </div>
                <div className="relative flex items-center justify-between px-2 sm:px-8">
                  <div className="absolute left-4 right-4 top-1/2 h-px bg-slate-700 sm:left-10 sm:right-10" />
                  <motion.div className="absolute left-4 top-1/2 h-px origin-left bg-cyan-300 sm:left-10" animate={{ width: `calc(${progress}% - ${progress > 95 ? 20 : 0}px)` }} transition={{ duration: 0.6 }} />
                  {stages.map((stage, index) => { const StageIcon = stage.icon; return <div key={stage.name} className="relative flex flex-col items-center gap-4">
                    <motion.div animate={index === currentStage ? { scale: [1, 1.12, 1] } : { scale: 1 }} transition={{ duration: 1.6, repeat: index === currentStage ? Infinity : 0 }} className={`flex h-11 w-11 items-center justify-center rounded-full border ${index <= currentStage ? 'border-cyan-200 bg-cyan-300 text-[#081019]' : 'border-slate-600 bg-[#0b1220] text-slate-600'}`}><StageIcon size={16} /></motion.div>
                    <span className={`hidden font-mono-ui text-[9px] uppercase tracking-[0.1em] sm:block ${index === currentStage ? 'text-cyan-200' : 'text-slate-600'}`}>{stage.name}</span>
                  </div>; })}
                </div>
                <div className="mt-16 rounded-xl border border-slate-700/70 bg-slate-900/60 p-5">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 rounded-lg bg-cyan-300/10 p-2 text-cyan-300"><Zap size={16} /></div>
                    <div><div className="font-mono-ui text-[10px] uppercase tracking-[0.14em] text-cyan-300">Now passing through · {stages[currentStage].index}</div><div className="mt-2 font-display text-lg text-slate-200">{stages[currentStage].name}</div><p className="mt-1 text-sm leading-6 text-slate-500">{stages[currentStage].detail}</p></div>
                  </div>
                </div>
              </motion.div>
            )}
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
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState('home');
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => () => { if (timerRef.current) window.clearTimeout(timerRef.current); }, []);
  useEffect(() => {
    if (!sent || isSending) return;
    const interval = window.setInterval(() => setCurrentStage((value) => value < stages.length - 1 ? value + 1 : value), 1900);
    return () => window.clearInterval(interval);
  }, [sent, isSending]);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) setActiveId(entry.target.id); }), { rootMargin: '-35% 0px -55% 0px' });
    navItems.forEach(({ id }) => { const element = document.getElementById(id); if (element) observer.observe(element); });
    return () => observer.disconnect();
  }, []);

  const send = () => {
    if (isSending) return;
    if (!message.trim()) setMessage('Meet me where the signal bends.');
    setIsSending(true);
    setSent(false);
    setCurrentStage(0);
    timerRef.current = window.setTimeout(() => { setIsSending(false); setSent(true); scrollToSection('journey'); }, 1200);
  };
  const replay = () => { setCurrentStage(0); setSent(true); };

  return (
    <div className="noise min-h-[100dvh] overflow-x-hidden">
      <Header activeId={activeId} onMenu={() => setMenuOpen(true)} />
      <MobileMenu open={menuOpen} close={() => setMenuOpen(false)} />
      <main>
        <Hero message={message} setMessage={setMessage} send={send} isSending={isSending} sent={sent} />
        <Journey sent={sent} currentStage={currentStage} replay={replay} />
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