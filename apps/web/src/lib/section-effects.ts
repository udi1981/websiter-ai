/**
 * Section Effects Library
 *
 * Reusable CSS/JS effect generators that section templates inject into
 * their HTML output. These are NOT React components — they produce raw
 * HTML/CSS/JS strings intended for generated sites running in an iframe.
 *
 * Every effect is self-contained, tree-shakeable, and respects:
 *  - prefers-reduced-motion
 *  - RTL (logical CSS properties where applicable)
 *  - CSS custom properties for color adaptation
 */

type EffectOutput = { css: string; js: string }
type CssOnlyEffect = { css: string; js?: undefined }

// ---------------------------------------------------------------------------
// 1. scrollReveal — IntersectionObserver fade-up
// ---------------------------------------------------------------------------

export const scrollReveal = (): EffectOutput => ({
  css: `
.motion-reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}
.motion-reveal.revealed {
  opacity: 1;
  transform: translateY(0);
}
@media (prefers-reduced-motion: reduce) {
  .motion-reveal { opacity: 1; transform: none; transition: none; }
}`,
  js: `
(function(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    document.querySelectorAll('.motion-reveal').forEach(function(el){el.classList.add('revealed');});
    return;
  }
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){e.target.classList.add('revealed');io.unobserve(e.target);}
    });
  },{threshold:0.1,rootMargin:'-50px'});
  document.querySelectorAll('.motion-reveal').forEach(function(el){io.observe(el);});
})();`,
})

// ---------------------------------------------------------------------------
// 2. staggerReveal — Children animate sequentially
// ---------------------------------------------------------------------------

export const staggerReveal = (): EffectOutput => {
  let nthDelays = ''
  for (let i = 1; i <= 10; i++) {
    nthDelays += `.stagger-reveal.revealed > *:nth-child(${i}) { transition-delay: ${(i * 0.1).toFixed(1)}s; }\n`
  }
  return {
    css: `
.stagger-reveal > * {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.stagger-reveal.revealed > * {
  opacity: 1;
  transform: translateY(0);
}
${nthDelays}
@media (prefers-reduced-motion: reduce) {
  .stagger-reveal > * { opacity: 1; transform: none; transition: none; }
}`,
    js: `
(function(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    document.querySelectorAll('.stagger-reveal').forEach(function(el){el.classList.add('revealed');});
    return;
  }
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){e.target.classList.add('revealed');io.unobserve(e.target);}
    });
  },{threshold:0.1,rootMargin:'-50px'});
  document.querySelectorAll('.stagger-reveal').forEach(function(el){io.observe(el);});
})();`,
  }
}

// ---------------------------------------------------------------------------
// 3. parallaxFloat — Slight parallax on scroll
// ---------------------------------------------------------------------------

export const parallaxFloat = (): EffectOutput => ({
  css: `
.parallax-float {
  transition: transform 0.1s linear;
  will-change: transform;
}
@media (prefers-reduced-motion: reduce) {
  .parallax-float { transition: none; }
}`,
  js: `
(function(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var els=document.querySelectorAll('.parallax-float');
  if(!els.length) return;
  var ticking=false;
  window.addEventListener('scroll',function(){
    if(!ticking){
      window.requestAnimationFrame(function(){
        var scrollY=window.pageYOffset||document.documentElement.scrollTop;
        els.forEach(function(el){
          el.style.transform='translateY('+(scrollY*-0.15)+'px)';
        });
        ticking=false;
      });
      ticking=true;
    }
  },{passive:true});
})();`,
})

// ---------------------------------------------------------------------------
// 4. magneticButton — Subtly follows cursor on hover
// ---------------------------------------------------------------------------

export const magneticButton = (): EffectOutput => ({
  css: `
.magnetic-btn {
  transition: transform 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  will-change: transform;
}
@media (prefers-reduced-motion: reduce) {
  .magnetic-btn { transition: none; }
}`,
  js: `
(function(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('.magnetic-btn').forEach(function(btn){
    btn.addEventListener('mousemove',function(e){
      var rect=btn.getBoundingClientRect();
      var x=e.clientX-rect.left-rect.width/2;
      var y=e.clientY-rect.top-rect.height/2;
      btn.style.transform='translate('+x*0.25+'px,'+y*0.25+'px)';
    });
    btn.addEventListener('mouseleave',function(){
      btn.style.transform='translate(0,0)';
    });
  });
})();`,
})

