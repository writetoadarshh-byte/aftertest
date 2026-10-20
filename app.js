/**
 * aftertest.in — behaviour and motion.
 * 1. Nav menu, anchors, FAQ (work with or without motion).
 * 2. The five-step walkthrough (one example student per subject; every worked
 *    answer below has been checked: practice and Test B items test only the
 *    followed topic, and none repeats a Test A question).
 * 3. Motion (only under prefers-reduced-motion: no-preference): Lenis smooth
 *    scroll, GSAP + ScrollTrigger reveals, the Test A → practice → Test B story
 *    (scroll picks the step, each change plays on its own clock), count-ups, the
 *    hero wordmark and card.
 */

(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const qs = (sel, root) => (root || document).querySelector(sel);
  const qsa = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const html = document.documentElement;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const motionOK = html.classList.contains('motion') && hasGsap;
  if (motionOK) window.__aftertestMotion = true; else html.classList.remove('motion');

  /* ---------------------------------------------------------------------
     Wordmarks: fit "AfterTest" to the full container width
     --------------------------------------------------------------------- */

  function fitWordmarks() {
    const wm = $('wordmark');
    if (!wm) return;
    const clip = wm.parentElement;
    const available = clip.clientWidth;
    if (!available) return;
    wm.style.fontSize = '100px';
    const range = document.createRange();
    range.selectNodeContents(wm);
    const natural = range.getBoundingClientRect().width;
    if (!natural) { wm.style.fontSize = ''; return; }
    const size = Math.max(40, Math.min(360, (available / natural) * 100 * 0.985));
    html.style.setProperty('--wm-size', size.toFixed(2) + 'px');
    wm.style.fontSize = '';
  }

  /* ---------------------------------------------------------------------
     Nav: mobile menu, dark/light state, anchor scrolling
     --------------------------------------------------------------------- */

  let lenis = null;

  // Where an element sits in the page with nothing holding. A held chapter is sticky, so while it
  // holds the browser reports where it is held, not where it lives.
  function pageTop(el) {
    const holding = html.classList.contains('holds');
    if (holding) html.classList.remove('holds');
    const y = el.getBoundingClientRect().top + window.scrollY;
    if (holding) html.classList.add('holds');
    return y;
  }

  function scrollToHash(hash, fast) {
    const target = hash === '#top' ? document.body : qs(hash);
    if (!target) return;
    const pad = parseFloat(getComputedStyle(html).scrollPaddingTop) || 0;
    const y = hash === '#top' ? 0 : Math.max(0, pageTop(target) - pad);
    if (lenis) {
      lenis.scrollTo(hash === '#top' ? 0 : y - 72, { duration: fast ? 0.8 : 1.3 });
    } else {
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }

  function initNav() {
    const toggle = $('navToggle');
    const menu = $('menu');
    if (!toggle || !menu) return;

    function setMenu(open) {
      toggle.setAttribute('aria-expanded', String(open));
      menu.hidden = !open;
      $('nav').classList.toggle('is-open', open);
      if (open) $('nav').classList.remove('is-hidden');
      document.body.style.overflow = open ? 'hidden' : '';
      if (lenis) open ? lenis.stop() : lenis.start();
      if (open) qs('a', menu).focus();
    }

    toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !menu.hidden) { setMenu(false); toggle.focus(); }
    });

    qsa('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const hash = a.getAttribute('href');
        if (hash.length < 2 || !qs(hash) && hash !== '#top') return;
        e.preventDefault();
        if (!menu.hidden) setMenu(false);
        history.replaceState(null, '', hash);
        scrollToHash(hash);
      });
    });
  }

  /* ---------------------------------------------------------------------
     FAQ: one answer open at a time; smooth open/close under motion
     --------------------------------------------------------------------- */

  function initFaq() {
    const list = $('faqList');
    if (!list) return;
    const items = qsa('details', list);
    items.forEach((d) => {
      const summary = qs('summary', d);
      const answer = qs('.faq-a', d);
      summary.addEventListener('click', (e) => {
        if (!motionOK) {
          if (!d.open) items.forEach((o) => { if (o !== d) o.open = false; });
          return;
        }
        e.preventDefault();
        if (d.open) {
          gsap.to(answer, { height: 0, opacity: 0, duration: 0.35, ease: 'power2.inOut', onComplete: () => { d.open = false; answer.style.height = ''; answer.style.opacity = ''; } });
        } else {
          items.forEach((o) => {
            if (o !== d && o.open) {
              const oa = qs('.faq-a', o);
              gsap.to(oa, { height: 0, opacity: 0, duration: 0.3, ease: 'power2.inOut', onComplete: () => { o.open = false; oa.style.height = ''; oa.style.opacity = ''; } });
            }
          });
          d.open = true;
          gsap.from(answer, { height: 0, opacity: 0, duration: 0.45, ease: 'power3.out', clearProps: 'height,opacity' });
        }
      });
    });
  }

  /* ---------------------------------------------------------------------
     The walkthrough
     --------------------------------------------------------------------- */

  const ICON_OK = '<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';
  const ICON_NO = '<svg viewBox="0 0 24 24" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

  const STEPS = [
    { name: 'Test A', verb: 'Diagnose', title: 'Find the weak topics.', line: 'One paper for the whole class. Every question is tagged with a topic and a difficulty level.' },
    { name: 'Report', verb: 'Tell', title: 'Topics, not just marks.', line: 'A report card with every topic: how many right, out of how many asked.' },
    { name: 'Class', verb: 'Teach', title: 'Class starts at the mistake.', line: 'The teacher fixes the wrong step, not the whole chapter.' },
    { name: 'Practice', verb: 'Drill', title: 'A practice sheet made for each student.', line: 'Only their weak topics. New questions, similar level.' },
    { name: 'Test B', verb: 'Retest', title: 'Test the weak topics again.', line: "Each student's own paper, with never-seen questions. Then Test A and Test B are compared." }
  ];

  const SUBJECTS = {
    maths: {
      name: 'Aarav',
      grade: 'Class 10',
      subject: 'Maths',
      chapter: 'Quadratic equations',
      concept: 'Splitting the middle term',
      testA: [
        { q: 11, marked: 'B', correct: 'B', concept: 'Discriminant', level: 4 },
        { q: 12, marked: 'D', correct: 'D', concept: 'Nature of roots', level: 5 },
        { q: 13, marked: 'A', correct: 'C', concept: 'Splitting the middle term', level: 6 },
        { q: 14, marked: 'A', correct: 'A', concept: 'Quadratic formula', level: 5 },
        { q: 15, marked: 'D', correct: 'B', concept: 'Splitting the middle term', level: 5 }
      ],
      report: {
        marks: '42/60',
        weak: [['Splitting the middle term', 0, 2, 'L5–6'], ['Quadratic formula', 1, 2, 'L6'], ['Word problems', 1, 3, 'L7']],
        strong: [['Discriminant', 3, 3], ['Nature of roots', 2, 2], ['Standard form', 3, 3]],
        more: 5,
        next: "Bring these questions to Tuesday's class."
      },
      lesson: {
        q: 'Q13',
        problem: '2x² − 5x − 3 = 0',
        wrong: '(2x + 1)(x + 3) = 0',
        note: 'Product −6, sum −5 → −6x and +x',
        right: ['2x² − 6x + x − 3 = 0', '(2x + 1)(x − 3) = 0', 'x = 3  or  x = −½']
      },
      practice: {
        levels: 'L5–7',
        hint: 'Solve by splitting the middle term.',
        qs: ['3x² − 10x − 8 = 0', '6x² − x − 2 = 0', '4x² − 4x − 3 = 0', '2x² + x − 6 = 0'],
        seen: 'Q13, Q15 from Test A'
      },
      testB: ['5x² − 13x − 6 = 0', '2x² − 7x − 15 = 0', '3x² + 5x − 2 = 0']
    },

    physics: {
      name: 'Riya',
      grade: 'Class 11',
      subject: 'Physics',
      chapter: 'Motion in a plane',
      concept: 'Vertical component (u sin θ)',
      testA: [
        { q: 6, marked: 'C', correct: 'C', concept: 'Horizontal motion', level: 4 },
        { q: 7, marked: 'A', correct: 'A', concept: 'Range formula', level: 5 },
        { q: 8, marked: 'A', correct: 'D', concept: 'Vertical component (u sin θ)', level: 6 },
        { q: 9, marked: 'B', correct: 'B', concept: 'Relative velocity', level: 5 },
        { q: 10, marked: 'B', correct: 'C', concept: 'Vertical component (u sin θ)', level: 5 }
      ],
      report: {
        marks: '38/60',
        weak: [['Vertical component (u sin θ)', 0, 2, 'L5–6'], ['Relative velocity', 1, 3, 'L6']],
        strong: [['Horizontal motion', 3, 3], ['Range formula', 2, 2], ['Vector addition', 3, 3]],
        more: 4,
        next: "Bring these questions to Thursday's class."
      },
      lesson: {
        q: 'Q8',
        problem: 'u = 20 m/s at 30°. Maximum height? (g = 10)',
        wrong: 'H = u² / 2g = 400 / 20 = 20 m',
        note: 'Only the vertical part rises: u sin 30° = 10 m/s',
        right: ['H = (u sin θ)² / 2g', '= 10² / 20', '= 5 m']
      },
      practice: {
        levels: 'L5–7',
        hint: 'Take g = 10 m/s².',
        qs: [
          'u = 25 m/s at 53°. Maximum height? (sin 53° = 0.8)',
          'u = 30 m/s at 30°. Time to reach the top?',
          'Same speed at 30° and at 60°. Ratio of maximum heights?',
          'Maximum height is 45 m. Vertical component of launch velocity?'
        ],
        seen: 'Q8, Q10 from Test A'
      },
      testB: [
        'u = 50 m/s at 37°. Maximum height? (sin 37° = 0.6)',
        'u = 20 m/s at 30°. Time of flight?',
        'Same speed at 30° and at 90°. Ratio of maximum heights?'
      ]
    },

    chemistry: {
      name: 'Kabir',
      grade: 'Class 11',
      subject: 'Chemistry',
      chapter: 'Mole concept',
      concept: 'Mole ratio from a balanced equation',
      testA: [
        { q: 3, marked: 'D', correct: 'D', concept: 'Molar mass', level: 3 },
        { q: 4, marked: 'B', correct: 'D', concept: 'Mole ratio from a balanced equation', level: 6 },
        { q: 5, marked: 'A', correct: 'A', concept: "Avogadro's number", level: 4 },
        { q: 6, marked: 'C', correct: 'C', concept: 'Percentage composition', level: 5 },
        { q: 7, marked: 'A', correct: 'C', concept: 'Mole ratio from a balanced equation', level: 5 }
      ],
      report: {
        marks: '40/60',
        weak: [['Mole ratio from a balanced equation', 0, 2, 'L5–6'], ['Limiting reagent', 1, 3, 'L7']],
        strong: [['Molar mass', 3, 3], ["Avogadro's number", 2, 2], ['Percentage composition', 3, 3]],
        more: 4,
        next: "Bring these questions to Monday's class."
      },
      lesson: {
        q: 'Q4',
        problem: 'Moles of O₂ needed to burn 64 g CH₄?',
        wrong: 'CH₄ + O₂ → CO₂ + H₂O, so 4 mol O₂',
        note: 'Balance first. Ratios come from the balanced equation.',
        right: ['CH₄ + 2O₂ → CO₂ + 2H₂O', '64 g CH₄ = 4 mol', '4 × 2 = 8 mol O₂']
      },
      practice: {
        levels: 'L5–7',
        hint: 'Balance the equation first.',
        qs: [
          '2H₂ + O₂ → 2H₂O. Moles of O₂ for 6 mol H₂?',
          'C₂H₆ + O₂ → CO₂ + H₂O. Moles of CO₂ from 3 mol C₂H₆?',
          'N₂ + H₂ → NH₃. Grams of NH₃ from 2 mol N₂?',
          'Moles of O₂ needed to burn 88 g C₃H₈?'
        ],
        seen: 'Q4, Q7 from Test A'
      },
      testB: [
        'Fe + O₂ → Fe₂O₃. Moles of O₂ for 8 mol Fe?',
        'C₄H₁₀ + O₂ → CO₂ + H₂O. Moles of CO₂ from 2 mol C₄H₁₀?',
        'Grams of H₂O formed when 16 g CH₄ burns?'
      ]
    },

    biology: {
      name: 'Ananya',
      grade: 'Class 11',
      subject: 'Biology',
      chapter: 'Cell cycle and cell division',
      concept: 'Anaphase I vs Anaphase II',
      testA: [
        { q: 4, marked: 'C', correct: 'C', concept: 'Phases of mitosis', level: 3 },
        { q: 5, marked: 'B', correct: 'D', concept: 'Anaphase I vs Anaphase II', level: 6 },
        { q: 6, marked: 'A', correct: 'A', concept: 'Interphase (G1, S, G2)', level: 4 },
        { q: 7, marked: 'D', correct: 'D', concept: 'Crossing over', level: 5 },
        { q: 8, marked: 'A', correct: 'C', concept: 'Anaphase I vs Anaphase II', level: 5 }
      ],
      report: {
        marks: '39/60',
        weak: [['Anaphase I vs Anaphase II', 0, 2, 'L5–6'], ['Chromosome number in meiosis', 1, 3, 'L6']],
        strong: [['Phases of mitosis', 3, 3], ['Interphase (G1, S, G2)', 2, 2], ['Crossing over', 2, 2]],
        more: 4,
        next: "Bring these questions to Wednesday's class."
      },
      lesson: {
        q: 'Q5',
        problem: 'What separates in Anaphase I?',
        wrong: 'Sister chromatids separate',
        note: 'That happens in Anaphase II. Anaphase I splits the pairs.',
        right: ['Anaphase I: homologous chromosomes separate', 'Sister chromatids stay joined at the centromere', 'Anaphase II: sister chromatids separate']
      },
      practice: {
        levels: 'L5–7',
        hint: 'Ask: are pairs separating, or chromatids?',
        qs: [
          'After Anaphase I, how many chromatids does each chromosome at a pole have?',
          'Which stage of meiosis looks most like mitotic anaphase, and why?',
          'In which stage of meiosis do the centromeres split?',
          'In a meiotic cell, chromosomes with two chromatids each move to opposite poles. Name the stage.'
        ],
        seen: 'Q5, Q8 from Test A'
      },
      testB: [
        'Do centromeres split in Anaphase I? Give a reason.',
        'Which separate in Anaphase II: homologous chromosomes or sister chromatids?',
        'In a haploid cell during meiosis, sister chromatids move to opposite poles. Name the stage.'
      ]
    }
  };

  const dots = (right, total) =>
    '<span class="dots" aria-hidden="true">' +
    Array.from({ length: total }, (_, i) => `<i class="dot ${i < right ? 'is-green' : 'is-red'}"></i>`).join('') +
    '</span>';

  const otherWeak = (s) => s.report.weak.slice(1).map(([topic]) => topic);

  function renderTestA(s) {
    const rows = s.testA.map((r) => {
      const ok = r.marked === r.correct;
      const bubbles = ['A', 'B', 'C', 'D'].map((letter) => {
        let cls = '';
        if (letter === r.marked) cls = 'on';
        else if (!ok && letter === r.correct) cls = 'key';
        return `<i class="${cls}">${letter}</i>`;
      }).join('');
      const said = ok ? `Marked ${r.marked}, right` : `Marked ${r.marked}, answer ${r.correct}`;
      return `
        <li class="${ok ? '' : 'miss'}">
          <span class="omr-q">Q${r.q}</span>
          <span class="bubbles" role="img" aria-label="${said}">${bubbles}</span>
          <span class="omr-c">${r.concept} <span class="tag">L${r.level}</span></span>
          <span class="mark ${ok ? 'ok' : 'no'}">${ok ? ICON_OK : ICON_NO}</span>
        </li>`;
    }).join('');

    return `
      <div class="paper">
        <div class="paper-head"><strong>Test A · ${s.chapter}</strong><span class="legend">L = difficulty, 1–10</span></div>
        <ul class="omr">${rows}</ul>
        <p class="stage-note"><span class="mark no">${ICON_NO}</span><span>Missed twice: <b>${s.concept}</b></span></p>
      </div>`;
  }

  function renderReport(s) {
    const r = s.report;
    const line = ([label, right, total, level], i) => `
      <li class="report-line${i === 0 && level ? ' followed' : ''}">
        <span class="report-topic">${label}${level ? ` <span class="tag tag-red">${level}</span>` : ''}</span>
        ${dots(right, total)}
        <span class="score">${right}/${total}</span>
      </li>`;

    return `
      <div class="paper report-card">
        <div class="paper-head"><strong>Report card · ${s.name}</strong><span>${s.subject} Test A · <span class="report-marks">${r.marks}</span></span></div>
        <p class="report-group weak">Weak topics</p>
        <ul class="report-list weak">${r.weak.map(line).join('')}</ul>
        <p class="report-group good">Strong topics</p>
        <ul class="report-list good">${r.strong.map(line).join('')}</ul>
        <p class="report-more">+ ${r.more} more topics</p>
        <p class="report-next"><b>Next:</b> ${r.next}</p>
      </div>`;
  }

  function renderClass(s) {
    const c = s.lesson;
    const right = c.right.map((step, i) =>
      `<p class="nb-line nb-right"${i === c.right.length - 1 ? ' data-m="✓"' : ''}>${step}</p>`
    ).join('');

    return `
      <div class="notebook">
        <div class="nb-head"><span>${s.name}'s working</span><span class="teacher">Teacher's note</span></div>
        <p class="nb-line nb-q"><span class="tag">${c.q}</span>${c.problem}</p>
        <p class="nb-line nb-wrong" data-m="✗"><span>${c.wrong}</span></p>
        <p class="nb-line nb-note">${c.note}</p>
        ${right}
      </div>`;
  }

  function renderPractice(s) {
    const p = s.practice;
    const items = p.qs.map((q, i) => `<li><b>${i + 1}.</b><span>${q}</span></li>`).join('');
    const others = otherWeak(s).map((topic) =>
      `<li><span>+ ${topic}</span><span>4 questions</span></li>`
    ).join('');

    return `
      <div class="paper">
        <div class="paper-head"><strong>Practice sheet · ${s.name}</strong><span class="tag">Only weak topics</span></div>
        <div class="topic-head"><span class="topic">${s.concept}</span><span class="tag">4 questions · ${p.levels}</span></div>
        <p class="sheet-hint">${p.hint}</p>
        <ol class="qs">${items}</ol>
        <ul class="more">${others}</ul>
        <div class="left-out">
          <span>Left out</span>
          <ul>
            <li>${p.seen}</li>
            <li>Topics ${s.name} already knows</li>
          </ul>
        </div>
      </div>`;
  }

  function renderTestB(s) {
    const [, aRight, aTotal] = s.report.weak[0];
    const items = s.testB.map((q, i) =>
      `<li><b>${i + 1}.</b><span>${q}</span><span class="mark ok">${ICON_OK}</span></li>`
    ).join('');
    const others = otherWeak(s).map((topic) =>
      `<li><span>+ ${topic}</span><span>3 questions</span></li>`
    ).join('');

    return `
      <div class="paper">
        <div class="paper-head"><strong>Test B · ${s.name}</strong><span class="tag">Never-seen questions</span></div>
        <div class="topic-head"><span class="topic">${s.concept}</span><span class="tag">3 questions</span></div>
        <ol class="qs ticked">${items}</ol>
        <ul class="more">${others}</ul>
        <div class="ab">
          <div class="ab-col"><span class="ab-label">Test A</span><b class="ab-score red">${aRight}/${aTotal}</b></div>
          <svg class="ab-arrow" viewBox="0 0 44 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 8h38M34 2l6 6-6 6"/></svg>
          <div class="ab-col"><span class="ab-label">Test B</span><b class="ab-score green">3/3</b></div>
          <span class="pill pill-up">Improved</span>
        </div>
      </div>`;
  }

  const RENDERERS = [renderTestA, renderReport, renderClass, renderPractice, renderTestB];

  function initWalkthrough() {
    const root = $('sim');
    if (!root) return;

    const tabs = qsa('[role="tab"]', root);
    const items = tabs.map((tab) => tab.parentElement);
    const radios = qsa('[role="radio"]', root);
    const panel = $('simPanel');
    const prev = $('simPrev');
    const next = $('simNext');
    const stage = $('simStage');

    let step = 0;
    let subject = 'maths';

    function render(direction) {
      const s = SUBJECTS[subject];
      const st = STEPS[step];

      items.forEach((li, i) => {
        li.classList.toggle('reached', i <= step);
        li.classList.toggle('current', i === step);
      });
      tabs.forEach((tab, i) => {
        tab.setAttribute('aria-selected', String(i === step));
        tab.tabIndex = i === step ? 0 : -1;
      });
      radios.forEach((radio) => {
        const on = radio.dataset.subject === subject;
        radio.setAttribute('aria-checked', String(on));
        radio.tabIndex = on ? 0 : -1;
      });

      panel.setAttribute('aria-labelledby', tabs[step].id);
      $('simWho').innerHTML = `Example student: <b>${s.name}</b> · ${s.grade} · ${s.chapter}`;
      $('simCount').textContent = `Step ${step + 1} of ${STEPS.length} · ${st.verb}`;
      $('simTitle').textContent = st.title;
      $('simLine').textContent = st.line;
      swapStage(RENDERERS[step](s), motionOK ? direction : 0);

      prev.disabled = step === 0;
      next.textContent = step === STEPS.length - 1 ? '↺ Start again' : `Next: ${STEPS[step + 1].name} →`;

      if (motionOK && direction !== 0) {
        gsap.fromTo(qsa('.walk-count, .walk-copy h3, .walk-line', root), { y: 10, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.55, stagger: 0.05, ease: 'expo.out', overwrite: true, clearProps: 'transform,opacity' });
      }
    }

    // The old paper slips out while the new one slides in from the side it comes from,
    // and the box eases to the new paper's height instead of jumping
    function swapStage(markup, direction) {
      gsap.killTweensOf(stage);
      if (!direction) { stage.style.height = ''; stage.innerHTML = markup; return; }
      const from = stage.getBoundingClientRect().height;
      stage.style.height = '';
      qsa('.is-leaving', stage).forEach((el) => el.remove());
      const old = stage.firstElementChild;
      if (old) { gsap.killTweensOf(old); old.classList.add('is-leaving'); }
      stage.insertAdjacentHTML('beforeend', markup);
      const card = stage.lastElementChild;
      const to = stage.getBoundingClientRect().height;
      if (Math.abs(to - from) > 1) gsap.fromTo(stage, { height: from }, { height: to, duration: 0.55, ease: 'expo.out', clearProps: 'height' });
      if (old) gsap.to(old, { x: -18 * direction, opacity: 0, duration: 0.24, ease: 'power2.in', onComplete: () => old.remove() });
      gsap.fromTo(card, { x: 28 * direction, opacity: 0 }, { x: 0, opacity: 1, duration: 0.65, ease: 'expo.out', delay: 0.06, clearProps: 'transform,opacity' });
    }

    function goTo(index, focusTab) {
      const from = step;
      step = (index + STEPS.length) % STEPS.length;
      render(step > from ? 1 : step < from ? -1 : 1);
      if (focusTab) tabs[step].focus();
    }

    tabs.forEach((tab, i) => tab.addEventListener('click', () => goTo(i)));
    prev.addEventListener('click', () => goTo(step - 1));
    next.addEventListener('click', () => goTo(step + 1));

    qs('.rail', root).addEventListener('keydown', (e) => {
      const moves = { ArrowRight: step + 1, ArrowLeft: step - 1, Home: 0, End: STEPS.length - 1 };
      if (!(e.key in moves)) return;
      e.preventDefault();
      goTo(moves[e.key], true);
    });

    radios.forEach((radio) => radio.addEventListener('click', () => {
      if (radio.dataset.subject === subject) return;
      subject = radio.dataset.subject;
      render(1);
    }));

    // Phones: swipe the paper left or right to step through the example
    let touchX = null;
    let touchY = 0;
    stage.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; touchY = e.touches[0].clientY; }, { passive: true });
    stage.addEventListener('touchcancel', () => { touchX = null; }, { passive: true });
    stage.addEventListener('touchend', (e) => {
      if (touchX === null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      const dy = e.changedTouches[0].clientY - touchY;
      touchX = null;
      if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      const to = step + (dx < 0 ? 1 : -1);
      if (to >= 0 && to < STEPS.length) goTo(to);
    }, { passive: true });

    qs('.subject-switch', root).addEventListener('keydown', (e) => {
      const delta = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!delta) return;
      e.preventDefault();
      const keys = radios.map((r) => r.dataset.subject);
      subject = keys[(keys.indexOf(subject) + delta + keys.length) % keys.length];
      render(1);
      radios[keys.indexOf(subject)].focus();
    });

    render(0);
  }

  /* ---------------------------------------------------------------------
     Motion
     --------------------------------------------------------------------- */

  function countUp(el, to, duration) {
    const o = { v: 0 };
    el.textContent = '0';
    return gsap.to(o, {
      v: to, duration: duration || 1.1, ease: 'power2.out',
      onUpdate: () => { el.textContent = String(Math.round(o.v)); }
    });
  }

  function initMotion() {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });

    // Smooth scroll for a mouse or trackpad only. Phones and tablets keep their own native scroll,
    // and the page adds no touch listeners that would make the browser wait before it scrolls.
    if (typeof window.Lenis !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      lenis = new Lenis({ lerp: 0.16, smoothWheel: true });
      window.__lenis = lenis;
      lenis.on('scroll', ScrollTrigger.update);
      ScrollTrigger.addEventListener('refresh', () => lenis.resize());
      gsap.ticker.add((time) => lenis.raf(time * 1000));
    }
    gsap.ticker.lagSmoothing(0);
    if (location.hash && location.hash.length > 1) {
      requestAnimationFrame(() => scrollToHash(location.hash, true));
    }

    const heroInner = qs('.hero-inner');
    const wordmark = $('wordmark');
    const card = $('heroCard');

    // Split the wordmark in two kerned halves so the letters can rise
    wordmark.innerHTML = '<span class="wm">After</span><span class="wm">Test</span>';
    fitWordmarks();

    /* Load ------------------------------------------------------------- */
    const load = gsap.timeline({ defaults: { ease: 'power4.out' } });
    load
      .set(wordmark, { visibility: 'visible' })
      .from(qsa('.wm', wordmark), { yPercent: 108, duration: 1.2, stagger: 0.09 }, 0.1)
      .to('.hero-meta', { opacity: 1, duration: 0.8 }, 0.5)
      .fromTo(card, { y: 48, scale: 0.94, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 1, ease: 'power3.out' }, 0.75)
      .fromTo('.hero-h1', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9 }, 0.95)
      .fromTo('.hero-side', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9 }, 1.1);

    /* Hero card: 0/2 in red becomes 3/3 in green, on a loop ------------ */
    const dotsA = qsa('.hc-dot-a', card);
    const dotsB = qsa('.hc-dot-b', card);
    const numB = qs('.hc-num-b', card);
    const arrow = qs('.hc-arrow-path', card);
    const pillWeak = qs('.hc-pill-weak', card);
    const pillUp = qs('.hc-pill-up', card);
    const arrowLen = arrow.getTotalLength();
    gsap.set(arrow, { strokeDasharray: arrowLen, strokeDashoffset: arrowLen });

    const cardLoop = gsap.timeline({ repeat: -1, repeatDelay: 4.5, paused: true });
    cardLoop
      .set(dotsA, { scale: 0, transformOrigin: 'center' })
      .set(dotsB, { scale: 0, transformOrigin: 'center' })
      .set(arrow, { strokeDashoffset: arrowLen })
      .set(pillWeak, { opacity: 1 })
      .set(pillUp, { opacity: 0 })
      .call(() => { numB.textContent = '0'; })
      .to(dotsA, { scale: 1, duration: 0.45, stagger: 0.18, ease: 'back.out(2.5)' }, 0.2)
      .to(arrow, { strokeDashoffset: 0, duration: 0.6, ease: 'power2.inOut' }, 0.9)
      .to(dotsB, { scale: 1, duration: 0.45, stagger: 0.28, ease: 'back.out(2.5)' }, 1.5)
      .call(() => { numB.textContent = '1'; }, null, 1.6)
      .call(() => { numB.textContent = '2'; }, null, 1.88)
      .call(() => { numB.textContent = '3'; }, null, 2.16)
      .to(pillWeak, { opacity: 0, duration: 0.3 }, 2.45)
      .to(pillUp, { opacity: 1, duration: 0.35 }, 2.5);
    load.call(() => cardLoop.play(), null, 1.4);

    /* Hero dissolves as the dark section slides over it ------------------ */
    const heroScrub = gsap.timeline({
      scrollTrigger: {
        trigger: '.story', start: 'top bottom', end: 'top 25%', scrub: true,
        onLeave: () => { heroInner.style.visibility = 'hidden'; cardLoop.pause(); },
        onEnterBack: () => { heroInner.style.visibility = ''; cardLoop.play(); }
      }
    });
    heroScrub
      .to('.wordmark-wrap', { scale: 0.94, y: -40, opacity: 0, ease: 'none' }, 0)
      .to('.hero-bottom, .hero-meta', { y: -24, opacity: 0, ease: 'none' }, 0);


    /* Reveals ----------------------------------------------------------- */
    qsa('[data-reveal]').forEach((el) => {
      gsap.from(el, { y: 28, opacity: 0, duration: 0.95, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });
    qsa('[data-reveal-group]').forEach((group) => {
      gsap.from(group.children, { y: 24, opacity: 0, duration: 0.9, stagger: 0.09, ease: 'power3.out', scrollTrigger: { trigger: group, start: 'top 88%', once: true } });
    });
    qsa('[data-stagger]').forEach((group) => {
      gsap.from(group.children, { y: 26, opacity: 0, duration: 0.8, stagger: 0.09, ease: 'power3.out', scrollTrigger: { trigger: group, start: 'top 86%', once: true } });
    });

    /* The story: Test A → practice sheet → Test B ----------------------- */
    initStory();

    /* Chapters: each colour change slides over the screen before it ------ */
    initChapters();

    /* The chat pill keeps clear of the opening screen. It appears once the dark section has risen
       40% of the way; on a phone, where it would sit on the words and then on the papers, only
       after the Test A/B cards. ---------------------------------------------- */
    const chat = qs('.wa-float');
    const phone = window.matchMedia('(max-width: 900px)');
    if (chat) {
      const away = (on) => chat.classList.toggle('is-away', on);
      ScrollTrigger.create({
        trigger: '.story', end: 'max',
        start: () => (phone.matches ? 'top ' + -($('stageTrack').offsetTop + $('stageTrack').offsetHeight - window.innerHeight) + 'px' : 'top 60%'),
        onEnter: () => away(false), onLeaveBack: () => away(true),
        onRefresh: (self) => away(self.scroll() < self.start)
      });
    }

    /* Result table: rows in, counts up ---------------------------------- */
    const rows = qsa('[data-result-row]');
    gsap.from(rows, {
      y: 18, opacity: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: '#result', start: 'top 70%', once: true, onEnter: () => {
        rows.forEach((row, i) => {
          qsa('[data-count]', row).forEach((n) => gsap.delayedCall(0.2 + i * 0.12, () => countUp(n, +n.dataset.count, 0.9)));
          const pill = qs('.pill', row);
          gsap.from(pill, { scale: 0.7, opacity: 0, duration: 0.5, ease: 'back.out(2)', delay: 0.9 + i * 0.12 });
        });
      } }
    });

    /* Portal: stats count up ------------------------------------------- */
    const stats = qsa('.portal-stats [data-count]');
    if (stats.length) {
      ScrollTrigger.create({ trigger: '.portal-stats', start: 'top 85%', once: true, onEnter: () => stats.forEach((n, i) => gsap.delayedCall(i * 0.1, () => countUp(n, +n.dataset.count))) });
    }

    /* Closing: words rise, the tick draws itself ------------------------ */
    const closingWords = qsa('#closingLine .w');
    const tick = qs('.closing-logo .logo-tick');
    const tickLen = tick.getTotalLength();
    gsap.set(tick, { strokeDasharray: tickLen, strokeDashoffset: tickLen });
    gsap.timeline({ scrollTrigger: { trigger: '.closing', start: 'top 70%', once: true } })
      .from('.closing-logo', { scale: 0.6, opacity: 0, duration: 0.6, ease: 'back.out(1.8)' }, 0)
      .to(tick, { strokeDashoffset: 0, duration: 0.7, ease: 'power2.inOut' }, 0.3)
      .from(closingWords, { yPercent: 60, opacity: 0, duration: 0.9, stagger: 0.07, ease: 'power3.out' }, 0.15);

    /* Footer wordmark drifts up --------------------------------------- */
    gsap.from('#footerMark', { yPercent: 30, ease: 'none', scrollTrigger: { trigger: '.footer-mark-clip', start: 'top bottom', end: 'bottom bottom', scrub: true } });

    /* Sizes that move the layout are set just before ScrollTrigger measures. Its own
       resize handling refreshes on real resizes and ignores a phone's toolbar sliding
       in and out, so nothing re-measures (and nothing jumps) in the middle of a scroll. */
    ScrollTrigger.addEventListener('refreshInit', fitWordmarks);
    ScrollTrigger.refresh();
    document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());
  }

  /* ---------------------------------------------------------------------
     Chapters. Where the colour changes (hero → story → the light chapter,
     Example to FAQ → closing), the next one slides up over the last screen of
     the one before. That screen holds still, sticky at its own bottom edge, so
     the browser moves nothing, and its content sinks back and fades with the
     scroll, the way the hero always has. A fully covered chapter is hidden.
     --------------------------------------------------------------------- */

  function initChapters() {
    const main = qs('main');
    const chapters = [
      { held: qs('.hero'), next: qs('.story'), fade: [] }, // the hero's own dissolve is heroScrub
      { held: qs('.story'), next: qs('.light-chapter'), fade: qsa('.stage-wrap, #result') },
      { held: qs('.light-chapter'), next: qs('.closing'), fade: qsa('.vision-head, .faq-head, .faq-list') }
    ].filter((c) => c.held && c.next);
    const held = chapters.map((c) => c.held);

    // The fade is over when the next chapter is 75% of the way up, or sooner if the page ends
    // first: a held chapter can only hold while the page still runs on below it
    function fadeEnd(next) {
      const below = main.getBoundingClientRect().bottom - next.getBoundingClientRect().top;
      return Math.round(Math.max(window.innerHeight * 0.25, window.innerHeight - below + 8));
    }

    function setHeights() {
      const heights = held.map((el) => el.offsetHeight);
      held.forEach((el, i) => el.style.setProperty('--hold-h', heights[i] + 'px'));
    }

    setHeights();
    html.classList.add('holds');
    // ScrollTrigger measures with every section in its normal place, so nothing inside a held
    // section is measured from where it happens to be holding
    ScrollTrigger.addEventListener('refreshInit', () => { html.classList.remove('holds'); setHeights(); });
    ScrollTrigger.addEventListener('refresh', () => html.classList.add('holds'));

    // When the page changes height (an FAQ answer opens, an Example step is longer), each section
    // keeps holding at its true bottom and the triggers below are measured again once it settles
    if ('ResizeObserver' in window) {
      let timer;
      new ResizeObserver(() => {
        setHeights();
        clearTimeout(timer);
        timer = setTimeout(() => ScrollTrigger.refresh(), 300);
      }).observe(main);
    }

    chapters.forEach(({ held: section, next, fade }) => {
      if (fade.length) {
        gsap.to(fade, { scale: 0.94, y: -40, opacity: 0, ease: 'none', scrollTrigger: { trigger: next, start: 'top bottom', end: () => 'top ' + fadeEnd(next) + 'px', scrub: true } });
      }
      // Hidden once the next chapter covers it completely, shown again on the way back up (and it
      // stays hidden at the very end of the page, where a trigger's range would otherwise end)
      const hide = (covered) => { section.style.visibility = covered ? 'hidden' : ''; };
      ScrollTrigger.create({
        trigger: next, start: 'top -64px', end: 'max',
        onEnter: () => hide(true), onLeaveBack: () => hide(false),
        onRefresh: (self) => hide(self.scroll() >= self.start)
      });
    });
  }

  /* ---------------------------------------------------------------------
     The story. The stage is CSS-sticky inside a tall track. How far you are
     through the track picks the step; each change then plays on its own clock:
     the new paper lands on top of the pile and the one before settles back,
     smaller and darker, its edge still showing. A change always finishes, never
     stops half-way and never trails the scroll. Only transform and opacity move.
     --------------------------------------------------------------------- */

  function initStory() {
    const track = $('stageTrack');
    const slot = $('sheets');
    const deck = $('deck');
    if (!track || !deck) return;
    const sheets = [$('sheetA'), $('sheetP'), $('sheetB')];
    const shades = sheets.map((sheet) => qs('.sheet-shade', sheet));
    const beats = qsa('.beat');
    const fills = beats.map((beat) => qs('.beat-bar i', beat));
    const fanCards = qsa('.fan i', deck);
    const chat = qs('.wa-float');
    const LAST = sheets.length - 1;
    const HYSTERESIS = 0.03; // a step changes 3% past its line, so a resting scroll never flickers
    const GATHER = [[36, 28], [-36, 28], [36, -28], [-36, -28], [0, 36], [0, -36]];
    const FAN_OUT = { x: (i) => GATHER[i][0], y: (i) => GATHER[i][1], scale: 0.9, opacity: 0 };
    const FAN_IN = { x: 0, y: 0, scale: 1, opacity: 1 };

    // How each role moves. Every ease starts at full speed, so a change answers the scroll at once:
    // the paper arriving on top, a paper settling into the pile, a paper lifting off (scrolling back)
    const MOVES = {
      top: { duration: 0.9, ease: 'expo.out', fade: 0.25 },
      pile: { duration: 0.8, ease: 'power3.out', fade: 0.25 },
      off: { duration: 0.45, ease: 'power2.out', fade: 0.22 }
    };

    // The small touches inside each paper. They are set up while the paper is out of sight, so the
    // frame in which a change starts does almost no work (nothing is measured, nothing is parsed).
    const DETAILS = [
      { rise: qsa('.omr li', sheets[0]), pop: qsa('.omr .mark', sheets[0]), foot: qsa('.sheet-foot', sheets[0]) },
      { rise: qsa('.topic-head, .qs li, .more li, .left-out', sheets[1]), pop: [], foot: [] },
      { rise: qsa('.topic-head, .qs li, .more li', sheets[2]), pop: qsa('.qs .mark', sheets[2]), foot: qsa('.ab > *', sheets[2]) }
    ].map((d) => ({ ...d, all: [...d.rise, ...d.pop, ...d.foot], hidden: false }));

    let current = -1;
    let settled = false;
    let fanShown = null;
    let peekPx = 14;
    const placed = [];
    const lastFill = [];

    function hideDetails(i) {
      const d = DETAILS[i];
      gsap.killTweensOf(d.all);
      gsap.set(d.rise, { y: 14, opacity: 0 });
      gsap.set(d.pop, { scale: 0 });
      gsap.set(d.foot, { y: 10, opacity: 0 });
      d.hidden = true;
    }

    function playDetails(i, delay) {
      const d = DETAILS[i];
      if (!d.hidden) return;
      d.hidden = false;
      gsap.to(d.rise, { y: 0, opacity: 1, duration: 0.7, ease: 'expo.out', stagger: 0.05, delay: delay });
      gsap.to(d.pop, { scale: 1, duration: 0.5, ease: 'back.out(2.2)', stagger: 0.1, delay: delay + 0.3 });
      gsap.to(d.foot, { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out', stagger: 0.07, delay: delay + 0.55 });
    }

    function revealDetails(i) {
      const d = DETAILS[i];
      if (!d.hidden) return;
      d.hidden = false;
      gsap.killTweensOf(d.all);
      gsap.set(d.all, { y: 0, scale: 1, opacity: 1 });
    }

    // Where sheet i sits while `step` is showing: in the pile, on top, or waiting out of sight
    function pose(i, step) {
      if (i < step) {
        const depth = step - i;
        return { role: 'pile', key: 'pile' + depth, yPercent: 0, y: -peekPx * depth, scale: 1 - 0.05 * depth, rotation: 0, opacity: 1, shade: depth === 1 ? 0.42 : 0.66 };
      }
      if (i === step) return { role: 'top', key: 'top', yPercent: 0, y: 0, scale: 1, rotation: 0, opacity: 1, shade: 0 };
      return { role: 'off', key: 'off', yPercent: 16, y: 0, scale: 1.04, rotation: 1.2, opacity: 0, shade: 0 };
    }

    function move(i, to, instant) {
      const sheet = sheets[i];
      const shade = shades[i];
      const was = placed[i];
      const changed = was !== to.key;
      if (!changed && !instant) return;
      placed[i] = to.key;
      gsap.killTweensOf([sheet, shade]);
      if (instant) {
        gsap.set(sheet, { yPercent: to.yPercent, y: to.y, scale: to.scale, rotation: to.rotation, opacity: to.opacity, visibility: 'inherit' });
        gsap.set(shade, { opacity: to.shade });
        if (changed) { if (to.role === 'off') hideDetails(i); else revealDetails(i); }
        return;
      }
      const m = MOVES[to.role];
      gsap.to(sheet, { yPercent: to.yPercent, y: to.y, scale: to.scale, rotation: to.rotation, duration: m.duration, ease: m.ease });
      gsap.to(sheet, {
        opacity: to.opacity, duration: m.fade, ease: 'power2.out',
        // once a paper has lifted off, its details wait, ready to play on its next arrival
        onComplete: to.role === 'off' && i > 0 ? () => hideDetails(i) : null
      });
      gsap.to(shade, { opacity: to.shade, duration: m.duration, ease: m.ease });
      if (to.role === 'top' && was === 'off') playDetails(i, 0.1);
      else if (to.role === 'pile') revealDetails(i);
    }

    function fan(visible, instant) {
      if (fanShown === visible && !instant) return;
      fanShown = visible;
      gsap.killTweensOf(fanCards);
      if (instant) { gsap.set(fanCards, visible ? FAN_IN : FAN_OUT); return; }
      gsap.to(fanCards, visible
        ? { ...FAN_IN, duration: 0.9, ease: 'expo.out', stagger: 0.04 }
        : { ...FAN_OUT, duration: 0.55, ease: 'power3.out', stagger: 0.025 });
    }

    function show(step, instant) {
      if (step === current && !instant) return;
      current = step;
      sheets.forEach((sheet, i) => move(i, pose(i, step), instant));
      fan(step === 0, instant);
      beats.forEach((beat, j) => beat.classList.toggle('is-on', j === step));
    }

    function stepAt(raw) {
      let step = current < 0 ? Math.min(LAST, Math.floor(raw)) : current;
      while (step < LAST && raw >= step + 1 + HYSTERESIS) step++;
      while (step > 0 && raw < step - HYSTERESIS) step--;
      return step;
    }

    function onProgress(progress, instant) {
      const raw = progress * sheets.length;
      fills.forEach((fill, j) => {
        const f = Math.round(Math.min(1, Math.max(0, raw - j)) * 1000) / 1000;
        if (lastFill[j] !== f) { lastFill[j] = f; fill.style.setProperty('--fill', f); }
      });
      show(stepAt(raw), instant);
    }

    // Measured only when ScrollTrigger refreshes (load, real resizes), never while scrolling.
    // Phones and short windows: the pile shrinks to fit the room under the beats.
    function measure() {
      const peekNow = parseFloat(getComputedStyle(deck).getPropertyValue('--peek')) || 14;
      deck.style.scale = '';
      const room = slot.clientHeight;
      const need = deck.offsetHeight;
      if (room > 0 && need > room) deck.style.scale = (room / need).toFixed(3);
      if (peekNow !== peekPx) {
        peekPx = peekNow;
        if (current >= 0) show(current, true);
      }
    }

    // Test A arrives as the section comes up: answer rows rise, marks pop, the class's papers fan out
    function intro() {
      if (current !== 0) { revealDetails(0); return; }
      playDetails(0, 0);
      fan(true, false);
    }

    measure();
    show(0, true);
    const introPending = track.getBoundingClientRect().top > window.innerHeight * 0.85;
    if (introPending) {
      hideDetails(0);
      fanShown = false;
      gsap.set(fanCards, FAN_OUT);
    }

    ScrollTrigger.addEventListener('refreshInit', measure);
    ScrollTrigger.create({
      trigger: track, start: 'top top', end: 'bottom bottom',
      onUpdate: (self) => onProgress(self.progress, false),
      onRefresh: (self) => { onProgress(self.progress, !settled); settled = true; },
      // On a phone the floating chat pill would sit on the paper; it steps aside while the story holds the screen
      onToggle: (self) => { if (chat) chat.classList.toggle('is-tucked', self.isActive); }
    });
    if (introPending) {
      ScrollTrigger.create({ trigger: track, start: 'top 85%', once: true, onEnter: intro });
    }
  }

  /* The nav pill turns dark while it sits over a dark section ------------ */
  function initNavShade() {
    const nav = $('nav');
    const sections = qsa('main > section, main > .light-chapter, .footer');
    const dark = new Set(qsa('.story, .closing, .footer'));
    if (!nav || !sections.length) return;
    let ticking = false;
    let lastY = window.scrollY;
    let hidden = false;
    function update() {
      ticking = false;
      const y = window.scrollY;
      const probe = Math.min(36, nav.offsetHeight / 2);
      // A later section slides over an earlier one, so the header sits over the last one that reaches it
      let under = null;
      sections.forEach((sec) => { const r = sec.getBoundingClientRect(); if (r.top <= probe && r.bottom >= probe && sec.style.visibility !== 'hidden') under = sec; });
      nav.classList.toggle('is-dark', dark.has(under));
      nav.classList.toggle('is-scrolled', y > 24);
      // Tuck the header away while reading down the page; bring it back on the way up
      const delta = y - lastY;
      if (y < 120) hidden = false;
      else if (delta > 6) hidden = true;
      else if (delta < -6) hidden = false;
      nav.classList.toggle('is-hidden', hidden && !nav.classList.contains('is-open'));
      lastY = y;
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }

  function initStatic() {
    const wordmark = $('wordmark');
    if (wordmark) {
      wordmark.innerHTML = '<span class="wm">After</span><span class="wm">Test</span>';
      fitWordmarks();
      const hero = qs('.hero');
      hero.classList.toggle('hero--tall', hero.offsetHeight > window.innerHeight + 40);
      let t;
      window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(fitWordmarks, 150); });
      document.fonts && document.fonts.ready.then(fitWordmarks);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initFaq();
    initWalkthrough();
    if (motionOK) initMotion(); else initStatic();
    initNavShade();
  });
})();
