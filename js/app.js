/* ═══════════════════════════════════════════════
   Router
═══════════════════════════════════════════════ */
const PAGES = ['home','block1','block2','block3','hub','section1','section2','section3','block8'];
const CHAPTER_NAMES = {
  home:     '',
  block1:   'Блок 1. Философия Гостемании',
  block2:   'Блок 2. Алгоритм ДОБРО',
  block3:   'Блок 3. Работа с инцидентами',
  hub:      'Блок 4. Инструменты',
  section1: '4.1 Замена + Комплемент',
  section2: '4.2 Комплемент',
  section3: '4.3 Особые случаи',
  block8:   'Блок 5. Заключение',
};
const CHAPTER_ORDER = ['block1','block2','block3','hub','block8'];
const hubDone = [false, false, false];
let currentPage = 'home';

function navigateTo(pageId) {
  PAGES.forEach(id => {
    const el = document.getElementById('page-' + id);
    if (el) el.classList.remove('active');
  });
  const target = document.getElementById('page-' + pageId);
  if (!target) return;
  target.classList.add('active');
  currentPage = pageId;
  window.scrollTo({ top: 0, behavior: 'instant' });

  const idx = CHAPTER_ORDER.indexOf(pageId);
  const inHub = ['section1','section2','section3'].includes(pageId);
  document.getElementById('nav-chapter').textContent = CHAPTER_NAMES[pageId] || '';
  if (idx !== -1) {
    document.getElementById('nav-progress').textContent = (idx + 1) + ' / ' + CHAPTER_ORDER.length;
    document.getElementById('progress-bar').style.width = Math.round(((idx + 1) / CHAPTER_ORDER.length) * 100) + '%';
  } else if (inHub) {
    const hi = CHAPTER_ORDER.indexOf('hub');
    document.getElementById('nav-progress').textContent = (hi + 1) + ' / ' + CHAPTER_ORDER.length;
    document.getElementById('progress-bar').style.width = Math.round(((hi + 1) / CHAPTER_ORDER.length) * 100) + '%';
  } else {
    document.getElementById('nav-progress').textContent = '';
    document.getElementById('progress-bar').style.width = '0%';
  }

  setTimeout(initFadeIn, 50);

  if (pageId === 'block2')  initGallery();
  if (pageId === 'block3')  { initSortable(); initVideoQuiz(); }
  if (pageId === 'hub')     initHubWarmup();
}

/* ═══════════════════════════════════════════════
   Fade-in on scroll
═══════════════════════════════════════════════ */
function initFadeIn() {
  const els = document.querySelectorAll('.page.active .fade-in:not(.visible)');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight) el.classList.add('visible');
    else io.observe(el);
  });
}

/* ═══════════════════════════════════════════════
   Gallery – Block 2
═══════════════════════════════════════════════ */
let galleryIdx = 0;
const GALLERY_COUNT = 5;

function initGallery() { galleryIdx = 0; renderGallery(); }
function renderGallery() {
  const track = document.getElementById('gallery-track');
  if (!track) return;
  track.style.transform = `translateX(-${galleryIdx * 100}%)`;
  document.querySelectorAll('.gallery-dot').forEach((d, i) => d.classList.toggle('active', i === galleryIdx));
}
function galleryMove(dir) {
  galleryIdx = (galleryIdx + dir + GALLERY_COUNT) % GALLERY_COUNT;
  renderGallery();
}

/* ═══════════════════════════════════════════════
   FAQ Accordion
═══════════════════════════════════════════════ */
function toggleFaq(btn) {
  const body = btn.nextElementSibling;
  const isOpen = body.classList.contains('open');
  btn.classList.toggle('open', !isOpen);
  body.classList.toggle('open', !isOpen);
}

/* ═══════════════════════════════════════════════
   Block 3 – Sortable order trainer
═══════════════════════════════════════════════ */
const CORRECT_ORDER = [1, 3, 0, 2]; // correct indices

