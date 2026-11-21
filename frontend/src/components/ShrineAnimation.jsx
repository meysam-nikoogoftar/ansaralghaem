import { useEffect, useRef } from 'react'
import useReducedMotion from '../hooks/useReducedMotion'
import shrine from '../assets/shrine.svg?raw'
import './ShrineAnimation.css'

export default function ShrineAnimation() {
  const host = useRef(null)
  const reduced = useReducedMotion()
  useEffect(() => {
    const root = host.current
    root.innerHTML = shrine
    let frame = 0
    let visible = false
    let elapsed = 0
    let last = null
    const stopped = reduced
    let enhanced = null
    let cancelled = false
    let requested = false
    let slowFrames = 0
    const eligible = !reduced && !navigator.connection?.saveData &&
      (navigator.hardwareConcurrency || 0) >= 6 &&
      (navigator.deviceMemory ? navigator.deviceMemory >= 8 : matchMedia('(min-width: 1024px) and (pointer: fine)').matches)
    const upgrade = () => {
      if (requested || !eligible) return
      requested = true
      import('./shrineWebGL').then(({ createShrineWebGL }) => {
        if (!cancelled) enhanced = createShrineWebGL(root)
      }).catch(() => { /* The SVG animation remains available. */ })
    }
    const ns='http://www.w3.org/2000/svg';function el(tag,attrs,parent){const e=document.createElementNS(ns,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);parent.append(e);return e}const tiles=root.querySelector('#tiles');for(let y=239,r=0;y<390;y+=9,r++){el('path',{d:`M0 ${y+6} Q222 ${y-7} 532 ${y+6}`},tiles);for(let x=-20+(r%2)*9;x<540;x+=20)el('path',{d:`M${x} ${y-1} l${(x-222)*.025} 9`},tiles)}const svg=root.querySelector('svg');const defs=svg.querySelector('defs');const tex=el('g',{id:'texture'},defs);el('rect',{width:180,height:105,fill:'#bd0716'},tex);const label=el('text',{x:90,y:60,'text-anchor':'middle','dominant-baseline':'middle','font-size':48,'font-family':'serif','font-weight':'bold',fill:'#fff1dc'},tex);label.textContent='یا حسین';const flag=root.querySelector('#flag');const strips=[];for(let i=0;i<90;i++){const s=el('svg',{width:2.7,height:105,viewBox:`${i*2} 0 2.7 105`,preserveAspectRatio:'none',overflow:'hidden'},flag);el('use',{href:'#texture'},s);const shadow=el('rect',{x:i*2,width:2.7,height:105,fill:'#000'},s);strips.push([s,shadow])}
    function draw(ms) {
      const t=ms/1000
      for(let i=0;i<90;i++) {
        const u=1-i/89,a=u*(9+3*Math.sin(t*.8)),p=u*9-t*4
        const [s,h]=strips[i]
        s.setAttribute('x',43+i*2+Math.sin(p)*a*.18)
        s.setAttribute('y',7+u*18+Math.sin(p)*a)
        s.setAttribute('height',105+Math.cos(p)*a*.35)
        h.setAttribute('opacity',.16+.15*Math.cos(p)*u)
      }
    }
    function tick(now) {
      if (last !== null) {
        const delta = now-last
        elapsed += delta
        if (enhanced) {
          slowFrames = delta > 34 ? slowFrames + 1 : Math.max(0, slowFrames - 1)
          if (slowFrames > 45) { enhanced.dispose(); enhanced = null }
        }
      }
      last=now
      if (enhanced) {
        if (!enhanced.render(elapsed / 1000)) { enhanced.dispose(); enhanced = null; draw(elapsed) }
      } else draw(elapsed)
      frame=requestAnimationFrame(tick)
    }
    draw(0)
    const observer=new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(frame)
      visible=entry.isIntersecting
      if (visible) upgrade()
      last=null
      if (visible && !stopped && !document.hidden) frame=requestAnimationFrame(tick)
    })
    const visibility=()=>{
      cancelAnimationFrame(frame)
      last=null
      if (visible && !stopped && !document.hidden) frame=requestAnimationFrame(tick)
    }
    observer.observe(root)
    document.addEventListener('visibilitychange',visibility)
    return ()=>{cancelled=true; enhanced?.dispose(); cancelAnimationFrame(frame);observer.disconnect();document.removeEventListener('visibilitychange',visibility)}
  },[reduced])
  return <div className="shrine-animation">
    <div ref={host} className="shrine-animation-art" role="img" aria-label="گنبد طلایی حرم و پرچم یا حسین" />
  </div>
}
