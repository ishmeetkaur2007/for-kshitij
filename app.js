// SunnyGratitude - Sunflower Thank You Interactive Application

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // ================= 1. WEB AUDIO HARMONIC SYNTHESIZER =================
  let audioCtx = null;
  let isSoundEnabled = true;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Sunny Pentatonic Chime Frequencies (E Major Pentatonic: E4, F#4, G#4, B4, C#5, E5, G#5)
  const sunnyNotes = [329.63, 369.99, 415.30, 493.88, 554.37, 659.25, 830.61];

  function playChime(noteIndex = 0, type = 'sine') {
    if (!isSoundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      const freq = sunnyNotes[noteIndex % sunnyNotes.length];
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.2, audioCtx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 1.25);
    } catch (e) {
      console.warn("Audio context error:", e);
    }
  }

  function playSpecialHarpArpeggio() {
    if (!isSoundEnabled) return;
    initAudio();
    const chord = [0, 2, 3, 4, 5, 6];
    chord.forEach((noteIdx, i) => {
      setTimeout(() => {
        playChime(noteIdx, 'triangle');
      }, i * 85);
    });
  }

  // Sound Toggle Control
  const soundToggleBtn = document.getElementById('sound-toggle-btn');
  const soundIconOn = document.getElementById('sound-icon-on');
  const soundIconOff = document.getElementById('sound-icon-off');

  soundToggleBtn?.addEventListener('click', () => {
    isSoundEnabled = !isSoundEnabled;
    if (isSoundEnabled) {
      soundIconOn.classList.remove('hidden');
      soundIconOff.classList.add('hidden');
      playChime(4);
    } else {
      soundIconOn.classList.add('hidden');
      soundIconOff.classList.remove('hidden');
    }
  });

  // ================= 2. CANVAS FLOATING SUNFLOWER PETALS & DUST =================
  const canvas = document.getElementById('petals-canvas');
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  class Petal {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : -20;
      this.size = Math.random() * 14 + 10;
      this.speedY = Math.random() * 1.2 + 0.6;
      this.speedX = Math.random() * 1.4 - 0.4;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.03;
      this.flap = Math.random() * Math.PI;
      this.flapSpeed = Math.random() * 0.04 + 0.02;
      this.colorGrad = Math.random() > 0.3 ? '#FFB300' : '#FFD54F';
      this.opacity = Math.random() * 0.45 + 0.4;
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX + Math.sin(this.flap) * 0.5;
      this.rotation += this.rotSpeed;
      this.flap += this.flapSpeed;

      if (this.y > height + 30 || this.x < -30 || this.x > width + 30) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.scale(1, Math.cos(this.flap)); // 3D flipping petal effect

      ctx.beginPath();
      // Sunflower petal teardrop shape
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-this.size / 2, -this.size / 2, -this.size / 3, -this.size * 1.6, 0, -this.size * 2);
      ctx.bezierCurveTo(this.size / 3, -this.size * 1.6, this.size / 2, -this.size / 2, 0, 0);
      
      ctx.fillStyle = this.colorGrad;
      ctx.globalAlpha = this.opacity;
      ctx.fill();
      ctx.strokeStyle = '#FFA000';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      ctx.restore();
    }
  }

  // Sparkling Pollen Dust
  class Pollen {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 10;
      this.size = Math.random() * 2.5 + 1;
      this.speedY = -(Math.random() * 0.6 + 0.2);
      this.speedX = (Math.random() - 0.5) * 0.6;
      this.alpha = Math.random() * 0.7 + 0.3;
      this.pulse = Math.random() * Math.PI;
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      this.pulse += 0.05;
      if (this.y < -10) this.reset();
    }

    draw() {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = '#FFE082';
      ctx.globalAlpha = (Math.sin(this.pulse) * 0.3 + 0.7) * this.alpha;
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#FFD54F';
      ctx.fill();
      ctx.restore();
    }
  }

  const petals = Array.from({ length: 30 }, () => new Petal());
  const pollens = Array.from({ length: 45 }, () => new Pollen());

  function animateCanvas() {
    ctx.clearRect(0, 0, width, height);

    pollens.forEach((p) => {
      p.update();
      p.draw();
    });

    petals.forEach((p) => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(animateCanvas);
  }
  animateCanvas();

  // ================= 3. PHOTOTROPIC HERO SUNFLOWER (CURSOR TRACKING) =================
  const heroFlowerSvg = document.getElementById('hero-sunflower-svg');
  const flowerHead = document.getElementById('flower-head');
  const flowerStem = document.getElementById('flower-stem');
  const flowerContainer = document.getElementById('interactive-sunflower-container');

  let currentAngle = 0;
  let targetAngle = 0;
  let stemCurve = 200;
  let targetStemCurve = 200;

  window.addEventListener('mousemove', (e) => {
    if (!flowerContainer) return;
    const rect = flowerContainer.getBoundingClientRect();
    const flowerCenterX = rect.left + rect.width / 2;
    const flowerCenterY = rect.top + rect.height * 0.4;

    const deltaX = e.clientX - flowerCenterX;
    const deltaY = e.clientY - flowerCenterY;

    // Angle calculation in degrees
    const deg = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    // Limit rotation between -35 and +35 deg from upright (which is -90 deg)
    const normalized = deg + 90;
    targetAngle = Math.max(-35, Math.min(35, normalized));
    targetStemCurve = 200 + targetAngle * 1.2;
  });

  function smoothFlowerTracking() {
    currentAngle += (targetAngle - currentAngle) * 0.08;
    stemCurve += (targetStemCurve - stemCurve) * 0.08;

    if (flowerHead) {
      flowerHead.setAttribute('transform', `translate(200, 180) rotate(${currentAngle})`);
    }
    if (flowerStem) {
      flowerStem.setAttribute('d', `M200 410 Q${stemCurve} 300 200 180`);
    }
    requestAnimationFrame(smoothFlowerTracking);
  }
  smoothFlowerTracking();

  // Hero flower click bloom celebration
  flowerContainer?.addEventListener('click', (e) => {
    triggerConfetti(e.clientX, e.clientY);
    playSpecialHarpArpeggio();

    // Scale pop animation on the SVG
    heroFlowerSvg.style.transform = 'scale(1.15) rotate(5deg)';
    setTimeout(() => {
      heroFlowerSvg.style.transform = 'scale(1) rotate(0deg)';
    }, 300);
  });

  // ================= 4. IMPORTANT MESSAGE MODAL FOR KSHITIJ =================
  const importantModal = document.getElementById('important-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const navImportantBtn = document.getElementById('nav-important-msg-btn');
  const heroImportantBtn = document.getElementById('hero-important-btn');
  const modalCelebrateBtn = document.getElementById('modal-celebrate-btn');
  const modalCopyBtn = document.getElementById('modal-copy-btn');
  const modalCopyText = document.getElementById('modal-copy-text');

  const specialGratitudeText = `thankyou for always guiding me and please be the same like this only kshitij , i m very grateful to have you in my life 😇🙏✨`;

  function openImportantModal() {
    if (!importantModal) return;
    initAudio();
    playSpecialHarpArpeggio();
    triggerConfetti();

    importantModal.classList.remove('hidden');
    setTimeout(() => {
      importantModal.classList.remove('opacity-0');
      const innerCard = importantModal.querySelector('.special-letter-card');
      if (innerCard) innerCard.classList.remove('scale-95');
    }, 20);
  }

  function closeImportantModal() {
    if (!importantModal) return;
    importantModal.classList.add('opacity-0');
    const innerCard = importantModal.querySelector('.special-letter-card');
    if (innerCard) innerCard.classList.add('scale-95');
    setTimeout(() => {
      importantModal.classList.add('hidden');
    }, 300);
  }

  navImportantBtn?.addEventListener('click', openImportantModal);
  heroImportantBtn?.addEventListener('click', openImportantModal);
  modalCloseBtn?.addEventListener('click', closeImportantModal);

  // Close modal when clicking outside
  importantModal?.addEventListener('click', (e) => {
    if (e.target === importantModal) {
      closeImportantModal();
    }
  });

  // Close on Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !importantModal?.classList.contains('hidden')) {
      closeImportantModal();
    }
  });

  // Modal actions
  modalCelebrateBtn?.addEventListener('click', () => {
    triggerConfetti();
    playSpecialHarpArpeggio();
  });

  modalCopyBtn?.addEventListener('click', () => {
    navigator.clipboard.writeText(specialGratitudeText).then(() => {
      modalCopyText.innerText = 'Copied to Clipboard! 🌻';
      playChime(5);
      setTimeout(() => {
        modalCopyText.innerText = 'Copy Note';
      }, 2500);
    });
  });

  // Section Special Card Actions
  const cardActionCelebrate = document.getElementById('card-action-celebrate');
  const cardActionCopy = document.getElementById('card-action-copy');
  const cardActionPlant = document.getElementById('card-action-plant');
  const copyBtnText = document.getElementById('copy-btn-text');

  cardActionCelebrate?.addEventListener('click', () => {
    triggerConfetti();
    playSpecialHarpArpeggio();
  });

  cardActionCopy?.addEventListener('click', () => {
    navigator.clipboard.writeText(specialGratitudeText).then(() => {
      copyBtnText.innerText = 'Copied! 🌻';
      playChime(5);
      setTimeout(() => {
        copyBtnText.innerText = 'Copy Message';
      }, 2500);
    });
  });

  cardActionPlant?.addEventListener('click', () => {
    plantSunflowerInGarden(specialGratitudeText, 'Kshitij 😇');
    const gardenSec = document.getElementById('garden-section');
    gardenSec?.scrollIntoView({ behavior: 'smooth' });
  });

  // ================= 5. INTERACTIVE SUNFLOWER GARDEN =================
  const gardenField = document.getElementById('garden-field');
  const plantedContainer = document.getElementById('planted-flowers-container');
  const gardenInputText = document.getElementById('garden-input-text');
  const gardenPlantBtn = document.getElementById('garden-plant-btn');

  const defaultNotes = [
    { text: "Thank you Kshitij for always guiding me! 😇🙏✨", author: "Kshitij 🌻", xPercent: 18, scale: 1.1 },
    { text: "Gratitude turns what we have into enough. ☀️", author: "Sunny Soul", xPercent: 36, scale: 0.9 },
    { text: "Guiding stars shine brightest in our lives! ⭐", author: "Mentor Love", xPercent: 58, scale: 1.05 },
    { text: "Forever thankful for warmth, patience & kindness! 💛", author: "Friendship", xPercent: 78, scale: 0.95 },
    { text: "Like sunflowers, we rise towards the light! 🌻", author: "Inspiration", xPercent: 90, scale: 0.85 },
  ];

  function createSunflowerSvgElement(scale = 1) {
    return `
      <svg width="${70 * scale}" height="${140 * scale}" viewBox="0 0 70 140" class="overflow-visible">
        <!-- Stem -->
        <path d="M35 140 Q33 70 35 35" stroke="#388E3C" stroke-width="5" fill="none" stroke-linecap="round" />
        <!-- Leaves -->
        <path d="M35 80 C15 70 5 90 2 80 C10 60 25 70 35 75 Z" fill="#4CAF50" stroke="#2E7D32" stroke-width="1" />
        <path d="M35 60 C55 50 65 70 68 60 C60 40 45 50 35 55 Z" fill="#4CAF50" stroke="#2E7D32" stroke-width="1" />
        <!-- Head -->
        <g transform="translate(35, 35)">
          <g class="animate-spin-slow">
            ${Array.from({ length: 12 }).map((_, i) => `
              <ellipse cx="0" cy="-22" rx="6" ry="14" fill="#FFC107" stroke="#FF9800" stroke-width="0.8" transform="rotate(${i * 30})" />
            `).join('')}
          </g>
          <circle cx="0" cy="0" r="12" fill="#4E342E" stroke="#3E2723" stroke-width="1.5" />
          <circle cx="0" cy="0" r="8" fill="#5D4037" opacity="0.8" />
          <text x="0" y="3" font-size="8" text-anchor="middle" fill="#FFD54F">✨</text>
        </g>
      </svg>
    `;
  }

  function plantSunflowerInGarden(text, author = "Friend", customX = null, scale = 1) {
    if (!plantedContainer) return;

    const xPos = customX !== null ? customX : Math.floor(Math.random() * 80) + 10;
    const flowerWrapper = document.createElement('div');
    flowerWrapper.className = 'planted-sunflower';
    flowerWrapper.style.left = `${xPos}%`;
    flowerWrapper.style.bottom = `${Math.random() * 20 + 8}px`;

    flowerWrapper.innerHTML = `
      <div class="flower-tooltip bg-amber-950/90 backdrop-blur-md text-amber-100 px-4 py-2 rounded-xl shadow-xl border border-amber-400 text-xs font-semibold">
        <p class="font-handwriting text-base text-amber-200">${text}</p>
        <span class="text-[10px] text-amber-400 font-bold uppercase">— ${author}</span>
      </div>
      ${createSunflowerSvgElement(scale)}
    `;

    flowerWrapper.addEventListener('click', (e) => {
      e.stopPropagation();
      playChime(Math.floor(Math.random() * sunnyNotes.length));
      triggerConfetti(e.clientX, e.clientY);
      flowerWrapper.style.transform = 'scale(1.3) translateY(-15px)';
      setTimeout(() => {
        flowerWrapper.style.transform = '';
      }, 300);
    });

    flowerWrapper.addEventListener('mouseenter', () => {
      playChime(2);
    });

    plantedContainer.appendChild(flowerWrapper);
  }

  // Load default flowers
  defaultNotes.forEach((item) => {
    plantSunflowerInGarden(item.text, item.author, item.xPercent, item.scale);
  });

  // Handle Plant Button
  gardenPlantBtn?.addEventListener('click', () => {
    const val = gardenInputText.value.trim();
    if (!val) return;
    plantSunflowerInGarden(val, 'You 💛');
    playChime(4);
    triggerConfetti();
    gardenInputText.value = '';
  });

  // Click on garden field to plant directly
  gardenField?.addEventListener('click', (e) => {
    const rect = gardenField.getBoundingClientRect();
    const clickXPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const val = gardenInputText.value.trim() || 'Spreading sunshine & gratitude! 🌻';
    plantSunflowerInGarden(val, 'Kind Heart', clickXPercent);
    playChime(3);
    triggerConfetti(e.clientX, e.clientY);
  });

  // ================= 6. VIRTUAL BOUQUET BUILDER =================
  const bouquetFlowersContainer = document.getElementById('bouquet-visual-flowers');
  const bouquetTagInput = document.getElementById('bouquet-tag-input');
  const bouquetTagDisplay = document.getElementById('bouquet-tag-text-display');
  const bouquetCelebrateBtn = document.getElementById('bouquet-celebrate-btn');

  let selectedCount = 3;
  let selectedRibbon = 'gold';
  let selectedWrap = 'kraft';

  function renderBouquetVisual() {
    if (!bouquetFlowersContainer) return;
    
    // Generate flower arrangement
    let flowersSvg = '';
    const rotations = [-24, -12, 0, 12, 24, -30, 30, -18, 18];

    for (let i = 0; i < selectedCount; i++) {
      const rot = rotations[i % rotations.length];
      const offsetX = (i - (selectedCount - 1) / 2) * 18;
      const offsetY = Math.abs(rot) * 0.8;

      flowersSvg += `
        <div class="absolute transition-all duration-500 ease-out origin-bottom" style="transform: translateX(${offsetX}px) translateY(${offsetY}px) rotate(${rot}deg);">
          ${createSunflowerSvgElement(1.2)}
        </div>
      `;
    }

    // Ribbon Colors
    const ribbonClasses = {
      gold: 'bg-gradient-to-r from-amber-400 to-yellow-500',
      emerald: 'bg-gradient-to-r from-emerald-500 to-green-600',
      pink: 'bg-gradient-to-r from-pink-400 to-rose-500',
      blue: 'bg-gradient-to-r from-sky-400 to-blue-600'
    };

    // Wrapper background classes
    const wrapClasses = {
      kraft: 'bg-amber-200/90 border-amber-400 text-amber-900',
      white: 'bg-white/90 border-slate-200 text-slate-800',
      golden: 'bg-gradient-to-r from-amber-300 to-yellow-400 border-yellow-500 text-amber-950'
    };

    bouquetFlowersContainer.innerHTML = `
      <div class="relative w-full h-64 flex items-center justify-center">
        <!-- Sunflowers bundle -->
        <div class="relative z-10 w-full h-full flex items-center justify-center">
          ${flowersSvg}
        </div>
        
        <!-- Bouquet Wrapper Cone -->
        <div class="absolute -bottom-2 z-20 w-44 h-28 ${wrapClasses[selectedWrap]} border-2 rounded-b-3xl shadow-lg flex items-center justify-center" style="clip-path: polygon(15% 0%, 85% 0%, 65% 100%, 35% 100%);">
          <span class="text-xs font-bold uppercase tracking-wider opacity-60">With Gratitude</span>
        </div>

        <!-- Ribbon Bow -->
        <div class="absolute bottom-4 z-30 flex items-center justify-center">
          <div class="${ribbonClasses[selectedRibbon]} text-white px-5 py-1.5 rounded-full text-xs font-bold shadow-md border border-white/60 flex items-center gap-1.5 animate-bounce" style="animation-duration: 2.5s;">
            <span>🎀</span>
            <span class="uppercase tracking-wider">Sunshine Bundle</span>
          </div>
        </div>
      </div>
    `;
  }

  renderBouquetVisual();

  // Bouquet Count Selectors
  document.querySelectorAll('.bouquet-count-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.bouquet-count-btn').forEach((b) => {
        b.classList.remove('active', 'border-amber-400', 'bg-amber-100');
        b.classList.add('border-amber-200');
      });
      btn.classList.add('active', 'border-amber-400', 'bg-amber-100');
      btn.classList.remove('border-amber-200');
      selectedCount = parseInt(btn.getAttribute('data-count'), 10);
      renderBouquetVisual();
      playChime(3);
    });
  });

  // Bouquet Ribbon Selectors
  document.querySelectorAll('.bouquet-ribbon-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.bouquet-ribbon-btn').forEach((b) => {
        b.classList.remove('active', 'ring-2');
        b.classList.add('ring-1');
      });
      btn.classList.add('active', 'ring-2');
      btn.classList.remove('ring-1');
      selectedRibbon = btn.getAttribute('data-ribbon');
      renderBouquetVisual();
      playChime(4);
    });
  });

  // Bouquet Wrap Selectors
  document.querySelectorAll('.bouquet-wrap-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.bouquet-wrap-btn').forEach((b) => {
        b.classList.remove('active', 'border-amber-400', 'bg-amber-100');
        b.classList.add('border-amber-200');
      });
      btn.classList.add('active', 'border-amber-400', 'bg-amber-100');
      btn.classList.remove('border-amber-200');
      selectedWrap = btn.getAttribute('data-wrap');
      renderBouquetVisual();
      playChime(2);
    });
  });

  // Bouquet Tag Live Update
  bouquetTagInput?.addEventListener('input', (e) => {
    if (bouquetTagDisplay) {
      bouquetTagDisplay.innerText = e.target.value || 'With warmest gratitude & sunshine! 🌻';
    }
  });

  bouquetCelebrateBtn?.addEventListener('click', () => {
    triggerConfetti();
    playSpecialHarpArpeggio();
  });

  // ================= 7. CUSTOM THANK-YOU CARD MAKER =================
  const cardInputTo = document.getElementById('card-input-to');
  const cardInputMsg = document.getElementById('card-input-msg');
  const cardInputFrom = document.getElementById('card-input-from');

  const previewCardTo = document.getElementById('preview-card-to');
  const previewCardBody = document.getElementById('preview-card-body');
  const previewCardFrom = document.getElementById('preview-card-from');
  const exportableCard = document.getElementById('exportable-thank-you-card');
  const downloadCardBtn = document.getElementById('download-card-btn');

  cardInputTo?.addEventListener('input', (e) => {
    previewCardTo.innerText = `Dear ${e.target.value || 'Friend'}`;
  });

  cardInputMsg?.addEventListener('input', (e) => {
    previewCardBody.innerText = e.target.value || 'Thank you for everything! 🌻';
  });

  cardInputFrom?.addEventListener('input', (e) => {
    previewCardFrom.innerText = e.target.value || 'With Gratitude';
  });

  // Theme Buttons for Card
  document.querySelectorAll('.card-theme-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.card-theme-btn').forEach((b) => {
        b.classList.remove('active', 'border-amber-400', 'bg-amber-100');
        b.classList.add('border-amber-200');
      });
      btn.classList.add('active', 'border-amber-400', 'bg-amber-100');
      btn.classList.remove('border-amber-200');

      const theme = btn.getAttribute('data-theme');
      if (theme === 'sunshine') {
        exportableCard.className = 'relative w-full max-w-lg bg-gradient-to-tr from-amber-100 via-yellow-50 to-amber-100 p-8 sm:p-10 rounded-3xl border-4 border-amber-300 shadow-2xl text-center space-y-6 overflow-hidden';
      } else if (theme === 'meadow') {
        exportableCard.className = 'relative w-full max-w-lg bg-gradient-to-tr from-emerald-100 via-yellow-50 to-green-100 p-8 sm:p-10 rounded-3xl border-4 border-emerald-300 shadow-2xl text-center space-y-6 overflow-hidden';
      } else if (theme === 'golden') {
        exportableCard.className = 'relative w-full max-w-lg bg-gradient-to-tr from-amber-200 via-yellow-100 to-amber-300 p-8 sm:p-10 rounded-3xl border-4 border-amber-400 shadow-2xl text-center space-y-6 overflow-hidden';
      }
      playChime(3);
    });
  });

  // Download Card Functionality via HTML2Canvas
  downloadCardBtn?.addEventListener('click', () => {
    if (!window.html2canvas || !exportableCard) return;
    downloadCardBtn.innerHTML = `<span>⏳ Creating Image...</span>`;

    html2canvas(exportableCard, {
      backgroundColor: null,
      scale: 2,
      useCORS: true
    }).then((canvas) => {
      const link = document.createElement('a');
      link.download = `Sunflower-Thank-You-${(cardInputTo.value || 'Card').trim()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      downloadCardBtn.innerHTML = `<i data-lucide="check" class="w-5 h-5"></i><span>Card Downloaded! 🌻</span>`;
      if (window.lucide) lucide.createIcons();
      playSpecialHarpArpeggio();
      triggerConfetti();

      setTimeout(() => {
        downloadCardBtn.innerHTML = `<i data-lucide="download" class="w-5 h-5"></i><span>Download Card as Image</span>`;
        if (window.lucide) lucide.createIcons();
      }, 3000);
    }).catch((err) => {
      console.error('Card capture error:', err);
      downloadCardBtn.innerHTML = `<span>Error downloading card</span>`;
    });
  });

  // ================= 8. GLOBAL CONFETTI & RIPPLE BURSTS =================
  function triggerConfetti(x = null, y = null) {
    if (!window.confetti) return;

    const origin = x !== null && y !== null
      ? { x: x / window.innerWidth, y: y / window.innerHeight }
      : { x: 0.5, y: 0.5 };

    confetti({
      particleCount: 60,
      spread: 70,
      origin: origin,
      colors: ['#FFB300', '#FFCA28', '#FFA000', '#4CAF50', '#81C784', '#FFF9C4'],
      shapes: ['circle', 'square'],
      scalar: 1.2
    });
  }

  // Click anywhere ripple effect
  window.addEventListener('click', (e) => {
    // Avoid creating ripple on input/interactive textareas
    if (['INPUT', 'TEXTAREA', 'BUTTON', 'A'].includes(e.target.tagName)) return;

    const ripple = document.createElement('div');
    ripple.className = 'sun-ripple';
    ripple.style.left = `${e.clientX}px`;
    ripple.style.top = `${e.clientY}px`;
    ripple.style.width = '60px';
    ripple.style.height = '60px';
    document.body.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 700);
  });
});
