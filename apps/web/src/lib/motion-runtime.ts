/**
 * Generates vanilla JS runtime for motion animations.
 * This script runs in the generated HTML (iframe), not in React.
 * Handles: scroll reveal, parallax, sticky header, counters, tilt, typewriter.
 */

import type { MotionPreset } from './motion-presets'

/**
 * Generates a complete JS string for the given motion preset.
 * Replaces the old simple IntersectionObserver with a full motion runtime.
 */
export const generateMotionJS = (preset: MotionPreset): string => {
  if (preset.id === 'none') {
    return `
    // Motion: none — show everything immediately
    document.querySelectorAll('.motion-reveal').forEach(function(el) { el.classList.add('visible'); });
    `
  }

  const parts: string[] = []

  // Always include: mobile menu toggle + smooth scroll
  parts.push(generateBaseScripts())

  // Scroll reveal (IntersectionObserver)
  parts.push(generateScrollReveal(preset))

  // Parallax
  if (preset.scroll.parallaxDepth > 0) {
    parts.push(generateParallax())
  }

  // Sticky header
  if (preset.scroll.stickyHeader) {
    parts.push(generateStickyHeader())
  }

  // Animated counters
  if (preset.counter.enabled) {
    parts.push(generateCounters(preset))
  }

  // Tilt hover effect
  if (preset.hover.cards === 'tilt') {
    parts.push(generateTiltHover())
  }

  // Hero typewriter
  if (preset.hero.titleAnimation === 'typewriter') {
    parts.push(generateTypewriter())
  }

  // Hero split words
  if (preset.hero.titleAnimation === 'splitWords') {
    parts.push(generateSplitWords(preset))
  }

  return parts.join('\n\n')
}

// ---------------------------------------------------------------------------
// Script generators
// ---------------------------------------------------------------------------

const generateBaseScripts = (): string => `
    // --- Mobile menu toggle ---
    (function() {
      var menuBtn = document.getElementById('mobile-menu-btn');
      var mobileMenu = document.getElementById('mobile-menu');
      if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', function() {
          mobileMenu.classList.toggle('hidden');
        });
        mobileMenu.querySelectorAll('a').forEach(function(link) {
          link.addEventListener('click', function() {
            mobileMenu.classList.add('hidden');
          });
        });
      }
    })();

    // --- Smooth scroll for anchor links ---
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        var target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });`

const generateScrollReveal = (preset: MotionPreset): string => `
    // --- Scroll Reveal (IntersectionObserver) ---
    (function() {
      var threshold = ${preset.entrance.threshold};
      var staggerDelay = ${preset.entrance.stagger};

      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (!entry.isIntersecting) return;

          var el = entry.target;

          // Check if this is a stagger container
          var staggerChildren = el.querySelectorAll('[class*="motion-stagger-"]');
          if (staggerChildren.length > 0) {
            staggerChildren.forEach(function(child, i) {
              setTimeout(function() {
                child.classList.add('visible');
              }, i * staggerDelay);
            });
          }

          el.classList.add('visible');
          observer.unobserve(el);
        });
      }, {
        threshold: threshold,
        rootMargin: '0px 0px -50px 0px'
      });

      document.querySelectorAll('.motion-reveal, .motion-hero-title, .motion-hero-subtitle, .motion-hero-cta, .motion-split-word').forEach(function(el) {
        observer.observe(el);
      });
    })();`

const generateParallax = (): string => `
    // --- Parallax ---
    (function() {
      var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var isMobile = window.innerWidth <= 768;
      if (prefersReducedMotion || isMobile) return;

      var parallaxEls = document.querySelectorAll('[data-parallax-speed]');
      if (!parallaxEls.length) return;

      var ticking = false;

      function updateParallax() {
        var scrollY = window.pageYOffset;
        parallaxEls.forEach(function(el) {
          var speed = parseFloat(el.getAttribute('data-parallax-speed')) || 0;
          var rect = el.getBoundingClientRect();
          var centerY = rect.top + rect.height / 2;
          var viewportCenter = window.innerHeight / 2;
          var offset = (centerY - viewportCenter) * speed;
          el.style.transform = 'translateY(' + offset + 'px)';
        });
        ticking = false;
      }

      window.addEventListener('scroll', function() {
        if (!ticking) {
          requestAnimationFrame(updateParallax);
          ticking = true;
        }
      }, { passive: true });
    })();`

