# AfterTest — design brief for the 2026 redesign

Single-page introductory site for aftertest.in. Anyone, student, parent or teacher, should know, in ten seconds,
what AfterTest is (two tests with practice in between), why it matters (wrong topics
become strong ones, shown as real counts) and what to do next (see the example, or
chat on WhatsApp). Same facts, links and functions as the 7 Oct 2026 site
(`website_old_2026-10-20/`). New presentation.

## 1. Palette

Two neutrals, two signal colours. Colour tells one story: red is "wrong / weak",
green is "right / improved". Nothing else is coloured.

| Token | Hex | Use | Contrast |
| --- | --- | --- | --- |
| `--paper` | `#F3EFE7` | warm off-white page, light sections | — |
| `--card` | `#FBF9F4` | sheets, cards and the nav pill on light | ink 17.9 |
| `--paper-2` | `#E9E4DA` | hairlines, subtle fills on light | — |
| `--ink` | `#121110` | warm near-black: dark sections, headlines, dark buttons | paper 16.5 |
| `--ink-2` | `#1B1A18` | raised surfaces on dark | — |
| `--mute` | `#6B665D` | meta text on light | 4.97 on paper |
| `--mute-dark` | `#A6A199` | meta text on dark | 7.35 on ink |
| `--red` | `#B93D2E` | "wrong / weak" text on light | 4.86 on paper |
| `--red-mark` | `#C9473B` | red dots, crosses, pen underline (non-text) | — |
| `--red-tint` | `#F6DDD8` | "Still weak" pill background | deep 6.37 |
| `--red-deep` | `#8F2C21` | text on the red tint | — |
| `--red-dark` | `#F0887B` | red on dark sections | 7.65 on ink |
| `--green` | `#237A50` | "right / improved" text on light | 4.61 on paper |
| `--green-mark` | `#2E8A5E` | green dots, ticks (non-text) | — |
| `--green-tint` | `#D7EDDF` | "Improved" pill background | deep 6.28 |
| `--green-deep` | `#1C5E3D` | text on the green tint | — |
| `--green-dark` | `#7FD6A4` | green on dark sections, WhatsApp buttons on dark | 10.8 on ink |
| `--highlight` | `#BFE6CF` | the one accent pill behind a key phrase ("strong topics") | ink 13.9 |

No gradients, no glass, no shadows heavier than a soft paper lift
(`0 24px 48px -32px rgba(18,17,16,.35)`).

## 2. Type

* Display: **Fraunces** (variable: opsz 9–144, wght 300–700, italic). Wordmark, headlines,
  the big tagline. Tight (`letter-spacing: -0.03em` to `-0.05em`), `opsz` on auto. Italic
  carries the red-pen phrase ("wrong answers").
* Text: **Hanken Grotesk** (variable wght 300–800). Body, UI, tables, meta.
  Meta text is 11–12px, uppercase, `letter-spacing: .12em`, `--mute`.
* Both self-hosted from Google Fonts (`assets/fonts/`, latin subset, `font-display: swap`).
  Replaces Newsreader + Plus Jakarta Sans.

Scale: wordmark `clamp(72px, 19.5vw, 300px)`; h1 `clamp(34px, 5vw, 64px)`; h2
`clamp(30px, 4.2vw, 56px)`; body 16–18px; meta 11–12px.

## 3. Motion system

* Lenis smooth scroll (lerp 0.16, desktop pointer only; native on touch), GSAP 3.15 + ScrollTrigger,
  vendored in `assets/vendor/`. Every scrubbed sequence uses `scrub: true`, so the pinned slides and the
  hero dissolve sit exactly on the scroll position with no catch-up lag; moving layers carry
  `will-change`, and the hero blur is skipped on touch devices.
* Motion runs only when `prefers-reduced-motion: no-preference` (the inline script adds `html.motion`;
  `?nomotion=1` forces the static page for testing). Reduced motion = static page, every element
  visible, the story's three sheets stacked, FAQ still works.
