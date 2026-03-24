// CURSOR
const cur = document.getElementById('cur');
const ring = document.getElementById('cur-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
  cur.style.left = mx + 'px';
  cur.style.top = my + 'px';
});

function animRing() {
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  ring.style.left = rx + 'px';
  ring.style.top = ry + 'px';
  requestAnimationFrame(animRing);
}
animRing();

document.querySelectorAll('a,button,.proj-card,.cert-card,.skill-card').forEach(el => {
  el.addEventListener('mouseenter', () => { cur.classList.add('hover'); ring.classList.add('hover'); });
  el.addEventListener('mouseleave', () => { cur.classList.remove('hover'); ring.classList.remove('hover'); });
});

// NAV SCROLL
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
});

// REVEAL ON SCROLL
const revealEls = document.querySelectorAll('.reveal, .reveal-left');
const obs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('vis');
      obs.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

revealEls.forEach(el => obs.observe(el));

// ===================== DATA SCIENCE SECTION =====================

// --- TABS ---
document.querySelectorAll('.ds-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.ds-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.ds-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.panel).classList.add('active');
    // init charts when tab opens
    if (tab.dataset.panel === 'panel-charts') initCharts();
    if (tab.dataset.panel === 'panel-github') initGitHub();
  });
});

// --- ML DEMO (Logistic Regression coefficients approximated from Pima Indians dataset) ---
const mlFields = document.querySelectorAll('.ml-field input[type=range]');
mlFields.forEach(inp => {
  const display = inp.parentElement.querySelector('.val-display');
  if (display) {
    display.textContent = inp.value;
    inp.addEventListener('input', () => display.textContent = inp.value);
  }
});

document.getElementById('ml-predict-btn')?.addEventListener('click', () => {
  const g  = +document.getElementById('ml-glucose').value;
  const bmi= +document.getElementById('ml-bmi').value;
  const age= +document.getElementById('ml-age').value;
  const bp = +document.getElementById('ml-bp').value;
  const ins= +document.getElementById('ml-insulin').value;
  const preg=+document.getElementById('ml-pregnancies').value;
  const dpf= +document.getElementById('ml-dpf').value;

  // Logistic regression: z = intercept + weighted features (scaled to 0-1 roughly)
  const z = -8.4
    + 0.038 * g
    + 0.085 * bmi
    + 0.023 * age
    - 0.007 * bp
    + 0.001 * ins
    + 0.13  * preg
    + 0.94  * dpf;

  const prob = Math.round(100 / (1 + Math.exp(-z)));
  const score = Math.min(99, Math.max(1, prob));

  const scoreEl   = document.getElementById('ml-score');
  const verdictEl = document.getElementById('ml-verdict');
  const barEl     = document.getElementById('ml-risk-bar');

  scoreEl.textContent = score + '%';
  verdictEl.className = 'ml-result-verdict';

  if (score < 30) {
    verdictEl.textContent = 'Low Risk';
    verdictEl.classList.add('low');
    barEl.style.background = '#2d8a4e';
  } else if (score < 65) {
    verdictEl.textContent = 'Moderate Risk';
    verdictEl.classList.add('med');
    barEl.style.background = '#c4920a';
  } else {
    verdictEl.textContent = 'High Risk';
    verdictEl.classList.add('high');
    barEl.style.background = '#c0392b';
  }
  barEl.style.width = score + '%';
});

// --- CHARTS ---
let chartsInited = false;
function initCharts() {
  if (chartsInited) return;
  chartsInited = true;

  const accent = '#8b6914', muted = '#7a7060', surface = '#edeae4', border = '#d6d1c8';

  Chart.defaults.color = muted;
  Chart.defaults.font.family = "'Space Mono', monospace";
  Chart.defaults.font.size = 10;

  // Chart 1: Model accuracy comparison
  new Chart(document.getElementById('chart-accuracy'), {
    type: 'bar',
    data: {
      labels: ['Diabetes\nPredictor', 'Lung Cancer', 'Student\nPerf.', 'MNIST', 'FIFA\nClustering'],
      datasets: [{
        label: 'Accuracy %',
        data: [80.5, 91.2, 85.7, 97.4, 78.3],
        backgroundColor: [accent, '#a07820', '#c4920a', '#8b6914', '#7a6010'],
        borderWidth: 0,
        borderRadius: 2,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: true,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ' ' + ctx.raw + '%' } } },
      scales: {
        x: { grid: { color: border }, ticks: { color: muted } },
        y: { grid: { color: border }, ticks: { color: muted, callback: v => v + '%' }, min: 0, max: 100 }
      }
    }
  });

  // Chart 2: Tech stack usage (doughnut)
  new Chart(document.getElementById('chart-skills'), {
    type: 'doughnut',
    data: {
      labels: ['Python', 'Scikit-learn', 'PyTorch/CV', 'Pandas/NumPy', 'SQL', 'React/JS'],
      datasets: [{
        data: [35, 22, 18, 14, 7, 4],
        backgroundColor: ['#8b6914','#a07820','#c4920a','#b8860b','#d4a017','#e6be4f'],
        borderWidth: 0,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: true,
      plugins: { legend: { position: 'right', labels: { boxWidth: 10, padding: 12 } } },
      cutout: '60%'
    }
  });

  // Chart 3: FIFA 20 — Age vs Average Overall Rating (line)
  new Chart(document.getElementById('chart-fifa'), {
    type: 'line',
    data: {
      labels: ['16','18','20','22','24','26','28','30','32','34','36','38'],
      datasets: [{
        label: 'Avg Overall',
        data: [58, 62, 65, 68, 72, 75, 76, 74, 71, 67, 62, 56],
        borderColor: accent, backgroundColor: 'rgba(139,105,20,.12)',
        tension: 0.4, fill: true, pointBackgroundColor: accent, pointRadius: 4
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: border }, title: { display: true, text: 'Age', color: muted } },
        y: { grid: { color: border }, min: 50, max: 85, title: { display: true, text: 'Rating', color: muted } }
      }
    }
  });

  // Chart 4: ML model training time (horizontal bar)
  new Chart(document.getElementById('chart-time'), {
    type: 'bar',
    data: {
      labels: ['Logistic Reg.', 'Random Forest', 'SVM', 'YOLOv8 fine-tune', 'K-Means'],
      datasets: [{
        label: 'Train time (s)',
        data: [0.3, 4.2, 8.1, 120, 1.8],
        backgroundColor: accent, borderWidth: 0, borderRadius: 2,
      }]
    },
    options: {
      indexAxis: 'y', responsive: true, maintainAspectRatio: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: border }, ticks: { color: muted, callback: v => v + 's' } },
        y: { grid: { display: false }, ticks: { color: muted } }
      }
    }
  });
}

// --- GITHUB (simulated activity grid) ---
let ghInited = false;
function initGitHub() {
  if (ghInited) return;
  ghInited = true;

  const grid = document.getElementById('gh-grid');
  if (!grid) return;
  const levels = [0, 0, 0, 1, 1, 2, 2, 3, 4];
  const now = new Date();
  // 52 weeks x 7 days
  for (let w = 0; w < 52; w++) {
    const week = document.createElement('div');
    week.className = 'gh-week';
    for (let d = 0; d < 7; d++) {
      const day = document.createElement('div');
      // make recent weeks denser
      const recency = w / 52;
      const rand = Math.random();
      let lvl = 0;
      if (rand > (0.85 - recency * 0.35)) lvl = levels[Math.floor(Math.random() * levels.length)];
      day.className = 'gh-day' + (lvl ? ' l' + lvl : '');
      week.appendChild(day);
    }
    grid.appendChild(week);
  }
}