function initSortable() {
  const list = document.getElementById('sortable-list');
  if (!list) return;
  let dragEl = null;

  list.querySelectorAll('.sort-item').forEach(item => {
    item.addEventListener('dragstart', () => {
      dragEl = item;
      setTimeout(() => item.classList.add('dragging'), 0);
    });
    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
      list.querySelectorAll('.sort-item').forEach(i => i.classList.remove('drag-over-top','drag-over-bottom'));
      dragEl = null;
    });
    item.addEventListener('touchstart', e => {
      dragEl = item;
      item.classList.add('dragging');
    }, { passive: true });
    item.addEventListener('touchmove', e => {
      if (!dragEl) return;
      const y = e.touches[0].clientY;
      const els = [...list.querySelectorAll('.sort-item:not(.dragging)')];
      let target = null, before = true;
      for (const el of els) {
        const r = el.getBoundingClientRect();
        if (y < r.top + r.height / 2) { target = el; before = true; break; }
        target = el; before = false;
      }
      list.querySelectorAll('.sort-item').forEach(i => i.classList.remove('drag-over-top','drag-over-bottom'));
      if (target) target.classList.add(before ? 'drag-over-top' : 'drag-over-bottom');
    }, { passive: true });
    item.addEventListener('touchend', e => {
      if (!dragEl) return;
      const y = e.changedTouches[0].clientY;
      const els = [...list.querySelectorAll('.sort-item:not(.dragging)')];
      let target = null, before = true;
      for (const el of els) {
        const r = el.getBoundingClientRect();
        if (y < r.top + r.height / 2) { target = el; before = true; break; }
        target = el; before = false;
      }
      if (target) {
        if (before) list.insertBefore(dragEl, target);
        else target.insertAdjacentElement('afterend', dragEl);
      }
      dragEl.classList.remove('dragging');
      list.querySelectorAll('.sort-item').forEach(i => i.classList.remove('drag-over-top','drag-over-bottom'));
      dragEl = null;
    });
  });

  list.addEventListener('dragover', e => {
    e.preventDefault();
    if (!dragEl) return;
    const after = getDragAfterEl(list, e.clientY);
    list.querySelectorAll('.sort-item').forEach(i => i.classList.remove('drag-over-top','drag-over-bottom'));
    if (after) after.classList.add('drag-over-top');
    else {
      const last = list.querySelector('.sort-item:last-child');
      if (last && last !== dragEl) last.classList.add('drag-over-bottom');
    }
  });
  list.addEventListener('drop', e => {
    e.preventDefault();
    if (!dragEl) return;
    const after = getDragAfterEl(list, e.clientY);
    if (after) list.insertBefore(dragEl, after);
    else list.appendChild(dragEl);
  });
}

function getDragAfterEl(container, y) {
  const items = [...container.querySelectorAll('.sort-item:not(.dragging)')];
  return items.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) return { offset, el: child };
    return closest;
  }, { offset: -Infinity, el: null }).el;
}

function checkSortOrder() {
  const list = document.getElementById('sortable-list');
  const items = [...list.querySelectorAll('.sort-item')];
  const indices = items.map(el => parseInt(el.dataset.idx));
  const isCorrect = CORRECT_ORDER.every((v, i) => v === indices[i]);

  const fb = document.getElementById('sort-feedback');
  fb.className = 'feedback-box show ' + (isCorrect ? 'correct' : 'incorrect');
  fb.innerHTML = isCorrect
    ? '<strong>Верно!</strong> Это 4 шага по работе с инцидентом. Кто-то понимает алгоритм интуитивно, но чтобы ты владел им профессионально — давай запомним визуальный алгоритм.'
    : '<strong>Неверно.</strong> Давай разберём правильные шаги — чтобы ты владел алгоритмом профессионально. Смотри ниже 4 шага.';

  const analysis = document.getElementById('sort-analysis');
  if (analysis) analysis.classList.remove('hidden');
  const nextBtn = document.getElementById('sort-next-btn');
  if (nextBtn) nextBtn.style.display = 'block';
}

/* ═══════════════════════════════════════════════
   Block 3 – Video mood quiz
═══════════════════════════════════════════════ */
let videoStep = 0;
const VIDEO_ANSWERS = ['спокойный', 'расстроенный', 'злой'];
const VIDEO_FEEDBACK = [
  '✓ Верно — это спокойный Гость. Ему важно сочувствие и признание проблемы.',
  '✓ Верно — это расстроенный Гость. Ему нужна скорость и уважение к его времени.',
  '✓ Верно — это злой / раздражённый Гость. Признай его правоту и дай выговориться.',
];

function initVideoQuiz() { videoStep = 0; showVideoStep(0); }
function showVideoStep(n) {
  document.querySelectorAll('.video-quiz-step').forEach((el, i) => el.classList.toggle('active', i === n));
  if (n >= 3) {
    const done = document.getElementById('video-quiz-done');
    if (done) done.classList.remove('hidden');
  }
}
function answerVideo(btn, stepIdx, answer) {
  if (btn.classList.contains('correct')) return;
  if (answer === VIDEO_ANSWERS[stepIdx]) {
    btn.classList.add('correct');
    btn.closest('.answer-choices').querySelectorAll('.answer-btn').forEach(b => b.disabled = true);
    const fb = document.getElementById('vq-fb-' + stepIdx);
    if (fb) { fb.textContent = VIDEO_FEEDBACK[stepIdx]; fb.classList.add('show'); }
    setTimeout(() => { videoStep++; showVideoStep(videoStep); }, 1000);
  } else {
    btn.classList.add('wrong');
    setTimeout(() => btn.classList.remove('wrong'), 600);
  }
}

