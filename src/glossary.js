const glossary = {
  'القابلة': 'المرأة التي تساعد الأم أثناء الولادة',
  'حاضنته': 'المرأة التي تولّت رعايته في طفولته',
  'الحاضنة': 'من تتولى رعاية الطفل والاهتمام به',
  'أمهات المؤمنين': 'لقب زوجات النبي ﷺ في القرآن الكريم',
  'المتوكل': 'المعتمد على الله مع الأخذ بالأسباب',
  'الحاشر': 'الذي يُحشر الناس على أثره يوم القيامة',
  'الماحي': 'الذي يمحو الله به الكفر',
  'العاقب': 'الذي لا نبي بعده',
  'الفاتح': 'اسم معناه الذي يفتح الخير بإذن الله',
  'الأمين': 'الموثوق به وصاحب الأمانة',
  'الرضاع': 'إرضاع الطفل وإطعامه من اللبن',
  'بادية': 'منطقة صحراوية يعيش أهلها بعيداً عن المدن',
  'مولاة': 'امرأة ارتبطت ببيت أو قبيلة برابطة الولاء',
  'الموالي': 'في سياق السيرة: المعتَقون أو من ارتبطوا بقبيلة برابطة الولاء',
  'ذو النورين': 'لقب عثمان بن عفان؛ لزواجه من ابنتي النبي ﷺ رقية ثم أم كلثوم',
  'ذات الهجرتين': 'من هاجرت مرتين: إلى الحبشة ثم إلى المدينة',
  'البعثة': 'بدء إرسال النبي ﷺ لتبليغ رسالة الله',
  'الوحي': 'ما يبلّغه الله إلى نبيٍّ من أمره',
  'المشركين': 'الذين يعبدون مع الله غيره',
  'محتسباً': 'راجياً الأجر والثواب من الله',
  'الغزوة': 'معركة شارك فيها النبي ﷺ بنفسه',
  'يثرب': 'الاسم القديم للمدينة المنورة',
  'المؤاخاة': 'جعل رابطة أخوة وتعاون بين المسلمين',
  'المهاجرين': 'المسلمون الذين هاجروا من مكة إلى المدينة',
  'المهاجرون': 'المسلمون الذين هاجروا من مكة إلى المدينة',
  'الأنصار': 'أهل المدينة الذين نصروا النبي والمهاجرين',
  'حجة الوداع': 'آخر حجة حجّها النبي ﷺ قبل وفاته',
  'بقيع الغرقد': 'مقبرة أهل المدينة المنورة',
  'الركوة': 'إناء صغير يُحفظ فيه الماء',
  'الرفيق الأعلى': 'الرفقة في أعلى منازل الجنة',
  'الرثاء': 'شعر يُقال للتعبير عن الحزن على من توفّي',
  'الزلل': 'الخطأ أو الزلة',
  'المحجة البيضاء': 'الطريق الواضح الذي لا لبس فيه',
  'النواجذ': 'الأضراس الخلفية؛ والتمسك بها كناية عن شدة التمسك',
  'الطلقاء': 'من أُطلق سراحهم بعد العفو عنهم',
  'الإلحاح': 'تكرار الدعاء بإصرار وخشوع',
  'توقره': 'تحترمه وتعظّمه',
  'انبلج': 'ظهر وانتشر ضوؤه',
  'ذرية': 'الأبناء والأحفاد',
  'الكنية': 'اسم يُعرف به الشخص غالباً مبدوءاً بأب أو أم',
  'المولد': 'ولادة الشخص وبداية حياته',
  'النسب': 'سلسلة الآباء والأجداد',
  'السيرة': 'أخبار حياة النبي ﷺ وأحداثها وأخلاقه',
  'الهجرة': 'انتقال المسلمين من مكة إلى المدينة طلباً للأمان وحرية العبادة',
  'غار حراء': 'غار في جبل النور بمكة، بدأ فيه نزول الوحي',
  'عام الفيل': 'العام الذي حاول فيه جيش أبرهة القادم بالفيلة الاعتداء على الكعبة',
  'أهل السير': 'العلماء الذين كتبوا أخبار سيرة النبي ﷺ',
  'المرضعه': 'المرأة التي تُرضع طفلاً ليس ابنها',
  'المرضعة': 'المرأة التي تُرضع طفلاً ليس ابنها',
  'المصطفى': 'المختار والمفضّل',
  'سيدة نساء العالمين': 'لقب تكريم لفاطمة الزهراء رضي الله عنها',
  'البادية': 'منطقة صحراوية يعيش أهلها بعيداً عن المدن',
};

const terms = Object.keys(glossary).sort((a, b) => b.length - a.length);
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const isArabicLetter = /[\u0621-\u064A\u066E-\u06D3]/u;
const marks = '[\\u064B-\\u065F\\u0670\\u06D6-\\u06ED]*';
const arabicWordChar = '[\\u0621-\\u064A\\u066E-\\u06D3\\u064B-\\u065F\\u0670]';
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
const removeDiacritics = (value) => value.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '');

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
