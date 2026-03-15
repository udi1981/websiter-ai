'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import { EditorTopBar } from '@/components/editor/EditorTopBar'
import { EditorSidebar } from '@/components/editor/EditorSidebar'
import { EditorPreview } from '@/components/editor/EditorPreview'
import { AIChatPanel } from '@/components/editor/AIChatPanel'

type PreviewMode = 'desktop' | 'tablet' | 'mobile'
type RightPanelTab = 'chat' | 'code' | 'seo' | 'gso'

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  toolCalls?: { name: string; status: 'running' | 'done' }[]
  suggestions?: string[]
}

type SiteData = {
  id: string
  name: string
  status: string
  template: string
  description: string
  url: string
}

/** Default fallback HTML when no template is found */
const fallbackHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Website</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white text-gray-900">
  <nav class="border-b px-6 py-4 flex items-center justify-between">
    <span class="text-xl font-bold">My Website</span>
    <div class="flex gap-6 text-sm">
      <a href="#" class="hover:text-indigo-600">Home</a>
      <a href="#about" class="hover:text-indigo-600">About</a>
      <a href="#contact" class="hover:text-indigo-600">Contact</a>
    </div>
  </nav>
  <section class="px-6 py-24 text-center">
    <h1 class="text-5xl font-bold mb-4">Welcome to My Website</h1>
    <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">Build something amazing with AI. Describe what you want and watch it come to life.</p>
    <button class="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700">Get Started</button>
  </section>
  <section id="about" class="px-6 py-16 bg-gray-50">
    <h2 class="text-3xl font-bold text-center mb-8">About Us</h2>
    <p class="text-gray-600 text-center max-w-2xl mx-auto">We help businesses build beautiful websites with the power of AI.</p>
  </section>
  <footer class="px-6 py-8 bg-gray-900 text-gray-400 text-center text-sm">
    <p>&copy; 2026 My Website. All rights reserved.</p>
  </footer>
