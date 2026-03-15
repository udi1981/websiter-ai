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

  // Add gallery section
  if (msg.includes('gallery') || msg.includes('גלריה') || msg.includes('portfolio')) {
    const galleryHtml = `
  <section class="py-20 px-6">
    <div class="max-w-6xl mx-auto">
      <h2 class="text-3xl font-bold text-center mb-4">Our Gallery</h2>
      <p class="text-gray-600 text-center mb-12 max-w-2xl mx-auto">A showcase of our finest work and achievements.</p>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        ${['photo-1497366216548-37526070297c', 'photo-1497366811353-6870744d04b2', 'photo-1542744094-3a31f272c490', 'photo-1460925895917-afdab827c52f', 'photo-1504384308090-c894fdcc538d', 'photo-1519389950473-47ba0277781c']
          .map(id => `<div class="relative aspect-[4/3] rounded-xl overflow-hidden group"><img src="https://images.unsplash.com/${id}?w=400&q=80" alt="Gallery" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"><div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors"></div></div>`)
          .join('\n        ')}
      </div>
    </div>
  </section>`
    return insertBeforeFooter(html, galleryHtml, 'Added a gallery section with 6 images.', ['Add more images', 'Change gallery layout', 'Add image captions'])
  }

  // Add team section
  if (msg.includes('team') || msg.includes('צוות') || msg.includes('staff') || msg.includes('people')) {
    const teamHtml = `
  <section class="py-20 px-6 bg-gray-50">
    <div class="max-w-6xl mx-auto">
      <h2 class="text-3xl font-bold text-center mb-4">Meet Our Team</h2>
      <p class="text-gray-600 text-center mb-12 max-w-2xl mx-auto">The talented people behind our success.</p>
      <div class="grid md:grid-cols-4 gap-8">
        ${[
          { name: 'Alex Rivera', role: 'CEO & Founder', color: 'indigo' },
          { name: 'Maya Chen', role: 'Design Lead', color: 'purple' },
          { name: 'James Wilson', role: 'Tech Lead', color: 'blue' },
          { name: 'Sophie Martin', role: 'Marketing', color: 'green' },
        ].map(p => `<div class="text-center"><div class="w-24 h-24 rounded-full bg-${p.color}-100 flex items-center justify-center mx-auto mb-4"><span class="text-2xl font-bold text-${p.color}-600">${p.name[0]}</span></div><h3 class="font-bold">${p.name}</h3><p class="text-sm text-gray-500">${p.role}</p></div>`).join('\n        ')}
      </div>
    </div>
  </section>`
    return insertBeforeFooter(html, teamHtml, 'Added a team section with 4 members.', ['Edit team members', 'Add photos', 'Change layout'])
  }

  // Add stats/numbers section
  if (msg.includes('stats') || msg.includes('numbers') || msg.includes('counter') || msg.includes('מספרים') || msg.includes('סטטיסטיקות')) {
    const statsHtml = `
  <section class="py-16 px-6 bg-indigo-600 text-white">
    <div class="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
      <div><div class="text-4xl font-bold mb-2">500+</div><div class="text-indigo-200 text-sm">Happy Clients</div></div>
      <div><div class="text-4xl font-bold mb-2">1,200</div><div class="text-indigo-200 text-sm">Projects Done</div></div>
      <div><div class="text-4xl font-bold mb-2">15+</div><div class="text-indigo-200 text-sm">Years Experience</div></div>
      <div><div class="text-4xl font-bold mb-2">99%</div><div class="text-indigo-200 text-sm">Satisfaction</div></div>
    </div>
  </section>`
    return insertBeforeFooter(html, statsHtml, 'Added a stats section with 4 key metrics.', ['Edit numbers', 'Change stats colors', 'Add more metrics'])
  }

  // Add about section
  if (msg.includes('about') || msg.includes('אודות') || msg.includes('who we are')) {
    const aboutHtml = `
  <section id="about" class="py-20 px-6">
    <div class="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
      <div>
        <h2 class="text-3xl font-bold mb-6">About Us</h2>
        <p class="text-gray-600 mb-4">We are a passionate team dedicated to delivering exceptional results. With years of experience and a commitment to innovation, we help businesses thrive in the digital age.</p>
        <p class="text-gray-600 mb-6">Our mission is to make powerful technology accessible to everyone, empowering businesses of all sizes to succeed online.</p>
        <div class="flex gap-4">
          <div class="text-center"><div class="text-2xl font-bold text-indigo-600">10+</div><div class="text-xs text-gray-500">Years</div></div>
          <div class="text-center"><div class="text-2xl font-bold text-indigo-600">500+</div><div class="text-xs text-gray-500">Clients</div></div>
          <div class="text-center"><div class="text-2xl font-bold text-indigo-600">50+</div><div class="text-xs text-gray-500">Team</div></div>
        </div>
      </div>
      <div class="rounded-2xl overflow-hidden shadow-xl"><img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80" alt="About us" class="w-full h-full object-cover"></div>
    </div>
  </section>`
    return insertBeforeFooter(html, aboutHtml, 'Added an About Us section with text and image.', ['Edit about content', 'Change about image', 'Add team section'])
  }

  // Add CTA (call to action) section
  if (msg.includes('cta') || msg.includes('call to action') || msg.includes('קריאה לפעולה')) {
    const ctaHtml = `
  <section class="py-20 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center">
    <div class="max-w-3xl mx-auto">
      <h2 class="text-4xl font-bold mb-4">Ready to Get Started?</h2>
      <p class="text-lg text-indigo-100 mb-8">Join thousands of satisfied customers and take your business to the next level.</p>
      <div class="flex gap-4 justify-center">
        <button class="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition">Get Started Free</button>
        <button class="border border-white/30 px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition">Learn More</button>
      </div>
    </div>
  </section>`
    return insertBeforeFooter(html, ctaHtml, 'Added a call-to-action section with gradient background.', ['Edit CTA text', 'Change CTA colors', 'Add another CTA'])
  }

  // ---------------------------------------------------------------------------
  // Motion commands
  // ---------------------------------------------------------------------------

  // More animations / יותר אנימציות
  if (msg.match(/(?:more|increase|upgrade|add)\s*(?:animation|motion|movement)/i) || msg.includes('יותר אנימציות') || msg.includes('יותר תנועה')) {
    const motionLevels: string[] = ['none', 'subtle', 'premium', 'dynamic', 'cinematic', 'storytelling']
    // Detect current level from HTML comment
    const currentMatch = html.match(/data-motion-preset="(\w+)"/)
    const current = currentMatch?.[1] ?? 'subtle'
    const idx = motionLevels.indexOf(current)
    const next = motionLevels[Math.min(idx + 1, motionLevels.length - 1)]
    if (next !== current) {
      let updated = html.replace(/data-motion-preset="\w+"/, `data-motion-preset="${next}"`)
      // Also update CSS custom properties for distance
      const distances: Record<string, number> = { none: 0, subtle: 20, premium: 30, dynamic: 40, cinematic: 50, storytelling: 60 }
      const durations: Record<string, number> = { none: 0, subtle: 600, premium: 800, dynamic: 600, cinematic: 1000, storytelling: 1200 }
      updated = updated.replace(/--motion-distance:\s*\d+px/g, `--motion-distance: ${distances[next]}px`)
      updated = updated.replace(/--motion-duration:\s*\d+ms/g, `--motion-duration: ${durations[next]}ms`)
      return {
        html: updated,
        response: `Upgraded motion from "${current}" to "${next}". Animations are now more pronounced.`,
        suggestions: ['Reduce animations', 'Set motion to cinematic', 'Remove all animations'],
      }
    }
    return { html, response: 'Motion is already at maximum level (storytelling).', suggestions: ['Reduce animations', 'Remove all animations'] }
  }

  // Reduce / less animations / פחות אנימציות
  if (msg.match(/(?:less|reduce|decrease|downgrade|fewer)\s*(?:animation|motion|movement)/i) || msg.includes('פחות אנימציות') || msg.includes('פחות תנועה')) {
    const motionLevels: string[] = ['none', 'subtle', 'premium', 'dynamic', 'cinematic', 'storytelling']
    const currentMatch = html.match(/data-motion-preset="(\w+)"/)
    const current = currentMatch?.[1] ?? 'subtle'
    const idx = motionLevels.indexOf(current)
    const prev = motionLevels[Math.max(idx - 1, 0)]
    if (prev !== current) {
      let updated = html.replace(/data-motion-preset="\w+"/, `data-motion-preset="${prev}"`)
      const distances: Record<string, number> = { none: 0, subtle: 20, premium: 30, dynamic: 40, cinematic: 50, storytelling: 60 }
      const durations: Record<string, number> = { none: 0, subtle: 600, premium: 800, dynamic: 600, cinematic: 1000, storytelling: 1200 }
      updated = updated.replace(/--motion-distance:\s*\d+px/g, `--motion-distance: ${distances[prev]}px`)
      updated = updated.replace(/--motion-duration:\s*\d+ms/g, `--motion-duration: ${durations[prev]}ms`)
      return {
        html: updated,
        response: `Reduced motion from "${current}" to "${prev}". Animations are now calmer.`,
        suggestions: ['More animations', 'Remove all animations', 'Set motion to premium'],
      }
    }
    return { html, response: 'Motion is already at minimum level (none).', suggestions: ['Add animations', 'Set motion to subtle'] }
  }

  // Set motion to specific preset
  const motionSetMatch = msg.match(/(?:set|change|switch)\s+(?:the\s+)?(?:motion|animation)\s+(?:to\s+)?(\w+)/i) ||
    msg.match(/(?:make\s+it|go)\s+(subtle|premium|dynamic|cinematic|storytelling)/i) ||
    msg.match(/סגנון\s+(?:אנימציה|תנועה)\s+(\S+)/i)
  if (motionSetMatch) {
    const target = motionSetMatch[1].toLowerCase()
    const validPresets = ['none', 'subtle', 'premium', 'dynamic', 'cinematic', 'storytelling']
    if (validPresets.includes(target)) {
      let updated = html.replace(/data-motion-preset="\w+"/, `data-motion-preset="${target}"`)
      const distances: Record<string, number> = { none: 0, subtle: 20, premium: 30, dynamic: 40, cinematic: 50, storytelling: 60 }
      const durations: Record<string, number> = { none: 0, subtle: 600, premium: 800, dynamic: 600, cinematic: 1000, storytelling: 1200 }
      updated = updated.replace(/--motion-distance:\s*\d+px/g, `--motion-distance: ${distances[target]}px`)
      updated = updated.replace(/--motion-duration:\s*\d+ms/g, `--motion-duration: ${durations[target]}ms`)
      return {
        html: updated,
        response: `Set motion preset to "${target}".`,
        suggestions: ['More animations', 'Less animations', 'Remove all animations'],
      }
    }
  }

  // Remove all animations / הסר אנימציות
  if ((msg.includes('remove') || msg.includes('disable') || msg.includes('הסר') || msg.includes('בטל')) &&
      (msg.includes('animation') || msg.includes('motion') || msg.includes('אנימציות') || msg.includes('תנועה'))) {
    let updated = html.replace(/data-motion-preset="\w+"/, 'data-motion-preset="none"')
    updated = updated.replace(/--motion-distance:\s*\d+px/g, '--motion-distance: 0px')
    updated = updated.replace(/--motion-duration:\s*\d+ms/g, '--motion-duration: 0ms')
    // Remove parallax
    updated = updated.replace(/data-parallax-speed="[^"]*"/g, '')
    return {
      html: updated,
      response: 'Removed all animations. The site is now static.',
      suggestions: ['Add subtle animations', 'Set motion to premium', 'Set motion to cinematic'],
    }
  }

  // Add parallax / הוסף פרלקס
  if (msg.includes('parallax') || msg.includes('פרלקס')) {
    let updated = html
    // Add parallax to hero background images
    updated = updated.replace(
      /(<(?:section|div)[^>]*class="[^"]*hero[^"]*"[^>]*)>/i,
      '$1 data-parallax-speed="0.05">'
    )
    return {
      html: updated,
      response: 'Added parallax scrolling effect to the hero section.',
      suggestions: ['Remove parallax', 'More animations', 'Set motion to cinematic'],
    }
  }

  // Animate stats / counters
  if (msg.match(/animate\s+(?:the\s+)?(?:stats|numbers|counters)/i) || msg.includes('הנפש מספרים') || msg.includes('אנימציית מספרים')) {
    let updated = html
    // Find stat numbers and wrap with counter animation
    updated = updated.replace(
      /(<(?:p|span|div)[^>]*class="[^"]*(?:text-4xl|text-5xl|font-bold)[^"]*"[^>]*>)\s*(\d[\d,]*)\s*(<\/(?:p|span|div)>)/gi,
      (match, open, num, close) => {
        const cleanNum = num.replace(/,/g, '')
        return `${open.replace('>', ` data-count-target="${cleanNum}">`)}0${close}`
      }
    )
    if (updated !== html) {
      return {
        html: updated,
        response: 'Added counting animation to stat numbers. They will animate when scrolled into view.',
        suggestions: ['More animations', 'Add parallax', 'Change animation speed'],
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Media commands
  // ---------------------------------------------------------------------------

  // Change hero image / שנה תמונת הירו
  if (msg.match(/(?:change|update|replace|new)\s+(?:the\s+)?hero\s+(?:image|photo|picture|background)/i) ||
      msg.includes('שנה תמונת הירו') || msg.includes('שנה תמונה ראשית')) {
    let updated = html
    // Replace hero background image with a different one
    const heroPhotoIds = [
      '1497366216548-37526070297c', '1497366811353-6870744d04b2', '1504384308090-c894fdcc538d',
      '1519389950473-47ba0277781c', '1460925895917-afdab827c52f', '1522071820081-009f0129c71c',
    ]
    const currentImgMatch = html.match(/hero[\s\S]*?unsplash\.com\/photo-(\d+-[a-f0-9]+)/i)
    const currentId = currentImgMatch?.[1]
    const newId = heroPhotoIds.find(id => id !== currentId) ?? heroPhotoIds[0]
    // Replace hero section background or img
    updated = updated.replace(
      /(unsplash\.com\/photo-)\d+-[a-f0-9]+/i,
      `$1${newId}`
    )
    if (updated !== html) {
      return {
        html: updated,
        response: 'Changed the hero image to a new photo.',
        suggestions: ['Change hero image again', 'Make images warmer', 'Change image style'],
      }
    }
  }

  // Make images more professional / warmer / lifestyle
  const imageStyleMatch = msg.match(/(?:make|set|change)\s+(?:the\s+)?(?:images?|photos?)\s+(?:more\s+)?(\w+)/i) ||
    msg.match(/סגנון\s+תמונות\s+(\S+)/i)
  if (imageStyleMatch) {
    const style = imageStyleMatch[1].toLowerCase()
    const styleResponses: Record<string, string> = {
      professional: 'Images now have a more professional, corporate feel.',
      warm: 'Images now have warmer, more inviting tones.',
      lifestyle: 'Images now have a casual, lifestyle photography feel.',
      minimal: 'Images now have a clean, minimal aesthetic.',
      energetic: 'Images now have a vibrant, energetic feel.',
    }
    if (styleResponses[style]) {
      // Adjust image brightness/contrast via CSS filter
      let updated = html
      const filterMap: Record<string, string> = {
        professional: 'brightness(1.05) contrast(1.1) saturate(0.9)',
        warm: 'brightness(1.05) saturate(1.2) sepia(0.15)',
        lifestyle: 'brightness(1.1) contrast(0.95) saturate(1.1)',
        minimal: 'brightness(1.1) contrast(0.9) saturate(0.7)',
        energetic: 'brightness(1.1) contrast(1.15) saturate(1.3)',
      }
      const filter = filterMap[style]
      if (filter) {
        // Add or update image filter style
        if (updated.includes('img-style-filter')) {
          updated = updated.replace(/\.img-style-filter\s*\{[^}]*\}/, `.img-style-filter { filter: ${filter}; }`)
        } else {
          updated = updated.replace('</style>', `  .img-style-filter { filter: ${filter}; }\n</style>`)
          updated = updated.replace(/<img(?![^>]*img-style-filter)/g, '<img class="img-style-filter" ')
        }
      }
      return {
        html: updated,
        response: styleResponses[style],
        suggestions: ['Change hero image', 'Regenerate all images', 'Change image style'],
      }
    }
  }

  // Regenerate all images / שנה את כל התמונות
  if (msg.match(/(?:regenerate|refresh|replace|change)\s+(?:all\s+)?(?:the\s+)?images/i) ||
      msg.includes('שנה את כל התמונות') || msg.includes('רענן תמונות')) {
    let updated = html
    // Shift all Unsplash photo IDs by replacing with different curated photos
    const replacements: [RegExp, string][] = [
      [/photo-1497366216548-37526070297c/g, 'photo-1504384308090-c894fdcc538d'],
      [/photo-1497366811353-6870744d04b2/g, 'photo-1519389950473-47ba0277781c'],
      [/photo-1542744094-3a31f272c490/g, 'photo-1522071820081-009f0129c71c'],
      [/photo-1460925895917-afdab827c52f/g, 'photo-1553877522-43269d4ea984'],
      [/photo-1504384308090-c894fdcc538d/g, 'photo-1497366216548-37526070297c'],
    ]
    for (const [pattern, replacement] of replacements) {
      updated = updated.replace(pattern, replacement)
    }
    if (updated !== html) {
      return {
        html: updated,
        response: 'Regenerated all images with new curated photos.',
        suggestions: ['Change hero image', 'Make images warmer', 'Change image style to lifestyle'],
      }
    }
    return {
      html,
      response: 'No Unsplash images found to regenerate. Try adding images first.',
      suggestions: ['Add gallery', 'Add about section with image', 'Add team section'],
    }
  }

  // Make it modern / professional / minimal
  if (msg.includes('modern') || msg.includes('professional') || msg.includes('מודרני') || msg.includes('מקצועי')) {
    let updated = html
    // Add modern design tweaks
    updated = updated.replace(/rounded-lg/g, 'rounded-2xl')
    updated = updated.replace(/rounded-md/g, 'rounded-xl')
    updated = updated.replace(/shadow-sm/g, 'shadow-lg')
    updated = updated.replace(/shadow-md/g, 'shadow-xl')
    // Add subtle transitions (motion-reveal system)
    if (!updated.includes('.motion-reveal')) {
      updated = updated.replace('</style>', `  .motion-reveal { opacity: 0; transform: translateY(20px); transition: all 0.6s ease; }\n  .motion-reveal.visible { opacity: 1; transform: translateY(0); }\n</style>`)
    }
    if (updated !== html) {
      return {
        html: updated,
        response: 'Applied modern design improvements: larger border radius, enhanced shadows, and smooth animations.',
        suggestions: ['Add animations', 'Change color scheme', 'Switch to dark mode'],
      }
    }
  }

  // Make it minimal / clean
  if (msg.includes('minimal') || msg.includes('clean') || msg.includes('simple') || msg.includes('מינימליסטי')) {
    let updated = html
    updated = updated.replace(/shadow-xl/g, 'shadow-sm')
    updated = updated.replace(/shadow-lg/g, 'shadow-sm')
    updated = updated.replace(/shadow-2xl/g, 'shadow-sm')
    updated = updated.replace(/rounded-2xl/g, 'rounded-lg')
    updated = updated.replace(/rounded-3xl/g, 'rounded-lg')
    updated = updated.replace(/bg-gradient-to-r\s+from-\w+-\d+\s+to-\w+-\d+/g, 'bg-gray-900')
    if (updated !== html) {
      return {
        html: updated,
        response: 'Applied minimal/clean design: reduced shadows, smaller corners, simplified gradients.',
        suggestions: ['Change colors', 'Add subtle animations', 'Update typography'],
      }
    }
  }

  // Hebrew commands - general text changes
  if (msg.includes('שנה') || msg.includes('עדכן') || msg.includes('הוסף') || msg.includes('הסר') || msg.includes('מחק')) {
    const hebrewActions: Record<string, string> = {
      'שנה': 'change', 'עדכן': 'update', 'הוסף': 'add', 'הסר': 'remove', 'מחק': 'delete',
    }
    const action = Object.entries(hebrewActions).find(([k]) => msg.includes(k))?.[1] ?? 'change'
    return {
      html,
      response: `I understand you want to ${action} something. Try in English or be more specific, for example:\n- "Change the title to [new title]"\n- "Add testimonials"\n- "Change color to blue"\n- "הוסף גלריה" (Add gallery)`,
      suggestions: ['הוסף המלצות', 'שנה צבע', 'הוסף צוות', 'מצב כהה'],
    }
  }

  // Add section (generic)
  if (msg.includes('add') && msg.includes('section')) {
    return {
      html,
      response: "What kind of section would you like to add? I can add testimonials, FAQ, pricing, contact, newsletter, gallery, team, stats, about, or CTA.",
      suggestions: ['Add testimonials', 'Add FAQ', 'Add pricing', 'Add gallery', 'Add team', 'Add stats'],
    }
  }

  // Fallback
  return {
    html,
    response: `I understand you want to "${message}". Try being more specific, for example:\n- "Change the title to [new title]"\n- "Change the color to blue"\n- "Add a testimonials section"\n- "Add gallery" / "Add team" / "Add stats"\n- "Make it modern" / "Switch to dark mode"\n- "Remove the contact form"\n- "Change 'old text' to 'new text'"`,
    suggestions: ['Change the heading', 'Update colors', 'Add a section', 'Make it modern'],
  }
}

/** Helper to insert HTML before footer or before </body> */
const insertBeforeFooter = (html: string, sectionHtml: string, response: string, suggestions: string[]): AiResult => {
  let updated = html
  if (updated.includes('</footer>')) {
    updated = updated.replace(/<footer/i, `${sectionHtml}\n  <footer`)
  } else if (updated.includes('</body>')) {
    updated = updated.replace('</body>', `${sectionHtml}\n</body>`)
  }
  return { html: updated, response, suggestions }
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