// ---------------------------------------------------------------------------
// 5. tiltCard — 3D perspective tilt on hover
// ---------------------------------------------------------------------------

export const tiltCard = (): EffectOutput => ({
  css: `
.tilt-card {
  transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  transform-style: preserve-3d;
  will-change: transform;
}
.tilt-card:hover {
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
}
@media (prefers-reduced-motion: reduce) {
  .tilt-card { transition: none; transform: none !important; }
}`,
  js: `
(function(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('.tilt-card').forEach(function(card){
    card.addEventListener('mousemove',function(e){
      var rect=card.getBoundingClientRect();
      var x=(e.clientX-rect.left)/rect.width;
      var y=(e.clientY-rect.top)/rect.height;
      var rotateY=(x-0.5)*24;
      var rotateX=(0.5-y)*24;
      rotateX=Math.max(-12,Math.min(12,rotateX));
      rotateY=Math.max(-12,Math.min(12,rotateY));
      card.style.transform='perspective(800px) rotateX('+rotateX+'deg) rotateY('+rotateY+'deg)';
    });
    card.addEventListener('mouseleave',function(){
      card.style.transform='perspective(800px) rotateX(0) rotateY(0)';
    });
  });
})();`,
})

// ---------------------------------------------------------------------------
// 6. glowCard — Radial gradient glow follows cursor
// ---------------------------------------------------------------------------

export const glowCard = (): EffectOutput => ({
  css: `
.glow-card {
  position: relative;
  overflow: hidden;
}
.glow-card::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.4s;
  background: radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.06), transparent 40%);
  pointer-events: none;
  z-index: 1;
}
.glow-card:hover::before {
  opacity: 1;
}`,
  js: `
(function(){
  document.querySelectorAll('.glow-card').forEach(function(card){
    card.addEventListener('mousemove',function(e){
      var rect=card.getBoundingClientRect();
      card.style.setProperty('--mouse-x',(e.clientX-rect.left)+'px');
      card.style.setProperty('--mouse-y',(e.clientY-rect.top)+'px');
    });
  });
})();`,
})

// ---------------------------------------------------------------------------
// 7. shimmerButton — Shimmer sweep effect
// ---------------------------------------------------------------------------

export const shimmerButton = (): CssOnlyEffect => ({
  css: `
.shimmer-btn {
  position: relative;
  overflow: hidden;
}
.shimmer-btn::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(110deg, transparent 25%, rgba(255,255,255,0.15) 50%, transparent 75%);
  transform: translateX(-100%);
  animation: shimmer 3s infinite;
  pointer-events: none;
}
@keyframes shimmer {
  100% { transform: translateX(100%); }
}
@media (prefers-reduced-motion: reduce) {
  .shimmer-btn::after { animation: none; opacity: 0; }
}`,
})

// ---------------------------------------------------------------------------
// 8. gradientMesh — Animated mesh gradient background
// ---------------------------------------------------------------------------

export const gradientMesh = (): CssOnlyEffect => ({
  css: `
.gradient-mesh {
  background: linear-gradient(
    135deg,
    var(--gm-1, #7c3aed) 0%,
    var(--gm-2, #06b6d4) 25%,
    var(--gm-3, #f59e0b) 50%,
    var(--gm-4, #10b981) 75%,
    var(--gm-1, #7c3aed) 100%
  );
  background-size: 400% 400%;
  animation: gradient-shift 15s ease infinite;
}
@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
@media (prefers-reduced-motion: reduce) {
  .gradient-mesh { animation: none; background-size: 100% 100%; }
}`,
})

// ---------------------------------------------------------------------------
// 9. noiseTexture — SVG noise texture overlay
// ---------------------------------------------------------------------------

export const noiseTexture = (): CssOnlyEffect => ({
  css: `
.noise-overlay {
  position: relative;
}
.noise-overlay::after {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.03;
  pointer-events: none;
  z-index: 1;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-repeat: repeat;
}`,
})

// ---------------------------------------------------------------------------
// 10. counterAnimation — Animated counting number
// ---------------------------------------------------------------------------

