// A one-paragraph activity card. It never reads or writes learner records.
function activityEscape(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
}

function activityVerse(verse, showPinyin) {
  const text = String(verse.text ?? '');
  const phrases = text.match(/[^，。！？；,.;!?]+[，。！？；,.;!?]?/g) || [text];
  const pronunciations = String(verse.pinyin ?? '').split(/[，。！？；,.;!?]/).map(x => x.trim()).filter(Boolean);
  return phrases.map((phrase, index) => showPinyin && pronunciations[index]
    ? `<ruby>${activityEscape(phrase)}<rt>${activityEscape(pronunciations[index])}</rt></ruby>`
    : `<span>${activityEscape(phrase)}</span>`).join('');
}

/**
 * Render one selected paragraph, never a whole chapter or personal record.
 * Both in-app preview and the print root use this same markup, without IDs.
 */
export function renderActivitySheet(chapter, guide, {
  verseIndex = 0, showPinyin = true, showExplanation = false
} = {}) {
  if (!chapter || !Array.isArray(chapter.verses) || !chapter.verses.length || !guide || !Array.isArray(guide.verses)) {
    throw new TypeError('An activity card needs a chapter and its matching child guide');
  }
  const index = Number.isInteger(verseIndex) && verseIndex >= 0 && verseIndex < chapter.verses.length ? verseIndex : 0;
  const verse = chapter.verses[index], explanation = guide.verses[index]?.plain;
  if (!verse || typeof verse.text !== 'string' || typeof explanation !== 'string') {
    throw new TypeError('The selected paragraph needs its matching child explanation');
  }
  const lesson = Number.isInteger(chapter.id) && chapter.id >= 0 ? String(chapter.id + 1).padStart(2, '0') : '—';
  return `<article class="activity-sheet${showPinyin ? ' activity-sheet-with-pinyin' : ''}${showExplanation ? ' activity-sheet-with-explanation' : ''}" aria-label="${activityEscape(chapter.title)}活动卡">
    <header class="activity-sheet-header">
      <div><p class="activity-sheet-brand">云山书院 · 三字经</p><h1>${activityEscape(chapter.title)}</h1></div>
      <p class="activity-sheet-number">第 ${lesson} 课<span>第 ${index + 1} / ${chapter.verses.length} 小段</span></p>
    </header>
    <p class="activity-sheet-goal"><strong>今天，试着</strong>${activityEscape(guide.goal)}</p>
    <section class="activity-sheet-reading">
      <h2><span>01</span>读一读</h2>
      <div class="activity-sheet-verse">${activityVerse(verse, showPinyin)}</div>
      <p class="activity-sheet-invitation">自己读，或和愿意陪你的人一起读。遇到不认识的字，可以问一问。</p>
    </section>
    ${showExplanation ? `<section class="activity-sheet-explanation"><h2>读懂这一段</h2><p>${activityEscape(explanation)}</p></section>` : ''}
    <section class="activity-sheet-talk">
      <h2><span>02</span>说一说</h2>
      <p class="activity-sheet-prompt">${activityEscape(guide.talk)}</p>
      <p class="activity-sheet-invitation">用自己的话说意思，再举一个例子。不用和书上的句子一模一样。</p>
    </section>
    <section class="activity-sheet-action">
      <h2><span>03</span>离开屏幕，试一试</h2>
      <p class="activity-sheet-prompt">${activityEscape(guide.activity)}</p>
    </section>
    <section class="activity-sheet-create">
      <h2><span>04</span>留下我的想法</h2>
      <p class="activity-sheet-invitation">画一画，写几个字，或者只说给自己听。留白也没关系。</p>
      <div class="activity-sheet-canvas" aria-label="自由画写区域"><span>我的一个发现</span><div class="activity-sheet-lines" aria-hidden="true"></div></div>
    </section>
    <footer class="activity-sheet-footer"><p>今天学到这里，也很好。下次再想一想。</p><small>古书有时代背景；今天学习，尊重每个人，也保护休息和游戏的时间。</small></footer>
  </article>`;
}
