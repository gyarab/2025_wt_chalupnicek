/*

    🐱 8‑bit kočka nahánějící kurzor – čistý JS, bez assetů

    ChatGPT prompt:
    
    napis v cistem javascriptu pro moderni prohlizec snipet pro vlozeni do vlastniho webu, ktery vlozi do stranky obrazek kocky, ktera lovi kurzor mysi, ne moc rychle, aby to bylo zabavne
    
    rozsireni: obrazek kocky je animovany, pro vzdalenost kurzoru mensi nez 50 px kocka utoci. pokud je kurzor dal nez 500px kocka se zastavi, lehne si do klubicka a spi dokud se clovek nepriblizi na mene nez 50px, tim se probudi a zacina lovit.
    
    Pro mobil udelej verzi kdy prilozeni prstu udela cerveny puntik (vetsi, aby byl pod prstem malinko videt), na ktery kocka utoci
    
    obrazek kocky vytvor ve stylu 8bit games sprite

*/
(function () {
  'use strict';

  // --- počkáme na DOM, ať máme <body> ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    // === Nastavení (můžete si doladit) ===
    const CAT_CSS_SIZE = 96;              // viditelná velikost kočky v px (škáluje 32×32 canvas)
    const GRID_SIZE = 32;                 // logická mřížka (neměňte, pokud nepředěláváte kreslení)
    const SPEED = { walk: 200, attack: 420 }; // px/s
    const THRESH = {
      attackIn: 50,   // < 50 → útok
      attackOut: 70,  // > 70 → konec útoku
      sleepIn: 500,   // > 500 → usni
      wakeIn: 50      // spící kočka se probudí jen když jste < 50
    };

    // Respekt k reduced‑motion: zjemníme rychlosti/plynulost
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      SPEED.walk = 120;
      SPEED.attack = 220;
    }

    // === Styl (přidáme do <head>) ===
    const style = document.createElement('style');
    style.textContent = `
      .pixel-cat {
        position: fixed;
        left: 0; top: 0;
        width: ${CAT_CSS_SIZE}px;
        height: ${CAT_CSS_SIZE}px;
        transform: translate(-50%, -50%) scaleX(1);
        transform-origin: 50% 50%;
        image-rendering: pixelated;
        pointer-events: none;
        z-index: 999999;
        filter: drop-shadow(0 4px 0 rgba(0,0,0,.16));
      }
      .cat-touch-dot {
        position: fixed;
        width: 44px; height: 44px;
        border-radius: 999px;
        background: rgba(255,0,0,.85);
        box-shadow: 0 0 0 6px rgba(255,0,0,.22);
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: 999998;
        display: none;
      }
      @media (prefers-reduced-motion: reduce) {
        .pixel-cat { transition: none !important; }
      }
    `;
    document.head.appendChild(style);

    // === Elementy: canvas kočky + dotykový puntík ===
    const cat = document.createElement('canvas');
    cat.className = 'pixel-cat';
    cat.width = GRID_SIZE;  // 32
    cat.height = GRID_SIZE; // 32
    const ctx = cat.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    document.body.appendChild(cat);

    const dot = document.createElement('div');
    dot.className = 'cat-touch-dot';
    document.body.appendChild(dot);

    // === Stav hry ===
    const STATE = { SLEEP: 'sleep', WALK: 'walk', ATTACK: 'attack' };
    let state = STATE.SLEEP;

    let pos = { x: window.innerWidth * 0.2, y: window.innerHeight * 0.7 }; // výchozí
    let target = { x: pos.x, y: pos.y };
    let facingRight = true;

    // === Vstupy: myš + dotyk (Pointer Events) ===
    // Myš – jen aktualizuje cíl, puntík neukazujeme
    window.addEventListener('mousemove', (e) => {
      target.x = e.clientX;
      target.y = e.clientY;
    }, { passive: true });

    // Dotyk – děláme červený puntík (větší, ať je pod prstem vidět) a honíme ho
    const onPointer = (e) => {
      if (e.pointerType === 'touch') {
        target.x = e.clientX;
        target.y = e.clientY;
        dot.style.left = target.x + 'px';
        dot.style.top = target.y + 'px';
        dot.style.display = 'block';
      }
    };
    window.addEventListener('pointerdown', onPointer, { passive: true });
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('pointerup', (e) => {
      if (e.pointerType === 'touch') {
        dot.style.display = 'none';
      }
    }, { passive: true });

    // Reflow/clamp při resize
    window.addEventListener('resize', () => {
      pos.x = clamp(pos.x, CAT_CSS_SIZE * 0.5, window.innerWidth - CAT_CSS_SIZE * 0.5);
      pos.y = clamp(pos.y, CAT_CSS_SIZE * 0.5, window.innerHeight - CAT_CSS_SIZE * 0.5);
    });

    // === Hlavní smyčka ===
    let last = performance.now();
    requestAnimationFrame(tick);

    function tick(now) {
      const dt = Math.min((now - last) / 1000, 0.033); // ~max 30 FPS simulace pro stabilitu
      last = now;

      const dx = target.x - pos.x;
      const dy = target.y - pos.y;
      const dist = Math.hypot(dx, dy);

      // --- Stavový automat ---
      switch (state) {
        case STATE.SLEEP:
          // Spí, dokud se nepřiblížíte < wakeIn (50 px)
          if (dist < THRESH.wakeIn) state = STATE.ATTACK;
          break;
        case STATE.ATTACK:
          if (dist > THRESH.sleepIn) state = STATE.SLEEP;
          else if (dist > THRESH.attackOut) state = STATE.WALK;
          break;
        case STATE.WALK:
          if (dist > THRESH.sleepIn) state = STATE.SLEEP;
          else if (dist < THRESH.attackIn) state = STATE.ATTACK;
          break;
      }

      // --- Pohyb ---
      let speed = 0;
      if (state === STATE.WALK) speed = SPEED.walk;
      else if (state === STATE.ATTACK) speed = SPEED.attack;

      if (speed > 0 && dist > 0.5) {
        const step = Math.min(speed * dt, dist);
        pos.x += (dx / dist) * step;
        pos.y += (dy / dist) * step;
      }

      // Držet kočku v okně (počítáme s centrovaným transformem)
      const pad = CAT_CSS_SIZE * 0.5 + 2;
      pos.x = clamp(pos.x, pad, window.innerWidth - pad);
      pos.y = clamp(pos.y, pad, window.innerHeight - pad);

      // Směr pohledu
      facingRight = target.x >= pos.x;

      // --- Kreslení „sprite“ kočky ---
      drawCat(ctx, state, now);

      // Umístění elementu
      cat.style.left = pos.x + 'px';
      cat.style.top = pos.y + 'px';
      // flip horizontálně podle směru
      cat.style.transform = 'translate(-50%, -50%) scaleX(' + (facingRight ? 1 : -1) + ')';

      requestAnimationFrame(tick);
    }

    // === Pomocné ===
    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

    // === 8‑bit „sprite“ (kreslení na 32×32 canvas) ===
    // Paleta
    const C = {
      fur:   '#d6903a', // srst
      fur2:  '#b6732f', // stín srsti
      out:   '#5a3b23', // tmavý obrys
      eye:   '#30cf62', // oči
      nose:  '#a03b2e', // čumák
      red:   '#e23b3b', // jazyk/ústa
      z:     '#7aa0ff'  // „Zzz“
    };

    // Jednopixelový blok/obdélník v mřížce
    function px(ctx, x, y, w = 1, h = 1, color = C.fur) {
      ctx.fillStyle = color;
      // zaokrouhlení drží ostré hrany i při integer souřadnicích
      ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
    }
    // Tmavý obrys kolem obdélníku (jednopixelové „linky“)
    function outlineRect(ctx, x, y, w, h) {
      ctx.fillStyle = C.out;
      ctx.fillRect(x - 1, y - 1, w + 2, 1);
      ctx.fillRect(x - 1, y + h, w + 2, 1);
      ctx.fillRect(x - 1, y, 1, h);
      ctx.fillRect(x + w, y, 1, h);
    }

    function drawCat(ctx, state, nowMs) {
      // Vyber frame podle stavu
      let frames = 2, fps = 1.2;
      if (state === STATE.WALK) { frames = 4; fps = 8; }
      if (state === STATE.ATTACK) { frames = 4; fps = 12; }
      const f = Math.floor((nowMs / 1000) * fps) % frames;

      // Vyčistit plátno
      ctx.clearRect(0, 0, GRID_SIZE, GRID_SIZE);

      // Lehounký „stín“ pod kočkou
      ctx.globalAlpha = 0.16;
      ctx.fillStyle = '#000';
      // stín posouváme maličko podle stavu
      const shW = state === STATE.ATTACK ? 18 : 16;
      const shX = (GRID_SIZE - shW) >> 1;
      ctx.fillRect(shX, 28, shW, 2);
      ctx.globalAlpha = 1;

      if (state === STATE.SLEEP) drawSleep(ctx, f);
      else if (state === STATE.ATTACK) drawAttack(ctx, f);
      else drawWalk(ctx, f);
    }

    // --- Pózy / animace ---
    function drawWalk(ctx, f) {
      // trup
      px(ctx, 8, 14, 16, 10, C.fur);
      px(ctx, 8, 14, 16, 1, C.fur2); // horní hrana stín
      outlineRect(ctx, 8, 14, 16, 10);

      // hlava
      px(ctx, 22, 9, 9, 8, C.fur);
      px(ctx, 22, 9, 9, 1, C.fur2);
      outlineRect(ctx, 22, 9, 9, 8);

      // uši
      px(ctx, 22, 7, 3, 2, C.fur); outlineRect(ctx, 22, 7, 3, 2);
      px(ctx, 28, 7, 3, 2, C.fur); outlineRect(ctx, 28, 7, 3, 2);

      // oči + čumák
      px(ctx, 25, 12, 1, 1, C.eye);
      px(ctx, 28, 12, 1, 1, C.eye);
      px(ctx, 26.5, 14, 1, 1, C.nose);

      // ocásek – kývání
      const tailY = [10, 9, 10, 11][f];
      px(ctx, 7, tailY, 2, 10, C.fur); outlineRect(ctx, 7, tailY, 2, 10);

      // nohy – střídání
      const step = f % 4;
      const liftA = (step === 0 || step === 3) ? 0 : 2;
      const liftB = (step === 1 || step === 2) ? 0 : 2;

      // zadní
      px(ctx, 10, 22, 3, 6 - liftA, C.fur); outlineRect(ctx, 10, 22, 3, 6 - liftA);
      px(ctx, 15, 22, 3, 6 - liftB, C.fur); outlineRect(ctx, 15, 22, 3, 6 - liftB);
      // přední
      px(ctx, 20, 22, 3, 6 - liftA, C.fur); outlineRect(ctx, 20, 22, 3, 6 - liftA);
      px(ctx, 24, 22, 3, 6 - liftB, C.fur); outlineRect(ctx, 24, 22, 3, 6 - liftB);
    }

    function drawAttack(ctx, f) {
      // přikrčený trup
      px(ctx, 8, 16, 16, 8, C.fur);
      px(ctx, 8, 16, 16, 1, C.fur2);
      outlineRect(ctx, 8, 16, 16, 8);

      // hlava víc vpřed
      px(ctx, 25, 12, 9, 8, C.fur);
      outlineRect(ctx, 25, 12, 9, 8);

      // uši dozadu
      px(ctx, 26, 10, 3, 2, C.fur2); outlineRect(ctx, 26, 10, 3, 2);
      px(ctx, 31, 10, 3, 2, C.fur2); outlineRect(ctx, 31, 10, 3, 2);

      // ostré oči
      px(ctx, 28, 15, 1, 1, C.eye);
      px(ctx, 30, 15, 1, 1, C.eye);

      // otevřená tlama (bliká)
      if (f % 2 === 0) { px(ctx, 33, 17, 2, 2, C.red); }

      // ocas napnutý
      px(ctx, 7, 14, 2, 9, C.fur2); outlineRect(ctx, 7, 14, 2, 9);

      // nohy „péro“ – jemná změna výšky
      const crouch = [0, 1, 0, 1][f % 4];
      px(ctx, 12, 21, 4, 5 - crouch, C.fur); outlineRect(ctx, 12, 21, 4, 5 - crouch);
      px(ctx, 18, 21, 4, 5 - crouch, C.fur); outlineRect(ctx, 18, 21, 4, 5 - crouch);
    }

    function drawSleep(ctx, f) {
      // stočené tělo
      px(ctx, 10, 15, 14, 12, C.fur);
      outlineRect(ctx, 10, 15, 14, 12);

      // hlava v kožíšku
      px(ctx, 20, 18, 6, 6, C.fur2);
      outlineRect(ctx, 20, 18, 6, 6);

      // ocas přes bok
      px(ctx, 9, 22, 6, 3, C.fur2);

      // Z‑bublinky (mírně se pohupují)
      const zY = [0, 1][f % 2];
      ctx.fillStyle = C.z;
      px(ctx, 27, 10 + zY, 1, 1, C.z); px(ctx, 28, 10 + zY, 1, 1, C.z);
      px(ctx, 28, 9 + zY, 1, 1, C.z);  px(ctx, 29, 9 + zY, 1, 1, C.z);
      px(ctx, 29, 8 + zY, 2, 1, C.z);
    }
  }
})();