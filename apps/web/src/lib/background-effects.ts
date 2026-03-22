/**
 * Premium Background Effects — Inspired by 21st.dev
 *
 * These generate self-contained HTML/CSS/JS for background effects
 * that can be layered behind any section. They use Canvas API and
 * CSS animations — no React, no npm dependencies.
 *
 * Usage: wrap section content with the background HTML:
 *   `<div style="position:relative">${backgroundEffect}${sectionContent}</div>`
 */

/** 1. Floating Orbs — Animated gradient blobs (like aurora/mesh gradient) */
export const floatingOrbs = (colors: { c1?: string; c2?: string; c3?: string } = {}): string => {
  const c1 = colors.c1 || '#7C3AED'
  const c2 = colors.c2 || '#06B6D4'
  const c3 = colors.c3 || '#F59E0B'
  const id = 'orbs-' + Math.random().toString(36).slice(2, 6)
  return `<div class="${id}-wrap" style="position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:0">
  <div class="${id}-orb" style="position:absolute;width:500px;height:500px;border-radius:50%;filter:blur(100px);opacity:0.35;background:${c1};top:-10%;left:-5%;animation:${id}-f1 15s ease-in-out infinite alternate"></div>
  <div class="${id}-orb" style="position:absolute;width:400px;height:400px;border-radius:50%;filter:blur(90px);opacity:0.3;background:${c2};bottom:-15%;right:-10%;animation:${id}-f2 18s ease-in-out infinite alternate"></div>
  <div class="${id}-orb" style="position:absolute;width:350px;height:350px;border-radius:50%;filter:blur(80px);opacity:0.25;background:${c3};top:40%;left:50%;animation:${id}-f3 20s ease-in-out infinite alternate"></div>
</div>
<style>
@keyframes ${id}-f1{0%{transform:translate(0,0) scale(1)}50%{transform:translate(40px,-30px) scale(1.1)}100%{transform:translate(-20px,20px) scale(0.95)}}
@keyframes ${id}-f2{0%{transform:translate(0,0) scale(1)}50%{transform:translate(-30px,25px) scale(1.08)}100%{transform:translate(25px,-15px) scale(0.92)}}
@keyframes ${id}-f3{0%{transform:translate(0,0) scale(1)}50%{transform:translate(20px,20px) scale(1.05)}100%{transform:translate(-15px,-25px) scale(0.97)}}
@media(prefers-reduced-motion:reduce){.${id}-orb{animation:none!important}}
</style>`
}

/** 2. Particles Canvas — Twinkling dots with connections (like stars/particles bg) */
export const particlesCanvas = (opts: { color?: string; count?: number; connectDistance?: number } = {}): string => {
  const color = opts.color || 'rgba(255,255,255,0.6)'
  const count = opts.count || 60
  const dist = opts.connectDistance || 120
  const id = 'ptcl-' + Math.random().toString(36).slice(2, 6)
  return `<canvas id="${id}" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0"></canvas>
<script>
(function(){
  var c=document.getElementById('${id}');if(!c)return;
  var ctx=c.getContext('2d'),w,h,particles=[];
  var mq=window.matchMedia('(prefers-reduced-motion:reduce)');
  if(mq.matches)return;
  function resize(){w=c.width=c.offsetWidth;h=c.height=c.offsetHeight}
  resize();window.addEventListener('resize',resize);
  for(var i=0;i<${count};i++)particles.push({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-0.5)*0.5,vy:(Math.random()-0.5)*0.5,r:Math.random()*2+0.5});
  function draw(){
    ctx.clearRect(0,0,w,h);
    for(var i=0;i<particles.length;i++){
      var p=particles[i];
      p.x+=p.vx;p.y+=p.vy;
      if(p.x<0||p.x>w)p.vx*=-1;
      if(p.y<0||p.y>h)p.vy*=-1;
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle='${color}';ctx.fill();
      for(var j=i+1;j<particles.length;j++){
        var q=particles[j],dx=p.x-q.x,dy=p.y-q.y,d=Math.sqrt(dx*dx+dy*dy);
        if(d<${dist}){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.strokeStyle='rgba(255,255,255,'+(1-d/${dist})*0.15+')';ctx.stroke()}
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
})();
</script>`
}