* Reveals: `y: 28 → 0`, `opacity 0 → 1`, `0.9s`, `power3.out`, once. Groups stagger `0.08s`.
* Count-ups: integers only, `1.1s`, snap to whole numbers (0/2 → 3/3, 4, 10, 4).
* Only `transform`, `opacity` and (hero wordmark only) `filter` animate. Pinned stages use
  ScrollTrigger pin; `ScrollTrigger.config({ ignoreMobileResize: true })`.
* Budget: 60 fps on a mid-range Android. No blur on anything but the hero wordmark; no
  animated box-shadows; no per-frame layout.

## 4. Storyboard

Header links: How it works `#tests`, Example `#how`, Parent portal `#portal`, Contact `#contact`
(FAQ is reached by scrolling). Skip link to `#main`. Floating "Chat with us" WhatsApp pill.

### 0 · Header — part of the page, not a widget
One idea: who this is and where to go.
Copy: ring-tick glyph · **AfterTest** (Fraunces) · "by Focus Lab Academy" (tiny uppercase meta, a link) ·
How it works (`#tests`) · Example (`#how`) · Parent portal (`#portal`) · Contact (`#contact`), all as
small uppercase meta text. Mobile: the lockup + "Menu", opening a full-screen sheet with the same four.
Behaviour: transparent on the hero; after 24px of scroll it gains a solid paper (or ink, over dark
sections) background and a hairline; it tucks away while scrolling down and returns on the way up.

### 1 · Hero (`#top`, light)
One idea: wrong answers become strong topics.
Copy (≈40 words): meta "Find the gap. Drill it. Retest it." / "CBSE · ICSE · IB · JEE · NEET";
wordmark **AfterTest**; h1 "Turn *wrong answers* into **strong topics**."; lead "After each
test, AfterTest finds the weak topics, gives practice on just those, then tests them again.";
buttons "How it works" → `#tests`, "See an example" → `#how`.
Hero object (the product, built in HTML + SVG, no image): a report-card row overlapping the
lower right of the wordmark: *Aarav · Class 10 Maths* / **Splitting the middle term** /
Test A ○○ **0/2** → Test B ●●● **3/3** / pill "Improved". Numbers are the old site's.
Motion: load — wordmark letters rise with a 0.04s stagger, card lifts in, h1 words rise, lead
and buttons fade. Card then plays: Test A dots fill red with crosses, the arrow draws, Test B
dots fill green one by one, 3/3 counts up, pill flips "Weak" → "Improved"; repeats every 7 s.
Scroll — hero is sticky; the dark section slides up over it with rounded top corners while the
wordmark and card blur (0 → 14px), scale to 0.94 and fade out over the first 80% of a viewport.

### 2 · Test A & B (`#tests`, dark, pinned)
One idea: the same weak topic, three beats.
Copy (≈40 words): eyebrow "Test A and Test B"; h2 "Two tests. One comparison.";
01 **Test A** — "Same paper for the whole class. Every topic is tested, so no gap stays hidden.";
02 **Practice sheet** — "Made for each student. New questions on just the weak topics, at a
similar level."; 03 **Test B** — "Made for each student. The same topics, with questions never
seen before."
Stage: one sheet that changes with scroll. Beat 1: Test A answer rows Q11–Q15 for Aarav, two
rows red (Splitting the middle term, missed twice). Beat 2: the practice sheet — the topic with
four new questions; "Left out: Q13, Q15 from Test A · topics Aarav already knows". Beat 3:
Test B — three never-seen questions tick green; 0/2 → 3/3.
Motion: stage pinned for three viewports; a scrubbed timeline dims and brightens the beats
on the left and swaps the sheet on the right (slide + fade, no blur). Mobile: beats stack
above the sheet.

### 3 · The result (still `#tests`, dark)
One idea: topic by topic, real counts.
Copy (≈35 words): eyebrow "The result"; h3 "Test A vs Test B, topic by topic."; "See what was
weak, what improved and what still needs work. Real counts, never a vague percentage.";
tiny note "A few questions are a signal, not a final grade."
Table (Aarav · Class 10 Maths · Quadratic equations · Example; on phones each score carries a
Test A / Test B label): Splitting the middle term
0/2 → 3/3 Improved; Quadratic formula 1/2 → 3/3 Improved; Word problems 1/3 → 1/3 Still weak.
Summary: "2 of 3 weak topics improved. Word problems: the teacher follows up."
Motion: rows stagger in; Test B counts count up from 0; pills pop (`scale .8 → 1`).

