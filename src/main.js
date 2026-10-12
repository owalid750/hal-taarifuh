import { stationsData } from './data.js';
import { quizQuestions } from './quizData.js';
import { DesertScene } from './scene.js';
import { ambientAudio } from './audio.js';
import { openShareModal, closeShareModal, downloadCardImage, copyShareText } from './share.js';
import { annotateTerms } from './glossary.js';
import confetti from 'canvas-confetti';

class App {
  constructor() {
    this.currentStationIndex = 0;
    this.scene = null;

    // Quiz state
    this.quizIndex = 0;
    this.quizScore = 0;
    this.hasAnswered = false;

    this.init();
  }

  init() {
    const canvasContainer = document.getElementById('webgl-canvas-container');
    this.scene = new DesertScene(canvasContainer);

    this.buildStepper();
    this.bindEvents();
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
    document.getElementById('startJourneyBtn').addEventListener('click', () => {
      this.startJourney();
    });

    // Home link
    document.getElementById('homeLink').addEventListener('click', (e) => {
      e.preventDefault();
      this.showHeroView();
    });

    // Restart button
    document.getElementById('restartJourneyBtn').addEventListener('click', () => {
      this.showHeroView();
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

    // المحطة السابقة (على الشمال)
    document.getElementById('prevStationBtn').addEventListener('click', () => {
      if (this.currentStationIndex > 0) {
        this.goToStation(this.currentStationIndex - 1);
      }
    });

    // المحطة التالية (على اليمين)
    document.getElementById('nextStationBtn').addEventListener('click', () => {
      if (this.currentStationIndex < stationsData.length - 1) {
        this.goToStation(this.currentStationIndex + 1);
      } else {
        // عند انتهاء المحطات: فتح الاختبار التفاعلي
        this.startQuiz();
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

    // Quiz events
    document.getElementById('quizNextBtn').addEventListener('click', () => {
      if (this.quizIndex < quizQuestions.length - 1) {
        this.quizIndex++;
        this.renderQuizQuestion();
      } else {
        this.showQuizResult();
      }
    });

    document.getElementById('retakeQuizBtn').addEventListener('click', () => {
      this.startQuiz();
    });

    document.getElementById('backToStationsBtn').addEventListener('click', () => {
      this.startJourney();
    });

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      const isJourney = document.getElementById('journeyView').classList.contains('active-view');
      if (isJourney) {
        if (e.key === 'ArrowRight') {
          // اليمين = التالي
          if (this.currentStationIndex < stationsData.length - 1) {
            this.goToStation(this.currentStationIndex + 1);
          }
        } else if (e.key === 'ArrowLeft') {
          // الشمال = السابق
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
    const quiz = document.getElementById('quizView');
    const restartBtn = document.getElementById('restartJourneyBtn');

    hero.classList.add('hidden-view');
    journey.classList.add('active-view');
    quiz.style.display = 'none';
    restartBtn.style.display = 'inline-flex';

    this.goToStation(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  showHeroView() {
    const hero = document.getElementById('heroView');
    const journey = document.getElementById('journeyView');
    const quiz = document.getElementById('quizView');
    const restartBtn = document.getElementById('restartJourneyBtn');

    journey.classList.remove('active-view');
    hero.classList.remove('hidden-view');
    quiz.style.display = 'none';
    restartBtn.style.display = 'none';

    if (this.scene) {
      this.scene.setStationProgress(0, stationsData.length);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goToStation(index) {
    this.currentStationIndex = index;
    this.renderStation(index);

    if (this.scene) {
      this.scene.setStationProgress(index, stationsData.length);
    }

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
    const contentBody = document.getElementById('stationContentBody');
    contentBody.innerHTML = station.content;
    [
      document.getElementById('stationPeriodText'),
      document.getElementById('stationTitle'),
      document.getElementById('stationTagline'),
    ].forEach(annotateTerms);
    annotateTerms(contentBody);

    // Button states
    const prevBtn = document.getElementById('prevStationBtn');
    const nextBtn = document.getElementById('nextStationBtn');

    prevBtn.disabled = index === 0;
    prevBtn.style.opacity = index === 0 ? '0.4' : '1';
    prevBtn.style.pointerEvents = index === 0 ? 'none' : 'auto';

    if (index === stationsData.length - 1) {
      nextBtn.innerHTML = `<span>اختبار السيرة التفاعلي (١٥ سؤالاً) ✦</span>`;
      nextBtn.style.background = 'linear-gradient(135deg, #a97539 0%, #6c4627 100%)';
      nextBtn.style.color = '#fff';
    } else {
      nextBtn.innerHTML = `<span>المحطة التالية ◂</span>`;
      nextBtn.style.background = 'var(--sand-200)';
      nextBtn.style.color = 'var(--sand-900)';
    }

    const manuscript = document.getElementById('stationManuscript');
    manuscript.style.animation = 'none';
    manuscript.offsetHeight;
    manuscript.style.animation = 'fadeInStation 0.45s cubic-bezier(0.16, 1, 0.3, 1)';
  }

  // --- QUIZ METHODS ---
  startQuiz() {
    this.quizIndex = 0;
    this.quizScore = 0;
    this.hasAnswered = false;

    document.getElementById('journeyView').classList.remove('active-view');
    document.getElementById('heroView').classList.add('hidden-view');
    document.getElementById('quizView').style.display = 'flex';
    document.getElementById('quizQuestionBox').style.display = 'block';
    document.getElementById('quizResultScreen').style.display = 'none';

    this.renderQuizQuestion();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  renderQuizQuestion() {
    this.hasAnswered = false;
    const q = quizQuestions[this.quizIndex];

    document.getElementById('quizCounterText').textContent = `السؤال ${this.quizIndex + 1} من ${quizQuestions.length}`;
    document.getElementById('quizScoreText').textContent = `الدرجة: ${this.quizScore} / ${quizQuestions.length}`;

    const progressPercent = ((this.quizIndex + 1) / quizQuestions.length) * 100;
    document.getElementById('quizProgressFill').style.width = `${progressPercent}%`;

    document.getElementById('quizQuestionText').textContent = q.question;

    const optionsContainer = document.getElementById('quizOptionsList');
    optionsContainer.innerHTML = '';

    // Hide feedback & next btn
    document.getElementById('quizFeedbackBox').style.display = 'none';
    document.getElementById('quizNextBtn').style.display = 'none';

    q.options.forEach((optText, optIdx) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option-btn';
      btn.innerHTML = `<span>${optText}</span><span class="opt-icon">⃝</span>`;
      btn.addEventListener('click', () => {
        this.handleQuizAnswer(optIdx, btn);
      });
      optionsContainer.appendChild(btn);
    });
  }

  handleQuizAnswer(selectedIndex, clickedBtn) {
    if (this.hasAnswered) return;
    this.hasAnswered = true;

    const q = quizQuestions[this.quizIndex];
    const isCorrect = selectedIndex === q.correctAnswer;
    const allOptionBtns = document.querySelectorAll('.quiz-option-btn');

    // Disable all options
    allOptionBtns.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === q.correctAnswer) {
        btn.classList.add('correct-opt');
        btn.querySelector('.opt-icon').textContent = '✓';
      }
    });

    if (isCorrect) {
      this.quizScore++;
      document.getElementById('quizScoreText').textContent = `الدرجة: ${this.quizScore} / ${quizQuestions.length}`;
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    } else {
      clickedBtn.classList.add('wrong-opt');
      clickedBtn.querySelector('.opt-icon').textContent = '✕';
    }

    // Show instant feedback box & evidence
    const feedbackBox = document.getElementById('quizFeedbackBox');
    const feedbackStatus = document.getElementById('quizFeedbackStatus');
    const feedbackEvidence = document.getElementById('quizFeedbackEvidence');

    feedbackStatus.className = `feedback-status ${isCorrect ? 'correct' : 'wrong'}`;
    feedbackStatus.textContent = isCorrect ? '✓ إجابة صحيحة، أحسنت!' : '✕ إجابة غير صحيحة';
    feedbackEvidence.textContent = q.evidence;
    feedbackBox.style.display = 'block';

    // Show Next button
    const nextBtn = document.getElementById('quizNextBtn');
    if (this.quizIndex === quizQuestions.length - 1) {
      nextBtn.innerHTML = `<span>عرض النتيجة النهائية ✦</span>`;
    } else {
      nextBtn.innerHTML = `<span>السؤال التالي ◂</span>`;
    }
    nextBtn.style.display = 'inline-flex';
  }

  showQuizResult() {
    document.getElementById('quizQuestionBox').style.display = 'none';
    document.getElementById('quizNextBtn').style.display = 'none';
    const resultScreen = document.getElementById('quizResultScreen');
    resultScreen.style.display = 'block';

    document.getElementById('finalScoreVal').textContent = this.quizScore;

    const msg = document.getElementById('finalScoreMsg');
    if (this.quizScore === 15) {
      msg.textContent = "ما شاء الله تبارك الله! درجة كاملة (15/15). معرفتك بسيرة النبي ﷺ استثنائية ونموذجية!";
    } else if (this.quizScore >= 11) {
      msg.textContent = "ممتاز جداً! لديك إلمام رائع بأدق تفاصيل سيرة الحبيب المصطفى ﷺ.";
    } else if (this.quizScore >= 8) {
      msg.textContent = "جيد جداً! تعرفت على الكثير من محطات السيرة، ويمكنك مراجعة المحطات لتعزيز معرفتك.";
    } else {
      msg.textContent = "بداية مباركة في التعرف على نبيك ﷺ، ندعوك لإعادة قراءة المحطات للتأمل في تفاصيل سيرته العطرة.";
    }

    confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new App();
});
