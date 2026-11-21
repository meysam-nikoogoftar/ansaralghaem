'use client'
import { Fragment, useEffect, useState } from 'react'
import { toFa } from './home-content'
export default function Countdown() {
  const [countdown, setCountdown] = useState({ d: 0, h: 0, m: 0, s: 0 })
  useEffect(() => {
    const tick = () => {
      const diff = Math.max(new Date('2027-07-27T00:00:00+03:30').getTime() - Date.now(), 0)
      setCountdown({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [])
  return (
    <>
      {' '}
      {/* Countdown */}
      <section className="countdown-section">
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="section-head fade-in">
            <h2 className="section-title">تا آغاز هفتمین کاروان اربعین</h2>
            <p className="section-desc">هر ثانیه، قدمی نزدیک‌تر به کربلا</p>
          </div>
          <div className="countdown fade-in">
            {[
              { val: countdown.d, label: 'روز' },
              { val: countdown.h, label: 'ساعت' },
              { val: countdown.m, label: 'دقیقه' },
              { val: countdown.s, label: 'ثانیه' },
            ].map((item, i) => (
              <Fragment key={item.label}>
                <div key={item.label} className="count-box">
                  <div className="count-num">{toFa(item.val)}</div>
                  <div className="count-label">{item.label}</div>
                </div>
                {i < 3 && (
                  <div key={`sep-${i}`} className="count-sep">
                    :
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