export const counterAnimation = (): EffectOutput => ({
  css: `
.counter-value {
  display: inline-block;
  font-variant-numeric: tabular-nums;
}`,
  js: `
(function(){
  function easeOutQuart(t){return 1-Math.pow(1-t,4);}
  var animated=new Set();
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(!e.isIntersecting||animated.has(e.target)) return;
      animated.add(e.target);
      var el=e.target;
      var target=parseFloat(el.getAttribute('data-count-target'))||0;
      var isFloat=String(target).indexOf('.')!==-1;
      var decimals=isFloat?(String(target).split('.')[1]||'').length:0;
      var prefix=el.getAttribute('data-count-prefix')||'';
      var suffix=el.getAttribute('data-count-suffix')||'';
      var duration=2000;
      var start=performance.now();
      function tick(now){
        var elapsed=now-start;
        var progress=Math.min(elapsed/duration,1);
        var value=easeOutQuart(progress)*target;
        el.textContent=prefix+(isFloat?value.toFixed(decimals):Math.round(value))+suffix;
        if(progress<1) requestAnimationFrame(tick);
      }
      if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
        el.textContent=prefix+(isFloat?target.toFixed(decimals):target)+suffix;
      } else {
        requestAnimationFrame(tick);
      }
    });
  },{threshold:0.3});
  document.querySelectorAll('[data-count-target]').forEach(function(el){io.observe(el);});
})();`,
})

// ---------------------------------------------------------------------------
// 11. typewriterText — Character-by-character typing
// ---------------------------------------------------------------------------

export const typewriterText = (): EffectOutput => ({
  css: `
.typewriter-cursor {
  border-inline-end: 2px solid;
  animation: tw-blink 1s step-end infinite;
}
@keyframes tw-blink {
  50% { border-color: transparent; }
}
@media (prefers-reduced-motion: reduce) {
  .typewriter-cursor { animation: none; }
}`,
  js: `
(function(){
  document.querySelectorAll('[data-typewriter-text]').forEach(function(el){
    var fullText=el.getAttribute('data-typewriter-text')||'';
    var shouldLoop=el.hasAttribute('data-typewriter-loop');
    var charDelay=50;
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      el.textContent=fullText;
      return;
    }
    var idx=0;
    el.textContent='';
    el.classList.add('typewriter-cursor');
    function typeNext(){
      if(idx<=fullText.length){
        el.textContent=fullText.slice(0,idx);
        idx++;
        setTimeout(typeNext,charDelay);
      } else if(shouldLoop){
        setTimeout(function(){idx=0;typeNext();},2000);
      } else {
        el.classList.remove('typewriter-cursor');
      }
    }
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){typeNext();io.unobserve(e.target);}
      });
    },{threshold:0.3});
    io.observe(el);
  });
})();`,
})

// ---------------------------------------------------------------------------
// 12. marquee — Infinite horizontal scroll
// ---------------------------------------------------------------------------

export const marquee = (): CssOnlyEffect => ({
  css: `
.marquee-container {
  overflow: hidden;
  width: 100%;
}
.marquee-track {
  display: flex;
  gap: 3rem;
  width: max-content;
  animation: marquee-scroll 30s linear infinite;
}
.marquee-container:hover .marquee-track {
  animation-play-state: paused;
}
@keyframes marquee-scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
@media (prefers-reduced-motion: reduce) {
  .marquee-track { animation: none; flex-wrap: wrap; width: auto; }
}`,
})

// ---------------------------------------------------------------------------
// 13. smoothAccordion — Smooth expand/collapse for FAQ
// ---------------------------------------------------------------------------

