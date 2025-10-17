/* 🐱 Minimal JS – emoji kočka, bez animací/efektů, s komentáři rolí proměnných */
document.addEventListener('DOMContentLoaded', () => {
  // EMOJI: mapování stav → emoji (zobrazení UI)
  const EMOJI = {
    walk: '😺',    // „jde za vámi“
    attack: '😾',  // „útočí“
    sleep: '🐱💤'  // „spí“
  }

  // THRESH: prahové vzdálenosti v px pro přepínání stavů
  const THRESH = { attack: 50, sleep: 800, wake: 200 }

  // STEP: délka jednoho kroku kočky při události (px)
  const STEP = 4

  // cat: DOM element reprezentující kočku (emoji)
  const cat = document.createElement('div')
  cat.textContent = EMOJI.sleep
  cat.style.cssText = `
    position: fixed;
    left: 0; top: 0;
    transform: translate(-50%, -50%);
    font-size: 64px; line-height: 1;
    user-select: none; pointer-events: none;
    z-index: 2147483647;
  `
  document.body.appendChild(cat)

  // pos: aktuální pozice kočky v okně (v px)
  let pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 }

  // state: aktuální stav kočky (sleep | walk | attack)
  let state = 'sleep'

  // place(): umístí DOM element kočky na souřadnice pos
  const place = () => {
    cat.style.left = pos.x + 'px'
    cat.style.top = pos.y + 'px'
  }
  place()

  // setState(s): změní stav a odpovídající emoji
  const setState = s => {
    if (state !== s) {
      state = s
      cat.textContent = EMOJI[s]
    }
  }

  // onPointer(e): zpracuje pohyb/klik/prst a posune kočku o STEP směrem k cíli
  const onPointer = e => {
    // target: souřadnice ukazatele/prstu (v px)
    const target = { x: e.clientX, y: e.clientY }

    // dx, dy: vektory z kočky na cíl; dist: eukleidovská vzdálenost
    const dx = target.x - pos.x
    const dy = target.y - pos.y
    const dist = Math.hypot(dx, dy)

    // Stavový automat (bez plynulé animace)
    if (state === 'sleep') {
      // spí, dokud se nepřiblížíte < wake
      if (dist < THRESH.wake) setState('attack')
      else return
    } else {
      if (dist > THRESH.sleep) {
        setState('sleep')
        return
      }
      if (dist < THRESH.attack) setState('attack')
      else setState('walk')
    }

    // Posun o jeden krok směrem k cíli
    if (dist > 0) {
      const step = Math.min(STEP, dist) // step: skutečná délka kroku (nesmí přeskočit cíl)
      pos.x += (dx / dist) * step
      pos.y += (dy / dist) * step
      place()
    }
  }

  // Reakce na myš i dotyk (Pointer Events)
  window.addEventListener('pointermove', onPointer, { passive: true })
  window.addEventListener('pointerdown', onPointer, { passive: true })

  // resize handler: udrží kočku v rámci okna při změně velikosti
  window.addEventListener('resize', () => {
    pos.x = Math.max(0, Math.min(window.innerWidth, pos.x))
    pos.y = Math.max(0, Math.min(window.innerHeight, pos.y))
    place()
  })
})