const copy = {
  zh: { eyebrow: 'TOKYO / PUBLIC SPACE / 2026', title: '东京<br><em>必拉榜</em>', intro: '不只是解决生理需求。收录值得专程去看、适合打卡，也真正好用的城市厕所。', mapLink: '打开东京厕所地图', mapEyebrow: 'ALL PLACES, ONE MAP', mapTitle: '一张图看完全部地点', mapNote: '点击标记查看地点<br>并在 Google Maps 导航', directoryEyebrow: 'THE DIRECTORY', directoryTitle: '值得绕路的厕所', directoryNote: '按推荐顺序排列<br>涩谷及周边区域', search: '搜索名称、设计师或区域', empty: '没有找到匹配的厕所。', tipsEyebrow: 'QUICK TIPS', tipsTitle: '急用时，先看这里', tip1Title: '优先找车站', tip1Text: 'JR、Tokyo Metro、都营地下铁和私铁车站通常是最快的选择。', tip2Title: '商场最稳', tip2Text: '百货公司、大型商场和电器城的设施通常更完善。', tip3Title: '地图搜关键词', tip3Text: '在 Google Maps 搜索「トイレ」或「公衆トイレ」。', count: '处收录'},
  ja: { eyebrow: 'TOKYO / PUBLIC SPACE / 2026', title: '東京<br><em>トイレ案内</em>', intro: 'ただ用を足すだけじゃない。わざわざ訪れたい、使って気持ちいい東京のトイレを紹介します。', mapLink: '東京のトイレを地図で見る', mapEyebrow: 'ALL PLACES, ONE MAP', mapTitle: '地図で全スポットを見る', mapNote: 'マーカーをクリック<br>Google Mapsでナビ開始', directoryEyebrow: 'THE DIRECTORY', directoryTitle: '寄り道したいトイレ', directoryNote: 'おすすめ順<br>渋谷とその周辺', search: '名前、デザイナー、地域で検索', empty: '該当するトイレがありません。', tipsEyebrow: 'QUICK TIPS', tipsTitle: '急いでいるときは', tip1Title: 'まず駅へ', tip1Text: 'JR、東京メトロ、都営地下鉄、私鉄の駅が最も見つけやすい選択肢です。', tip2Title: '商業施設が安心', tip2Text: '百貨店、大型商業施設、家電量販店は設備も充実しています。', tip3Title: '地図で検索', tip3Text: 'Google Mapsで「トイレ」または「公衆トイレ」と検索。', count: 'か所掲載'},
  en: { eyebrow: 'TOKYO / PUBLIC SPACE / 2026', title: 'TOKYO<br><em>TOILET GUIDE</em>', intro: 'More than a pit stop. A field guide to Tokyo toilets worth visiting, photographing, and actually using.', mapLink: 'Open the Tokyo toilet map', mapEyebrow: 'ALL PLACES, ONE MAP', mapTitle: 'Every place, mapped', mapNote: 'Select a marker for details<br>and Google Maps navigation', directoryEyebrow: 'THE DIRECTORY', directoryTitle: 'Worth the detour', directoryNote: 'Ranked recommendations<br>Shibuya and beyond', search: 'Search by name, designer, or area', empty: 'No toilets match your search.', tipsEyebrow: 'QUICK TIPS', tipsTitle: 'When nature calls', tip1Title: 'Try a station first', tip1Text: 'JR, Tokyo Metro, Toei Subway, and private railway stations are usually the quickest bet.', tip2Title: 'Malls are reliable', tip2Text: 'Department stores, malls, and electronics shops tend to have well-kept facilities.', tip3Title: 'Search the map', tip3Text: 'Search Google Maps for “トイレ” or “公衆トイレ”.', count: 'listed'}
};

let language = 'zh';
let toilets = [];
let map;
let markers = [];

const rankSymbol = (rank) => ({ 1: '🥇', 2: '🥈', 3: '🥉' })[rank] || '⭐';

