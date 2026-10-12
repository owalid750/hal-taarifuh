import { toPng } from 'html-to-image';
import confetti from 'canvas-confetti';

export function openShareModal(station) {
  const modal = document.getElementById('shareModal');
  const cardElement = document.getElementById('shareCardPreview');

  // Populate card details
  document.getElementById('cardBadge').textContent = station.badge;
  document.getElementById('cardTitle').textContent = station.title;
  document.getElementById('cardPeriod').textContent = station.period;
  document.getElementById('cardQuote').textContent = `"${station.shareQuote}"`;

  const highlightsContainer = document.getElementById('cardHighlights');
  highlightsContainer.innerHTML = '';
  station.cardHighlights.forEach(h => {
    const item = document.createElement('div');
    item.className = 'share-highlight-chip';
    item.innerHTML = `<strong>${h.label}:</strong> <span>${h.value}</span>`;
    highlightsContainer.appendChild(item);
  });

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Confetti celebration
  confetti({
    particleCount: 40,
    spread: 60,
    origin: { y: 0.8 },
    colors: ['#c49746', '#e6c887', '#5a3d1b', '#ffffff']
  });
}

export function closeShareModal() {
  const modal = document.getElementById('shareModal');
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

export async function downloadCardImage(stationTitle) {
  const cardElement = document.getElementById('shareCardPreview');
  const downloadBtn = document.getElementById('downloadCardBtn');
  const originalText = downloadBtn.innerHTML;

  try {
    downloadBtn.innerHTML = `<span>جاري توليد الصورة...</span>`;
    downloadBtn.disabled = true;

    // Use pixel ratio 2 for crisp resolution
    const dataUrl = await toPng(cardElement, {
      cacheBust: true,
      pixelRatio: 2,
      quality: 0.95,
      style: {
        transform: 'scale(1)',
        margin: '0 auto'
      }
    });

    const link = document.createElement('a');
    link.download = `هل_تعرفه_${stationTitle.replace(/\s+/g, '_')}.png`;
    link.href = dataUrl;
    link.click();

    downloadBtn.innerHTML = `<span>✓ تم التحميل بنجاح</span>`;
    setTimeout(() => {
      downloadBtn.innerHTML = originalText;
      downloadBtn.disabled = false;
    }, 2500);
  } catch (error) {
    console.error("Failed to generate image:", error);
    downloadBtn.innerHTML = `<span>حدث خطأ، حاول مجدداً</span>`;
    setTimeout(() => {
      downloadBtn.innerHTML = originalText;
      downloadBtn.disabled = false;
    }, 2500);
  }
}

export async function copyShareText(station) {
  const text = `📜 من رحلة «هل تعرفه؟» في سيرة النبي ﷺ:\n\n*${station.title}*\n${station.shareQuote}\n\n﴿وَإِنَّكَ لَعَلَىٰ خُلُقٍ عَظِيمٍ﴾\nاستكشف الرحلة وتعرف على نبيك ﷺ!`;
  try {
    await navigator.clipboard.writeText(text);
    const copyBtn = document.getElementById('copyCardTextBtn');
    const orig = copyBtn.innerHTML;
    copyBtn.innerHTML = `<span>✓ تم نسخ النص</span>`;
    setTimeout(() => {
      copyBtn.innerHTML = orig;
    }, 2000);
  } catch (err) {
    console.error("Failed to copy:", err);
  }
}
