// 🔑 Supabase setup
const SUPABASE_URL = "https://byvqjbxkmcwmurifptti.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_0rdRvX_M8wTy7_aQKJfYFA_I22kPDkj";

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 🎯 DOM
const form = document.querySelector('#reviewForm');
const preview = document.querySelector('#overallPreview');

// 🧠 Score calculation (unchanged)
function scoreOf(review) {
  const keys = ['aroma','flavor','complexity','longevity','dab_performance','smoothness','effects'];
  return +(keys.reduce((sum, key) => sum + Number(review[key] || 0), 0) / keys.length).toFixed(1);
}

// 📥 Build form data
function formData() {
  const data = Object.fromEntries(new FormData(form).entries());

  ['aroma','flavor','complexity','longevity','dab_performance','smoothness','effects','price_paid']
    .forEach(k => data[k] = Number(data[k] || 0));

  data.overall = scoreOf(data);
  data.created_at = new Date().toISOString();
  data.id = crypto.randomUUID();

  return data;
}

// 🔄 Live preview
function updatePreview() {
  preview.textContent = `Overall: ${scoreOf(formData())} / 10`;
}

// 📡 GET from Supabase
async function getReviews() {
  const { data, error } = await db
    .from('entries')
    .select('*');

  if (error) {
    console.error('Fetch error:', error);
    return [];
  }

  return data;
}

// 📡 INSERT into Supabase
async function saveReview(review) {
  const { error } = await db
    .from('entries')
    .insert([review]);

  if (error) {
    console.error('Insert error:', error);
  }
}

// 🧱 UI helpers (unchanged)
function leaderboardItem(review, scoreKey = 'overall') {
  const li = document.createElement('li');
  li.innerHTML = `
    <span class="score-pill">${Number(review[scoreKey]).toFixed(1)}</span>
    <strong>${review.strain}</strong><br>
    <small>${review.brand} • ${review.reviewer}</small>
  `;
  return li;
}

// 🎨 Render UI
async function render() {
  const reviews = await getReviews();

  const topOverall = document.querySelector('#topOverall');
  const topFlavor = document.querySelector('#topFlavor');
  const topReviewers = document.querySelector('#topReviewers');
  const recent = document.querySelector('#recentReviews');

  [topOverall, topFlavor, topReviewers, recent].forEach(el => el.innerHTML = '');

  // 🏆 Top overall
  reviews.slice().sort((a,b)=>b.overall-a.overall).slice(0,10)
    .forEach(r => topOverall.append(leaderboardItem(r, 'overall')));

  // 🍋 Top flavor
  reviews.slice().sort((a,b)=>b.flavor-a.flavor).slice(0,10)
    .forEach(r => topFlavor.append(leaderboardItem(r, 'flavor')));

  // 👤 Top reviewers
  const byReviewer = Object.values(reviews.reduce((acc, r) => {
    acc[r.reviewer] ||= { reviewer:r.reviewer, count:0, total:0 };
    acc[r.reviewer].count++;
    acc[r.reviewer].total += r.overall;
    return acc;
  }, {})).map(r => ({...r, avg:r.total/r.count}))
    .sort((a,b)=>b.avg-a.avg);

  byReviewer.forEach(r => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="score-pill">${r.avg.toFixed(1)}</span>
      <strong>${r.reviewer}</strong><br>
      <small>${r.count} review${r.count === 1 ? '' : 's'}</small>
    `;
    topReviewers.append(li);
  });

  // 🆕 Recent reviews
  reviews.slice().sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)).slice(0,8)
    .forEach(r => {
      const card = document.querySelector('#reviewCardTemplate').content.cloneNode(true);
      card.querySelector('strong').textContent = `${r.strain} — ${r.overall}/10`;
      card.querySelector('span').textContent = `${r.brand} • ${r.type} • ${new Date(r.created_at).toLocaleDateString()}`;
      card.querySelector('p').textContent = r.primary_notes || r.extra_notes || 'No notes added.';
      recent.append(card);
    });
}

// 🎯 Events
form.addEventListener('input', updatePreview);

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const review = formData();

  await saveReview(review);

  form.reset();
  updatePreview();
  await render();
});

// 🧪 Sample data
document.querySelector('#sampleBtn').addEventListener('click', async () => {
  const sample = {
    reviewer:'Rafe',
    brand:'Example Farms',
    strain:'Electric Lemonade',
    batch:'Drop 01',
    type:'Live Rosin',
    where_purchased:'Local',
    price_paid:70,
    color:'Light Yellow',
    texture:'Badder',
    stability:'Stable',
    aroma:9,
    flavor:9,
    complexity:8,
    longevity:8,
    dab_performance:9,
    smoothness:9,
    effects:8,
    primary_notes:'bright citrus, dank gas, sweet finish',
    extra_notes:'Very clean melt.',
    buy_again:'Yes',
    verdict_notes:'Top shelf.',
    created_at:new Date().toISOString(),
    id:crypto.randomUUID()
  };

  sample.overall = scoreOf(sample);

  await saveReview(sample);
  await render();
});

// 🚀 Init
updatePreview();
render();