import { stationsData } from './data.js';
import { DesertScene } from './scene.js';
import { ambientAudio } from './audio.js';
import { openShareModal, closeShareModal, downloadCardImage, copyShareText } from './share.js';

class App {
  constructor() {
    this.currentStationIndex = 0;
    this.scene = null;
    this.init();
  }

  init() {
    // 1. Initialize Three.js scene
    const canvasContainer = document.getElementById('webgl-canvas-container');
    this.scene = new DesertScene(canvasContainer);

    // 2. Render Stepper Dots
    this.buildStepper();

    // 3. Bind UI Events
    this.bindEvents();

    // 4. Render first station
    this.renderStation(0);
  }

  buildStepper() {
    const wrapper = document.getElementById('stepperDotsWrapper');
    wrapper.innerHTML = '';
    stationsData.forEach((station, idx) => {
      const dot = document.createElement('div');
      dot.className = `step-dot ${idx === 0 ? 'active' : ''}`;
      dot.textContent = idx + 1;
      dot.title = station.title;
      dot.addEventListener('click', () => {
        this.goToStation(idx);
      });
      wrapper.appendChild(dot);
    });
  }

  bindEvents() {
    // Start Journey button
    const startBtn = document.getElementById('startJourneyBtn');
    startBtn.addEventListener('click', () => {
      this.startJourney();
    });

    // Home link
    document.getElementById('homeLink').addEventListener('click', (e) => {
      e.preventDefault();
      this.showHeroView();
    });

    // Restart button
    document.getElementById('restartJourneyBtn').addEventListener('click', () => {
      this.goToStation(0);
    });

    // Audio Toggle
    const audioBtn = document.getElementById('audioToggleBtn');
    audioBtn.addEventListener('click', () => {
      const isPlaying = ambientAudio.toggle();
      const statusText = document.getElementById('audioStatusText');
      const icon = document.getElementById('audioIcon');
      if (isPlaying) {
        statusText.textContent = "صوت الصحراء: يعمل";
        icon.textContent = "🔊";
      } else {
        statusText.textContent = "صوت الصحراء: مغلق";
        icon.textContent = "🔈";
      }
    });

    // Previous & Next Station
    document.getElementById('prevStationBtn').addEventListener('click', () => {
      if (this.currentStationIndex > 0) {
        this.goToStation(this.currentStationIndex - 1);
      }
    });

    document.getElementById('nextStationBtn').addEventListener('click', () => {
      if (this.currentStationIndex < stationsData.length - 1) {
        this.goToStation(this.currentStationIndex + 1);
      }
    });

    // Share Modal triggers
    document.getElementById('openShareModalBtn').addEventListener('click', () => {
      const station = stationsData[this.currentStationIndex];
      openShareModal(station);
    });

    document.getElementById('closeModalBtn').addEventListener('click', () => {
      closeShareModal();
    });

    document.getElementById('shareModal').addEventListener('click', (e) => {
      if (e.target.id === 'shareModal') {
        closeShareModal();
      }
    });

    document.getElementById('downloadCardBtn').addEventListener('click', () => {
      const station = stationsData[this.currentStationIndex];
      downloadCardImage(station.title);
    });

    document.getElementById('copyCardTextBtn').addEventListener('click', () => {
      const station = stationsData[this.currentStationIndex];
      copyShareText(station);
    });

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      if (document.getElementById('journeyView').classList.contains('active-view')) {
        if (e.key === 'ArrowLeft') {
          if (this.currentStationIndex < stationsData.length - 1) this.goToStation(this.currentStationIndex + 1);
        } else if (e.key === 'ArrowRight') {
          if (this.currentStationIndex > 0) this.goToStation(this.currentStationIndex - 1);
        } else if (e.key === 'Escape') {
          closeShareModal();
        }
      }
    });
  }

  startJourney() {
    const hero = document.getElementById('heroView');
    const journey = document.getElementById('journeyView');
    const restartBtn = document.getElementById('restartJourneyBtn');

    hero.classList.add('hidden-view');
    journey.classList.add('active-view');
    restartBtn.style.display = 'inline-flex';

    this.goToStation(0);
    ambientAudio.playChime();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  showHeroView() {
    const hero = document.getElementById('heroView');
    const journey = document.getElementById('journeyView');
    const restartBtn = document.getElementById('restartJourneyBtn');

    journey.classList.remove('active-view');
    hero.classList.remove('hidden-view');
    restartBtn.style.display = 'none';

    if (this.scene) {
      this.scene.setStationProgress(0, stationsData.length);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goToStation(index) {
    this.currentStationIndex = index;
    this.renderStation(index);

    // Update Three.js scene position & theme
    if (this.scene) {
      this.scene.setStationProgress(index, stationsData.length);
    }

    ambientAudio.playChime();

    // Scroll smoothly to top of card
    const card = document.getElementById('stationManuscript');
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  renderStation(index) {
    const station = stationsData[index];

    // Stepper updates
    document.getElementById('stepperCounter').textContent = `المحطة ${index + 1} من ${stationsData.length}`;
    const fillPercent = ((index) / (stationsData.length - 1)) * 100;
    document.getElementById('stepperLineFill').style.width = `${fillPercent}%`;

    const dots = document.querySelectorAll('.step-dot');
    dots.forEach((dot, idx) => {
      dot.classList.remove('active', 'completed');
      if (idx === index) {
        dot.classList.add('active');
      } else if (idx < index) {
        dot.classList.add('completed');
      }
    });

    // Station details
    document.getElementById('stationBadge').textContent = station.badge;
    document.getElementById('stationPeriodText').textContent = station.period;
    document.getElementById('stationTitle').textContent = station.title;
    document.getElementById('stationTagline').textContent = station.tagline;
    document.getElementById('stationContentBody').innerHTML = station.content;

    // Button states
    const prevBtn = document.getElementById('prevStationBtn');
    const nextBtn = document.getElementById('nextStationBtn');

    prevBtn.disabled = index === 0;
    prevBtn.style.opacity = index === 0 ? '0.4' : '1';
    prevBtn.style.pointerEvents = index === 0 ? 'none' : 'auto';

    if (index === stationsData.length - 1) {
      nextBtn.innerHTML = `<span>تمت الرحلة المباركة ✦</span>`;
      nextBtn.style.background = 'linear-gradient(135deg, #a97539 0%, #6c4627 100%)';
      nextBtn.style.color = '#fff';
    } else {
      nextBtn.innerHTML = `<span>المحطة التالية ←</span>`;
      nextBtn.style.background = 'var(--sand-200)';
      nextBtn.style.color = 'var(--sand-900)';
    }

    // Trigger manuscript animation
    const manuscript = document.getElementById('stationManuscript');
    manuscript.style.animation = 'none';
    manuscript.offsetHeight; /* trigger reflow */
    manuscript.style.animation = 'fadeInStation 0.45s cubic-bezier(0.16, 1, 0.3, 1)';
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  new App();
});