export const smoothAccordion = (): EffectOutput => ({
  css: `
details.smooth-accordion summary {
  cursor: pointer;
  list-style: none;
}
details.smooth-accordion summary::-webkit-details-marker {
  display: none;
}
details.smooth-accordion .accordion-content {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.35s ease;
  overflow: hidden;
}
details.smooth-accordion .accordion-content > * {
  overflow: hidden;
}
details.smooth-accordion[open] .accordion-content {
  grid-template-rows: 1fr;
}
details.smooth-accordion summary .accordion-icon {
  transition: transform 0.35s ease;
}
details.smooth-accordion[open] summary .accordion-icon {
  transform: rotate(180deg);
}
@media (prefers-reduced-motion: reduce) {
  details.smooth-accordion .accordion-content { transition: none; }
}`,
  js: `
(function(){
  document.querySelectorAll('details.smooth-accordion').forEach(function(details){
    var summary=details.querySelector('summary');
    if(!summary) return;
    summary.addEventListener('click',function(e){
      e.preventDefault();
      if(details.open){
        var content=details.querySelector('.accordion-content');
        if(content){
          content.style.gridTemplateRows='0fr';
          var onEnd=function(){
            details.removeAttribute('open');
            content.removeEventListener('transitionend',onEnd);
            content.style.gridTemplateRows='';
          };
          content.addEventListener('transitionend',onEnd);
        } else {
          details.removeAttribute('open');
        }
      } else {
        details.setAttribute('open','');
      }
    });
  });
})();`,
})

// ---------------------------------------------------------------------------
// 14. blurFade — Starts blurred, becomes clear on scroll
// ---------------------------------------------------------------------------

export const blurFade = (): EffectOutput => ({
  css: `
.blur-fade {
  filter: blur(8px);
  opacity: 0;
  transition: filter 1s ease, opacity 1s ease;
}
.blur-fade.revealed {
  filter: blur(0);
  opacity: 1;
}
@media (prefers-reduced-motion: reduce) {
  .blur-fade { filter: none; opacity: 1; transition: none; }
}`,
  js: `
(function(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    document.querySelectorAll('.blur-fade').forEach(function(el){el.classList.add('revealed');});
    return;
  }
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){e.target.classList.add('revealed');io.unobserve(e.target);}
    });
  },{threshold:0.1,rootMargin:'-50px'});
  document.querySelectorAll('.blur-fade').forEach(function(el){io.observe(el);});
})();`,
})

// ---------------------------------------------------------------------------
// 15. springAnimation — CSS spring-like bounce
// ---------------------------------------------------------------------------

export const springAnimation = (): CssOnlyEffect => ({
  css: `
@keyframes spring-in {
  0% { transform: scale(0.8); opacity: 0; }
  50% { transform: scale(1.05); }
  70% { transform: scale(0.97); }
  100% { transform: scale(1); opacity: 1; }
}
.spring-in {
  animation: spring-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
@media (prefers-reduced-motion: reduce) {
  .spring-in { animation: none; opacity: 1; transform: none; }
}`,
})

// ---------------------------------------------------------------------------
// 16. liquidGlass — Apple-style frosted glass + refraction
// ---------------------------------------------------------------------------

export const liquidGlass = (): CssOnlyEffect => ({
  css: `
.liquid-glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px) saturate(1.8);
  -webkit-backdrop-filter: blur(20px) saturate(1.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 20px 60px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}
.liquid-glass::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%);
  pointer-events: none;
}`,
})

// ---------------------------------------------------------------------------
// 17. containerScroll — Sticky + scale transform on scroll
// ---------------------------------------------------------------------------

export const containerScroll = (): EffectOutput => ({
  css: `
.container-scroll {
  position: sticky;
  top: 0;
  transition: transform 0.1s linear, opacity 0.1s linear;
  will-change: transform, opacity;
}
@media (prefers-reduced-motion: reduce) {
  .container-scroll { position: relative; transform: none !important; opacity: 1 !important; }
}`,
  js: `
(function(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('.container-scroll').forEach(function(el){
    var parent=el.parentElement;
    if(!parent) return;
    function onScroll(){
      var rect=parent.getBoundingClientRect();
      var progress=Math.max(0,Math.min(1,-rect.top/(rect.height-window.innerHeight)));
      var scale=1-progress*0.05;
      var opacity=1-progress*0.3;
      el.style.transform='scale('+scale+')';
      el.style.opacity=opacity;
    }
    window.addEventListener('scroll',onScroll,{passive:true});
    onScroll();
  });
})();`,
})

// ---------------------------------------------------------------------------
// 18. textShimmer — Animated gradient mask on text
// ---------------------------------------------------------------------------

