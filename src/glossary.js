const glossary = {
  'القابلة': 'المرأة التي تساعد الأم أثناء الولادة',
  'حاضن': 'من يتولى رعاية الطفل والاهتمام به',
  'حاضنته': 'المرأة التي تولّت رعايته في طفولته',
  'الحاضنة': 'من تتولى رعاية الطفل والاهتمام به',
  'المتوكل': 'المعتمد على الله مع الأخذ بالأسباب',
  'الحاشر': 'الذي يُحشر الناس على أثره يوم القيامة',
  'الماحي': 'الذي يمحو الله به الكفر',
  'العاقب': 'الذي لا نبي بعده',
  'مولاة': 'امرأة ارتبطت ببيت أو قبيلة برابطة الولاء',
  'الموالي': 'في سياق السيرة: المعتَقون أو من ارتبطوا بقبيلة برابطة الولاء',
  'ذو النورين': 'لقب عثمان بن عفان؛ لزواجه من ابنتي النبي ﷺ رقية ثم أم كلثوم',
  'ذات الهجرتين': 'من هاجرت مرتين: إلى الحبشة ثم إلى المدينة',
  'المؤاخاة': 'جعل رابطة أخوة وتعاون بين المسلمين',
  'بقيع الغرقد': 'مقبرة أهل المدينة المنورة',
  'الركوة': 'إناء صغير يُحفظ فيه الماء',
  'الرثاء': 'شعر يُقال للتعبير عن الحزن على من توفّي',
  'المحجة البيضاء': 'الطريق الواضح الذي لا لبس فيه',
  'النواجذ': 'الأضراس الخلفية؛ والتمسك بها كناية عن شدة التمسك',
  'الطلقاء': 'من أُطلق سراحهم بعد العفو عنهم',
  'محتسباً': 'راجياً الأجر والثواب من الله',
  'انبلج': 'ظهر وانتشر ضوؤه',
};

const terms = Object.keys(glossary).sort((a, b) => b.length - a.length);
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
const isArabicLetter = /[\\u0621-\\u064A\\u066E-\\u06D3]/u;
const marks = '[\\\\u064B-\\\\u065F\\\\u0670\\\\u06D6-\\\\u06ED]*';
const arabicWordChar = '[\\\\u0621-\\\\u064A\\\\u066E-\\\\u06D3\\\\u064B-\\\\u065F\\\\u0670]';
const attachedPrefix = '[وفبكلس]';

function makeFlexibleTerm(term) {
  return Array.from(term, (character) => (
    isArabicLetter.test(character) ? `${escapeRegExp(character)}${marks}` : escapeRegExp(character)
  )).join('');
}

const termPattern = new RegExp(
  `(?:(?<!${arabicWordChar})|(?<=${attachedPrefix}))(${terms.map(makeFlexibleTerm).join('|')})(?!${arabicWordChar})`,
  'gu'
);
const removeDiacritics = (value) => value.replace(/[\\u064B-\\u065F\\u0670\\u06D6-\\u06ED]/g, '');

export function annotateTerms(container) {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const textNodes = [];

  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.nodeValue.trim() && !node.parentElement?.closest('.term-meaning')) {
      textNodes.push(node);
    }
  }

  for (const node of textNodes) {
    const parts = node.nodeValue.split(termPattern);
    if (parts.length === 1) continue;

    const fragment = document.createDocumentFragment();
    for (const part of parts) {
      const definition = glossary[removeDiacritics(part)];
      if (!definition) {
        fragment.appendChild(document.createTextNode(part));
        continue;
      }

      fragment.appendChild(document.createTextNode(part));
      const note = document.createElement('span');
      note.className = 'term-meaning';
      note.textContent = ` (المعنى: ${definition})`;
      note.setAttribute('aria-label', `${part}: ${definition}`);
      fragment.appendChild(note);
    }
    node.replaceWith(fragment);
  }
}