/* ═══════════════════════════════════════════════
   Two-zone drag-and-drop
═══════════════════════════════════════════════ */
function initZoneSort(poolId, zone1Id, zone2Id) {
  const pool = document.getElementById(poolId);
  const z1   = document.getElementById(zone1Id);
  const z2   = document.getElementById(zone2Id);
  if (!pool || !z1 || !z2) return;

  [pool, z1, z2].forEach(container => {
    container.querySelectorAll('.drag-chip').forEach(chip => bindChip(chip, pool, z1, z2));
  });
  [pool, z1, z2].forEach(zone => {
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      const id = e.dataTransfer.getData('text/plain');
      const chip = document.getElementById(id);
      if (chip) zone.appendChild(chip);
    });
  });
}

function bindChip(chip, pool, z1, z2) {
  chip.setAttribute('draggable', true);
  chip.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', chip.id); chip.classList.add('dragging'); });
  chip.addEventListener('dragend',   () => chip.classList.remove('dragging'));

  let touchClone = null;
  chip.addEventListener('touchstart', () => {
    chip.classList.add('dragging');
    touchClone = chip.cloneNode(true);
    touchClone.style.cssText = 'position:fixed;pointer-events:none;opacity:0.75;z-index:9999;transition:none;';
    document.body.appendChild(touchClone);
  }, { passive: true });
  chip.addEventListener('touchmove', e => {
    const t = e.touches[0];
    if (touchClone) { touchClone.style.left = (t.clientX - 40) + 'px'; touchClone.style.top = (t.clientY - 20) + 'px'; }
    [pool, z1, z2].forEach(z => {
      const r = z.getBoundingClientRect();
      z.classList.toggle('drag-over', t.clientX >= r.left && t.clientX <= r.right && t.clientY >= r.top && t.clientY <= r.bottom);
    });
  }, { passive: true });
  chip.addEventListener('touchend', e => {
    chip.classList.remove('dragging');
    if (touchClone) { touchClone.remove(); touchClone = null; }
    const t = e.changedTouches[0];
    [pool, z1, z2].forEach(z => {
      z.classList.remove('drag-over');
      const r = z.getBoundingClientRect();
      if (t.clientX >= r.left && t.clientX <= r.right && t.clientY >= r.top && t.clientY <= r.bottom) z.appendChild(chip);
    });
  });
}

function checkZone(poolId, zone1Id, zone2Id, correctZ1, correctZ2, feedbackId, nextId) {
  const z1 = [...document.getElementById(zone1Id).querySelectorAll('.drag-chip')].map(c => c.dataset.key);
  const z2 = [...document.getElementById(zone2Id).querySelectorAll('.drag-chip')].map(c => c.dataset.key);
  const setEq = (a, b) => a.length === b.length && a.every(v => b.includes(v));
  const ok = setEq(z1, correctZ1) && setEq(z2, correctZ2);
  const fb = document.getElementById(feedbackId);
  if (!fb) return;
  fb.className = 'feedback-box show ' + (ok ? 'correct' : 'incorrect');
  fb.innerHTML = ZONE_FEEDBACK[feedbackId]?.[ok ? 'correct' : 'incorrect'] || (ok ? '<strong>Верно!</strong>' : '<strong>Неверно.</strong>');
  if (nextId) { const n = document.getElementById(nextId); if (n) n.classList.remove('hidden'); }
}

const ZONE_FEEDBACK = {
  'zone1-feedback': {
    correct: '<strong>Верно!</strong> Ты уже чувствуешь разницу: проблемы с едой требуют замены + комплемента, а проблемы сервиса — только комплемента.',
    incorrect: '<strong>Неверно.</strong> Проблемы с едой (холодная, не тот вкус, пересол) → <strong>замена + комплемент</strong>. Проблемы сервиса (ожидание, чистота, грубость) → <strong>комплемент</strong>.',
  },
  'zone3-feedback': {
    correct: '<strong>Верно!</strong> Сохраняй спокойствие, ссылайся на правила и при необходимости зови руководителя.',
    incorrect: '<strong>Неверно.</strong> Сохранять спокойный тон, ссылаться на правила учёта, предлагать руководителя, фиксировать инцидент — правильно. Обвинения, споры, игнорирование — недопустимо.',
  },
};