export const textShimmer = (): CssOnlyEffect => ({
  css: `
.text-shimmer {
  background: linear-gradient(
    110deg,
    currentColor 45%,
    rgba(255,255,255,0.8) 50%,
    currentColor 55%
  );
  background-size: 250% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: text-shimmer-move 3s ease-in-out infinite;
}
@keyframes text-shimmer-move {
  0% { background-position: 100% 0; }
  100% { background-position: -100% 0; }
}
@media (prefers-reduced-motion: reduce) {
  .text-shimmer {
    animation: none;
    -webkit-text-fill-color: currentColor;
    background: none;
  }
}`,
})

// ---------------------------------------------------------------------------
// 19. glowingBorder — Animated conic-gradient border
// ---------------------------------------------------------------------------

export const glowingBorder = (): CssOnlyEffect => ({
  css: `
.glowing-border {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
}
.glowing-border::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: conic-gradient(
    from 0deg,
    var(--glow-1, #7c3aed),
    var(--glow-2, #06b6d4),
    var(--glow-3, #f59e0b),
    var(--glow-4, #10b981),
    var(--glow-1, #7c3aed)
  );
  border-radius: inherit;
  animation: glow-rotate 4s linear infinite;
  z-index: -1;
}
.glowing-border::after {
  content: '';
  position: absolute;
  inset: 2px;
  background: inherit;
  border-radius: calc(16px - 2px);
  z-index: -1;
}
@keyframes glow-rotate {
  100% { transform: rotate(360deg); }
}
@media (prefers-reduced-motion: reduce) {
  .glowing-border::before { animation: none; }
}`,
})

// ---------------------------------------------------------------------------
// 20. backgroundPaths — SVG animated flowing paths
// ---------------------------------------------------------------------------

export const backgroundPaths = (): CssOnlyEffect => ({
  css: `
.bg-paths {
  position: relative;
  overflow: hidden;
}
.bg-paths svg.bg-path-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}
.bg-paths svg.bg-path-svg path {
  fill: none;
  stroke: var(--path-color, rgba(124, 58, 237, 0.15));
  stroke-width: 1.5;
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: path-draw 4s ease forwards;
}
.bg-paths svg.bg-path-svg path:nth-child(2) { animation-delay: 0.5s; stroke: var(--path-color-2, rgba(6, 182, 212, 0.1)); }
.bg-paths svg.bg-path-svg path:nth-child(3) { animation-delay: 1s; stroke: var(--path-color-3, rgba(245, 158, 11, 0.08)); }
@keyframes path-draw {
  to { stroke-dashoffset: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .bg-paths svg.bg-path-svg path { animation: none; stroke-dashoffset: 0; }
}`,
})

// ---------------------------------------------------------------------------
// 21. auroraEffect — Multi-layer animated radial gradients
// ---------------------------------------------------------------------------

export const auroraEffect = (): CssOnlyEffect => ({
  css: `
.aurora-bg {
  position: relative;
  overflow: hidden;
}
.aurora-bg::before,
.aurora-bg::after {
  content: '';
  position: absolute;
  width: 150%;
  height: 150%;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
  pointer-events: none;
  z-index: 0;
}
.aurora-bg::before {
  top: -50%;
  inset-inline-start: -25%;
  background: radial-gradient(ellipse, var(--aurora-1, rgba(124,58,237,0.5)), transparent 60%);
  animation: aurora-drift 12s ease-in-out infinite alternate;
}
.aurora-bg::after {
  bottom: -50%;
  inset-inline-end: -25%;
  background: radial-gradient(ellipse, var(--aurora-2, rgba(6,182,212,0.4)), transparent 60%);
  animation: aurora-drift 15s ease-in-out infinite alternate-reverse;
}
@keyframes aurora-drift {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(5%, 8%) scale(1.1); }
}
@media (prefers-reduced-motion: reduce) {
  .aurora-bg::before, .aurora-bg::after { animation: none; }
}`,
})

// ---------------------------------------------------------------------------
// 22. meteorShower — Falling streak particles
// ---------------------------------------------------------------------------