function applyCopy() {
  document.documentElement.lang = language === 'zh' ? 'zh-CN' : language;
  document.querySelectorAll('[data-copy]').forEach((element) => { element.innerHTML = copy[language][element.dataset.copy]; });
  document.querySelectorAll('[data-copy-placeholder]').forEach((element) => { element.placeholder = copy[language][element.dataset.copyPlaceholder]; });
  function escapeHtml(value) { return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]); }
function renderMap() {
  if (!window.L || !toilets.length) return;
  if (!map) { map = L.map('toilet-map', { scrollWheelZoom: false }); L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(map); }
  markers.forEach((marker) => marker.remove());
  markers = toilets.filter((toilet) => Array.isArray(toilet.coordinates)).map((toilet, index) => {
    const name = toilet.name[language] || toilet.name.en;
    const address = toilet.address?.[language] || toilet.address?.en || '';
    const label = toilet.rank ? rankSymbol(toilet.rank) : index + 1;
    const marker = L.marker(toilet.coordinates, { icon: L.divIcon({ className: 'map-marker', html: '<span>' + label + '</span>', iconSize: [32, 32], iconAnchor: [16, 16] }) }).addTo(map);
    marker.bindPopup('<strong>' + escapeHtml(name) + '</strong><small>' + escapeHtml(address) + '</small><a href="' + toilet.google_maps + '" target="_blank" rel="noreferrer">Google Maps ↗</a>');
    return marker;
  });
  const points = markers.map((marker) => marker.getLatLng());
  if (points.length) map.fitBounds(L.latLngBounds(points), { padding: [36, 36], maxZoom: 14 });
}

document.querySelectorAll('.language-button').forEach((button) => button.classList.toggle('is-active', button.dataset.language === language));
  renderToilets();
}

function cardTemplate(toilet, index) {
  const name = toilet.name[language] || toilet.name.en;
  const address = toilet.address?.[language] || toilet.address?.en || '';
  const description = toilet.description?.[language] || toilet.description?.en || '';
  const tags = toilet.tags?.[language] || toilet.tags?.en || [];
  const designer = language === 'en' ? toilet.designer_en || toilet.designer : `${toilet.designer}${toilet.designer_en ? `｜${toilet.designer_en}` : ''}`;
  return `<article class="toilet-card" style="animation-delay: ${Math.min(index, 10) * 45}ms">
    <div class="card-top"><span class="rank">${rankSymbol(toilet.rank)}</span><span class="card-id">${String(index + 1).padStart(2, '0')} / ${String(toilets.length).padStart(2, '0')}</span></div>
    <h3>${name}</h3><p class="designer">${designer}</p><p class="description">${description}</p>
    <div class="tags">${tags.map((tag) => `<span class="tag">${tag}</span>`).join('')}</div>
    <div class="card-bottom"><span class="address">${address}</span><div class="card-links"><a href="${toilet.google_maps}" target="_blank" rel="noreferrer">MAP ↗</a>${toilet.official_page ? `<a href="${toilet.official_page}" target="_blank" rel="noreferrer">SITE ↗</a>` : ''}</div></div>
  </article>`;
}

function renderToilets() {
  const query = document.querySelector('#search').value.trim().toLowerCase();
  const filtered = toilets.filter((toilet) => JSON.stringify(toilet).toLowerCase().includes(query));
  document.querySelector('#toilet-grid').innerHTML = filtered.map(cardTemplate).join('');
  document.querySelector('#empty-state').hidden = filtered.length > 0;
  document.querySelector('#result-count').textContent = `${filtered.length} ${copy[language].count}`;
}

document.querySelectorAll('.language-button').forEach((button) => button.addEventListener('click', () => { language = button.dataset.language; applyCopy(); renderMap(); }));
document.querySelector('#search').addEventListener('input', renderToilets);

const dataPath = window.location.pathname.includes('/site/') ? '../data/toilets.json' : 'data/toilets.json';

fetch(dataPath)
  .then((response) => { if (!response.ok) throw new Error('Could not load toilet data'); return response.json(); })
  .then((data) => { toilets = data.sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999)); applyCopy(); })
  .catch(() => { document.querySelector('#toilet-grid').innerHTML = '<p class="empty-state">Unable to load toilet data. Please open this page through a local server.</p>'; });