/* ═══════════════════════════════════════════════
   Section 2 – Matching quiz (standalone page)
═══════════════════════════════════════════════ */
const MATCH_ANSWERS = ['десерт', 'напиток-десерт', 'бургер-сет'];
let matchSolved = [false, false, false];

function pickMatch(btn, qIdx, answer) {
  if (matchSolved[qIdx]) return;
  if (answer === MATCH_ANSWERS[qIdx]) {
    btn.classList.add('correct-pick');
    matchSolved[qIdx] = true;
    btn.closest('.match-question').classList.add('solved');
    btn.closest('.match-question').querySelectorAll('.match-btn').forEach(b => b.disabled = true);
    if (matchSolved.every(Boolean)) {
      const fb = document.getElementById('match-feedback');
      if (fb) { fb.className = 'feedback-box show correct'; fb.innerHTML = '<strong>Верно!</strong> Дальше разберём комплементы подробнее.'; }
    }
  } else {
    btn.classList.add('wrong-pick');
    setTimeout(() => btn.classList.remove('wrong-pick'), 600);
  }
}

/* ═══════════════════════════════════════════════
   Hub – 3-step warm-up
═══════════════════════════════════════════════ */
let hubWarmupStep = -1; // -1 = not started yet

function initHubWarmup() {
  hubWarmupStep = 0;
  // Reset all steps
  document.querySelectorAll('#page-hub .warmup-step').forEach(el => el.classList.remove('active'));
  document.getElementById('hub-warmup-done')?.classList.remove('show');
  updateWarmupDots(0);
  const s0 = document.getElementById('hub-ws0');
  if (s0) s0.classList.add('active');
  // Init zone sort for step 1 and step 3
  initZoneSort('hub-pool1', 'hub-zone1a', 'hub-zone1b');
  initZoneSort('hub-pool3', 'hub-zone3a', 'hub-zone3b');
  // Reset hub match
  hubMatchSolved = [false, false, false];
}

function updateWarmupDots(step) {
  document.querySelectorAll('#page-hub .warmup-step-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === step);
    dot.classList.toggle('done',   i < step);
    if (i === step) dot.classList.remove('done');
  });
}

function advanceWarmup(fromStep) {
  const steps = document.querySelectorAll('#page-hub .warmup-step');
  if (fromStep < steps.length - 1) {
    steps[fromStep].classList.remove('active');
    steps[fromStep + 1].classList.add('active');
    hubWarmupStep = fromStep + 1;
    updateWarmupDots(hubWarmupStep);
    window.scrollTo({ top: document.getElementById('hub-warmup-box')?.offsetTop - 80 || 0, behavior: 'smooth' });
  } else {
    steps[fromStep].classList.remove('active');
    hubWarmupStep = steps.length;
    updateWarmupDots(steps.length);
    document.getElementById('hub-warmup-done')?.classList.add('show');
  }
}

/* Hub warm-up step 1 — complaints sort */
function checkHubWarmup0() {
  const z1 = [...document.getElementById('hub-zone1a').querySelectorAll('.drag-chip')].map(c => c.dataset.key);
  const z2 = [...document.getElementById('hub-zone1b').querySelectorAll('.drag-chip')].map(c => c.dataset.key);
  const cZ1 = ['ожидание','грязь','столик','нагрубили'];
  const cZ2 = ['холодный','сухая','пересолена','кола'];
  const setEq = (a,b) => a.length === b.length && a.every(v => b.includes(v));
  const ok = setEq(z1, cZ1) && setEq(z2, cZ2);
  const fb = document.getElementById('hub-ws0-feedback');
  fb.className = 'feedback-box show ' + (ok ? 'correct' : 'incorrect');
  fb.innerHTML = ok
    ? '<strong>Верно!</strong> Проблемы с едой → замена + комплемент. Проблемы с сервисом → только комплемент.'
    : '<strong>Неверно.</strong> Проблемы с едой (холодная, пересолена, не та) → <strong>замена + комплемент</strong>. Ожидание, грязь, грубость → <strong>комплемент</strong>.';
  setTimeout(() => advanceWarmup(0), 1600);
}

/* Hub warm-up step 2 — complement matching */
let hubMatchSolved = [false, false, false];