export const meteorShower = (): CssOnlyEffect => ({
  css: `
.meteor-shower {
  position: relative;
  overflow: hidden;
}
.meteor {
  position: absolute;
  width: 2px;
  height: 80px;
  background: linear-gradient(to bottom, var(--meteor-color, rgba(124,58,237,0.6)), transparent);
  border-radius: 999px;
  animation: meteor-fall 3s linear infinite;
  opacity: 0;
  z-index: 0;
  pointer-events: none;
}
.meteor:nth-child(1) { inset-inline-start: 15%; animation-delay: 0s; animation-duration: 2.5s; }
.meteor:nth-child(2) { inset-inline-start: 35%; animation-delay: 0.8s; animation-duration: 3.2s; }
.meteor:nth-child(3) { inset-inline-start: 55%; animation-delay: 1.6s; animation-duration: 2.8s; }
.meteor:nth-child(4) { inset-inline-start: 75%; animation-delay: 0.4s; animation-duration: 3.5s; }
.meteor:nth-child(5) { inset-inline-start: 90%; animation-delay: 2.1s; animation-duration: 2.3s; }
@keyframes meteor-fall {
  0% { transform: translateY(-100px) rotate(215deg); opacity: 0; }
  10% { opacity: 1; }
  80% { opacity: 0.5; }
  100% { transform: translateY(calc(100vh + 100px)) rotate(215deg); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .meteor { animation: none; display: none; }
}`,
})

// ---------------------------------------------------------------------------
// 23. beamEffect — SVG animated line with glow
// ---------------------------------------------------------------------------

export const beamEffect = (): CssOnlyEffect => ({
  css: `
.beam-line {
  stroke: var(--beam-color, #7c3aed);
  stroke-width: 2;
  fill: none;
  stroke-dasharray: 200;
  stroke-dashoffset: 200;
  animation: beam-draw 2s ease-in-out forwards;
  filter: drop-shadow(0 0 6px var(--beam-color, #7c3aed));
}
.beam-line:nth-child(2) { animation-delay: 0.3s; opacity: 0.6; }
.beam-line:nth-child(3) { animation-delay: 0.6s; opacity: 0.3; }
@keyframes beam-draw {
  to { stroke-dashoffset: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .beam-line { animation: none; stroke-dashoffset: 0; }
}`,
})

// ---------------------------------------------------------------------------
// 24. spotlightEffect — Radial gradient follows cursor on section
// ---------------------------------------------------------------------------

export const spotlightEffect = (): EffectOutput => ({
  css: `
.spotlight-section {
  position: relative;
  overflow: hidden;
}
.spotlight-section::before {
  content: '';
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--spot-color, rgba(124,58,237,0.08)), transparent 60%);
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 0;
  opacity: 0;
  transition: opacity 0.3s;
  inset-inline-start: var(--spot-x, 50%);
  top: var(--spot-y, 50%);
}
.spotlight-section:hover::before {
  opacity: 1;
}`,
  js: `
(function(){
  document.querySelectorAll('.spotlight-section').forEach(function(el){
    el.addEventListener('mousemove',function(e){
      var rect=el.getBoundingClientRect();
      el.style.setProperty('--spot-x',(e.clientX-rect.left)+'px');
      el.style.setProperty('--spot-y',(e.clientY-rect.top)+'px');
    });
  });
})();`,
})

// ---------------------------------------------------------------------------
// 25. expandableTabs — Height transition + content swap
// ---------------------------------------------------------------------------

export const expandableTabs = (): EffectOutput => ({
  css: `
.expandable-tabs [role="tablist"] {
  display: flex;
  gap: 0.5rem;
}
.expandable-tabs [role="tab"] {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  border: none;
  background: transparent;
}
.expandable-tabs [role="tab"][aria-selected="true"] {
  background: var(--tab-active-bg, rgba(124, 58, 237, 0.1));
  color: var(--tab-active-color, #7c3aed);
}
.expandable-tabs [role="tabpanel"] {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  overflow: hidden;
}
.expandable-tabs [role="tabpanel"].active {
  grid-template-rows: 1fr;
}
.expandable-tabs [role="tabpanel"] > * {
  overflow: hidden;
}
@media (prefers-reduced-motion: reduce) {
  .expandable-tabs [role="tabpanel"] { transition: none; }
  .expandable-tabs [role="tab"] { transition: none; }
}`,
  js: `
(function(){
  document.querySelectorAll('.expandable-tabs').forEach(function(container){
    var tabs=container.querySelectorAll('[role="tab"]');
    var panels=container.querySelectorAll('[role="tabpanel"]');
    tabs.forEach(function(tab){
      tab.addEventListener('click',function(){
        tabs.forEach(function(t){t.setAttribute('aria-selected','false');});
        panels.forEach(function(p){p.classList.remove('active');});
        tab.setAttribute('aria-selected','true');
        var target=container.querySelector('#'+tab.getAttribute('aria-controls'));
        if(target) target.classList.add('active');
      });
    });
  });
})();`,
})

