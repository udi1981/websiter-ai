'use client'

import { useState, useEffect, useCallback } from 'react'
import { LandingStyles } from '@/components/landing/landing-styles'
import { NavHeader } from '@/components/landing/nav-header'
import { HeroSection } from '@/components/landing/hero-section'
import { TrustedBy } from '@/components/landing/trusted-by'
import { FeaturesSection } from '@/components/landing/features-section'
import { ManagementSection } from '@/components/landing/management-section'
import { HowItWorks } from '@/components/landing/how-it-works'
import { DemoSection } from '@/components/landing/demo-section'
import { TemplatesSection } from '@/components/landing/templates-section'
import { AIEngineSection } from '@/components/landing/ai-engine-section'
import { TestimonialsSection } from '@/components/landing/testimonials-section'
import { PricingSection } from '@/components/landing/pricing-section'
import { FAQSection } from '@/components/landing/faq-section'
import { CTASection } from '@/components/landing/cta-section'
import { FooterSection } from '@/components/landing/footer-section'

const HomePage = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [scrollY, setScrollY] = useState(0)
  const [headerScrolled, setHeaderScrolled] = useState(false)

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

  return (
    <div className="flex min-h-screen flex-col bg-bg transition-colors duration-500">
      <LandingStyles />
      <NavHeader theme={theme} toggleTheme={toggleTheme} headerScrolled={headerScrolled} />
      <HeroSection scrollY={scrollY} />
      <TrustedBy />
      <FeaturesSection scrollY={scrollY} />
      <ManagementSection />
      <HowItWorks />
      <DemoSection />
      <TemplatesSection />
      <AIEngineSection scrollY={scrollY} />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <FooterSection />
    </div>
  )
}

export default HomePage