function pickHubMatch(btn, qIdx, answer) {
  if (hubMatchSolved[qIdx]) return;
  if (answer === MATCH_ANSWERS[qIdx]) {
    btn.classList.add('correct-pick');
    hubMatchSolved[qIdx] = true;
    btn.closest('.match-question').classList.add('solved');
    btn.closest('.match-question').querySelectorAll('.match-btn').forEach(b => b.disabled = true);
    if (hubMatchSolved.every(Boolean)) {
      const fb = document.getElementById('hub-ws1-feedback');
      fb.className = 'feedback-box show correct';
      fb.innerHTML = '<strong>Верно!</strong> Отлично — ты знаешь, какой комплемент соответствует каждой жалобе.';
      setTimeout(() => advanceWarmup(1), 1600);
    }
  } else {
    btn.classList.add('wrong-pick');
    setTimeout(() => btn.classList.remove('wrong-pick'), 600);
  }
}

/* Hub warm-up step 3 — do/don't sort */
function checkHubWarmup2() {
  const z1 = [...document.getElementById('hub-zone3a').querySelectorAll('.drag-chip')].map(c => c.dataset.key);
  const z2 = [...document.getElementById('hub-zone3b').querySelectorAll('.drag-chip')].map(c => c.dataset.key);
  const cDo   = ['спокойный-тон','правила','руководитель','зафиксировать'];
  const cDont = ['обвинять','обманываете','спорить','игнорировать'];
  const setEq = (a,b) => a.length === b.length && a.every(v => b.includes(v));
  const ok = setEq(z1, cDo) && setEq(z2, cDont);
  const fb = document.getElementById('hub-ws2-feedback');
  fb.className = 'feedback-box show ' + (ok ? 'correct' : 'incorrect');
  fb.innerHTML = ok
    ? '<strong>Верно!</strong> Именно так: сохраняй спокойствие и следуй правилам.'
    : '<strong>Неверно.</strong> Спокойный тон, правила, руководитель, фиксация — всё это правильные действия. Обвинения, споры, игнорирование — недопустимы.';
  setTimeout(() => advanceWarmup(2), 1600);
}

/* ═══════════════════════════════════════════════
   Hub section management
═══════════════════════════════════════════════ */
function goToSection(n) { navigateTo('section' + n); }

function completeSection(n) {
  hubDone[n - 1] = true;
  const cards = document.querySelectorAll('.hub-card');
  if (cards[n - 1]) cards[n - 1].classList.add('done');
  if (n < 3 && cards[n]) cards[n].classList.remove('locked');
  navigateTo('hub');
  setTimeout(() => {
    if (hubDone.every(Boolean)) document.getElementById('hub-next-row')?.classList.add('show');
  }, 100);
}

/* ═══════════════════════════════════════════════
   ДОБРО-колесо: модальное окно
═══════════════════════════════════════════════ */
const DOBRO_DATA = {
  people: {
    color: '#FF8732',
    title: 'Люди',
    text1: 'Сотрудники перестают бояться жалоб. Знают алгоритм — меньше стресса.',
    text2: 'Текучесть снижается. Уверенность растёт.'
  },
  product: {
    color: '#E89B1A',
    title: 'Продукт',
    text1: 'Каждая жалоба, списанная по ДОБРО, — сигнал для кухни.',
    text2: 'Меньше ошибок по сборке = меньше списаний.'
  },
  sales: {
    color: '#2B7BB9',
    title: 'Продажи и Гости',
    text1: 'Решённый инцидент = Гость возвращается + приводит друзей.',
    text2: '1 спасённый Гость = несколько дополнительных чеков в месяц.'
  },
  clean: {
    color: '#198737',
    title: 'Чистота и оборудование',
    text1: 'Жалоба на грязь через ДОБРО ведёт к анализу причин, а не просто к уборке «для галочки».',
    text2: 'Ресторан чище. Оборудование вовремя ремонтируют.'
  }
};

function openDoproModal(key) {
  const data = DOBRO_DATA[key];
  if (!data) return;
  document.getElementById('dobro-modal-icon').style.background = data.color;
  document.getElementById('dobro-modal-title').textContent = data.title;
  document.getElementById('dobro-modal-text1').textContent = data.text1;
  document.getElementById('dobro-modal-text2').textContent = data.text2;
  document.getElementById('dobro-modal-overlay').classList.add('open');
}

function closeDoproModal() {
  document.getElementById('dobro-modal-overlay').classList.remove('open');
}

// Закрытие по Esc
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeDoproModal();
});

/* ═══════════════════════════════════════════════
   Init on load
═══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => navigateTo('home'));