// ---------------------------------------------------------------------------
// Registry — maps effect IDs to their generator functions
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// 26. spotlightTitle — Radial light cone on section titles (21st.dev Lamp)
// ---------------------------------------------------------------------------

export const spotlightTitle = (): CssOnlyEffect => ({
  css: `
.spotlight-title {
  position: relative;
  display: inline-block;
}
.spotlight-title::before {
  content: '';
  position: absolute;
  top: -60%;
  left: 50%;
  transform: translateX(-50%);
  width: 200%;
  height: 200%;
  background: radial-gradient(ellipse at center, var(--spotlight-color, rgba(124,58,237,0.15)) 0%, transparent 70%);
  pointer-events: none;
  z-index: -1;
}
@media (prefers-reduced-motion: reduce) {
  .spotlight-title::before { display: none; }
}
`,
})

// ---------------------------------------------------------------------------
// 27. glassCard — Glassmorphism card (21st.dev pattern)
// ---------------------------------------------------------------------------

export const glassCard = (): CssOnlyEffect => ({
  css: `
.glass-card {
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  transition: background 0.3s, border-color 0.3s, box-shadow 0.3s;
}
.glass-card:hover {
  background: rgba(255,255,255,0.08);
  border-color: rgba(255,255,255,0.15);
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
}
`,
})

// ---------------------------------------------------------------------------
// 28. gradientBorderAnim — Animated rotating gradient border (21st.dev)
// ---------------------------------------------------------------------------

export const gradientBorderAnim = (): CssOnlyEffect => ({
  css: `
.gradient-border-anim {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
}
.gradient-border-anim::before {
  content: '';
  position: absolute;
  inset: 0;
  padding: 1.5px;
  border-radius: inherit;
  background: conic-gradient(from var(--gb-angle, 0deg), var(--gb-color-1, #7C3AED), var(--gb-color-2, #06B6D4), var(--gb-color-3, #F59E0B), var(--gb-color-1, #7C3AED));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: gbRotate 4s linear infinite;
}
@keyframes gbRotate {
  to { --gb-angle: 360deg; }
}
@property --gb-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}
@media (prefers-reduced-motion: reduce) {
  .gradient-border-anim::before { animation: none; }
}
`,
})

// ---------------------------------------------------------------------------
// 29. dotGrid — Subtle dot pattern background
// ---------------------------------------------------------------------------

export const dotGrid = (): CssOnlyEffect => ({
  css: `
.dot-grid {
  background-image: radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px);
  background-size: 24px 24px;
}
.dot-grid-dark {
  background-image: radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px);
  background-size: 24px 24px;
}
`,
})

// ---------------------------------------------------------------------------
// 30. textGradient — Gradient fill on text (21st.dev pattern)
// ---------------------------------------------------------------------------

export const textGradient = (): CssOnlyEffect => ({
  css: `
.text-gradient {
  background: linear-gradient(135deg, var(--tg-from, #7C3AED), var(--tg-to, #06B6D4));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
`,
})

// ---------------------------------------------------------------------------
// 31. sectionFade — Smooth gradient transition between sections
// ---------------------------------------------------------------------------

export const sectionFade = (): CssOnlyEffect => ({
  css: `
.section-fade-top::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(to bottom, var(--fade-from, #0B0F1A), transparent);
  pointer-events: none;
  z-index: 1;
}
.section-fade-bottom::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(to top, var(--fade-to, #0B0F1A), transparent);
  pointer-events: none;
  z-index: 1;
}
`,
})

