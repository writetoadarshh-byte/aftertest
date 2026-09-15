/**
 * aftertest.in — five-step walkthrough.
 * One example student per subject. The first weak topic in each report is
 * followed through every step, so each screen shows the same case moving on.
 */

(function () {
  'use strict';

  const ICON_OK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';
  const ICON_NO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

  const STEPS = [
    { name: 'Test A', verb: 'Diagnose', title: 'Find the weak topics.', line: 'One paper for the whole class. Every question is tagged with a topic and a difficulty level.' },
    { name: 'Report', verb: 'Tell', title: 'Parents see topics, not just marks.', line: 'A report card with every topic: how many right, out of how many asked.' },
    { name: 'Class', verb: 'Teach', title: 'Class starts at the mistake.', line: 'The teacher fixes the wrong step, not the whole chapter.' },
    { name: 'Practice', verb: 'Drill', title: 'A practice sheet made for your child.', line: 'Only their weak topics. New questions, similar level.' },
    { name: 'Test B', verb: 'Retest', title: 'Test the weak topics again.', line: "Your child's own paper, with never-seen questions. Then Test A and Test B are compared." }
  ];

  // Every worked answer below has been checked: practice and Test B items
  // test only the followed topic, and none repeats a Test A question.
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
    Array.from({ length: total }, (_, i) => `<i class="dot${i < right ? ' on' : ''}"></i>`).join('') +
    '</span>';

  // Weak topics other than the one the walkthrough follows
  const otherWeak = (s) => s.report.weak.slice(1).map(([topic]) => topic);

  function renderTestA(s) {
    const rows = s.testA.map((r) => {
      const ok = r.marked === r.correct;
      const bubbles = ['A', 'B', 'C', 'D'].map((letter) => {
        let cls = 'bubble';
        if (letter === r.marked) cls += ' on';
        else if (!ok && letter === r.correct) cls += ' key';
        return `<span class="${cls}">${letter}</span>`;
      }).join('');
      const said = ok ? `Marked ${r.marked}, right` : `Marked ${r.marked}, answer ${r.correct}`;
      return `
        <li class="omr-row${ok ? '' : ' miss'}">
          <span class="omr-q">Q${r.q}</span>
          <span class="bubbles" role="img" aria-label="${said}">${bubbles}</span>
          <span class="omr-concept">${r.concept} <span class="tag">L${r.level}</span></span>
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
    const qs = p.qs.map((q, i) => `<li><b>${i + 1}.</b><span>${q}</span></li>`).join('');
    const others = otherWeak(s).map((topic) =>
      `<li class="topic-more"><span>+ ${topic}</span><span>4 questions</span></li>`
    ).join('');

    return `
      <div class="paper">
        <div class="paper-head"><strong>Practice sheet · ${s.name}</strong><span class="tag">Only weak topics</span></div>
        <div class="topic-head"><span class="sheet-concept">${s.concept}</span><span class="tag">4 questions · ${p.levels}</span></div>
        <p class="sheet-hint">${p.hint}</p>
        <ol class="sheet-qs">${qs}</ol>
        <ul>${others}</ul>
        <div class="left-out">
          <span>Left out</span>
          <ul>
            <li>${ICON_NO}${p.seen}</li>
            <li>${ICON_NO}Topics ${s.name} already knows</li>
          </ul>
        </div>
      </div>`;
  }

  function renderTestB(s) {
    const [, aRight, aTotal] = s.report.weak[0];
    const qs = s.testB.map((q, i) =>
      `<li><b>${i + 1}.</b><span>${q}</span><span class="mark ok">${ICON_OK}</span></li>`
    ).join('');
    const others = otherWeak(s).map((topic) =>
      `<li class="topic-more"><span>+ ${topic}</span><span>3 questions</span></li>`
    ).join('');

    return `
      <div class="paper">
        <div class="paper-head"><strong>Test B · ${s.name}</strong><span class="tag">Never-seen questions</span></div>
        <div class="topic-head"><span class="sheet-concept">${s.concept}</span><span class="tag">3 questions</span></div>
        <ol class="sheet-qs">${qs}</ol>
        <ul>${others}</ul>
        <div class="ab">
          <div class="ab-before"><p class="ab-label">Test A</p><p class="ab-score">${aRight}/${aTotal}</p>${dots(aRight, aTotal)}</div>
          <span class="ab-arrow" aria-hidden="true">→</span>
          <div class="ab-after"><p class="ab-label">Test B</p><p class="ab-score">3/3</p>${dots(3, 3)}</div>
          <span class="pill pill-up">Improved</span>
        </div>
      </div>`;
  }

  const RENDERERS = [renderTestA, renderReport, renderClass, renderPractice, renderTestB];

  function initWalkthrough() {
    const root = document.getElementById('sim');
    if (!root) return;

    const $ = (id) => document.getElementById(id);
    const tabs = Array.from(root.querySelectorAll('[role="tab"]'));
    const items = tabs.map((tab) => tab.parentElement);
    const radios = Array.from(root.querySelectorAll('[role="radio"]'));
    const panel = $('simPanel');
    const prev = $('simPrev');
    const next = $('simNext');

    let step = 0;
    let subject = 'maths';

    function render() {
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
      $('simStage').innerHTML = RENDERERS[step](s);

      prev.disabled = step === 0;
      next.textContent = step === STEPS.length - 1 ? '↺ Start again' : `Next: ${STEPS[step + 1].name} →`;

      panel.classList.remove('animate');
      void panel.offsetWidth; // restart the entrance animation
      panel.classList.add('animate');
    }

    function goTo(index, focusTab) {
      step = (index + STEPS.length) % STEPS.length;
      render();
      if (focusTab) tabs[step].focus();
    }

    tabs.forEach((tab, i) => tab.addEventListener('click', () => goTo(i)));
    prev.addEventListener('click', () => goTo(step - 1));
    next.addEventListener('click', () => goTo(step + 1));

    root.querySelector('.rail').addEventListener('keydown', (e) => {
      const moves = { ArrowRight: step + 1, ArrowLeft: step - 1, Home: 0, End: STEPS.length - 1 };
      if (!(e.key in moves)) return;
      e.preventDefault();
      goTo(moves[e.key], true);
    });

    radios.forEach((radio) => radio.addEventListener('click', () => {
      subject = radio.dataset.subject;
      render();
    }));

    root.querySelector('.subject-switch').addEventListener('keydown', (e) => {
      const delta = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!delta) return;
      e.preventDefault();
      const keys = radios.map((r) => r.dataset.subject);
      subject = keys[(keys.indexOf(subject) + delta + keys.length) % keys.length];
      render();
      radios[keys.indexOf(subject)].focus();
    });

    render();
  }

  document.addEventListener('DOMContentLoaded', initWalkthrough);
})();