### 4 · Example (`#how`, light)
One idea: follow one weak topic through all five steps.
Copy: eyebrow "Example"; h2 "Follow one weak topic, step by step."; the five step titles and
one-line descriptions from the old `app.js`, unchanged in meaning; subject tabs Maths ·
Physics · Chemistry · Biology; the example-student line.
Device: the walkthrough (rail of 5 steps, Back / Next, subject radio group, the rendered
paper for each step). All worked questions and numbers are the old site's.
Motion: section reveal; on each step change the paper slides in (`x: 24 → 0`, fade) and the
rail dot fills; keyboard behaviour unchanged (arrows, Home, End).

### 5 · Parent portal (`#portal`, light)
One idea: every chapter's progress in one place.
Copy (≈25 words): eyebrow "Parent portal"; h2 "Every chapter, every topic, in one place.";
"What was weak, what improved and what comes next."; button "Sign in to the parent portal ↗"
→ https://focuslabacademy.in/portal/login.
Mock-up: stats 4 chapters followed · 10 weak topics found · 4 improved in Test B; four chapter
rows (Quadratic equations 2 of 3 improved; Chemical reactions 2 of 2 improved; Light:
reflection, Test B on Friday; Life processes, practice sheet ready); Next up (Test B · Light:
reflection · Friday · 2 weak topics); Report cards list (four lines, unchanged).
Motion: frame lifts in, stats count up, chapter rows stagger, pills pop.

### 6 · Our vision (`#vision`, light)
One idea, in the academy's words, as short as it gets.
Copy (14 words): eyebrow "Why it exists"; h2 "AfterTest finds what you *don't know*. Then it makes sure
you **understand it**." ("doesn't know" in red italic, "understand it" on the green highlight pill),
one sentence per line.
Motion: eyebrow then headline rise.

### 7 · FAQ (`#faq`, light)
One idea: the questions people ask, answered in a line or two each. Six questions (the AI
question was removed on the owner's instruction, 20 Oct 2026). The product speaks as "it"; "we" and "us" appear only where real people are
reached (WhatsApp chat). Native `<details>`: keyboard-navigable, one open at a time, open animation
only under no-preference.

### 8 · Closing (`#about`, dark) and footer (`#contact`, dark)
One idea: the tagline, and how to reach us.
Copy: "Find the gap. Drill it. Retest it." (big, Fraunces); "AfterTest is a Focus Lab Academy
company."; buttons "Chat on WhatsApp" (wa.me link with the existing prefilled message) and
"+91 92790 09342" (tel:). Footer: brand + tagline + "A Focus Lab Academy company"; Visit —
Focus Lab Academy, Plot No. 85P, Opposite Bharti International Convent School, Sector 56,
Gurugram, Haryana 122011, "Open in Maps ↗"; Contact — +91 92790 09342 (tel:), WhatsApp,
admin@aftertest.in (mailto:); bottom line "aftertest.in · A Focus Lab Academy company ·
Gurugram". The giant wordmark, shown whole, closes the page.
Motion: tagline words rise; the logo tick draws itself; the footer wordmark drifts up slightly
on scroll.

## 5. Not allowed (checked on every pass)
No demo booking, forms, pricing, testimonials, ratings, logos, invented students, scores or
statistics. No gradients, glassmorphism, 3D, emoji or stock "AI" imagery. Any section a
landing-page generator could have made gets redone.

## 6. Three tests, every pass
* Ten-second test: can a student, a parent or a teacher say what AfterTest is, why it matters,
  and what to do next?
* Taste test: would a top studio put this in its portfolio?
* Truth test: is every fact, number and link identical to `website_old_2026-10-20/index.html`?