</body>
</html>`

// ==========================================
// AI COMMAND PARSER — processes user messages
// and returns modified HTML + response text
// ==========================================

type AiResult = {
  html: string
  response: string
  suggestions: string[]
}

const processAiCommand = (message: string, html: string): AiResult => {
  const msg = message.toLowerCase().trim()

  // Change title/heading
  const titleMatch = msg.match(/(?:change|update|set|make)\s+(?:the\s+)?(?:hero\s+)?(?:title|heading|h1)\s+(?:to\s+)?["']?(.+?)["']?$/i)
  if (titleMatch) {
    const newTitle = titleMatch[1].trim()
    const updated = html.replace(/<h1([^>]*)>([\s\S]*?)<\/h1>/i, `<h1$1>${newTitle}</h1>`)
    if (updated !== html) {
      return {
        html: updated,
        response: `Done! I've updated the main heading to "${newTitle}".`,
        suggestions: ['Change the subtitle', 'Update the button text', 'Change colors'],
      }
    }
  }

  // Change subtitle/paragraph
  const subtitleMatch = msg.match(/(?:change|update|set)\s+(?:the\s+)?(?:subtitle|subheading|description|tagline)\s+(?:to\s+)?["']?(.+?)["']?$/i)
  if (subtitleMatch) {
    const newText = subtitleMatch[1].trim()
    // Find first p tag in hero/first section
    const updated = html.replace(/(<(?:section|div)[^>]*>\s*(?:<[^>]*>\s*)*<h1[^>]*>[\s\S]*?<\/h1>\s*<p[^>]*)>([\s\S]*?)(<\/p>)/i, `$1>${newText}$3`)
    if (updated !== html) {
      return {
        html: updated,
        response: `Updated the subtitle to "${newText}".`,
        suggestions: ['Change the heading', 'Add a CTA button', 'Update colors'],
      }
    }
  }

  // Change button text
  const buttonMatch = msg.match(/(?:change|update|set)\s+(?:the\s+)?(?:button|cta)\s+(?:text\s+)?(?:to\s+)?["']?(.+?)["']?$/i)
  if (buttonMatch) {
    const newText = buttonMatch[1].trim()
    const updated = html.replace(/<button([^>]*)>([\s\S]*?)<\/button>/i, `<button$1>${newText}</button>`)
    if (updated !== html) {
      return {
        html: updated,
        response: `Changed the button text to "${newText}".`,
        suggestions: ['Change button color', 'Add another button', 'Update the heading'],
      }
    }
  }

  // Change text X to Y
  const textReplaceMatch = msg.match(/(?:change|replace|update)\s+(?:the\s+)?(?:text\s+)?["'](.+?)["']\s+(?:to|with)\s+["'](.+?)["']/i)
  if (textReplaceMatch) {
    const oldText = textReplaceMatch[1]
    const newText = textReplaceMatch[2]
    const updated = html.replaceAll(oldText, newText)
    if (updated !== html) {
      return {
        html: updated,
        response: `Replaced "${oldText}" with "${newText}".`,
        suggestions: ['Change another text', 'Update colors', 'Add a section'],
      }
    }
  }

  // Change color
  const colorMatch = msg.match(/(?:change|update|set|make)\s+(?:the\s+)?(?:primary\s+)?(?:color|colours?|scheme)\s+(?:to\s+)?(\w+)/i)
  if (colorMatch) {
    const colorName = colorMatch[1].toLowerCase()
    const colorMap: Record<string, { from: string[]; to: string }> = {
      blue: { from: ['indigo', 'purple', 'violet'], to: 'blue' },
      red: { from: ['indigo', 'blue', 'purple', 'violet'], to: 'red' },
      green: { from: ['indigo', 'blue', 'purple', 'violet'], to: 'green' },
      purple: { from: ['indigo', 'blue', 'red'], to: 'purple' },
      indigo: { from: ['blue', 'purple', 'violet', 'red'], to: 'indigo' },
      orange: { from: ['indigo', 'blue', 'purple', 'violet'], to: 'orange' },
      pink: { from: ['indigo', 'blue', 'purple', 'violet'], to: 'pink' },
      teal: { from: ['indigo', 'blue', 'purple', 'violet'], to: 'teal' },
      amber: { from: ['indigo', 'blue', 'purple', 'violet'], to: 'amber' },
      cyan: { from: ['indigo', 'blue', 'purple', 'violet'], to: 'cyan' },
    }

    const mapping = colorMap[colorName]
    if (mapping) {
      let updated = html
      for (const fromColor of mapping.from) {
        // Replace Tailwind color classes
        const regex = new RegExp(`((?:bg|text|border|from|to|via|ring|shadow|accent|outline|decoration)-)(${fromColor})(-\\d+)`, 'g')
        updated = updated.replace(regex, `$1${mapping.to}$3`)
        // Also replace standalone
        const regex2 = new RegExp(`((?:bg|text|border|from|to|via|ring)-)(${fromColor})\\b`, 'g')
        updated = updated.replace(regex2, `$1${mapping.to}`)
      }
      if (updated !== html) {
        return {
          html: updated,
          response: `Changed the color scheme to ${colorName}. All matching colors have been updated.`,
          suggestions: ['Try a different color', 'Change the font', 'Update the layout'],
        }
      }
    }

    // Try hex color replacement
    const hexMatch = msg.match(/#[0-9a-fA-F]{6}/i)
    if (hexMatch) {
      // Find and replace a dominant color
      const hexColors = html.match(/#[0-9a-fA-F]{6}/gi) || []
      if (hexColors.length > 0) {
        // Find most common color
        const freq: Record<string, number> = {}
        for (const c of hexColors) {
          const key = c.toUpperCase()
          freq[key] = (freq[key] || 0) + 1
        }
        const dominant = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0]
        if (dominant) {
          const updated = html.replaceAll(dominant, hexMatch[0].toUpperCase()).replaceAll(dominant.toLowerCase(), hexMatch[0])
          return {
            html: updated,
            response: `Changed the primary color from ${dominant} to ${hexMatch[0]}.`,
            suggestions: ['Change another color', 'Update text', 'Add a section'],
          }
        }
      }
    }
  }

  // Remove section
  const removeMatch = msg.match(/(?:remove|delete|hide)\s+(?:the\s+)?(.+?)(?:\s+section)?$/i)
  if (removeMatch) {
    const target = removeMatch[1].toLowerCase().trim()
    let updated = html

    // Try to find section by id
    const idRegex = new RegExp(`<(?:section|div)[^>]*id=["']${target}["'][\\s\\S]*?<\\/(?:section|div)>`, 'i')
    updated = updated.replace(idRegex, '')

    // Try to find section by class
    if (updated === html) {
      const classRegex = new RegExp(`<(?:section|div)[^>]*class=["'][^"']*${target}[^"']*["'][\\s\\S]*?<\\/(?:section|div)>`, 'i')
      updated = updated.replace(classRegex, '')
    }

    // Try to find by content (e.g. "contact form" -> find form element)
    if (updated === html && target.includes('form')) {
      updated = updated.replace(/<form[\s\S]*?<\/form>/i, '')
    }

    if (updated === html && target.includes('footer')) {
      updated = updated.replace(/<footer[\s\S]*?<\/footer>/i, '')
    }

    if (updated !== html) {
      return {
        html: updated,
        response: `Removed the ${target} section from the page.`,
        suggestions: ['Add a new section', 'Update remaining content', 'Change the layout'],
      }
    }
  }

  // Add testimonials section
  if (msg.includes('testimonial')) {
    const testimonialsHtml = `
  <section class="py-20 px-6 bg-gray-50">
    <div class="max-w-6xl mx-auto">
      <h2 class="text-3xl font-bold text-center mb-4">What Our Clients Say</h2>
      <p class="text-gray-600 text-center mb-12 max-w-2xl mx-auto">Don't just take our word for it — hear from our satisfied customers.</p>
      <div class="grid md:grid-cols-3 gap-8">
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div class="flex items-center gap-1 mb-4 text-yellow-400">
            <span>&#9733;</span><span>&#9733;</span><span>&#9733;</span><span>&#9733;</span><span>&#9733;</span>
          </div>
          <p class="text-gray-600 mb-4">"Absolutely amazing service. They transformed our online presence completely."</p>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600">S</div>
            <div><p class="font-semibold text-sm">Sarah Johnson</p><p class="text-xs text-gray-500">CEO, TechStart</p></div>
          </div>
        </div>
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div class="flex items-center gap-1 mb-4 text-yellow-400">
            <span>&#9733;</span><span>&#9733;</span><span>&#9733;</span><span>&#9733;</span><span>&#9733;</span>
          </div>
          <p class="text-gray-600 mb-4">"The best investment we've made for our business. Highly recommended!"</p>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-600">M</div>
            <div><p class="font-semibold text-sm">Michael Chen</p><p class="text-xs text-gray-500">Founder, GrowthLab</p></div>
          </div>
        </div>
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div class="flex items-center gap-1 mb-4 text-yellow-400">
            <span>&#9733;</span><span>&#9733;</span><span>&#9733;</span><span>&#9733;</span><span>&#9733;</span>
          </div>
          <p class="text-gray-600 mb-4">"Professional, fast, and incredibly creative. Our website looks stunning."</p>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-600">E</div>
            <div><p class="font-semibold text-sm">Emma Wilson</p><p class="text-xs text-gray-500">Director, DesignCo</p></div>
          </div>
        </div>
      </div>
    </div>
  </section>`

    let updated = html
    if (updated.includes('</footer>')) {
      updated = updated.replace(/<footer/i, `${testimonialsHtml}\n  <footer`)
    } else if (updated.includes('</body>')) {
      updated = updated.replace('</body>', `${testimonialsHtml}\n</body>`)
    }

    return {
      html: updated,
      response: 'Added a testimonials section with 3 client reviews.',
      suggestions: ['Edit testimonial names', 'Change testimonial style', 'Add more testimonials'],
    }
  }

  // Add FAQ section
  if (msg.includes('faq') || msg.includes('frequently asked')) {
    const faqHtml = `
  <section class="py-20 px-6">
    <div class="max-w-3xl mx-auto">
      <h2 class="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
      <div class="space-y-4">
        <details class="border border-gray-200 rounded-xl p-4 group">
          <summary class="font-semibold cursor-pointer list-none flex items-center justify-between">
            What services do you offer?
            <svg class="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </summary>
          <p class="mt-3 text-gray-600">We offer a wide range of services including web design, development, SEO optimization, and digital marketing.</p>
        </details>
        <details class="border border-gray-200 rounded-xl p-4 group">
          <summary class="font-semibold cursor-pointer list-none flex items-center justify-between">
            How long does a project take?
            <svg class="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </summary>
          <p class="mt-3 text-gray-600">Most projects are completed within 2-4 weeks, depending on the scope and complexity.</p>
        </details>
        <details class="border border-gray-200 rounded-xl p-4 group">
          <summary class="font-semibold cursor-pointer list-none flex items-center justify-between">
            Do you offer ongoing support?
            <svg class="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </summary>
          <p class="mt-3 text-gray-600">Yes! We provide ongoing maintenance and support packages to keep your website running smoothly.</p>
        </details>
      </div>
    </div>
  </section>`

    let updated = html
    if (updated.includes('</footer>')) {
      updated = updated.replace(/<footer/i, `${faqHtml}\n  <footer`)
    } else if (updated.includes('</body>')) {
      updated = updated.replace('</body>', `${faqHtml}\n</body>`)
    }

    return {
      html: updated,
      response: 'Added a FAQ section with 3 common questions.',
      suggestions: ['Add more questions', 'Change FAQ style', 'Add a contact section'],
    }
  }

  // Add pricing section
  if (msg.includes('pricing') || msg.includes('price')) {
    const pricingHtml = `
  <section class="py-20 px-6 bg-gray-50">
    <div class="max-w-6xl mx-auto">
      <h2 class="text-3xl font-bold text-center mb-4">Pricing Plans</h2>
      <p class="text-gray-600 text-center mb-12">Choose the plan that fits your needs</p>
      <div class="grid md:grid-cols-3 gap-8">
        <div class="bg-white rounded-2xl p-8 border border-gray-200 text-center">
          <h3 class="text-lg font-bold mb-2">Starter</h3>
          <div class="text-4xl font-bold mb-4">$9<span class="text-lg text-gray-500 font-normal">/mo</span></div>
          <ul class="text-sm text-gray-600 space-y-3 mb-8">
            <li>1 Website</li><li>5GB Storage</li><li>Email Support</li>
          </ul>
          <button class="w-full py-3 rounded-lg border border-indigo-600 text-indigo-600 font-medium hover:bg-indigo-50 transition">Get Started</button>
        </div>
        <div class="bg-indigo-600 text-white rounded-2xl p-8 text-center shadow-xl scale-105">
          <div class="text-xs font-bold uppercase tracking-wider mb-4 bg-white/20 rounded-full py-1 px-3 inline-block">Most Popular</div>
          <h3 class="text-lg font-bold mb-2">Professional</h3>
          <div class="text-4xl font-bold mb-4">$29<span class="text-lg text-indigo-200 font-normal">/mo</span></div>
          <ul class="text-sm text-indigo-100 space-y-3 mb-8">
            <li>10 Websites</li><li>50GB Storage</li><li>Priority Support</li>
          </ul>
          <button class="w-full py-3 rounded-lg bg-white text-indigo-600 font-medium hover:bg-indigo-50 transition">Get Started</button>
        </div>
        <div class="bg-white rounded-2xl p-8 border border-gray-200 text-center">
          <h3 class="text-lg font-bold mb-2">Enterprise</h3>
          <div class="text-4xl font-bold mb-4">$99<span class="text-lg text-gray-500 font-normal">/mo</span></div>
          <ul class="text-sm text-gray-600 space-y-3 mb-8">
            <li>Unlimited Websites</li><li>500GB Storage</li><li>24/7 Support</li>
          </ul>
          <button class="w-full py-3 rounded-lg border border-indigo-600 text-indigo-600 font-medium hover:bg-indigo-50 transition">Contact Sales</button>
        </div>
      </div>
    </div>
  </section>`

    let updated = html
    if (updated.includes('</footer>')) {
      updated = updated.replace(/<footer/i, `${pricingHtml}\n  <footer`)
    } else if (updated.includes('</body>')) {
      updated = updated.replace('</body>', `${pricingHtml}\n</body>`)
    }

    return {
      html: updated,
      response: 'Added a pricing section with 3 tiers: Starter, Professional, and Enterprise.',
      suggestions: ['Edit pricing amounts', 'Change pricing style', 'Add features to plans'],
    }
  }

  // Add contact section
  if (msg.includes('contact')) {
    const contactHtml = `
  <section id="contact" class="py-20 px-6">
    <div class="max-w-2xl mx-auto">
      <h2 class="text-3xl font-bold text-center mb-4">Get in Touch</h2>
      <p class="text-gray-600 text-center mb-8">Have a question? We'd love to hear from you.</p>
      <form class="space-y-4">
        <div class="grid md:grid-cols-2 gap-4">
          <input type="text" placeholder="Your Name" class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none">
          <input type="email" placeholder="Your Email" class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none">
        </div>
        <textarea rows="4" placeholder="Your Message" class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"></textarea>
        <button type="submit" class="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition">Send Message</button>
      </form>
    </div>
  </section>`

    let updated = html
    if (updated.includes('</footer>')) {
      updated = updated.replace(/<footer/i, `${contactHtml}\n  <footer`)
    } else if (updated.includes('</body>')) {
      updated = updated.replace('</body>', `${contactHtml}\n</body>`)
    }

    return {
      html: updated,
      response: 'Added a contact section with a form for name, email, and message.',
      suggestions: ['Add phone number', 'Add map embed', 'Change form style'],
    }
  }

  // Add newsletter section
  if (msg.includes('newsletter') || msg.includes('subscribe') || msg.includes('email signup')) {
    const newsletterHtml = `
  <section class="py-16 px-6 bg-indigo-600 text-white">
    <div class="max-w-2xl mx-auto text-center">
      <h2 class="text-3xl font-bold mb-4">Stay Updated</h2>
      <p class="text-indigo-100 mb-8">Subscribe to our newsletter for the latest news and updates.</p>
      <div class="flex gap-3 max-w-md mx-auto">
        <input type="email" placeholder="Enter your email" class="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white">
        <button class="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition">Subscribe</button>
      </div>
    </div>
  </section>`

    let updated = html
    if (updated.includes('</footer>')) {
      updated = updated.replace(/<footer/i, `${newsletterHtml}\n  <footer`)
    } else if (updated.includes('</body>')) {
      updated = updated.replace('</body>', `${newsletterHtml}\n</body>`)
    }

    return {
      html: updated,
      response: 'Added a newsletter subscription section.',
      suggestions: ['Change newsletter color', 'Add social links', 'Update CTA text'],
    }
  }

  // Change background to dark
  if (msg.includes('dark') && (msg.includes('mode') || msg.includes('theme') || msg.includes('background') || msg.includes('scheme'))) {
    let updated = html
    updated = updated.replace(/bg-white/g, 'bg-gray-900')
    updated = updated.replace(/bg-gray-50/g, 'bg-gray-800')
    updated = updated.replace(/bg-gray-100/g, 'bg-gray-700')
    updated = updated.replace(/text-gray-900/g, 'text-white')
    updated = updated.replace(/text-gray-800/g, 'text-gray-100')
    updated = updated.replace(/text-gray-700/g, 'text-gray-200')
    updated = updated.replace(/text-gray-600/g, 'text-gray-300')
    updated = updated.replace(/text-gray-500/g, 'text-gray-400')
    updated = updated.replace(/border-gray-100/g, 'border-gray-700')
    updated = updated.replace(/border-gray-200/g, 'border-gray-600')
    updated = updated.replace(/border-gray-300/g, 'border-gray-600')

    if (updated !== html) {
      return {
        html: updated,
        response: 'Switched to a dark theme. Background, text, and border colors have been updated.',
        suggestions: ['Switch to light mode', 'Adjust accent colors', 'Change font'],
      }
    }
  }

  // Change background to light
  if (msg.includes('light') && (msg.includes('mode') || msg.includes('theme') || msg.includes('background'))) {
    let updated = html
    updated = updated.replace(/bg-gray-900(?![\d])/g, 'bg-white')
    updated = updated.replace(/bg-gray-800/g, 'bg-gray-50')
    updated = updated.replace(/bg-gray-700/g, 'bg-gray-100')
    updated = updated.replace(/text-white(?![\s\S]*<\/footer)/g, 'text-gray-900')
    updated = updated.replace(/text-gray-100/g, 'text-gray-800')
    updated = updated.replace(/text-gray-200/g, 'text-gray-700')
    updated = updated.replace(/text-gray-300/g, 'text-gray-600')
    updated = updated.replace(/text-gray-400(?![\s\S]*<\/footer)/g, 'text-gray-500')

    if (updated !== html) {
      return {
        html: updated,
        response: 'Switched to a light theme.',
        suggestions: ['Switch to dark mode', 'Adjust accent colors', 'Change font'],
      }
    }
  }

  // Change font
  if (msg.includes('font') || msg.includes('typography')) {
    const fontMap: Record<string, string> = {
      serif: 'Georgia, serif',
      'sans-serif': "'Inter', sans-serif",
      mono: "'JetBrains Mono', monospace",
      modern: "'Poppins', sans-serif",
      elegant: "'Playfair Display', serif",
      playful: "'Comic Sans MS', cursive",
    }

    for (const [name, value] of Object.entries(fontMap)) {
      if (msg.includes(name)) {
        let updated = html
        if (updated.includes('<style>')) {
          updated = updated.replace('</style>', `  body { font-family: ${value}; }\n</style>`)
        } else {
          updated = updated.replace('</head>', `  <style>body { font-family: ${value}; }</style>\n</head>`)
        }
        return {
          html: updated,
          response: `Changed the font to ${name} (${value}).`,
          suggestions: ['Try a different font', 'Change heading size', 'Update colors'],
        }
      }
    }
  }

  // Change image / background image
  if (msg.includes('image') || msg.includes('photo') || msg.includes('picture')) {
    const urlMatch = msg.match(/https?:\/\/[^\s"']+/i)
    if (urlMatch) {
      const newUrl = urlMatch[0]
      // Replace first img src or background-image
      let updated = html.replace(/(src=["'])[^"']+(["'])/, `$1${newUrl}$2`)
      if (updated === html) {
        updated = html.replace(/(background-image:\s*url\(["']?)[^"')]+(['"']?\))/, `$1${newUrl}$2`)
      }
      if (updated !== html) {
        return {
          html: updated,
          response: `Updated the image URL.`,
          suggestions: ['Change another image', 'Add image alt text', 'Resize image section'],
        }
      }
    }
  }

  // Generic text change: "change X to Y"
  const genericChange = msg.match(/(?:change|replace|update)\s+["']?(.+?)["']?\s+(?:to|with)\s+["']?(.+?)["']?$/i)
  if (genericChange) {
    const oldText = genericChange[1].trim()
    const newText = genericChange[2].trim()
    if (html.includes(oldText)) {
      const updated = html.replaceAll(oldText, newText)
      return {
        html: updated,
        response: `Changed "${oldText}" to "${newText}".`,
        suggestions: ['Make another change', 'Update colors', 'Add a section'],
      }
    }
  }

  // Add section (generic)
  if (msg.includes('add') && msg.includes('section')) {
    return {
      html,
      response: "What kind of section would you like to add? I can add testimonials, FAQ, pricing, contact form, newsletter, gallery, team, or a custom section.",
      suggestions: ['Add testimonials', 'Add FAQ section', 'Add pricing section', 'Add contact form'],
    }
  }

  // Fallback — try a simple text search and replace within HTML tags
  return {
    html,
    response: `I understand you want to "${message}". Try being more specific, for example:\n- "Change the title to [new title]"\n- "Change the color to blue"\n- "Add a testimonials section"\n- "Remove the contact form"\n- "Change 'old text' to 'new text'"`,
    suggestions: ['Change the heading', 'Update colors', 'Add a section', 'Remove a section'],
  }
}

// ==========================================
// MAIN EDITOR PAGE COMPONENT
// ==========================================

const EditorPage = ({ params }: { params: Promise<{ siteId: string }> }) => {
  const { siteId } = use(params)
  const router = useRouter()

  const [siteData, setSiteData] = useState<SiteData | null>(null)
  const [htmlContent, setHtmlContent] = useState('')
  const [loading, setLoading] = useState(true)

  // History for undo/redo
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // UI state
  const [sidebarExpanded, setSidebarExpanded] = useState(true)
  const [rightPanel, setRightPanel] = useState<RightPanelTab>('chat')
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop')
  const [selectMode, setSelectMode] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [version, setVersion] = useState(1)
  const [publishDialogOpen, setPublishDialogOpen] = useState(false)

  // Load site data from localStorage
  useEffect(() => {
    const sites = JSON.parse(localStorage.getItem('ubuilder_sites') || '[]')
    const site = sites.find((s: SiteData) => s.id === siteId)

    if (!site) {
      router.push('/dashboard')
      return
    }

    setSiteData(site)

    // Check if we have saved HTML content for this site
    const savedHtml = localStorage.getItem(`ubuilder_html_${siteId}`)
    if (savedHtml) {
      setHtmlContent(savedHtml)
      setHistory([savedHtml])
      setHistoryIndex(0)
      setLoading(false)
    } else {
      // Load template HTML
      const templateType = site.template || 'business'
      const validTemplates = ['restaurant', 'saas', 'ecommerce', 'portfolio', 'business', 'blog', 'dental', 'yoga', 'law', 'realestate', 'fitness', 'photography']
      const templatePath = validTemplates.includes(templateType)
        ? `/templates/${templateType}/index.html`
        : `/templates/business/index.html`

      fetch(templatePath)
        .then((res) => {
          if (!res.ok) throw new Error('Template not found')
          return res.text()
        })
        .then((html) => {
          setHtmlContent(html)
          setHistory([html])
          setHistoryIndex(0)
          localStorage.setItem(`ubuilder_html_${siteId}`, html)
          setLoading(false)
        })
        .catch(() => {
          // Use fallback HTML
          setHtmlContent(fallbackHtml)
          setHistory([fallbackHtml])
          setHistoryIndex(0)
          localStorage.setItem(`ubuilder_html_${siteId}`, fallbackHtml)
          setLoading(false)
        })
    }

    // Load saved version
    const savedVersion = localStorage.getItem(`ubuilder_version_${siteId}`)
    if (savedVersion) setVersion(parseInt(savedVersion, 10))

    // Load saved chat
    const savedChat = localStorage.getItem(`ubuilder_chat_${siteId}`)
    if (savedChat) setChatMessages(JSON.parse(savedChat))
  }, [siteId, router])

  // Push new HTML state to history
  const pushHtmlState = useCallback(
    (newHtml: string) => {
      setHtmlContent(newHtml)

      // Truncate future history if we're not at the end
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push(newHtml)

      // Keep max 50 states
      if (newHistory.length > 50) newHistory.shift()

      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)

      // Save to localStorage
      localStorage.setItem(`ubuilder_html_${siteId}`, newHtml)
    },
    [history, historyIndex, siteId]
  )

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      const prevHtml = history[newIndex]
      setHtmlContent(prevHtml)
      localStorage.setItem(`ubuilder_html_${siteId}`, prevHtml)
    }
  }, [history, historyIndex, siteId])

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      const nextHtml = history[newIndex]
      setHtmlContent(nextHtml)
      localStorage.setItem(`ubuilder_html_${siteId}`, nextHtml)
    }
  }, [history, historyIndex, siteId])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        if (e.shiftKey) {
          handleRedo()
        } else {
          handleUndo()
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleUndo, handleRedo])

  const handleHtmlChange = useCallback(
    (newHtml: string) => {
      pushHtmlState(newHtml)
      setVersion((v) => {
        const newV = v + 1
        localStorage.setItem(`ubuilder_version_${siteId}`, String(newV))
        return newV
      })
    },
    [pushHtmlState, siteId]
  )

  const handleSendMessage = useCallback(
    (message: string) => {
      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: message,
      }
      setChatMessages((prev) => [...prev, userMsg])
      setIsGenerating(true)

      // Process the command after a brief delay for visual effect
      setTimeout(() => {
        const result = processAiCommand(message, htmlContent)

        if (result.html !== htmlContent) {
          handleHtmlChange(result.html)
        }

        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: result.response,
          toolCalls:
            result.html !== htmlContent
              ? [
                  { name: 'Analyzing request', status: 'done' as const },
                  { name: 'File Modified', status: 'done' as const },
                ]
              : undefined,
          suggestions: result.suggestions,
        }

        setChatMessages((prev) => {
          const updated = [...prev, assistantMsg]
          localStorage.setItem(`ubuilder_chat_${siteId}`, JSON.stringify(updated))
          return updated
        })
        setIsGenerating(false)
      }, 800)
    },
    [htmlContent, handleHtmlChange, siteId]
  )

  const handleSiteNameChange = useCallback(
    (newName: string) => {
      if (!siteData) return
      const updated = { ...siteData, name: newName }
      setSiteData(updated)

      // Update in localStorage
      const sites = JSON.parse(localStorage.getItem('ubuilder_sites') || '[]')
      const idx = sites.findIndex((s: SiteData) => s.id === siteId)
      if (idx >= 0) {
        sites[idx].name = newName
        localStorage.setItem('ubuilder_sites', JSON.stringify(sites))
      }
    },
    [siteData, siteId]
  )

  const handlePreview = useCallback(() => {
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
  }, [htmlContent])

  const handlePublish = useCallback(() => {
    setPublishDialogOpen(true)
    // Update site status
    if (siteData) {
      const sites = JSON.parse(localStorage.getItem('ubuilder_sites') || '[]')
      const idx = sites.findIndex((s: SiteData) => s.id === siteId)
      if (idx >= 0) {
        sites[idx].status = 'published'
        sites[idx].lastEdited = new Date().toLocaleDateString()
        localStorage.setItem('ubuilder_sites', JSON.stringify(sites))
      }
    }
  }, [siteData, siteId])

  const handleElementSelected = useCallback(
    (info: { tag: string; text: string; classList: string }) => {
      setSelectMode(false)
      const desc = info.text.trim().slice(0, 60)
      const contextMsg = `I selected a <${info.tag}> element${desc ? ` with text "${desc}"` : ''}. What would you like to change about it?`
      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: contextMsg,
          suggestions: [
            `Change this text`,
            `Change its color`,
            `Remove this element`,
          ],
        },
      ])
      setRightPanel('chat')
    },
    []
  )

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg">
        <div className="flex flex-col items-center gap-4">
          <svg className="h-10 w-10 animate-spin text-primary" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-text-muted">Loading editor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col">
      <EditorTopBar
        siteName={siteData?.name || 'Untitled'}
        previewMode={previewMode}
        onPreviewModeChange={setPreviewMode}
        onPublish={handlePublish}
        onPreview={handlePreview}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onSiteNameChange={handleSiteNameChange}
        version={version}
      />

      <div className="flex flex-1 overflow-hidden">
        <EditorSidebar
          expanded={sidebarExpanded}
          onToggle={() => setSidebarExpanded((prev) => !prev)}
          htmlContent={htmlContent}
          onHtmlChange={handleHtmlChange}
          siteName={siteData?.name || ''}
          onSiteNameChange={handleSiteNameChange}
        />

        <EditorPreview
          previewMode={previewMode}
          htmlContent={htmlContent}
          selectMode={selectMode}
          onElementSelected={handleElementSelected}
        />

        <AIChatPanel
          activeTab={rightPanel}
          onTabChange={setRightPanel}
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          isGenerating={isGenerating}
          htmlContent={htmlContent}
          onHtmlChange={handleHtmlChange}
          version={version}
        />
      </div>

      {/* Select Mode Toggle (floating) */}
      <button
        onClick={() => setSelectMode((prev) => !prev)}
        className={`fixed bottom-6 start-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium shadow-xl transition-all ${
          selectMode
            ? 'bg-primary text-white shadow-primary/30'
            : 'bg-bg-secondary text-text border border-border hover:border-primary'
        }`}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
        </svg>
        {selectMode ? 'Click an element to select it' : 'Select to Edit'}
      </button>

      {/* Publish Dialog */}
      {publishDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-bg border border-border p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/20">
                <svg className="h-5 w-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-text">Site Published!</h3>
                <p className="text-xs text-text-muted">Your site is now live</p>
              </div>
            </div>
            <div className="rounded-lg bg-bg-tertiary px-3 py-2 mb-4">
              <p className="text-xs text-text-muted mb-1">Your site URL</p>
              <p className="text-sm font-medium text-primary">{siteData?.url || 'your-site.ubuilder.co'}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPublishDialogOpen(false)}
                className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium text-text hover:bg-bg-secondary transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`https://${siteData?.url || 'your-site.ubuilder.co'}`)
                  setPublishDialogOpen(false)
                }}
                className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
              >
                Copy URL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EditorPage