/** 3. Wave Canvas — Smooth animated sine waves (like hero-waves) */
export const waveCanvas = (opts: { color?: string; waves?: number; speed?: number } = {}): string => {
  const color = opts.color || '#7C3AED'
  const waves = opts.waves || 3
  const speed = opts.speed || 0.02
  const id = 'wave-' + Math.random().toString(36).slice(2, 6)
  return `<canvas id="${id}" style="position:absolute;bottom:0;left:0;width:100%;height:40%;pointer-events:none;z-index:0;opacity:0.3"></canvas>
<script>
(function(){
  var c=document.getElementById('${id}');if(!c)return;
  var ctx=c.getContext('2d'),w,h,t=0;
  var mq=window.matchMedia('(prefers-reduced-motion:reduce)');
  if(mq.matches)return;
  function resize(){w=c.width=c.offsetWidth;h=c.height=c.offsetHeight}
  resize();window.addEventListener('resize',resize);
  function hex2rgba(hex,a){var r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return'rgba('+r+','+g+','+b+','+a+')'}
  function draw(){
    ctx.clearRect(0,0,w,h);
    for(var i=0;i<${waves};i++){
      ctx.beginPath();
      var amp=20+i*15,freq=0.005-i*0.001,phase=t*(${speed}+i*0.005);
      for(var x=0;x<=w;x++){
        var y=h*0.5+Math.sin(x*freq+phase)*amp+Math.sin(x*freq*2.5+phase*1.3)*amp*0.3;
        x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      }
      ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.closePath();
      ctx.fillStyle=hex2rgba('${color}',0.08+i*0.04);
      ctx.fill();
    }
    t++;requestAnimationFrame(draw);
  }
  draw();
})();
</script>`
}

/** 4. Grid Pattern with Radial Fade — Blueprint/tech grid background */
export const gridPattern = (opts: { color?: string; size?: number; fade?: boolean } = {}): string => {
  const color = opts.color || 'rgba(255,255,255,0.06)'
  const size = opts.size || 40
  const fade = opts.fade !== false
  const id = 'grid-' + Math.random().toString(36).slice(2, 6)
  return `<div class="${id}" style="position:absolute;inset:0;pointer-events:none;z-index:0;
    background-image:linear-gradient(${color} 1px,transparent 1px),linear-gradient(90deg,${color} 1px,transparent 1px);
    background-size:${size}px ${size}px;
    ${fade ? `mask-image:radial-gradient(ellipse 60% 50% at 50% 50%,black 40%,transparent 100%);-webkit-mask-image:radial-gradient(ellipse 60% 50% at 50% 50%,black 40%,transparent 100%)` : ''}
  "></div>`
}

/** 5. Shooting Stars — Animated diagonal light streaks */
export const shootingStars = (opts: { count?: number; color?: string } = {}): string => {
  const count = opts.count || 6
  const color = opts.color || '#7C3AED'
  const id = 'stars-' + Math.random().toString(36).slice(2, 6)
  const stars = Array.from({ length: count }, (_, i) => {
    const top = Math.random() * 60
    const left = Math.random() * 100
    const delay = Math.random() * 8
    const duration = 1.5 + Math.random() * 2
    const width = 80 + Math.random() * 120
    return `<div style="position:absolute;top:${top}%;left:${left}%;width:${width}px;height:1px;
      background:linear-gradient(90deg,${color},transparent);opacity:0;
      transform:rotate(-35deg);
      animation:${id}-shoot ${duration}s ${delay}s linear infinite;pointer-events:none"></div>`
  }).join('')
  return `<div style="position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:0">${stars}</div>
<style>
@keyframes ${id}-shoot{0%{transform:rotate(-35deg) translateX(-200px);opacity:0}5%{opacity:0.8}60%{opacity:0}100%{transform:rotate(-35deg) translateX(800px);opacity:0}}
@media(prefers-reduced-motion:reduce){[style*="${id}-shoot"]{animation:none!important;display:none!important}}
</style>`
}

/** 6. Aurora Gradient — Animated color-shifting aurora background */
export const auroraGradient = (opts: { colors?: string[] } = {}): string => {
  const colors = opts.colors || ['#7C3AED', '#06B6D4', '#10B981', '#7C3AED']
  const id = 'aurora-' + Math.random().toString(36).slice(2, 6)
  const gradient = colors.join(', ')
  return `<div class="${id}" style="position:absolute;inset:0;pointer-events:none;z-index:0;opacity:0.15;
    background:linear-gradient(135deg,${gradient});
    background-size:400% 400%;
    animation:${id}-shift 12s ease infinite;
    filter:blur(60px)"></div>
<style>
@keyframes ${id}-shift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
@media(prefers-reduced-motion:reduce){.${id}{animation:none!important}}
</style>`
}

/** 7. Dot Matrix — Halftone-style dot pattern */
export const dotMatrix = (opts: { color?: string; size?: number } = {}): string => {
  const color = opts.color || 'rgba(255,255,255,0.08)'
  const size = opts.size || 20
  return `<div style="position:absolute;inset:0;pointer-events:none;z-index:0;
    background-image:radial-gradient(circle,${color} 1.5px,transparent 1.5px);
    background-size:${size}px ${size}px;
    mask-image:radial-gradient(ellipse 80% 60% at 50% 50%,black 30%,transparent 100%);
    -webkit-mask-image:radial-gradient(ellipse 80% 60% at 50% 50%,black 30%,transparent 100%)"></div>`
}

/** Map of background effect names for AI selection */
export const BACKGROUND_EFFECTS = {
  'floating-orbs': floatingOrbs,
  'particles': particlesCanvas,
  'waves': waveCanvas,
  'grid-fade': gridPattern,
  'shooting-stars': shootingStars,
  'aurora': auroraGradient,
  'dot-matrix': dotMatrix,
} as const

export type BackgroundEffectName = keyof typeof BACKGROUND_EFFECTS
