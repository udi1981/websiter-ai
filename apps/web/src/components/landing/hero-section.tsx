'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'

type HeroSectionProps = {
  scrollY: number
}

export const HeroSection = ({ scrollY }: HeroSectionProps) => {
  const [countersTriggered, setCountersTriggered] = useState(false)
  const [counters, setCounters] = useState([0, 0, 0, 0])
  const [activeTab, setActiveTab] = useState(0)
  const statsRef = useRef<HTMLDivElement>(null)

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

  // Hero mockup tabs data
  const mockupTabs = [
    {
      label: 'Homepage',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      image: 'https://images.unsplash.com/photo-1583007109931-cdf68cdc4f4d?w=1200&q=80',
      url: 'babystyle.co/store',
      overlay: (
        <div className="absolute inset-0 flex flex-col bg-white">
          {/* Top nav */}
          <div className="h-8 bg-white flex items-center px-3 justify-between border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-pink-500 flex items-center justify-center"><span className="text-[6px] font-bold text-white">BS</span></div>
              <span className="text-[10px] font-bold text-gray-800">BabyStyle</span>
            </div>
            <div className="hidden md:flex items-center gap-2.5 text-[8px] font-medium text-gray-500">
              <span className="text-pink-500 font-semibold">Home</span><span>Shop</span><span>Collections</span><span>Sale</span><span>Blog</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <div className="relative">
                <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
                <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-pink-500 flex items-center justify-center"><span className="text-[5px] text-white font-bold">3</span></div>
              </div>
            </div>
          </div>
          {/* Hero banner */}
          <div className="relative h-24 bg-gradient-to-r from-pink-100 to-purple-100 flex items-center px-4">
            <div className="max-w-[55%]">
              <div className="text-[7px] font-semibold text-pink-500 uppercase tracking-wider mb-0.5">New Collection 2026</div>
              <div className="text-[11px] font-bold text-gray-800 leading-tight mb-1">Cozy Pajamas for Little Ones</div>
              <div className="text-[7px] text-gray-500 mb-1.5">Organic cotton. Sizes 0-8. Free shipping $50+</div>
              <div className="flex gap-1">
                <span className="rounded-full bg-pink-500 px-2 py-0.5 text-[7px] font-semibold text-white">Shop Now</span>
                <span className="rounded-full border border-pink-300 px-2 py-0.5 text-[7px] font-semibold text-pink-500">View Catalog</span>
              </div>
            </div>
            <div className="absolute right-3 bottom-1 flex gap-1.5">
              {['bg-pink-200', 'bg-purple-200', 'bg-rose-200'].map((c, i) => (
                <div key={i} className={`h-16 w-12 rounded-lg ${c} flex items-center justify-center shadow-sm`}>
                  <span className="text-[16px]">{['\ud83d\udc76', '\ud83e\uddf8', '\ud83c\udf80'][i]}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Product grid */}
          <div className="flex-1 bg-gray-50 px-3 py-2 overflow-hidden">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[8px] font-bold text-gray-800">Featured Products</span>
              <span className="text-[7px] text-pink-500 font-medium">View All →</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { name: 'Butterfly Set', price: '$24.99', rating: 4.8, sold: '2.1k', color: 'bg-pink-100' },
                { name: 'Unicorn PJs', price: '$29.99', rating: 4.9, sold: '3.4k', color: 'bg-purple-100' },
                { name: 'Star Onesie', price: '$19.99', rating: 4.7, sold: '1.8k', color: 'bg-blue-100' },
                { name: 'Dino Dreams', price: '$22.99', rating: 4.6, sold: '1.2k', color: 'bg-green-100' },
              ].map((p) => (
                <div key={p.name} className="rounded-lg bg-white border border-gray-100 p-1.5 shadow-sm">
                  <div className={`h-12 rounded ${p.color} mb-1 flex items-center justify-center`}>
                    <span className="text-[12px]">{'\ud83d\udc57'}</span>
                  </div>
                  <div className="text-[7px] font-semibold text-gray-800 truncate">{p.name}</div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[8px] font-bold text-pink-500">{p.price}</span>
                    <span className="text-[6px] text-amber-500">{'\u2605'} {p.rating}</span>
                  </div>
                  <div className="text-[6px] text-gray-400">{p.sold} sold</div>
                </div>
              ))}
            </div>
            {/* Trust bar */}
            <div className="flex items-center justify-center gap-3 mt-2 py-1 border-t border-gray-100">
              {['Free Shipping $50+', '30-Day Returns', 'Secure Checkout', 'Organic Cotton'].map((t) => (
                <span key={t} className="text-[6px] text-gray-400 font-medium flex items-center gap-0.5">
                  <span className="text-green-500">{'\u2713'}</span> {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      label: 'CRM',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80',
      url: 'babystyle.co/crm',
      overlay: (
        <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm flex flex-col text-white overflow-hidden">
          {/* Top bar */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold">CRM Pipeline</span>
              <span className="text-[8px] bg-success/20 text-success px-1.5 py-0.5 rounded-full">142 leads</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[7px] bg-white/10 px-1.5 py-0.5 rounded text-gray-300">This Month</span>
              <span className="text-[7px] bg-primary/20 px-1.5 py-0.5 rounded text-primary">+ Add Lead</span>
            </div>
          </div>
          {/* Stats row */}
          <div className="grid grid-cols-4 gap-1.5 px-3 py-2">
            {[{ n: 'New', v: '38', c: 'text-blue-400', bg: 'bg-blue-400' }, { n: 'Contacted', v: '52', c: 'text-yellow-400', bg: 'bg-yellow-400' }, { n: 'Qualified', v: '28', c: 'text-green-400', bg: 'bg-green-400' }, { n: 'Won', v: '$12.4K', c: 'text-purple-400', bg: 'bg-purple-400' }].map(s => (
              <div key={s.n} className="bg-white/5 rounded-lg p-1.5">
                <div className="flex items-center gap-1 mb-0.5">
                  <div className={`h-1.5 w-1.5 rounded-full ${s.bg}`} />
                  <span className="text-[7px] text-gray-400">{s.n}</span>
                </div>
                <div className={`text-[11px] font-bold ${s.c}`}>{s.v}</div>
              </div>
            ))}
          </div>
          {/* Pipeline kanban */}
          <div className="flex-1 px-3 pb-2 overflow-hidden flex gap-1.5">
            {[
              { title: 'New', color: 'border-blue-500', leads: [
                { name: 'Sarah M.', email: 'sarah@gm...', val: '$240', time: '2m ago' },
                { name: 'Yael K.', email: 'yael@out...', val: '$180', time: '15m ago' },
              ]},
              { title: 'Contacted', color: 'border-yellow-500', leads: [
                { name: 'David R.', email: 'david@co...', val: '$520', time: '1h ago' },
                { name: 'Noa B.', email: 'noa@mail...', val: '$95', time: '3h ago' },
                { name: 'Amit S.', email: 'amit@wor...', val: '$310', time: '5h ago' },
              ]},
              { title: 'Qualified', color: 'border-green-500', leads: [
                { name: 'Maya L.', email: 'maya@biz...', val: '$890', time: '1d ago' },
                { name: 'Tom H.', email: 'tom@star...', val: '$445', time: '2d ago' },
              ]},
              { title: 'Won', color: 'border-purple-500', leads: [
                { name: 'Dana P.', email: 'dana@sh...', val: '$1,200', time: 'Today' },
              ]},
            ].map((col) => (
              <div key={col.title} className={`flex-1 bg-white/5 rounded-lg border-t-2 ${col.color} p-1.5 overflow-hidden flex flex-col`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[7px] font-semibold text-gray-300">{col.title}</span>
                  <span className="text-[6px] text-gray-500 bg-white/5 rounded px-1">{col.leads.length}</span>
                </div>
                <div className="space-y-1 flex-1 overflow-hidden">
                  {col.leads.map((l, i) => (
                    <div key={i} className="bg-white/5 rounded p-1.5 border border-white/5">
                      <div className="flex items-center gap-1 mb-0.5">
                        <div className="h-3.5 w-3.5 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-[5px] font-bold">{l.name[0]}</div>
                        <span className="text-[7px] font-medium truncate">{l.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[6px] text-gray-500 truncate">{l.email}</span>
                        <span className="text-[7px] font-bold text-green-400">{l.val}</span>
                      </div>
                      <div className="text-[5px] text-gray-600 mt-0.5">{l.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {/* Activity feed bar */}
          <div className="px-3 py-1.5 border-t border-white/10 flex items-center gap-2">
            <span className="text-[7px] text-gray-500">Latest:</span>
            <span className="text-[7px] text-gray-300">Sarah M. opened email campaign</span>
            <span className="text-[6px] text-gray-600">{'\u2022'}</span>
            <span className="text-[7px] text-gray-300">Dana P. completed purchase</span>
            <span className="text-[6px] text-gray-600">{'\u2022'}</span>
            <span className="text-[7px] text-green-400">+$1,200</span>
          </div>
        </div>
      ),
    },
    {
      label: 'AI Agent',
      icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
      image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200&q=80',
      url: 'babystyle.co/chat',
      overlay: (
        <div className="absolute inset-0 bg-gray-900/85 backdrop-blur-sm flex">
          <div className="flex-1 p-3 flex flex-col">
            {/* Top stats bar */}
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] text-gray-400">Customer browsing: Pajamas &gt; Size 6</div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[7px] bg-green-500/15 text-green-400 px-1.5 py-0.5 rounded-full font-medium">
                  <span className="h-1 w-1 rounded-full bg-green-400 animate-pulse" /> Satisfaction: 98%
                </span>
                <span className="text-[7px] bg-blue-500/15 text-blue-400 px-1.5 py-0.5 rounded-full font-medium">Avg: 2.3s</span>
              </div>
            </div>
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
                        <div className="h-10 rounded bg-pink-500/10 mb-1 flex items-center justify-center"><span className="text-[14px]">{'\ud83d\udc57'}</span></div>
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
              {/* Typing indicator */}
              <div className="flex gap-2 justify-end">
                <div className="bg-primary/10 rounded-xl rounded-tr-sm px-3 py-2 flex items-center gap-1">
                  <div className="h-1 w-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="h-1 w-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="h-1 w-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
            {/* Quick replies */}
            <div className="flex gap-1 mb-1.5 mt-1.5">
              {['Track Order', 'Size Guide', 'Return Policy'].map(q => (
                <span key={q} className="text-[7px] bg-white/5 border border-white/10 text-gray-400 px-2 py-0.5 rounded-full">{q}</span>
              ))}
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 border border-white/10">
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
      image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&q=80',
      url: 'babystyle.co/seo',
      overlay: (
        <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
            <span className="text-[10px] font-bold text-white">AI Search Optimization</span>
            <span className="text-[8px] bg-success/20 text-success px-1.5 py-0.5 rounded-full font-medium">GSO Score: 94/100</span>
          </div>
          {/* Engine scores with radial indicators */}
          <div className="grid grid-cols-3 gap-1.5 px-3 py-2">
            {[{ engine: 'Google AI', score: 96, color: 'text-blue-400', ring: 'border-blue-400' }, { engine: 'ChatGPT', score: 92, color: 'text-green-400', ring: 'border-green-400' }, { engine: 'Perplexity', score: 94, color: 'text-purple-400', ring: 'border-purple-400' }].map(e => (
              <div key={e.engine} className="bg-white/5 rounded-lg p-2 flex items-center gap-2">
                <div className={`h-8 w-8 rounded-full border-2 ${e.ring} flex items-center justify-center shrink-0`}>
                  <span className={`text-[9px] font-bold ${e.color}`}>{e.score}</span>
                </div>
                <div>
                  <div className="text-[8px] text-gray-300 font-medium">{e.engine}</div>
                  <div className="text-[6px] text-success">+{Math.floor(Math.random() * 5 + 3)}% vs last month</div>
                </div>
              </div>
            ))}
          </div>
          {/* Two column layout */}
          <div className="flex-1 flex gap-1.5 px-3 pb-2 overflow-hidden">
            {/* Keyword rankings */}
            <div className="flex-1 bg-white/5 rounded-lg p-2 overflow-hidden">
              <div className="text-[8px] font-semibold text-gray-300 mb-1.5">Keyword Rankings</div>
              <div className="space-y-1">
                {[
                  { kw: 'baby pajamas organic', pos: 2, prev: 5, vol: '12K' },
                  { kw: 'kids sleepwear cotton', pos: 1, prev: 1, vol: '8.5K' },
                  { kw: 'toddler onesie set', pos: 3, prev: 7, vol: '6.2K' },
                  { kw: 'baby gift sets', pos: 4, prev: 8, vol: '15K' },
                  { kw: 'organic kids clothes', pos: 6, prev: 12, vol: '22K' },
                ].map((k, i) => (
                  <div key={i} className="flex items-center gap-1 text-[7px]">
                    <span className="w-3 text-center font-bold text-white">#{k.pos}</span>
                    <span className="text-green-400 text-[6px]">{k.prev > k.pos ? `\u2191${k.prev - k.pos}` : '\u2014'}</span>
                    <span className="flex-1 text-gray-300 truncate">{k.kw}</span>
                    <span className="text-gray-500">{k.vol}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Right column */}
            <div className="flex-1 flex flex-col gap-1.5 overflow-hidden">
              {/* Competitor comparison */}
              <div className="bg-white/5 rounded-lg p-2 flex-1">
                <div className="text-[8px] font-semibold text-gray-300 mb-1.5">vs Competitors</div>
                {[
                  { name: 'BabyStyle (You)', score: 94, color: 'from-primary to-secondary' },
                  { name: 'KiddoWear.com', score: 71, color: 'from-gray-500 to-gray-600' },
                  { name: 'TinyTrends.co', score: 65, color: 'from-gray-500 to-gray-600' },
                ].map((c, i) => (
                  <div key={i} className="mb-1">
                    <div className="flex items-center justify-between text-[6px] mb-0.5">
                      <span className={i === 0 ? 'text-primary font-semibold' : 'text-gray-400'}>{c.name}</span>
                      <span className={i === 0 ? 'text-primary font-bold' : 'text-gray-500'}>{c.score}</span>
                    </div>
                    <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-r ${c.color}`} style={{ width: `${c.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              {/* Checklist */}
              <div className="bg-white/5 rounded-lg p-2 flex-1 overflow-hidden">
                <div className="text-[8px] font-semibold text-gray-300 mb-1">Optimization</div>
                {[
                  { task: 'Schema.org data', done: true },
                  { task: 'AI content structure', done: true },
                  { task: 'FAQ markup', done: true },
                  { task: 'Entity keywords', done: true },
                  { task: 'Hreflang tags', done: false },
                ].map((t, i) => (
                  <div key={i} className="flex items-center gap-1 mb-0.5">
                    <div className={`h-2.5 w-2.5 rounded-full flex items-center justify-center ${t.done ? 'bg-success/20' : 'bg-white/10'}`}>
                      {t.done ? <svg className="h-1.5 w-1.5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> : <div className="h-1 w-1 rounded-full bg-gray-500" />}
                    </div>
                    <span className={`text-[7px] ${t.done ? 'text-gray-300' : 'text-gray-500'}`}>{t.task}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      label: 'Analytics',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80',
      url: 'babystyle.co/analytics',
      overlay: (
        <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-white">AI Analytics</span>
              <span className="flex items-center gap-1 text-[7px] text-green-400"><span className="h-1 w-1 rounded-full bg-green-400 animate-pulse" /> 847 online</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[7px] bg-white/10 px-1.5 py-0.5 rounded text-gray-300">7d</span>
              <span className="text-[7px] bg-primary/20 px-1.5 py-0.5 rounded text-primary">30d</span>
              <span className="text-[7px] bg-white/10 px-1.5 py-0.5 rounded text-gray-300">90d</span>
            </div>
          </div>
          {/* Stats row */}
          <div className="grid grid-cols-4 gap-1.5 px-3 py-2">
            {[{ n: 'Visitors', v: '24.8K', d: '+18%', c: 'text-blue-400' }, { n: 'Conversions', v: '1,247', d: '+24%', c: 'text-green-400' }, { n: 'Revenue', v: '$48.2K', d: '+31%', c: 'text-purple-400' }, { n: 'Avg. Order', v: '$38.6', d: '+7%', c: 'text-pink-400' }].map(s => (
              <div key={s.n} className="bg-white/5 rounded-lg p-1.5">
                <div className={`text-[10px] font-bold ${s.c}`}>{s.v}</div>
                <div className="text-[6px] text-gray-400">{s.n}</div>
                <div className="text-[6px] text-success font-medium">{s.d}</div>
              </div>
            ))}
          </div>
          {/* Main content area */}
          <div className="flex-1 flex gap-1.5 px-3 pb-2 overflow-hidden">
            {/* Left: Charts */}
            <div className="flex-[2] flex flex-col gap-1.5">
              {/* Line + bar chart combo */}
              <div className="bg-white/5 rounded-lg p-2 flex-1">
                <div className="text-[8px] text-gray-300 font-semibold mb-1">Revenue vs Visitors</div>
                <div className="flex items-end gap-0.5 h-16 relative">
                  {/* Bar chart */}
                  {[35, 42, 38, 55, 48, 62, 58, 72, 68, 78, 85, 92].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-primary/60 to-primary/20" style={{ height: `${h}%` }} />
                  ))}
                  {/* Line overlay hint */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 120 64" fill="none" preserveAspectRatio="none">
                    <polyline points="5,42 15,38 25,40 35,28 45,32 55,20 65,24 75,14 85,18 95,12 105,8 115,4" stroke="#06B6D4" strokeWidth="1.5" fill="none" opacity="0.8" />
                  </svg>
                </div>
                <div className="flex justify-between mt-0.5 text-[6px] text-gray-500">
                  <span>Jan</span><span>Mar</span><span>Jun</span><span>Sep</span><span>Dec</span>
                </div>
              </div>
              {/* Funnel */}
              <div className="bg-white/5 rounded-lg p-2">
                <div className="text-[8px] text-gray-300 font-semibold mb-1">Conversion Funnel</div>
                <div className="space-y-0.5">
                  {[
                    { stage: 'Page Views', val: '24,800', pct: 100, color: 'bg-blue-400' },
                    { stage: 'Add to Cart', val: '4,960', pct: 62, color: 'bg-purple-400' },
                    { stage: 'Checkout', val: '2,480', pct: 38, color: 'bg-pink-400' },
                    { stage: 'Purchase', val: '1,247', pct: 20, color: 'bg-green-400' },
                  ].map((f) => (
                    <div key={f.stage} className="flex items-center gap-1.5">
                      <span className="text-[6px] text-gray-400 w-12 truncate">{f.stage}</span>
                      <div className="flex-1 h-2.5 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full ${f.color} rounded-full`} style={{ width: `${f.pct}%` }} />
                      </div>
                      <span className="text-[6px] text-gray-300 w-8 text-end">{f.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Right column */}
            <div className="flex-1 flex flex-col gap-1.5">
              {/* Top pages */}
              <div className="bg-white/5 rounded-lg p-2 flex-1 overflow-hidden">
                <div className="text-[8px] text-gray-300 font-semibold mb-1">Top Pages</div>
                {[
                  { page: '/pajamas', views: '8.2K', cvr: '6.1%' },
                  { page: '/gift-sets', views: '5.4K', cvr: '8.3%' },
                  { page: '/sale', views: '4.1K', cvr: '4.7%' },
                  { page: '/onesies', views: '3.8K', cvr: '5.2%' },
                  { page: '/new', views: '2.1K', cvr: '7.8%' },
                ].map((p, i) => (
                  <div key={i} className="flex items-center gap-1 py-0.5 text-[6px]">
                    <span className="text-gray-500 w-2">{i + 1}</span>
                    <span className="flex-1 text-gray-300 truncate">{p.page}</span>
                    <span className="text-gray-400">{p.views}</span>
                    <span className="text-green-400">{p.cvr}</span>
                  </div>
                ))}
              </div>
              {/* Geographic hint */}
              <div className="bg-white/5 rounded-lg p-2">
                <div className="text-[8px] text-gray-300 font-semibold mb-1">Top Locations</div>
                {[
                  { loc: 'Tel Aviv, IL', pct: 32 },
                  { loc: 'New York, US', pct: 18 },
                  { loc: 'London, UK', pct: 12 },
                ].map((g) => (
                  <div key={g.loc} className="flex items-center gap-1 mb-0.5">
                    <span className="text-[6px] text-gray-400 flex-1 truncate">{g.loc}</span>
                    <div className="w-10 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-secondary" style={{ width: `${g.pct * 3}%` }} />
                    </div>
                    <span className="text-[6px] text-gray-500">{g.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ]

  return (
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
        <div className="hero-enter inline-flex items-center gap-2.5 rounded-full border border-primary/30 bg-primary/10 px-5 py-2 text-sm font-medium text-primary mb-10 animate-glow-border">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-primary animate-pulse-ring" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          The #1 AI Website Builder
        </div>

        {/* Heading */}
        <h1 className="hero-enter hero-enter-1 text-5xl font-extrabold tracking-tight md:text-7xl lg:text-8xl max-w-5xl mx-auto leading-[1.05]">
          <span className="text-text">Build Websites That </span>
          <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer">
            Blow Minds
          </span>
          <span className="text-text"> — With AI</span>
        </h1>

        {/* Subheading */}
        <p className="hero-enter hero-enter-2 mt-8 text-lg text-text-secondary max-w-2xl mx-auto md:text-xl leading-relaxed">
          Describe your vision in plain text. Our AI generates a complete, multi-page website with stunning design,
          real images, and SEO optimization — in under 60 seconds.
        </p>

        {/* CTAs */}
        <div className="hero-enter hero-enter-3 mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
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
        <div ref={statsRef} className="hero-enter hero-enter-4 mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm">
          {counterTargets.map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xl font-bold text-text tabular-nums">{formatCounter(counters[i], i)}</span>
              <span className="text-text-muted">{counterLabels[i]}</span>
              {i < 3 && <span className="hidden sm:block ms-8 h-5 w-px bg-border" />}
            </div>
          ))}
        </div>

        {/* Interactive Platform Mockup */}
        <div className="hero-enter hero-enter-5 mt-16 rounded-2xl border border-border/60 bg-bg-secondary/80 shadow-2xl shadow-primary/10 overflow-hidden max-w-6xl mx-auto backdrop-blur-sm hover-glow transition-all duration-700" style={{ transform: `translateY(${scrollY * -0.03}px)` }}>
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
  )
}