const effectRegistry: Record<string, () => EffectOutput | CssOnlyEffect> = {
  'scroll-reveal': scrollReveal,
  'stagger-reveal': staggerReveal,
  'parallax-float': parallaxFloat,
  'magnetic-button': magneticButton,
  'tilt-card': tiltCard,
  'glow-card': glowCard,
  'shimmer-button': shimmerButton,
  'gradient-mesh': gradientMesh,
  'noise-texture': noiseTexture,
  'counter-animation': counterAnimation,
  'typewriter-text': typewriterText,
  'marquee': marquee,
  'smooth-accordion': smoothAccordion,
  'blur-fade': blurFade,
  'spring-animation': springAnimation,
  'liquid-glass': liquidGlass,
  'container-scroll': containerScroll,
  'text-shimmer': textShimmer,
  'glowing-border': glowingBorder,
  'background-paths': backgroundPaths,
  'aurora-effect': auroraEffect,
  'meteor-shower': meteorShower,
  'beam-effect': beamEffect,
  'spotlight-effect': spotlightEffect,
  'expandable-tabs': expandableTabs,
  'spotlight-title': spotlightTitle,
  'glass-card': glassCard,
  'gradient-border-anim': gradientBorderAnim,
  'dot-grid': dotGrid,
  'text-gradient': textGradient,
  'section-fade': sectionFade,
}

// ---------------------------------------------------------------------------
// Reduced-motion CSS fallback (applied when reduceMotion flag is set)
// ---------------------------------------------------------------------------

const reducedMotionCSS = `
/* Reduced-motion overrides — all effects resolve to their final state */
.motion-reveal,
.stagger-reveal > *,
.blur-fade {
  opacity: 1 !important;
  transform: none !important;
  filter: none !important;
  transition: none !important;
}
.parallax-float { transition: none !important; }
.marquee-track { animation: none !important; flex-wrap: wrap; width: auto; }
.shimmer-btn::after { animation: none !important; opacity: 0 !important; }
.gradient-mesh { animation: none !important; background-size: 100% 100% !important; }
.spring-in { animation: none !important; opacity: 1 !important; transform: none !important; }
.typewriter-cursor { animation: none !important; }
.container-scroll { position: relative !important; transform: none !important; opacity: 1 !important; }
.text-shimmer { animation: none !important; -webkit-text-fill-color: currentColor !important; background: none !important; }
.glowing-border::before { animation: none !important; }
.bg-paths svg.bg-path-svg path { animation: none !important; stroke-dashoffset: 0 !important; }
.aurora-bg::before, .aurora-bg::after { animation: none !important; }
.meteor { animation: none !important; display: none !important; }
.beam-line { animation: none !important; stroke-dashoffset: 0 !important; }
.expandable-tabs [role="tabpanel"] { transition: none !important; }
`

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns all CSS + JS needed for the entire effect system.
 * Inject once per page. If reduceMotion is true, returns minimal
 * non-animated versions so elements remain visible without motion.
 */
export const getAllEffects = (options?: { reduceMotion?: boolean }): { css: string; js: string } => {
  if (options?.reduceMotion) {
    return { css: reducedMotionCSS, js: '' }
  }

  const cssParts: string[] = []
  const jsParts: string[] = []

  for (const id of Object.keys(effectRegistry)) {
    const effect = effectRegistry[id]()
    cssParts.push(effect.css)
    if (effect.js) {
      jsParts.push(effect.js)
    }
  }

  return {
    css: cssParts.join('\n'),
    js: jsParts.join('\n'),
  }
}

/**
 * Returns only the CSS + JS for the specified effect IDs.
 * Use this to tree-shake effects that a given page does not need.
 *
 * @param effectIds - Array of effect IDs (e.g., ['scroll-reveal', 'glow-card'])
 */
export const getEffectsForSections = (effectIds: string[]): { css: string; js: string } => {
  const cssParts: string[] = []
  const jsParts: string[] = []

  for (const id of effectIds) {
    const gen = effectRegistry[id]
    if (!gen) continue
    const effect = gen()
    cssParts.push(effect.css)
    if (effect.js) {
      jsParts.push(effect.js)
    }
  }

  return {
    css: cssParts.join('\n'),
    js: jsParts.join('\n'),
  }
}

/** All available effect IDs for reference */
export const availableEffectIds = Object.keys(effectRegistry)
