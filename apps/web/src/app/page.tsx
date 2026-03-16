'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef, useCallback } from 'react'

const HomePage = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [scrollY, setScrollY] = useState(0)
  const [countersTriggered, setCountersTriggered] = useState(false)
  const [counters, setCounters] = useState([0, 0, 0, 0])
  const statsRef = useRef<HTMLDivElement>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [headerScrolled, setHeaderScrolled] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [previewTemplate, setPreviewTemplate] = useState<number | null>(null)

  // Hero mockup tabs data
  const mockupTabs = [
    {
      label: 'Homepage',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      image: 'https://images.unsplash.com/photo-1604881991720-f91add269bed?w=1200&q=80',
      url: 'babystyle.co/store',
      overlay: (
        <div className="absolute inset-0 flex flex-col">
          <div className="h-10 bg-white/95 backdrop-blur flex items-center px-4 justify-between border-b border-gray-100">
            <span className="text-xs font-bold text-gray-800">BabyStyle</span>
            <div className="hidden md:flex items-center gap-3 text-[9px] font-medium text-gray-500">
              <span>Home</span><span>Shop</span><span>Collections</span><span>Sale</span>
              <span className="rounded-full bg-pink-500 px-2.5 py-0.5 text-white">Cart (3)</span>
            </div>
          </div>
          <div className="flex-1 relative">
            <div className="absolute bottom-6 left-6 max-w-sm">
              <div className="text-[10px] font-medium text-pink-400 mb-1">NEW COLLECTION 2026</div>
              <h3 className="text-xl font-bold text-white mb-1 drop-shadow-lg">Cozy Pajamas for Little Ones</h3>
              <p className="text-[11px] text-white/80 mb-3">Soft organic cotton. Sizes 0-8. Free shipping on orders over $50.</p>
              <div className="flex gap-2">
                <span className="rounded-full bg-pink-500 px-3 py-1.5 text-[10px] font-semibold text-white">Shop Now</span>
                <span className="rounded-full bg-white/20 backdrop-blur px-3 py-1.5 text-[10px] font-semibold text-white">View Catalog</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      label: 'CRM',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80',
      url: 'babystyle.co/crm',
      overlay: (
        <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-white">Lead Management</span>
            <span className="text-[9px] bg-success/20 text-success px-2 py-0.5 rounded-full">142 active leads</span>
          </div>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[{ n: 'New Leads', v: '38', c: 'text-blue-400' }, { n: 'Contacted', v: '52', c: 'text-yellow-400' }, { n: 'Converted', v: '28', c: 'text-green-400' }, { n: 'Revenue', v: '$12.4K', c: 'text-purple-400' }].map(s => (
              <div key={s.n} className="bg-white/5 rounded-lg p-2 text-center">
                <div className={`text-sm font-bold ${s.c}`}>{s.v}</div>
                <div className="text-[8px] text-gray-400">{s.n}</div>
              </div>
            ))}
          </div>
          <div className="flex-1 bg-white/5 rounded-lg p-2 overflow-hidden">
            <div className="text-[9px] font-semibold text-gray-300 mb-2">Recent Leads</div>
            {[
              { name: 'Sarah M.', email: 'sarah@gmail.com', status: 'Hot', statusColor: 'bg-red-500', product: 'Pajama Set x2' },
              { name: 'David K.', email: 'david.k@mail.com', status: 'Warm', statusColor: 'bg-yellow-500', product: 'Winter Bundle' },
              { name: 'Maya L.', email: 'maya@outlook.com', status: 'New', statusColor: 'bg-blue-500', product: 'Onesie Pack' },
              { name: 'Dan R.', email: 'dan.r@company.io', status: 'Hot', statusColor: 'bg-red-500', product: 'Gift Set Premium' },
            ].map((lead, i) => (
              <div key={i} className="flex items-center gap-2 py-1.5 border-b border-white/5 last:border-0">
                <div className="h-5 w-5 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-[7px] font-bold text-white">{lead.name[0]}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[9px] font-medium text-white truncate">{lead.name}</div>
                  <div className="text-[7px] text-gray-400 truncate">{lead.product}</div>
                </div>
                <span className={`${lead.statusColor} text-[7px] text-white px-1.5 py-0.5 rounded-full font-medium`}>{lead.status}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      label: 'AI Agent',
      icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
      image: 'https://images.unsplash.com/photo-1604881991720-f91add269bed?w=1200&q=80',
      url: 'babystyle.co/chat',
      overlay: (
        <div className="absolute inset-0 bg-gray-900/85 backdrop-blur-sm flex">
          <div className="flex-1 p-3 flex flex-col">
            <div className="text-[10px] text-gray-400 mb-2">Customer browsing: Pajamas &gt; Size 6</div>
            <div className="flex-1 space-y-2 overflow-hidden">
              <div className="flex gap-2">
                <div className="h-6 w-6 rounded-full bg-pink-500/20 flex items-center justify-center shrink-0"><span className="text-[8px] text-pink-400">C</span></div>
                <div className="bg-white/10 rounded-xl rounded-tl-sm px-3 py-2 text-[10px] text-gray-200 max-w-[75%]">Hi! I&apos;m looking for size 6 short pajamas for my daughter. Do you have any in pink?</div>
              </div>
              <div className="flex gap-2 justify-end">
                <div className="bg-primary/20 rounded-xl rounded-tr-sm px-3 py-2 text-[10px] text-primary max-w-[75%]">Hi! Yes, we have 3 options in size 6 short pajamas in pink! Here are the best sellers:</div>
              </div>
              <div className="flex gap-2 justify-end">
                <div className="bg-white/5 rounded-xl px-3 py-2 max-w-[80%]">
                  <div className="grid grid-cols-3 gap-1.5">
                    {['Butterfly Dream', 'Unicorn Magic', 'Flower Garden'].map(n => (
                      <div key={n} className="text-center">
                        <div className="h-10 rounded bg-pink-500/10 mb-1 flex items-center justify-center"><span className="text-[14px]">👗</span></div>
                        <div className="text-[7px] text-gray-300 font-medium">{n}</div>
                        <div className="text-[8px] text-pink-400 font-bold">$24.99</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-6 w-6 rounded-full bg-pink-500/20 flex items-center justify-center shrink-0"><span className="text-[8px] text-pink-400">C</span></div>
                <div className="bg-white/10 rounded-xl rounded-tl-sm px-3 py-2 text-[10px] text-gray-200 max-w-[75%]">I love the Butterfly Dream! Can I add it to my cart?</div>
              </div>
              <div className="flex gap-2 justify-end">
                <div className="bg-primary/20 rounded-xl rounded-tr-sm px-3 py-2 text-[10px] text-primary max-w-[75%]">Added to cart! Would you like to continue shopping or checkout? I can also suggest matching accessories.</div>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 border border-white/10">
              <span className="text-[10px] text-gray-400 flex-1">Type a message...</span>
              <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center"><svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg></div>
            </div>
          </div>
        </div>
      ),
    },
    {
      label: 'AI SEO',
      icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80',
      url: 'babystyle.co/seo',
      overlay: (
        <div className="absolute inset-0 bg-gray-900/85 backdrop-blur-sm p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-white">AI Search Optimization</span>
            <span className="text-[9px] bg-success/20 text-success px-2 py-0.5 rounded-full">Score: 94/100</span>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[{ engine: 'Google AI', score: 96, color: 'text-blue-400' }, { engine: 'ChatGPT', score: 92, color: 'text-green-400' }, { engine: 'Perplexity', score: 94, color: 'text-purple-400' }].map(e => (
              <div key={e.engine} className="bg-white/5 rounded-lg p-2 text-center">
                <div className={`text-lg font-bold ${e.color}`}>{e.score}</div>
                <div className="text-[8px] text-gray-400">{e.engine}</div>
                <div className="mt-1 h-1 rounded-full bg-white/10 overflow-hidden"><div className={`h-full rounded-full bg-gradient-to-r from-primary to-secondary`} style={{width: `${e.score}%`}} /></div>
              </div>
            ))}
          </div>
          <div className="flex-1 bg-white/5 rounded-lg p-3 space-y-2 overflow-hidden">
            <div className="text-[9px] font-semibold text-gray-300 mb-1">AI Optimization Checklist</div>
            {[
              { task: 'Schema.org structured data', done: true },
              { task: 'AI-friendly content structure', done: true },
              { task: 'FAQ markup for AI snippets', done: true },
              { task: 'Entity-based keyword mapping', done: true },
              { task: 'Conversational content format', done: false },
              { task: 'Multi-language hreflang tags', done: false },
            ].map((t, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`h-3.5 w-3.5 rounded-full flex items-center justify-center ${t.done ? 'bg-success/20' : 'bg-white/10'}`}>
                  {t.done ? <svg className="h-2 w-2 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> : <div className="h-1.5 w-1.5 rounded-full bg-gray-500" />}
                </div>
                <span className={`text-[9px] ${t.done ? 'text-gray-300' : 'text-gray-500'}`}>{t.task}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      label: 'Analytics',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80',
      url: 'babystyle.co/analytics',
      overlay: (
        <div className="absolute inset-0 bg-gray-900/85 backdrop-blur-sm p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-white">AI Analytics Dashboard</span>
            <span className="text-[9px] bg-primary/20 text-primary px-2 py-0.5 rounded-full">AI-Powered</span>
          </div>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[{ n: 'Visitors', v: '24.8K', d: '+18%', c: 'text-blue-400' }, { n: 'Conversions', v: '1,247', d: '+24%', c: 'text-green-400' }, { n: 'Revenue', v: '$48.2K', d: '+31%', c: 'text-purple-400' }, { n: 'Avg. Order', v: '$38.6', d: '+7%', c: 'text-pink-400' }].map(s => (
              <div key={s.n} className="bg-white/5 rounded-lg p-2 text-center">
                <div className={`text-sm font-bold ${s.c}`}>{s.v}</div>
                <div className="text-[7px] text-gray-400">{s.n}</div>
                <div className="text-[7px] text-success font-medium">{s.d}</div>
              </div>
            ))}
          </div>
          <div className="flex-1 bg-white/5 rounded-lg p-3 overflow-hidden">
            <div className="text-[9px] font-semibold text-gray-300 mb-2">AI Prompt: &quot;Show me conversion trends&quot;</div>
            <div className="flex items-end gap-1 h-20">
              {[35, 42, 38, 55, 48, 62, 58, 72, 68, 78, 85, 92].map((h, i) => (
                <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-primary to-secondary" style={{ height: `${h}%` }} />
              ))}
            </div>
            <div className="flex justify-between mt-1 text-[7px] text-gray-500">
              <span>Jan</span><span>Mar</span><span>Jun</span><span>Sep</span><span>Dec</span>
            </div>
          </div>
        </div>
      ),
    },
  ]

  // Theme toggle with persistence
  useEffect(() => {
    const saved = localStorage.getItem('ubuilder-theme') as 'dark' | 'light' | null
    const initial = saved || 'dark'
    setTheme(initial)
    document.documentElement.setAttribute('data-theme', initial)
  }, [])

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('ubuilder-theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }, [theme])

  // Scroll tracking for parallax + header
  useEffect(() => {
    const onScroll = () => {
      setScrollY(window.scrollY)
      setHeaderScrolled(window.scrollY > 60)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // IntersectionObserver for scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    )
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  // Animated counters
  const counterTargets = [50000, 4.9, 12, 99.9]
  const counterLabels = ['Sites Built', 'Rating', 'Languages', 'Uptime']
  const counterSuffixes = ['+', '\u2605', '', '%']

  useEffect(() => {
    if (!statsRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !countersTriggered) {
          setCountersTriggered(true)
          counterTargets.forEach((target, i) => {
            const duration = 2000
            const steps = 60
            const increment = target / steps
            let current = 0
            const interval = setInterval(() => {
              current += increment
              if (current >= target) {
                current = target
                clearInterval(interval)
              }
              setCounters((prev) => {
                const next = [...prev]
                next[i] = current
                return next
              })
            }, duration / steps)
          })
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(statsRef.current)
    return () => observer.disconnect()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countersTriggered])

  const formatCounter = (val: number, i: number) => {
    if (i === 0) return Math.floor(val).toLocaleString() + counterSuffixes[i]
    if (i === 1) return val.toFixed(1) + counterSuffixes[i]
    if (i === 2) return Math.floor(val).toString()
    return val.toFixed(1) + counterSuffixes[i]
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg transition-colors duration-500">
      <style>{`
        /* ===== SCROLL REVEAL SYSTEM ===== */
        .reveal {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal.revealed { opacity: 1; transform: translateY(0); }
        .reveal.from-left { transform: translateX(-60px) translateY(0); }
        .reveal.from-left.revealed { transform: translateX(0) translateY(0); }
        .reveal.from-right { transform: translateX(60px) translateY(0); }
        .reveal.from-right.revealed { transform: translateX(0) translateY(0); }
        .reveal.scale-in { transform: scale(0.85); }
        .reveal.scale-in.revealed { transform: scale(1); }
        .reveal-delay-1 { transition-delay: 0.1s; }
        .reveal-delay-2 { transition-delay: 0.2s; }
        .reveal-delay-3 { transition-delay: 0.3s; }
        .reveal-delay-4 { transition-delay: 0.4s; }
        .reveal-delay-5 { transition-delay: 0.5s; }
        .reveal-delay-6 { transition-delay: 0.6s; }
        .reveal-delay-7 { transition-delay: 0.7s; }

        /* ===== KEYFRAMES ===== */
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(1deg); }
          66% { transform: translateY(10px) rotate(-1deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-30px); }
        }
        @keyframes glow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes glow-border {
          0%, 100% { box-shadow: 0 0 20px rgba(124, 58, 237, 0.3); }
          50% { box-shadow: 0 0 40px rgba(124, 58, 237, 0.6), 0 0 60px rgba(6, 182, 212, 0.2); }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes score-fill {
          from { stroke-dashoffset: 251; }
          to { stroke-dashoffset: 62; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes typing-cursor {
          0%, 100% { border-color: transparent; }
          50% { border-color: #7C3AED; }
        }
        @keyframes slide-in-demo {
          0% { opacity: 0; transform: translateY(20px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes progress-fill {
          0% { width: 0%; }
          60% { width: 75%; }
          100% { width: 100%; }
        }
        @keyframes morph-blob {
          0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          25% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
          50% { border-radius: 50% 60% 30% 60% / 40% 70% 50% 60%; }
          75% { border-radius: 60% 30% 50% 40% / 70% 40% 60% 30%; }
        }

        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-float-delay { animation: float 6s ease-in-out 2s infinite; }
        .animate-glow { animation: glow 3s ease-in-out infinite; }
        .animate-glow-border { animation: glow-border 3s ease-in-out infinite; }
        .animate-marquee { animation: marquee 30s linear infinite; }
        .animate-shimmer { animation: shimmer 3s linear infinite; background-size: 200% 100%; }
        .animate-pulse-ring { animation: pulse-ring 2s ease-out infinite; }
        .animate-score { animation: score-fill 2s ease-out forwards; }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .animate-gradient { animation: gradient-shift 6s ease infinite; background-size: 200% 200%; }
        .animate-morph { animation: morph-blob 8s ease-in-out infinite; }
        .animate-typing-cursor { border-right: 2px solid; animation: typing-cursor 1s step-end infinite; }

        /* ===== HOVER EFFECTS ===== */
        .hover-lift { transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s ease; }
        .hover-lift:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(124, 58, 237, 0.15); }
        .hover-glow:hover { box-shadow: 0 0 30px rgba(124, 58, 237, 0.2), 0 0 60px rgba(124, 58, 237, 0.1); }
        .hover-scale { transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .hover-scale:hover { transform: scale(1.03); }

        /* ===== MISC ===== */
        details summary::-webkit-details-marker { display: none; }
        details summary::marker { display: none; content: ''; }
        details[open] summary .faq-chevron { transform: rotate(180deg); }
        details[open] .faq-content { animation: slide-in-demo 0.3s ease-out; }

        /* ===== DEMO ANIMATION ===== */
        .demo-screen { animation: slide-in-demo 0.8s ease-out forwards; }
        .demo-progress { animation: progress-fill 3s ease-out forwards; }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .reveal { opacity: 1; transform: none; transition: none; }
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      {/* ===== 1. NAVIGATION ===== */}
      <header className={`sticky top-0 z-50 border-b transition-all duration-500 ${headerScrolled ? 'border-border bg-bg/80 backdrop-blur-2xl shadow-lg shadow-black/5' : 'border-white/5 bg-bg/60 backdrop-blur-2xl'}`}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/25">
              <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" />
              </svg>
            </div>
            <span className="text-xl font-extrabold text-text tracking-tight">UBuilder</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-text-muted">
            <a href="#features" className="hover:text-text transition-colors duration-200">Features</a>
            <a href="#how-it-works" className="hover:text-text transition-colors duration-200">How It Works</a>
            <a href="#demo" className="hover:text-text transition-colors duration-200">Demo</a>
            <a href="#pricing" className="hover:text-text transition-colors duration-200">Pricing</a>
          </nav>
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-bg-secondary hover:bg-bg-tertiary transition-all duration-300 hover:border-primary/30"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg className="h-4 w-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              ) : (
                <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              )}
            </button>
            <Link
              href="/login"
              className="hidden sm:inline-flex text-sm font-medium text-text-secondary hover:text-text transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-gradient-to-r from-primary to-primary-hover px-5 py-2.5 text-sm font-semibold text-white hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:scale-105"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* ===== 2. HERO SECTION ===== */}
      <section className="relative overflow-hidden min-h-screen flex flex-col justify-center">
        {/* Animated gradient orbs with parallax */}
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 h-[700px] w-[900px] rounded-full bg-primary/20 blur-[150px] animate-glow" style={{ transform: `translate(-50%, ${scrollY * 0.1}px)` }} />
        <div className="absolute top-[100px] left-[10%] h-[400px] w-[400px] rounded-full bg-secondary/15 blur-[120px] animate-float-slow" style={{ transform: `translateY(${scrollY * -0.08}px)` }} />
        <div className="absolute top-[200px] right-[10%] h-[350px] w-[350px] rounded-full bg-primary/10 blur-[100px] animate-float-delay" style={{ transform: `translateY(${scrollY * 0.06}px)` }} />
        <div className="absolute bottom-[100px] left-[30%] h-[250px] w-[250px] rounded-full bg-accent/8 blur-[80px] animate-morph" />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'linear-gradient(rgba(124,58,237,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.3) 1px, transparent 1px)', backgroundSize: '60px 60px'}} />

        <div className="relative mx-auto max-w-7xl px-6 pt-16 pb-12 md:pt-20 md:pb-16 text-center">
          {/* Badge */}
          <div className="reveal inline-flex items-center gap-2.5 rounded-full border border-primary/30 bg-primary/10 px-5 py-2 text-sm font-medium text-primary mb-10 animate-glow-border">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-primary animate-pulse-ring" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            The #1 AI Website Builder
          </div>

          {/* Heading */}
          <h1 className="reveal reveal-delay-1 text-5xl font-extrabold tracking-tight md:text-7xl lg:text-8xl max-w-5xl mx-auto leading-[1.05]">
            <span className="text-text">Build Websites That </span>
            <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer">
              Blow Minds
            </span>
            <span className="text-text"> — With AI</span>
          </h1>

          {/* Subheading */}
          <p className="reveal reveal-delay-2 mt-8 text-lg text-text-secondary max-w-2xl mx-auto md:text-xl leading-relaxed">
            Describe your vision in plain text. Our AI generates a complete, multi-page website with stunning design,
            real images, and SEO optimization — in under 60 seconds.
          </p>

          {/* CTAs */}
          <div className="reveal reveal-delay-3 mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="group relative rounded-full bg-gradient-to-r from-primary via-purple-500 to-secondary px-10 py-4 text-base font-semibold text-white shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Building Free
                <svg className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
              </span>
            </Link>
            <a
              href="#demo"
              className="flex items-center gap-3 rounded-full border border-border hover:border-primary/40 px-8 py-4 text-base font-semibold text-text-secondary hover:text-text hover:bg-primary/5 transition-all duration-300"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                <svg className="h-3.5 w-3.5 text-primary ms-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              </span>
              Watch Demo
            </a>
          </div>

          {/* Animated Stats Row */}
          <div ref={statsRef} className="reveal reveal-delay-4 mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm">
            {counterTargets.map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xl font-bold text-text tabular-nums">{formatCounter(counters[i], i)}</span>
                <span className="text-text-muted">{counterLabels[i]}</span>
                {i < 3 && <span className="hidden sm:block ms-8 h-5 w-px bg-border" />}
              </div>
            ))}
          </div>

          {/* Interactive Platform Mockup */}
          <div className="reveal reveal-delay-5 mt-16 rounded-2xl border border-border/60 bg-bg-secondary/80 shadow-2xl shadow-primary/10 overflow-hidden max-w-6xl mx-auto backdrop-blur-sm hover-glow transition-all duration-700" style={{ transform: `translateY(${scrollY * -0.03}px)` }}>
            {/* Browser chrome */}
            <div className="flex items-center gap-2 border-b border-border px-4 py-3 bg-bg/60">
              <div className="h-3 w-3 rounded-full bg-[#FF5F57]" />
              <div className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
              <div className="h-3 w-3 rounded-full bg-[#28C840]" />
              <div className="ms-4 flex-1 max-w-md">
                <div className="rounded-md bg-bg-tertiary/80 px-3 py-1.5 text-xs text-text-muted text-start">
                  {mockupTabs[activeTab].url}
                </div>
              </div>
            </div>
            <div className="flex h-80 md:h-[420px] lg:h-[480px]">
              {/* Left sidebar — interactive tabs */}
              <div className="w-14 md:w-48 border-e border-border bg-bg flex flex-col">
                <div className="p-2 md:p-3 space-y-1 flex-1">
                  <div className="hidden md:block text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-3 px-2">Platform</div>
                  {mockupTabs.map((tab, i) => (
                    <button
                      key={tab.label}
                      onClick={() => setActiveTab(i)}
                      className={`w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-all duration-300 cursor-pointer ${i === activeTab ? 'bg-primary/15 text-primary shadow-sm' : 'text-text-muted hover:bg-bg-tertiary hover:text-text-secondary'}`}
                    >
                      <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} /></svg>
                      <span className="hidden md:inline text-start">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              {/* Main canvas — changes based on active tab */}
              <div className="flex-1 bg-bg-tertiary/30 relative overflow-hidden">
                <Image
                  src={mockupTabs[activeTab].image}
                  alt={`${mockupTabs[activeTab].label} preview`}
                  fill
                  className="object-cover object-center opacity-40 transition-opacity duration-500"
                  sizes="(max-width: 768px) 100vw, 70vw"
                />
                {mockupTabs[activeTab].overlay}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 3. TRUSTED BY ===== */}
      <section className="border-y border-border bg-bg-secondary/50 py-10 overflow-hidden">
        <p className="text-center text-sm font-medium text-text-muted mb-8">
          Trusted by <span className="text-text">10,000+</span> businesses worldwide
        </p>
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-bg-secondary/50 to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-bg-secondary/50 to-transparent z-10" />
          <div className="flex animate-marquee whitespace-nowrap">
            {[...Array(2)].map((_, setIdx) => (
              <div key={setIdx} className="flex items-center gap-16 px-8">
                {['TechCorp', 'DesignHub', 'StartupX', 'MediaFlow', 'CloudBase', 'DataSync', 'AppForge', 'PixelLab', 'NovaTech', 'BuildRight'].map((name) => (
                  <span key={`${setIdx}-${name}`} className="text-xl font-bold text-text-muted/30 tracking-wider whitespace-nowrap">
                    {name}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 4. FEATURES SECTION ===== */}
      <section id="features" className="relative bg-bg py-24 md:py-32">
        <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[120px]" style={{ transform: `translateY(${scrollY * 0.05}px)` }} />
        <div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-secondary/5 blur-[100px]" style={{ transform: `translateY(${scrollY * -0.04}px)` }} />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="text-center mb-20 reveal">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary uppercase tracking-wider mb-4">
              Features
            </span>
            <h2 className="mt-4 text-4xl font-extrabold md:text-5xl lg:text-6xl text-text">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Build & Grow</span>
            </h2>
            <p className="mt-6 text-text-secondary max-w-2xl mx-auto text-lg leading-relaxed">
              From AI generation to visual editing to search optimization — one platform for your entire web presence.
            </p>
          </div>

          {/* Feature 1: AI-Powered — Full width */}
          <div className="reveal rounded-3xl border border-border bg-bg-secondary/50 p-8 md:p-12 mb-6 overflow-hidden group hover:border-primary/20 transition-all duration-500 hover-lift">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-4">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5.002 5.002 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                  AI-Powered
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-text mb-4">
                  Describe It. <span className="text-primary">AI Builds It.</span>
                </h3>
                <p className="text-text-secondary text-lg leading-relaxed mb-6">
                  Type a description of your website in plain text. Our AI creates everything — layout, content, images, and code.
                  Multi-page sites generated in under 60 seconds.
                </p>
                <div className="flex flex-wrap gap-3">
                  {['Multi-page sites', 'SEO-optimized', 'Real content', 'Custom images'].map((tag) => (
                    <span key={tag} className="rounded-full bg-bg-tertiary px-3 py-1 text-xs font-medium text-text-muted">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="rounded-2xl border border-border bg-bg p-6 space-y-4">
                  <div className="rounded-xl bg-bg-tertiary p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
                        <svg className="h-3 w-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </div>
                      <span className="text-[11px] font-semibold text-text-muted">Your Prompt</span>
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      &quot;Build a modern coffee shop website with an online menu, reservation system, warm earthy tones, and hero image of latte art&quot;
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-b from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
                      <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                    </div>
                  </div>
                  <div className="rounded-xl border border-border overflow-hidden">
                    <div className="flex items-center gap-1.5 bg-bg-tertiary px-3 py-1.5">
                      <div className="h-2 w-2 rounded-full bg-[#FF5F57]" />
                      <div className="h-2 w-2 rounded-full bg-[#FEBC2E]" />
                      <div className="h-2 w-2 rounded-full bg-[#28C840]" />
                      <span className="ms-2 text-[9px] text-text-muted">cafebloom.ubuilder.co</span>
                    </div>
                    <div className="relative h-44">
                      <Image
                        src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80"
                        alt="AI generated coffee shop website"
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-bg/80 to-transparent" />
                      <div className="absolute bottom-3 left-3">
                        <div className="text-xs font-bold text-text">Cafe Bloom</div>
                        <div className="text-[10px] text-text-muted">Your cozy neighborhood cafe</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features 2 & 3 */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="reveal from-left rounded-3xl border border-border bg-bg-secondary/50 p-8 group hover:border-primary/20 transition-all duration-500 hover-lift">
              <div className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary mb-4">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Visual Editor
              </div>
              <h3 className="text-2xl font-bold text-text mb-3">Click to Edit. Chat to Change.</h3>
              <p className="text-text-secondary text-sm leading-relaxed mb-6">
                Click any element to edit visually. Or tell the AI what to change. Real-time preview with instant updates.
              </p>
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80"
                    alt="Visual editor with code"
                    fill
                    className="object-cover opacity-50 group-hover:opacity-70 transition-opacity duration-500"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg to-transparent" />
                  <div className="absolute top-4 right-4 rounded-lg bg-bg/90 backdrop-blur-sm border border-border px-2 py-1.5 flex items-center gap-2">
                    <div className="h-3 w-3 rounded bg-primary" />
                    <div className="h-3 w-3 rounded bg-secondary" />
                    <div className="h-3 w-3 rounded bg-accent" />
                    <div className="h-3 w-px bg-border" />
                    <span className="text-[9px] text-text-muted font-medium">Aa</span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-bg/90 backdrop-blur-sm border border-primary/30 px-3 py-2 flex items-center gap-2">
                    <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" /></svg>
                    <span className="text-[10px] text-text-muted animate-typing-cursor">&quot;Make this heading larger and bolder&quot;</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="reveal from-right rounded-3xl border border-border bg-bg-secondary/50 p-8 group hover:border-primary/20 transition-all duration-500 hover-lift">
              <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent mb-4">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                AI Images
              </div>
              <h3 className="text-2xl font-bold text-text mb-3">Generate Stunning Visuals</h3>
              <p className="text-text-secondary text-sm leading-relaxed mb-6">
                Generate images, icons, backgrounds, and logos. Every visual element is customizable and on-brand.
              </p>
              <div className="grid grid-cols-3 gap-2 rounded-xl overflow-hidden">
                {[
                  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&q=80',
                  'https://images.unsplash.com/photo-1634017839464-5c339afa60f0?w=300&q=80',
                  'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=300&q=80',
                ].map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden group/img">
                    <Image src={src} alt={`AI generated visual ${i + 1}`} fill className="object-cover group-hover/img:scale-110 transition-transform duration-700" sizes="150px" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Features 4 & 5 */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="reveal from-left reveal-delay-1 rounded-3xl border border-border bg-bg-secondary/50 p-8 group hover:border-primary/20 transition-all duration-500 hover-lift">
              <div className="inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success mb-4">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                Scanner
              </div>
              <h3 className="text-2xl font-bold text-text mb-3">Scan & Clone Any Website</h3>
              <p className="text-text-secondary text-sm leading-relaxed mb-6">
                Paste any URL. Our AI analyzes the design DNA — colors, fonts, layout — and creates an improved version.
              </p>
              <div className="rounded-xl bg-bg p-4 border border-border space-y-4">
                <div className="flex items-center gap-2 rounded-lg bg-bg-tertiary px-3 py-2.5 border border-border">
                  <svg className="h-4 w-4 text-text-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.507a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.757 8.257" /></svg>
                  <span className="text-xs text-text-muted">https://competitor-site.com</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {['Colors', 'Fonts', 'Layout', 'Content'].map((item, i) => (
                    <div key={item} className="text-center">
                      <div className={`h-8 w-8 mx-auto rounded-lg flex items-center justify-center mb-1 ${i === 0 ? 'bg-primary/20' : i === 1 ? 'bg-secondary/20' : i === 2 ? 'bg-accent/20' : 'bg-success/20'}`}>
                        <svg className={`h-4 w-4 ${i === 0 ? 'text-primary' : i === 1 ? 'text-secondary' : i === 2 ? 'text-accent' : 'text-success'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <span className="text-[9px] text-text-muted">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-success font-medium">
                  <div className="h-1.5 w-1.5 rounded-full bg-success" />
                  DNA extraction complete — ready to improve
                </div>
              </div>
            </div>

            <div className="reveal from-right reveal-delay-1 rounded-3xl border border-border bg-bg-secondary/50 p-8 group hover:border-primary/20 transition-all duration-500 hover-lift">
              <div className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary mb-4">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                GSO
              </div>
              <h3 className="text-2xl font-bold text-text mb-3">Generative Search Optimization</h3>
              <p className="text-text-secondary text-sm leading-relaxed mb-6">
                Not just SEO. Optimize for ChatGPT, Google AI Overviews, Perplexity, and all AI search engines.
              </p>
              <div className="rounded-xl bg-bg p-6 border border-border flex items-center justify-center">
                <div className="text-center">
                  <div className="relative inline-block">
                    <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="6" className="text-bg-tertiary" />
                      <circle cx="50" cy="50" r="40" fill="none" strokeWidth="6" strokeLinecap="round" strokeDasharray="251" strokeDashoffset="62" className="text-success animate-score" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-2xl font-bold text-text">92</span>
                      <span className="text-[9px] text-text-muted">GSO Score</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-center gap-4 text-[10px]">
                    <span className="flex items-center gap-1 text-success"><span className="h-1.5 w-1.5 rounded-full bg-success" />SEO: 95</span>
                    <span className="flex items-center gap-1 text-secondary"><span className="h-1.5 w-1.5 rounded-full bg-secondary" />AI: 89</span>
                    <span className="flex items-center gap-1 text-primary"><span className="h-1.5 w-1.5 rounded-full bg-primary" />Schema: 92</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features 6, 7, 8 */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                badge: 'i18n', badgeColor: 'bg-primary/10 text-primary',
                icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
                title: '12+ Languages & RTL',
                desc: 'Full RTL support. Hebrew, Arabic, English, and more. One click to translate your entire site.',
                visual: (
                  <div className="flex flex-wrap gap-2">
                    {['EN', 'HE', 'AR', 'FR', 'DE', 'ES', 'RU', 'ZH'].map((lang) => (
                      <span key={lang} className="rounded-md bg-bg-tertiary px-2 py-1 text-[10px] font-bold text-text-muted hover:bg-primary/10 hover:text-primary transition-colors cursor-default">
                        {lang}
                      </span>
                    ))}
                  </div>
                ),
              },
              {
                badge: 'AI Agent', badgeColor: 'bg-accent/10 text-accent',
                icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
                title: 'Built-in CRM & AI Chat',
                desc: 'AI chatbot for your visitors. Collect leads, book appointments, answer questions — 24/7.',
                visual: (
                  <div className="rounded-xl bg-bg p-3 border border-border space-y-2">
                    <div className="flex gap-2">
                      <div className="h-5 w-5 rounded-full bg-accent/20 shrink-0 flex items-center justify-center">
                        <span className="text-[8px]">?</span>
                      </div>
                      <div className="rounded-lg bg-bg-tertiary px-2.5 py-1.5 text-[10px] text-text-secondary">
                        Do you offer free delivery?
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <div className="rounded-lg bg-primary/10 px-2.5 py-1.5 text-[10px] text-primary max-w-[80%]">
                        Yes! Free delivery on orders over $50. Would you like to browse our menu?
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                badge: 'Commerce', badgeColor: 'bg-success/10 text-success',
                icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z',
                title: 'E-commerce & Payments',
                desc: 'Built-in online store. Accept payments with Stripe & PayPlus. No extra plugins needed.',
                visual: (
                  <div className="rounded-xl border border-border overflow-hidden">
                    <div className="relative h-28">
                      <Image src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&q=80" alt="E-commerce store" fill className="object-cover" sizes="300px" />
                    </div>
                    <div className="bg-bg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-semibold text-text">Premium Bundle</div>
                          <div className="text-sm font-bold text-primary">$49.99</div>
                        </div>
                        <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                          <svg className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
                        </div>
                      </div>
                    </div>
                  </div>
                ),
              },
            ].map((feat, i) => (
              <div key={feat.title} className={`reveal reveal-delay-${i + 1} rounded-3xl border border-border bg-bg-secondary/50 p-8 group hover:border-primary/20 transition-all duration-500 hover-lift`}>
                <div className={`inline-flex items-center gap-2 rounded-full ${feat.badgeColor} px-3 py-1 text-xs font-semibold mb-4`}>
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={feat.icon} /></svg>
                  {feat.badge}
                </div>
                <h3 className="text-xl font-bold text-text mb-3">{feat.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed mb-4">{feat.desc}</p>
                {feat.visual}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 4B. SMART MANAGEMENT & AI ANALYTICS ===== */}
      <section className="relative border-t border-border bg-bg-secondary py-24 md:py-32">
        <div className="absolute top-[20%] right-[5%] h-[300px] w-[300px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[10%] left-[10%] h-[250px] w-[250px] rounded-full bg-secondary/5 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="text-center mb-20 reveal">
            <span className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/5 px-4 py-1.5 text-xs font-semibold text-secondary uppercase tracking-wider mb-4">
              Built-in Management
            </span>
            <h2 className="mt-4 text-4xl font-extrabold md:text-5xl lg:text-6xl text-text">
              Not Just a Website — A Complete{' '}
              <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">Business Platform</span>
            </h2>
            <p className="mt-6 text-text-secondary max-w-2xl mx-auto text-lg leading-relaxed">
              Every website comes with a built-in smart management system, CRM, analytics, and AI agent — all customizable via AI prompts.
            </p>
          </div>

          {/* Smart Management System — Full width */}
          <div className="reveal rounded-3xl border border-border bg-bg p-8 md:p-12 mb-6 overflow-hidden group hover:border-secondary/20 transition-all duration-500 hover-lift">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary mb-4">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
                  Smart Management
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-text mb-4">
                  Your Business. <span className="text-secondary">Fully Managed.</span>
                </h3>
                <p className="text-text-secondary text-lg leading-relaxed mb-6">
                  A complete management dashboard included with every site. Leads, invoices, direct marketing, inventory, orders — all in one place. Tell the AI to customize it to your needs.
                </p>
                <div className="flex flex-wrap gap-3">
                  {['Lead Management', 'Invoicing', 'Direct Marketing', 'Inventory', 'Orders', 'AI Customizable'].map((tag) => (
                    <span key={tag} className="rounded-full bg-bg-tertiary px-3 py-1 text-xs font-medium text-text-muted">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              {/* CRM Visual */}
              <div className="rounded-2xl border border-border bg-bg-secondary overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <span className="text-xs font-bold text-text">BabyStyle — Management Hub</span>
                  <span className="text-[9px] bg-success/20 text-success px-2 py-0.5 rounded-full">All systems active</span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Active Leads', value: '142', icon: '👤', delta: '+12 today', color: 'text-blue-400' },
                      { label: 'Open Invoices', value: '$8.4K', icon: '📄', delta: '8 pending', color: 'text-amber-400' },
                      { label: 'Email Campaigns', value: '3 live', icon: '📧', delta: '67% open rate', color: 'text-green-400' },
                    ].map((card) => (
                      <div key={card.label} className="rounded-xl bg-bg p-3 border border-border">
                        <div className="text-lg mb-0.5">{card.icon}</div>
                        <div className={`text-sm font-bold ${card.color}`}>{card.value}</div>
                        <div className="text-[9px] text-text-muted">{card.label}</div>
                        <div className="text-[8px] text-success mt-1">{card.delta}</div>
                      </div>
                    ))}
                  </div>
                  {/* AI Prompt bar */}
                  <div className="rounded-xl bg-bg border border-primary/20 p-3 flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
                      <svg className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" /></svg>
                    </div>
                    <span className="text-[10px] text-text-muted flex-1 animate-typing-cursor">&quot;Add a loyalty points system to the CRM and create a VIP tier for orders over $200&quot;</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Analytics — Full width */}
          <div className="reveal rounded-3xl border border-border bg-bg p-8 md:p-12 overflow-hidden group hover:border-primary/20 transition-all duration-500 hover-lift">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div className="order-2 lg:order-1">
                <div className="rounded-2xl border border-border bg-bg-secondary overflow-hidden">
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <span className="text-xs font-bold text-text">AI Analytics</span>
                    <span className="text-[9px] bg-primary/20 text-primary px-2 py-0.5 rounded-full">Real-time</span>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: 'Visitors', value: '24.8K', delta: '+18%' },
                        { label: 'Sales', value: '$48.2K', delta: '+31%' },
                        { label: 'Conversion', value: '5.2%', delta: '+0.8%' },
                        { label: 'Bounce', value: '28%', delta: '-4%' },
                      ].map((m) => (
                        <div key={m.label} className="text-center rounded-lg bg-bg p-2 border border-border">
                          <div className="text-sm font-bold text-text">{m.value}</div>
                          <div className="text-[8px] text-text-muted">{m.label}</div>
                          <div className="text-[8px] text-success">{m.delta}</div>
                        </div>
                      ))}
                    </div>
                    {/* Chart bars */}
                    <div className="rounded-xl bg-bg p-3 border border-border">
                      <div className="text-[9px] text-text-muted mb-2">Revenue trend (last 12 months)</div>
                      <div className="flex items-end gap-1 h-16">
                        {[35, 42, 38, 55, 48, 62, 58, 72, 68, 78, 85, 92].map((h, i) => (
                          <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-primary/80 to-secondary/80 transition-all duration-300 hover:from-primary hover:to-secondary" style={{ height: `${h}%` }} />
                        ))}
                      </div>
                    </div>
                    {/* AI Prompt */}
                    <div className="rounded-xl bg-bg border border-primary/20 p-3 flex items-center gap-2">
                      <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
                        <svg className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" /></svg>
                      </div>
                      <span className="text-[10px] text-text-muted flex-1 animate-typing-cursor">&quot;Generate a visual report comparing Q1 vs Q2 sales by product category&quot;</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-4">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  AI Analytics
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-text mb-4">
                  Your Data. <span className="text-primary">AI-Powered Insights.</span>
                </h3>
                <p className="text-text-secondary text-lg leading-relaxed mb-6">
                  A complete analytics dashboard managed by AI. See all your site data, visitor behavior, conversion funnels, and revenue — then ask AI to generate custom visual reports with a simple prompt.
                </p>
                <div className="flex flex-wrap gap-3">
                  {['Real-time Analytics', 'AI Reports', 'Conversion Tracking', 'Revenue Insights', 'Custom Dashboards', 'Prompt-based'].map((tag) => (
                    <span key={tag} className="rounded-full bg-bg-tertiary px-3 py-1 text-xs font-medium text-text-muted">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 5. HOW IT WORKS ===== */}
      <section id="how-it-works" className="relative border-t border-border bg-bg-secondary py-24 md:py-32">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[150px]" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="text-center mb-20 reveal">
            <span className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/5 px-4 py-1.5 text-xs font-semibold text-secondary uppercase tracking-wider mb-4">
              How It Works
            </span>
            <h2 className="mt-4 text-4xl font-extrabold md:text-5xl lg:text-6xl text-text">
              Three Steps to{' '}
              <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">Your Website</span>
            </h2>
            <p className="mt-6 text-text-secondary max-w-xl mx-auto text-lg">
              From idea to published website in under 60 seconds. No coding, no templates — just AI.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                num: '1', title: 'Describe Your Vision', color: 'from-primary to-primary-hover', shadowColor: 'shadow-primary/20',
                desc: 'Type, speak, or upload an image. Describe any website you can imagine.',
                visual: (
                  <div className="rounded-xl bg-bg-tertiary p-4 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                      <svg className="h-4 w-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <svg className="h-4 w-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.507a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.757 8.257" /></svg>
                    </div>
                    <div className="h-px bg-border mb-2" />
                    <p className="text-[11px] text-text-muted">&quot;A modern SaaS landing page with pricing table, feature grid, and dark mode...&quot;</p>
                  </div>
                ),
              },
              {
                num: '2', title: 'AI Generates Everything', color: 'from-secondary to-primary', shadowColor: 'shadow-secondary/20',
                desc: 'Our AI creates pages, content, images, and optimized code in real-time.',
                visual: (
                  <div className="rounded-xl bg-bg-tertiary p-4 border border-border space-y-2">
                    {[
                      { name: 'index.html', status: 'Created', color: 'text-success' },
                      { name: 'styles.css', status: 'Generated', color: 'text-secondary' },
                      { name: 'hero-image.webp', status: 'AI Generated', color: 'text-primary' },
                      { name: 'schema.json', status: 'Optimized', color: 'text-accent' },
                    ].map((file) => (
                      <div key={file.name} className="flex items-center justify-between text-[11px]">
                        <span className="text-text-muted font-mono">{file.name}</span>
                        <span className={`${file.color} font-medium`}>{file.status}</span>
                      </div>
                    ))}
                    <div className="mt-2 h-1.5 rounded-full bg-bg overflow-hidden">
                      <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-primary to-secondary" />
                    </div>
                  </div>
                ),
              },
              {
                num: '3', title: 'Publish & Go Live', color: 'from-success to-secondary', shadowColor: 'shadow-success/20',
                desc: 'Publish instantly with a custom domain. Your site is live, fast, and SEO-ready.',
                visual: (
                  <div className="rounded-xl bg-bg-tertiary p-4 border border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-2 w-2 rounded-full bg-success" />
                      <span className="text-[11px] font-semibold text-success">Live</span>
                      <span className="text-[11px] text-text-muted ms-auto font-mono">yourdomain.com</span>
                    </div>
                    <div className="relative h-24 rounded-lg overflow-hidden">
                      <Image src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&q=80" alt="Published website" fill className="object-cover" sizes="300px" />
                      <div className="absolute inset-0 bg-gradient-to-t from-bg-tertiary/80 to-transparent" />
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-[10px] text-text-muted">
                      <span className="flex items-center gap-1"><span className="text-success">SSL</span></span>
                      <span className="flex items-center gap-1"><span className="text-secondary">CDN</span></span>
                      <span className="flex items-center gap-1"><span className="text-primary">SEO</span></span>
                    </div>
                  </div>
                ),
              },
            ].map((step, i) => (
              <div key={step.num} className={`reveal reveal-delay-${i + 1} relative group`}>
                <div className="rounded-2xl border border-border bg-bg p-8 hover:border-primary/30 transition-all duration-300 h-full hover-lift">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} text-2xl font-extrabold text-white mb-6 shadow-lg ${step.shadowColor}`}>
                    {step.num}
                  </div>
                  <h3 className="text-xl font-bold text-text mb-3">{step.title}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed mb-6">{step.desc}</p>
                  {step.visual}
                </div>
                {i < 2 && <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-primary/50 to-transparent" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 6. LIVE DEMO SIMULATION ===== */}
      <section id="demo" className="relative border-t border-border bg-bg py-24 md:py-32 overflow-hidden">
        <div className="absolute top-[20%] left-[5%] h-[300px] w-[300px] rounded-full bg-primary/8 blur-[100px] animate-float" />
        <div className="absolute bottom-[10%] right-[10%] h-[250px] w-[250px] rounded-full bg-secondary/8 blur-[80px] animate-float-delay" />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="text-center mb-16 reveal">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-xs font-semibold text-accent uppercase tracking-wider mb-4">
              Live Demo
            </span>
            <h2 className="mt-4 text-4xl font-extrabold md:text-5xl text-text">
              See It In <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">Action</span>
            </h2>
            <p className="mt-6 text-text-secondary max-w-xl mx-auto text-lg">
              Watch how UBuilder transforms a simple text prompt into a complete, stunning website.
            </p>
          </div>

          {/* Demo simulation */}
          <div className="reveal max-w-5xl mx-auto">
            <div className="rounded-2xl border border-border bg-bg-secondary/80 shadow-2xl shadow-primary/10 overflow-hidden backdrop-blur-sm">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 border-b border-border px-4 py-3 bg-bg/60">
                <div className="h-3 w-3 rounded-full bg-[#FF5F57]" />
                <div className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
                <div className="h-3 w-3 rounded-full bg-[#28C840]" />
                <div className="ms-4 flex-1 max-w-md">
                  <div className="rounded-md bg-bg-tertiary/80 px-3 py-1.5 text-xs text-text-muted text-start">
                    app.ubuilder.ai/dashboard/new
                  </div>
                </div>
              </div>

              <div className="p-8 md:p-12">
                {/* Step 1: Prompt */}
                <div className="max-w-2xl mx-auto mb-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                      <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" /></svg>
                    </div>
                    <span className="text-sm font-semibold text-text">What would you like to build?</span>
                  </div>
                  <div className="rounded-xl border border-primary/30 bg-bg p-4 relative">
                    <p className="text-sm text-text leading-relaxed animate-typing-cursor">
                      Build a premium dental clinic website with a modern hero section, services grid, patient testimonials, team section, and online booking. Use calming blue and white tones.
                    </p>
                  </div>
                </div>

                {/* Step 2: Progress */}
                <div className="max-w-2xl mx-auto mb-10">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-text-muted font-medium">Generating your website...</span>
                    <span className="text-primary font-semibold">100%</span>
                  </div>
                  <div className="h-2 rounded-full bg-bg-tertiary overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-primary demo-progress animate-gradient" />
                  </div>
                  <div className="flex items-center gap-6 mt-4 text-[11px] text-text-muted">
                    <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-success" />Layout created</span>
                    <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-success" />Content written</span>
                    <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-success" />Images matched</span>
                    <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-success" />SEO optimized</span>
                  </div>
                </div>

                {/* Step 3: Result preview */}
                <div className="rounded-xl border border-border overflow-hidden shadow-xl demo-screen">
                  <div className="relative h-64 md:h-96">
                    <Image
                      src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200&q=80"
                      alt="Generated dental clinic website"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 80vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent" />
                    {/* Overlay with generated UI elements */}
                    <div className="absolute top-0 inset-x-0 h-12 bg-white/90 backdrop-blur flex items-center px-6 justify-between">
                      <span className="text-xs font-bold text-gray-800">SmilePro Dental</span>
                      <div className="hidden md:flex items-center gap-4 text-[10px] font-medium text-gray-600">
                        <span>Home</span><span>Services</span><span>Our Team</span><span>Testimonials</span>
                        <span className="rounded-full bg-blue-600 px-3 py-1 text-white text-[10px]">Book Now</span>
                      </div>
                    </div>
                    <div className="absolute bottom-8 left-8 max-w-md">
                      <div className="text-xs font-medium text-primary mb-2">AI-Generated Website</div>
                      <h3 className="text-2xl md:text-3xl font-bold text-text mb-2">Your Smile, Our Priority</h3>
                      <p className="text-sm text-text-secondary mb-4">Expert dental care for the whole family. Book your appointment today.</p>
                      <div className="flex gap-3">
                        <span className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white">Book Appointment</span>
                        <span className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-text">Our Services</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 7. TEMPLATES ===== */}
      <section id="templates" className="relative border-t border-border bg-bg-secondary py-24 md:py-32">
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="text-center mb-16 reveal">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-xs font-semibold text-accent uppercase tracking-wider mb-4">
              Templates
            </span>
            <h2 className="mt-4 text-4xl font-extrabold md:text-5xl text-text">
              See What Our AI Can Build
            </h2>
            <p className="mt-6 text-text-secondary max-w-xl mx-auto text-lg">
              Every template is AI-generated. Click to preview the real site — desktop, mobile, and AI chatbot included.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: 'Saffron & Thyme', category: 'Restaurant', slug: 'restaurant', color: 'from-amber-500 to-orange-600' },
              { name: 'Metrica SaaS', category: 'SaaS', slug: 'saas', color: 'from-primary to-indigo-600' },
              { name: 'ATELIER Store', category: 'E-commerce', slug: 'ecommerce', color: 'from-emerald-500 to-teal-600' },
              { name: 'Creative Portfolio', category: 'Portfolio', slug: 'portfolio', color: 'from-secondary to-blue-600' },
              { name: 'Vantage Studio', category: 'Business', slug: 'business', color: 'from-slate-500 to-zinc-700' },
              { name: 'PearlCare Dental', category: 'Dental', slug: 'dental', color: 'from-sky-400 to-cyan-600' },
            ].map((template, i) => (
              <div key={template.name} className={`reveal reveal-delay-${(i % 3) + 1} group rounded-2xl border border-border bg-bg overflow-hidden hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500`}>
                {/* Device Frame Preview */}
                <div className="relative cursor-pointer p-4 pb-0" onClick={() => setPreviewTemplate(previewTemplate === i ? null : i)}>
                  {/* Desktop Frame */}
                  <div className="relative rounded-t-lg border border-white/10 bg-[#1a1a2e] overflow-hidden shadow-2xl">
                    {/* Browser Chrome */}
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-[#12121f] border-b border-white/5">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
                      </div>
                      <div className="flex-1 mx-4">
                        <div className="rounded-md bg-white/5 px-3 py-1 text-[9px] text-white/30 text-center truncate">
                          {template.name.toLowerCase().replace(/\s+/g, '')}.ubuilder.co
                        </div>
                      </div>
                    </div>
                    {/* Site Preview */}
                    <div className="relative h-44 overflow-hidden">
                      <iframe
                        src={`/templates/${template.slug}/index.html`}
                        className="absolute inset-0 w-[200%] h-[200%] border-0 pointer-events-none"
                        style={{ transform: 'scale(0.5)', transformOrigin: 'top left' }}
                        title={`${template.name} preview`}
                        loading="lazy"
                      />
                    </div>
                  </div>

                  {/* Mobile Frame - floating to the right */}
                  <div className="absolute -bottom-1 right-6 w-[60px] rounded-lg border-2 border-white/15 bg-[#1a1a2e] overflow-hidden shadow-xl">
                    <div className="h-1.5 bg-[#12121f] flex items-center justify-center">
                      <div className="w-4 h-0.5 rounded-full bg-white/10" />
                    </div>
                    <div className="relative h-[100px] overflow-hidden">
                      <iframe
                        src={`/templates/${template.slug}/index.html`}
                        className="absolute inset-0 border-0 pointer-events-none"
                        style={{ width: '375px', height: '667px', transform: 'scale(0.16)', transformOrigin: 'top left' }}
                        title={`${template.name} mobile`}
                        loading="lazy"
                      />
                    </div>
                  </div>

                  {/* AI Bot Badge */}
                  <div className="absolute top-6 right-6 flex items-center gap-1 rounded-full bg-primary/90 backdrop-blur-sm px-2 py-1 shadow-lg">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <span className="text-[8px] font-bold text-white">AI Bot</span>
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 backdrop-blur-[2px] rounded-t-2xl">
                    <span className="rounded-full bg-white/95 px-6 py-2.5 text-xs font-bold text-gray-900 shadow-xl hover:scale-105 transition-transform flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      Live Preview
                    </span>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-text">{template.name}</h3>
                    <p className="text-xs text-text-muted mt-0.5">{template.category}</p>
                  </div>
                  <span className={`inline-block bg-gradient-to-r ${template.color} rounded-full px-3 py-1 text-[10px] font-bold text-white`}>
                    {template.category}
                  </span>
                </div>
              </div>
            ))}

            {/* Template Preview Modal — live iframe */}
            {previewTemplate !== null && (() => {
              const templates = [
                { name: 'Saffron & Thyme', category: 'Restaurant', slug: 'restaurant' },
                { name: 'Metrica SaaS', category: 'SaaS', slug: 'saas' },
                { name: 'ATELIER Store', category: 'E-commerce', slug: 'ecommerce' },
                { name: 'Creative Portfolio', category: 'Portfolio', slug: 'portfolio' },
                { name: 'Vantage Studio', category: 'Business', slug: 'business' },
                { name: 'PearlCare Dental', category: 'Dental', slug: 'dental' },
              ]
              const t = templates[previewTemplate]
              return (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={() => setPreviewTemplate(null)}>
                  <div className="relative w-full max-w-6xl h-[85vh] rounded-2xl border border-white/10 bg-[#0d0d1a] shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                    {/* Modal Header */}
                    <div className="flex items-center justify-between border-b border-white/5 px-6 py-3 bg-[#0a0a15]">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-red-400/70 cursor-pointer hover:bg-red-400" onClick={() => setPreviewTemplate(null)} />
                          <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
                          <div className="w-3 h-3 rounded-full bg-green-400/70" />
                        </div>
                        <div className="rounded-lg bg-white/5 px-4 py-1.5 text-xs text-white/40">
                          {t.name.toLowerCase().replace(/\s+/g, '')}.ubuilder.co
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Link href="/dashboard/new" className="rounded-full bg-gradient-to-r from-primary to-primary-hover px-5 py-2 text-xs font-semibold text-white hover:shadow-lg hover:shadow-primary/30 transition-all">
                          Use This Template
                        </Link>
                        <button onClick={() => setPreviewTemplate(null)} className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    </div>
                    {/* Live Site Preview */}
                    <iframe
                      src={`/templates/${t.slug}/index.html`}
                      className="w-full border-0"
                      style={{ height: 'calc(85vh - 52px)' }}
                      title={`${t.name} full preview`}
                    />
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      </section>

      {/* ===== 8. AI CAPABILITIES ===== */}
      <section className="relative border-t border-border bg-bg py-24 md:py-32">
        <div className="absolute top-0 right-[20%] h-[300px] w-[300px] rounded-full bg-primary/5 blur-[120px]" style={{ transform: `translateY(${scrollY * 0.03}px)` }} />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="reveal from-left">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary uppercase tracking-wider mb-4">
                AI Engine
              </span>
              <h2 className="text-4xl font-extrabold md:text-5xl text-text mb-6">
                Our AI Doesn&apos;t Just Build — <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">It Thinks</span>
              </h2>
              <p className="text-text-secondary text-lg leading-relaxed mb-10">
                Powered by multiple AI models working together. Each task gets routed to the perfect model for speed, quality, and cost efficiency.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  'Generates multi-page websites',
                  'Creates custom images & icons',
                  'Writes SEO-optimized content',
                  'Scans & improves competitor sites',
                  'Optimizes for AI search (GSO)',
                  'Translates to 12+ languages',
                  'Built-in AI chatbot agent',
                  'Auto Schema.org markup',
                ].map((capability, i) => (
                  <div key={capability} className={`reveal reveal-delay-${(i % 4) + 1} flex items-start gap-3 py-2`}>
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/20">
                      <svg className="h-3 w-3 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-sm text-text-secondary">{capability}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="reveal from-right">
              <div className="rounded-3xl border border-border bg-bg-secondary p-8 relative overflow-hidden hover-glow transition-all duration-500">
                <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full border border-primary/20 animate-spin-slow" />
                <div className="absolute -bottom-16 -left-16 h-32 w-32 rounded-full border border-secondary/20 animate-spin-slow" style={{animationDirection: 'reverse'}} />
                <div className="relative">
                  <div className="text-center mb-8">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/25 mb-4">
                      <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" /></svg>
                    </div>
                    <h3 className="text-lg font-bold text-text">AI Router</h3>
                    <p className="text-xs text-text-muted mt-1">Smart model selection</p>
                  </div>
                  <div className="space-y-3">
                    {[
                      { model: 'Claude', task: 'Complex generation', speed: 'High quality', color: 'bg-primary' },
                      { model: 'Gemini Flash', task: 'Fast tasks', speed: 'Ultra fast', color: 'bg-secondary' },
                      { model: 'Gemini Nano', task: 'On-device', speed: 'Instant', color: 'bg-accent' },
                    ].map((item) => (
                      <div key={item.model} className="flex items-center gap-3 rounded-xl bg-bg/50 border border-border p-3 hover:border-primary/20 transition-colors duration-300">
                        <div className={`h-8 w-8 rounded-lg ${item.color} flex items-center justify-center`}>
                          <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" /></svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-text">{item.model}</div>
                          <div className="text-[10px] text-text-muted">{item.task}</div>
                        </div>
                        <span className="text-[10px] font-medium text-text-muted bg-bg rounded-full px-2 py-0.5">{item.speed}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 9. TESTIMONIALS ===== */}
      <section className="relative border-t border-border bg-bg-secondary py-24 md:py-32">
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="text-center mb-16 reveal">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-xs font-semibold text-accent uppercase tracking-wider mb-4">
              Testimonials
            </span>
            <h2 className="mt-4 text-4xl font-extrabold md:text-5xl text-text">
              Loved by Builders Everywhere
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { quote: 'UBuilder replaced our entire web team workflow. We went from 2-week design cycles to launching sites in under an hour. The AI generation quality is unreal.', name: 'Sarah Chen', title: 'Head of Marketing', company: 'TechCorp', initials: 'SC', color: 'bg-primary' },
              { quote: 'The GSO feature alone is worth the subscription. Our sites now get cited by ChatGPT and Google AI Overviews. Traffic from AI sources increased 340%.', name: 'David Katz', title: 'CEO & Founder', company: 'GrowthLab', initials: 'DK', color: 'bg-secondary' },
              { quote: 'As an Israeli startup, the RTL + Hebrew support is perfect. We build bilingual sites in minutes. The AI even translates our content beautifully.', name: 'Maya Levi', title: 'Product Designer', company: 'DesignHub', initials: 'ML', color: 'bg-accent' },
            ].map((testimonial, i) => (
              <div key={testimonial.name} className={`reveal reveal-delay-${i + 1} rounded-2xl border border-border bg-bg p-8 hover:border-primary/20 transition-all duration-300 hover-lift`}>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} className="h-4 w-4 text-accent" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
                <p className="text-text-secondary text-sm leading-relaxed mb-6">&quot;{testimonial.quote}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full ${testimonial.color} flex items-center justify-center text-xs font-bold text-white`}>
                    {testimonial.initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-text">{testimonial.name}</div>
                    <div className="text-xs text-text-muted">{testimonial.title}, {testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 10. PRICING ===== */}
      <section id="pricing" className="relative border-t border-border bg-bg py-24 md:py-32">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[150px]" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="text-center mb-16 reveal">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary uppercase tracking-wider mb-4">
              Pricing
            </span>
            <h2 className="mt-4 text-4xl font-extrabold md:text-5xl text-text">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-6 text-text-secondary max-w-xl mx-auto text-lg">
              Start free. Upgrade when you need more power. No hidden fees.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Free */}
            <div className="reveal reveal-delay-1 rounded-2xl border border-border bg-bg-secondary p-8 hover:border-border-hover transition-all duration-300 hover-lift">
              <h3 className="text-lg font-bold text-text mb-2">Free</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold text-text">$0</span>
                <span className="text-text-muted text-sm">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['1 website', 'AI generation', '*.ubuilder.co domain', 'Basic analytics', 'Community support'].map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm text-text-secondary">
                    <svg className="h-4 w-4 text-text-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="block w-full rounded-xl border border-border py-3 text-center text-sm font-semibold text-text hover:bg-bg-tertiary transition-colors">
                Get Started Free
              </Link>
            </div>

            {/* Pro */}
            <div className="reveal reveal-delay-2 relative rounded-2xl border-2 border-primary bg-bg-secondary p-8 shadow-xl shadow-primary/10 hover-lift">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-gradient-to-r from-primary to-secondary px-4 py-1 text-xs font-bold text-white shadow-lg">
                  Most Popular
                </span>
              </div>
              <h3 className="text-lg font-bold text-text mb-2">Pro</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold text-text">$19</span>
                <span className="text-text-muted text-sm">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['10 websites', 'Custom domains', 'Code export', 'AI Agent chatbot', 'GSO optimization', 'Priority support', 'Advanced analytics'].map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm text-text-secondary">
                    <svg className="h-4 w-4 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="block w-full rounded-xl bg-gradient-to-r from-primary to-primary-hover py-3 text-center text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300">
                Start Free Trial
              </Link>
            </div>

            {/* Business */}
            <div className="reveal reveal-delay-3 rounded-2xl border border-border bg-bg-secondary p-8 hover:border-border-hover transition-all duration-300 hover-lift">
              <h3 className="text-lg font-bold text-text mb-2">Business</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold text-text">$49</span>
                <span className="text-text-muted text-sm">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['Unlimited websites', 'White label', 'API access', 'Team collaboration', 'SLA guarantee', 'Dedicated support', 'Custom integrations'].map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm text-text-secondary">
                    <svg className="h-4 w-4 text-text-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="block w-full rounded-xl border border-border py-3 text-center text-sm font-semibold text-text hover:bg-bg-tertiary transition-colors">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 11. FAQ ===== */}
      <section className="relative border-t border-border bg-bg-secondary py-24 md:py-32">
        <div className="relative mx-auto max-w-3xl px-6">
          <div className="text-center mb-16 reveal">
            <span className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/5 px-4 py-1.5 text-xs font-semibold text-secondary uppercase tracking-wider mb-4">
              FAQ
            </span>
            <h2 className="mt-4 text-4xl font-extrabold md:text-5xl text-text">
              Common Questions
            </h2>
          </div>

          <div className="space-y-3">
            {[
              { q: 'How does AI website generation work?', a: 'You describe your website in plain text — the type of business, style preferences, and content needs. Our AI engine analyzes your prompt, selects the optimal layout, generates professional copy, sources relevant images, and builds a complete multi-page website in under 60 seconds.' },
              { q: 'Can I edit the generated website?', a: 'Absolutely! Every element is fully editable through our visual drag-and-drop editor. You can also chat with the AI to make changes — just type "make the headline bigger" or "change the color scheme to blue" and it updates instantly.' },
              { q: 'What is GSO (Generative Search Optimization)?', a: 'GSO goes beyond traditional SEO. It optimizes your website to be found and cited by AI search engines like ChatGPT, Google AI Overviews, Perplexity, and Claude. This includes structured data, Schema.org markup, and content formatting that AI models can easily understand.' },
              { q: 'Do I need coding skills?', a: 'Not at all. UBuilder is designed for everyone — from small business owners to designers. The AI handles all the technical work. If you want to export the code, Pro plans include full code export in clean HTML/CSS/JS.' },
              { q: 'Can I use my own domain?', a: 'Yes! Free plans include a *.ubuilder.co subdomain. Pro and Business plans support custom domains with free SSL certificates and CDN. Just point your domain to us and we handle the rest.' },
              { q: 'What languages do you support?', a: 'UBuilder supports 12+ languages including English, Hebrew, Arabic, French, German, Spanish, Russian, Chinese, Japanese, Korean, Portuguese, and Italian. Full RTL (right-to-left) support is built-in for Hebrew and Arabic.' },
              { q: 'Is there a free plan?', a: 'Yes! Our free plan includes 1 website, AI generation, a *.ubuilder.co subdomain, and basic analytics. No credit card required. Upgrade to Pro ($19/mo) for custom domains, code export, AI Agent, and more.' },
              { q: 'How does the AI chatbot agent work?', a: 'The AI Agent is a smart chatbot that lives on your published website. It answers visitor questions, collects leads, books appointments, and provides customer support — all automatically, 24/7. It learns from your website content and can be customized with your own knowledge base.' },
            ].map((faq, i) => (
              <details key={i} className={`reveal reveal-delay-${Math.min(i + 1, 4)} group rounded-xl border border-border bg-bg hover:border-border-hover transition-colors`}>
                <summary className="flex items-center justify-between cursor-pointer px-6 py-5 text-sm font-semibold text-text list-none">
                  <span>{faq.q}</span>
                  <svg className="faq-chevron h-5 w-5 text-text-muted shrink-0 ms-4 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </summary>
                <div className="faq-content px-6 pb-5">
                  <p className="text-sm text-text-secondary leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 12. FINAL CTA ===== */}
      <section className="relative border-t border-border overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-bg to-secondary/20 animate-gradient" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[400px] w-[800px] rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute bottom-0 right-[20%] h-[300px] w-[300px] rounded-full bg-secondary/10 blur-[100px]" />

        <div className="relative mx-auto max-w-4xl px-6 py-24 md:py-32 text-center reveal">
          <h2 className="text-4xl font-extrabold md:text-5xl lg:text-6xl text-text mb-6">
            Ready to Build Something{' '}
            <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer">Amazing</span>?
          </h2>
          <p className="text-text-secondary text-lg max-w-xl mx-auto mb-10">
            Join 50,000+ businesses building beautiful websites with AI. Start free — no credit card required.
          </p>

          <form className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto mb-6" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full sm:flex-1 rounded-xl border border-border bg-bg-secondary/80 px-5 py-3.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
            <Link
              href="/login"
              className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-primary to-primary-hover px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-105 transition-all duration-300 whitespace-nowrap"
            >
              Get Started Free
            </Link>
          </form>
          <p className="text-xs text-text-muted">
            No credit card required. Free forever for 1 site.
          </p>
        </div>
      </section>

      {/* ===== 13. FOOTER ===== */}
      <footer className="border-t border-border bg-bg py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/25">
                  <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" />
                  </svg>
                </div>
                <span className="text-xl font-extrabold text-text tracking-tight">UBuilder</span>
              </div>
              <p className="text-sm text-text-muted leading-relaxed max-w-xs mb-6">
                AI-powered website builder. Build, optimize, and grow your online presence with the power of artificial intelligence.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-bg-tertiary hover:bg-primary/20 text-text-muted hover:text-primary transition-all">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                </a>
                <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-bg-tertiary hover:bg-primary/20 text-text-muted hover:text-primary transition-all">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                </a>
                <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-bg-tertiary hover:bg-primary/20 text-text-muted hover:text-primary transition-all">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                </a>
              </div>
            </div>

            {[
              { title: 'Product', links: ['Features', 'Templates', 'Pricing', 'AI Assistant', 'API'] },
              { title: 'Resources', links: ['Documentation', 'Blog', 'Support', 'Changelog', 'Status'] },
              { title: 'Company', links: ['About', 'Privacy Policy', 'Terms of Service', 'Contact', 'Careers'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-semibold text-sm text-text mb-5">{col.title}</h4>
                <ul className="space-y-3 text-sm">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-text-muted hover:text-text transition-colors duration-200">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-14 border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-text-muted">&copy; 2026 UBuilder AI. All rights reserved.</p>
            <div className="flex items-center gap-6 text-xs text-text-muted">
              <a href="#" className="hover:text-text transition-colors">Privacy</a>
              <a href="#" className="hover:text-text transition-colors">Terms</a>
              <a href="#" className="hover:text-text transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