const generateStickyHeader = (): string => `
    // --- Sticky Header ---
    (function() {
      var nav = document.querySelector('nav');
      if (!nav) return;

      var scrollThreshold = 80;
      var lastScrollY = 0;
      var ticking = false;

      function updateHeader() {
        var scrollY = window.pageYOffset;
        if (scrollY > scrollThreshold) {
          nav.classList.add('header-scrolled');
        } else {
          nav.classList.remove('header-scrolled');
        }
        lastScrollY = scrollY;
        ticking = false;
      }

      window.addEventListener('scroll', function() {
        if (!ticking) {
          requestAnimationFrame(updateHeader);
          ticking = true;
        }
      }, { passive: true });
    })();`

const generateCounters = (preset: MotionPreset): string => `
    // --- Animated Counters ---
    (function() {
      var counterDuration = ${preset.counter.duration};
      var counters = document.querySelectorAll('.motion-counter[data-count-target]');
      if (!counters.length) return;

      function easeOutExpo(t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      }

      function animateCounter(el) {
        var target = parseFloat(el.getAttribute('data-count-target')) || 0;
        var suffix = el.getAttribute('data-count-suffix') || '';
        var prefix = el.getAttribute('data-count-prefix') || '';
        var decimals = (String(target).split('.')[1] || '').length;
        var start = performance.now();

        function update(now) {
          var elapsed = now - start;
          var progress = Math.min(elapsed / counterDuration, 1);
          var easedProgress = easeOutExpo(progress);
          var current = easedProgress * target;

          el.textContent = prefix + current.toFixed(decimals) + suffix;

          if (progress < 1) {
            requestAnimationFrame(update);
          } else {
            el.textContent = prefix + target.toFixed(decimals) + suffix;
          }
        }

        requestAnimationFrame(update);
      }

      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });

      counters.forEach(function(el) { observer.observe(el); });
    })();`

const generateTiltHover = (): string => `
    // --- Tilt Hover ---
    (function() {
      var isTouchDevice = 'ontouchstart' in window;
      var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (isTouchDevice || prefersReducedMotion) return;

      var tiltEls = document.querySelectorAll('[data-motion-tilt]');
      tiltEls.forEach(function(el) {
        el.addEventListener('mousemove', function(e) {
          var rect = el.getBoundingClientRect();
          var x = e.clientX - rect.left;
          var y = e.clientY - rect.top;
          var centerX = rect.width / 2;
          var centerY = rect.height / 2;
          var rotateX = ((y - centerY) / centerY) * -8;
          var rotateY = ((x - centerX) / centerX) * 8;
          el.style.transform = 'perspective(800px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)';
        });

        el.addEventListener('mouseleave', function() {
          el.style.transform = 'perspective(800px) rotateX(0) rotateY(0)';
        });
      });
    })();`

const generateTypewriter = (): string => `
    // --- Hero Typewriter ---
    (function() {
      var container = document.querySelector('[data-hero-animation="typewriter"]');
      if (!container) return;

      var titleEl = container.querySelector('.motion-hero-title');
      if (!titleEl) return;

      var text = titleEl.textContent || '';
      titleEl.textContent = '';
      titleEl.style.opacity = '1';
      titleEl.style.transform = 'none';
      titleEl.classList.add('visible');

      var span = document.createElement('span');
      span.className = 'motion-typewriter-text';
      span.style.display = 'inline-block';
      titleEl.appendChild(span);

      var i = 0;
      function type() {
        if (i < text.length) {
          span.textContent += text.charAt(i);
          i++;
          setTimeout(type, 50 + Math.random() * 30);
        }
      }

      setTimeout(type, 500);
    })();`

const generateSplitWords = (preset: MotionPreset): string => `
    // --- Hero Split Words ---
    (function() {
      var titleEl = document.querySelector('.motion-hero-title[data-split-words]');
      if (!titleEl) return;

      var text = titleEl.textContent || '';
      var words = text.split(/\\s+/);
      titleEl.textContent = '';
      titleEl.style.opacity = '1';
      titleEl.style.transform = 'none';

      words.forEach(function(word, i) {
        var span = document.createElement('span');
        span.className = 'motion-split-word';
        span.textContent = word;
        span.style.animationDelay = (i * ${preset.entrance.stagger + 40}) + 'ms';
        titleEl.appendChild(span);
        // Add space between words
        if (i < words.length - 1) {
          titleEl.appendChild(document.createTextNode(' '));
        }
      });

      // Trigger observer on split words
      setTimeout(function() {
        document.querySelectorAll('.motion-split-word').forEach(function(el) {
          el.classList.add('visible');
        });
      }, 300);
    })();`
