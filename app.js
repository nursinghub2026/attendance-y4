const $ = id => document.getElementById(id);

// ===== أيقونات خطية =====
const ICONS = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  check: '<path d="m5 12 5 5L20 7"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h3M20 17v4"/>',
  edit: '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6.5 6.5 0 0 1 3.5 6"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M9 7h6"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  sheet: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
  file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  cap: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5M22 9v6"/>',
  hourglass: '<path d="M6 3h12M6 21h12M7 3c0 5 5 5 5 9s-5 4-5 9M17 3c0 5-5 5-5 9s5 4 5 9"/>',
  chevR: '<path d="m9 6 6 6-6 6"/>',
  chevL: '<path d="m15 6-6 6 6 6"/>'
};
const icon = (n, cls = 'w-4 h-4') => `<svg class="${cls} shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[n] || ''}</svg>`;
function paintIcons(root = document) {
  root.querySelectorAll('[data-ic]').forEach(el => {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    el.insertAdjacentHTML('afterbegin', icon(el.dataset.ic, el.dataset.ics || 'w-4 h-4'));
  });
}
paintIcons();
$('emblem').innerHTML = icon('cap', 'w-10 h-10');
$('closed-ic').innerHTML = icon('lock', 'w-7 h-7');

let loaderTimer = setTimeout(() => fatal('timeout: no response from server'), 70000);
function hideLoader() { clearTimeout(loaderTimer); $('app-loader').classList.add('hidden'); }
function fatal(msg) {
  const l = $('app-loader');
  if (l.classList.contains('hidden')) return;
  const hint = /Failed to fetch|NetworkError|Load failed|timeout/i.test(msg)
    ? 'تعذر الاتصال بالسكريبت: تأكد أن الوصول = Anyone، وأنك عملت إصدار جديد (New version)، وأن API_URL صحيح.' : '';
  l.innerHTML = '<div class="max-w-sm text-center p-4"><p class="font-extrabold text-rose-400 mb-2">تعذر تشغيل النظام</p><p id="fm" class="text-xs text-slate-300 break-words" dir="ltr"></p><p id="fh" class="text-xs text-gold-200 mt-3"></p></div>';
  $('fm').textContent = msg; $('fh').textContent = hint;
}

const API_URL = 'https://script.google.com/macros/s/AKfycbwCux9kz_6J8VJK_9t0z7ctuVwTy2PjGyi0-bUJ0hDUMj5WJyoQ0yuw__ynODtOt0uDng/exec';

const urlParams = new URLSearchParams(location.search);
const requestedSessionId = urlParams.get('sid');
const isStudentLink = Boolean(requestedSessionId);
const tokenParam = urlParams.get('t') || '';
let tokenName = '', requireToken = false, tokenUsed = false;
const isAdminMode = urlParams.get('admin') === '1';
const appId = 'attendance-system-v3-y4';

let sessionsList = [], counts = {}, records = [];
let selectedAdminSessionId = null, activeStudentSession = null, closeTimer = null;

// ===== المواد والدكاترة =====
const DEFAULT_COURSES = [];
const cloneCourses = l => l.map(c => ({ name: c.name, doctors: [...c.doctors] }));
let coursesList = cloneCourses(DEFAULT_COURSES);
const stripDr = n => String(n || '').trim().replace(/^\s*د\s*[\/.]\s*/, '').replace(/\s+/g, ' ').trim();
const dr = n => { const x = stripDr(n); return x ? 'د/ ' + x : ''; };
const doctorsOf = name => (coursesList.find(c => c.name === name) || { doctors: [] }).doctors;

async function loadCourses() {
  try {
    const l = (await api({ action: 'courses' })).courses;
    if (Array.isArray(l) && l.length) coursesList = l;
  } catch { /* نستخدم الافتراضي */ }
}

// التاريخ فقط (بنشيل الوقت من المحاضرات القديمة)
const dOnly = s => String(s || '').split(' - ')[0];
const cleanSession = s => s ? { ...s, sessionDate: dOnly(s.sessionDate) } : s;

const getAdminKey = () => { try { return localStorage.getItem('att_admin_key_y4') || ''; } catch { return ''; } };
async function api(body, ms = 40000, retried = false) {
  if (isAdminMode) { const k = getAdminKey(); if (k) body = { ...body, adminKey: k }; }
  const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body), signal: ctl.signal });
    const j = await r.json();
    if (!j.ok) {
      if (j.error === 'unauthorized' && isAdminMode && !retried) {
        const k = prompt('أدخل كلمة سر لوحة التحكم');
        if (k) { try { localStorage.setItem('att_admin_key_y4', k.trim()); } catch {} clearTimeout(t); return api(body, ms, true); }
      }
      throw new Error(j.error || 'api_error');
    }
    return j;
  } catch (e) { if (e.name === 'AbortError') throw new Error('timeout'); throw e; }
  finally { clearTimeout(t); }
}
async function busy(btn, label, fn) {
  const old = btn.innerHTML; btn.disabled = true; btn.textContent = label;
  try { return await fn(); } finally { btn.disabled = false; btn.innerHTML = old; }
}

const sleep = ms => new Promise(r => setTimeout(r, ms));
const NO_RETRY = ['duplicate', 'closed', 'invalid_name', 'device_used', 'not_found', 'unknown_action'];

// إعادة محاولة ذكية: بتتحمل ضغط الطلاب (أخطاء الشبكة / السيرفر مشغول)
async function apiRetry(body, tries = 6) {
  for (let i = 1; ; i++) {
    try { return await api(body); }
    catch (err) {
      if (NO_RETRY.includes(err.message) || i >= tries) throw err;
      await sleep(Math.min(900 * i, 6000) + Math.random() * 2500);
    }
  }
}

async function submitWithRetry(body) {
  await sleep(Math.random() * 2500);
  let ambiguous = false;
  for (let i = 1; i <= 14; i++) {
    try { await api(body); return; }
    catch (err) {
      const m = err.message;
      // لو الطلب السابق اتحفظ فعلاً والرد ضاع، الجهاز هيطلع مسجل: ده نجاح
      if (ambiguous && m === 'device_used') return;
      if (NO_RETRY.includes(m) || i === 14) throw err;
      if (m !== 'busy') ambiguous = true;
      submitText.textContent = `الضغط عالي، جاري المحاولة (${i})... لا تغلق الصفحة`;
      await sleep(Math.min(1200 * i, 8000) + Math.random() * 3000);
    }
  }
}

function baseUrl() { const u = new URL(location.href); u.search = ''; u.hash = ''; return u.toString(); }
function studentUrl(id) { const u = new URL(baseUrl()); u.searchParams.set('sid', id); return u.toString(); }

const lockKey = sid => `att_locked_${appId}_${sid}`;
function getSaved(sid) { try { const r = localStorage.getItem(lockKey(sid)); return r ? JSON.parse(r) : null; } catch { return null; } }
function saveReg(sid, d) { try { localStorage.setItem(lockKey(sid), JSON.stringify(d)); } catch {} }
function getDeviceId() {
  let id = null;
  try { id = localStorage.getItem('att_device_id'); } catch {}
  if (!id) { const m = document.cookie.match(/(?:^|; )att_device_id=([^;]+)/); if (m) id = m[1]; }
  if (!id) id = 'd_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  try { localStorage.setItem('att_device_id', id); } catch {}
  document.cookie = 'att_device_id=' + id + ';max-age=31536000;path=/;SameSite=Lax';
  return id;
}

function showToast(message, type = 'success') {
  const colors = { success: 'bg-ink-900 border-gold-500', error: 'bg-rose-700 border-rose-300', info: 'bg-ink-800 border-gold-300' };
  const t = document.createElement('div');
  t.className = `pointer-events-auto px-5 py-3 rounded-2xl shadow-2xl text-white text-sm font-bold fade-in max-w-md border-r-4 ${colors[type] || colors.info}`;
  t.textContent = message;
  $('toast-container').appendChild(t);
  setTimeout(() => t.remove(), 3500);
}
async function copyText(text, msg) {
  try { await navigator.clipboard.writeText(text); }
  catch {
    const t = document.createElement('textarea'); t.value = text; t.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(t); t.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch {}
    t.remove();
    if (!ok) { showToast('تعذر النسخ التلقائي', 'error'); return; }
  }
  showToast(msg || 'تم النسخ!', 'success');
}
function confirmDialog(title, message) {
  return new Promise(resolve => {
    const m = $('confirm-modal'), ok = $('confirm-ok-btn'), no = $('confirm-cancel-btn');
    $('confirm-title').textContent = title; $('confirm-message').textContent = message;
    m.classList.remove('hidden');
    const done = r => { m.classList.add('hidden'); ok.removeEventListener('click', onOk); no.removeEventListener('click', onNo); resolve(r); };
    const onOk = () => done(true), onNo = () => done(false);
    ok.addEventListener('click', onOk); no.addEventListener('click', onNo);
  });
}
function fmtTime(iso) {
  if (!iso) return '-';
  try { return new Date(iso).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' }); } catch { return iso; }
}
const fmtHM = ms => new Date(ms).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
const normName = n => (n || '').trim().replace(/\s+/g, ' ').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
const esc = s => !s ? '' : String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
const findSession = id => sessionsList.find(s => s.id === id);

// ===== بحث مرن =====
const fold = n => String(n || '')
  .replace(/[\u064B-\u065F\u0670\u0640\u06D6-\u06ED]/g, '')
  .replace(/[أإآٱ]/g, 'ا').replace(/ء/g, '')
  .replace(/ة/g, 'ه').replace(/[ىئیې]/g, 'ي').replace(/ؤ/g, 'و').replace(/ک/g, 'ك')
  .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
  .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
  .toLowerCase().trim().replace(/\s+/g, ' ');
const matchName = (name, q) => {
  const words = fold(q).split(' ').filter(Boolean);
  if (!words.length) return true;
  const key = fold(name).replace(/ /g, '');
  return words.every(w => key.includes(w));
};
// ===== التاريخ =====
const DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const DOW_SHORT = ['أحد', 'اثنين', 'ثلاث', 'أربع', 'خميس', 'جمعة', 'سبت'];
const MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const pad = n => String(n).padStart(2, '0');
const todayISO = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const nowHM = () => { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const hmOf = ms => { const d = new Date(ms); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
function t12(hm) { const [h, m] = hm.split(':').map(Number); return `${h % 12 || 12}:${pad(m)} ${h < 12 ? 'ص' : 'م'}`; }
function buildSessionDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${DAYS[new Date(y, m - 1, d).getDay()]} ${d}/${m}/${y}`;
}
function parseSessionDate(str) {
  const m = /(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(str || '');
  return m ? `${m[3]}-${pad(m[2])}-${pad(m[1])}` : '';
}

// ===== المنتقيات =====
const pickerModal = $('picker-modal'), pickerBox = $('picker-box');
const XBTN = `<button type="button" data-x class="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">${icon('x')}</button>`;

function openPicker(render, onClick) {
  return new Promise(resolve => {
    const close = v => { pickerModal.classList.add('hidden'); pickerModal.onclick = null; pickerBox.onclick = null; resolve(v); };
    pickerModal.onclick = e => { if (e.target === pickerModal) close(null); };
    pickerBox.onclick = e => onClick(e, close);
    render();
    pickerModal.classList.remove('hidden');
  });
}

function pickFrom(title, items, cur) {
  const draw = () => {
    pickerBox.innerHTML = `
      <div class="flex items-center justify-between mb-4"><h3 class="font-display font-bold text-2xl text-ink-900">${esc(title)}</h3>${XBTN}</div>
      <div class="space-y-2 max-h-[60vh] overflow-y-auto">${items.map((it, i) => `
        <button type="button" data-pi="${i}" class="w-full flex items-center justify-between gap-3 text-right px-4 py-3.5 rounded-2xl border font-bold text-ink-900 transition ${it.value === cur ? 'border-gold-500 bg-gold-200/30' : 'border-slate-200 hover:border-gold-400'}">
          <span>${esc(it.label)}</span>${it.value === cur ? icon('check', 'w-4 h-4 text-gold-600') : ''}</button>`).join('')}</div>`;
  };
  return openPicker(draw, (e, close) => {
    const t = e.target.closest('button'); if (!t) return;
    if (t.hasAttribute('data-x')) return close(null);
    if (t.dataset.pi !== undefined) return close(items[Number(t.dataset.pi)].value);
  });
}

function pickDate(initIso) {
  const base = initIso ? new Date(initIso + 'T00:00:00') : new Date();
  let vy = base.getFullYear(), vm = base.getMonth(), sel = initIso || '';
  const today = todayISO();
  const draw = () => {
    const first = new Date(vy, vm, 1).getDay(), dim = new Date(vy, vm + 1, 0).getDate();
    let cells = '<span></span>'.repeat(first);
    for (let d = 1; d <= dim; d++) {
      const iso = `${vy}-${pad(vm + 1)}-${pad(d)}`;
      cells += `<button type="button" data-d="${iso}" class="pk-day ${iso === sel ? 'on' : ''} ${iso === today ? 'today' : ''}">${d}</button>`;
    }
    pickerBox.innerHTML = `
      <div class="flex items-center justify-between mb-4"><h3 class="font-display font-bold text-2xl text-ink-900">اختر التاريخ</h3>${XBTN}</div>
      <div class="flex items-center justify-between mb-3">
        <button type="button" data-nav="-1" class="pk-nav">${icon('chevR', 'w-5 h-5')}</button>
        <div class="font-display font-bold text-xl text-ink-900">${MONTHS[vm]} ${vy}</div>
        <button type="button" data-nav="1" class="pk-nav">${icon('chevL', 'w-5 h-5')}</button>
      </div>
      <div class="pk-grid7 mb-1">${DOW_SHORT.map(d => `<div class="pk-dow">${d}</div>`).join('')}</div>
      <div class="pk-grid7">${cells}</div>
      <div class="flex gap-3 mt-5">
        <button type="button" data-today class="btn-g flex-1 py-3">اليوم</button>
        <button type="button" data-ok class="btn-p flex-1 py-3">تم</button>
      </div>`;
  };
  return openPicker(draw, (e, close) => {
    const t = e.target.closest('button'); if (!t) return;
    if (t.hasAttribute('data-x')) return close(null);
    if (t.dataset.nav) { vm += Number(t.dataset.nav); if (vm < 0) { vm = 11; vy--; } if (vm > 11) { vm = 0; vy++; } return draw(); }
    if (t.dataset.d) { sel = t.dataset.d; return draw(); }
    if (t.hasAttribute('data-today')) return close(todayISO());
    if (t.hasAttribute('data-ok')) return close(sel || todayISO());
  });
}

function pickTime(initHM) {
  const [H0, M0] = (initHM || nowHM()).split(':').map(Number);
  let h = H0 % 12 || 12, m = M0, pm = H0 >= 12, step = 'h';
  const draw = () => {
    const cells = step === 'h'
      ? Array.from({ length: 12 }, (_, i) => i + 1).map(v => `<button type="button" data-h="${v}" class="pk-cell ${v === h ? 'on' : ''}">${v}</button>`).join('')
      : Array.from({ length: 12 }, (_, i) => i * 5).map(v => `<button type="button" data-m="${v}" class="pk-cell ${v === m ? 'on' : ''}">${pad(v)}</button>`).join('');
    pickerBox.innerHTML = `
      <div class="flex items-center justify-between"><h3 class="font-display font-bold text-2xl text-ink-900">وقت الإقفال</h3>${XBTN}</div>
      <div class="pk-disp"><button type="button" data-step="h" class="${step === 'h' ? 'act' : ''}">${h}</button><span>:</span><button type="button" data-step="m" class="${step === 'm' ? 'act' : ''}">${pad(m)}</button></div>
      <div class="flex gap-2 mb-4"><button type="button" data-ap="0" class="pk-ap ${!pm ? 'on' : ''}">ص</button><button type="button" data-ap="1" class="pk-ap ${pm ? 'on' : ''}">م</button></div>
      <p class="text-xs font-bold text-slate-400 text-center mb-2">${step === 'h' ? 'اختر الساعة' : 'اختر الدقائق'}</p>
      <div class="pk-cells">${cells}</div>
      <div class="flex gap-3 mt-5">
        <button type="button" data-now class="btn-g flex-1 py-3">الآن</button>
        <button type="button" data-ok class="btn-p flex-1 py-3">تم</button>
      </div>`;
  };
  const result = () => `${pad((h % 12) + (pm ? 12 : 0))}:${pad(m)}`;
  return openPicker(draw, (e, close) => {
    const t = e.target.closest('button'); if (!t) return;
    if (t.hasAttribute('data-x')) return close(null);
    if (t.dataset.step) { step = t.dataset.step; return draw(); }
    if (t.dataset.ap) { pm = t.dataset.ap === '1'; return draw(); }
    if (t.dataset.h) { h = Number(t.dataset.h); step = 'm'; return draw(); }
    if (t.dataset.m) { m = Number(t.dataset.m); return draw(); }
    if (t.hasAttribute('data-now')) return close(nowHM());
    if (t.hasAttribute('data-ok')) return close(result());
  });
}

// ===== Student view =====
function renderStudentView() {
  hideLoader();
  clearTimeout(closeTimer);
  $('student-mode-wrapper').classList.remove('hidden');
  const formCard = $('student-form-card'), receipt = $('student-receipt-card'), closed = $('student-closed-card'), dl = $('student-deadline');
  [formCard, receipt, closed, dl].forEach(c => c.classList.add('hidden'));
  const s = activeStudentSession;
  if (!s) {
    $('student-course-name').textContent = 'غير متاح'; $('student-session-date').textContent = '--';
    $('student-doctor').classList.add('hidden');
    $('closed-title').textContent = 'الرابط غير صحيح أو المحاضرة غير موجودة';
    $('closed-message').textContent = 'يرجى الحصول على رابط الحضور الصحيح من المحاضر.';
    closed.classList.remove('hidden'); return;
  }
  $('student-course-name').textContent = s.courseName;
  $('student-session-date').textContent = s.sessionDate;
  const docEl = $('student-doctor');
  if (s.doctor) { docEl.textContent = dr(s.doctor); docEl.classList.remove('hidden'); } else docEl.classList.add('hidden');
  document.title = `تسجيل حضور - ${s.courseName}`;
  const saved = getSaved(s.id);
  if (saved) {
    $('receipt-badge-text').textContent = 'إيصال تسجيل';
    $('receipt-name').textContent = saved.studentName;
    $('receipt-course').textContent = s.courseName;
    $('receipt-doctor').textContent = dr(s.doctor);
    $('receipt-doctor-row').classList.toggle('hidden', !s.doctor);
    $('receipt-date').textContent = s.sessionDate;
    $('receipt-time').textContent = fmtTime(saved.timestamp);
    receipt.classList.remove('hidden'); return;
  }
  if (s.isOpen === false) {
    $('closed-title').textContent = 'تم إغلاق تسجيل الحضور';
    $('closed-message').textContent = `انتهى وقت التسجيل لمحاضرة "${s.courseName}".`;
    closed.classList.remove('hidden'); return;
  }
  if (s.closeAtMs) {
    dl.innerHTML = `${icon('hourglass')}<span>التسجيل متاح حتى ${fmtHM(s.closeAtMs)}</span>`; dl.classList.remove('hidden');
    const left = s.closeAtMs - Date.now();
    if (left > 0 && left < 2147483000) closeTimer = setTimeout(() => { activeStudentSession = { ...s, isOpen: false }; renderStudentView(); }, left + 500);
  }
  if (tokenUsed) {
    $('closed-title').textContent = 'الرابط ده اتستخدم قبل كده';
    $('closed-message').textContent = 'كل رابط شخصي بيشتغل مرة واحدة. لو ماسجلتش حضورك، اطلب رابط جديد من البوت أو كلم المحاضر.';
    closed.classList.remove('hidden'); return;
  }
  if (requireToken && !tokenName) {
    $('closed-title').textContent = 'التسجيل من بوت التليجرام فقط';
    $('closed-message').textContent = 'افتح بوت الحضور على تليجرام واكتب /attend عشان توصلك رابطك الشخصي.';
    closed.classList.remove('hidden'); return;
  }
  if (tokenName) applyTokenMode();
  formCard.classList.remove('hidden');
}
function applyTokenMode() {
  const i = rosterNames.findIndex(n => normName(n) === normName(tokenName));
  pickedIdx = i >= 0 ? i : null;
  $('student-search').parentElement.classList.add('hidden');
  $('name-list').parentElement.classList.add('hidden');
  const h = $('student-form-card').querySelector('h2'); if (h) h.textContent = 'تأكيد تسجيل الحضور';
  const pl = $('picked-label'); pl.textContent = `الاسم: ${tokenName}`; pl.classList.remove('hidden');
}

// ===== اختيار الاسم من الكشف =====
const nameErr = $('name-error');
const submitBtn = $('submit-btn'), submitText = $('submit-btn-text');
let rosterNames = [], takenSet = new Set(), pickedIdx = null;

async function loadRoster() {
  const j = await apiRetry({ action: 'roster', sid: activeStudentSession.id });
  rosterNames = j.names || []; takenSet = new Set(j.taken || []); pickedIdx = null;
  $('picked-label').classList.add('hidden');
  renderNameList();
}
function renderNameList() {
  const q = $('student-search').value;
  const clr = $('student-clear');
  clr.classList.toggle('hidden', !q); clr.classList.toggle('flex', !!q);
  const box = $('name-list'), keep = box.scrollTop;
  $('student-stats').textContent = rosterNames.length ? `${takenSet.size} من ${rosterNames.length}` : '';
  $('student-bar').style.width = rosterNames.length ? Math.round(takenSet.size / rosterNames.length * 100) + '%' : '0%';
  if (!rosterNames.length) { box.innerHTML = '<div class="p-8 text-center text-sm text-slate-400">الكشف لسه ماترفعش، كلم المحاضر.</div>'; return; }
  const items = rosterNames.map((n, i) => ({ n, i })).filter(x => matchName(x.n, q));
  if (!items.length) { box.innerHTML = '<div class="p-10 text-center text-sm text-slate-400 leading-7">مفيش اسم بالشكل ده<br>جرّب تكتب جزء تاني من اسمك</div>'; return; }
  box.innerHTML = items.map(({ n, i }) => {
    const taken = takenSet.has(i), sel = i === pickedIdx;
    return `<button type="button" data-i="${i}" ${taken ? 'disabled' : ''} class="row ${taken ? 'row-taken' : sel ? 'row-sel' : ''}">
      <span class="num">${i + 1}</span>
      <span class="flex-1 text-right leading-6">${esc(n)}</span>
      ${taken ? '<span class="tag-taken">مسجّل</span>' : sel ? `<span class="chk">${icon('check', 'w-4 h-4')}</span>` : '<span class="ring-empty"></span>'}</button>`;
  }).join('');
  box.scrollTop = keep;
}
$('student-search').addEventListener('input', renderNameList);
$('student-clear').addEventListener('click', () => { $('student-search').value = ''; renderNameList(); $('student-search').focus(); });
$('name-list').addEventListener('click', e => {
  const b = e.target.closest('[data-i]'); if (!b || b.disabled) return;
  pickedIdx = Number(b.dataset.i); nameErr.classList.add('hidden');
  const pl = $('picked-label');
  pl.textContent = `اخترت: ${rosterNames[pickedIdx]}`; pl.classList.remove('hidden');
  renderNameList();
});

$('attendance-form').addEventListener('submit', async e => {
  e.preventDefault();
  const s = activeStudentSession;
  if (!s || s.isOpen === false) { showToast('التسجيل مغلق لهذه المحاضرة.', 'error'); return; }
  if (getSaved(s.id)) { renderStudentView(); return; }
  if (pickedIdx === null) { nameErr.textContent = 'اختار اسمك من القائمة.'; nameErr.classList.remove('hidden'); return; }
  const name = rosterNames[pickedIdx];
  if (!await confirmDialog('تأكيد الاسم', `هل أنت متأكد أن "${name}" هو اسمك؟ لن تستطيع تسجيل اسم آخر بعد التأكيد.`)) return;
  submitBtn.disabled = true; submitText.textContent = 'جاري حفظ الحضور...';
  try {
    await submitWithRetry({ action: 'addRecord', sessionId: s.id, rosterIdx: pickedIdx, studentName: name, deviceId: getDeviceId(), ...(tokenParam ? { token: tokenParam } : {}) });
    saveReg(s.id, { studentName: name, rosterIdx: pickedIdx, timestamp: new Date().toISOString() });
    showToast('تم تسجيل حضورك بنجاح');
    renderStudentView();
  } catch (err) {
    const m = { duplicate: 'الاسم ده اتسجل قبل كدا!', closed: 'التسجيل مغلق لهذه المحاضرة.', invalid_name: 'الكشف اتحدّث، اختار اسمك تاني.',
      device_used: 'تم التسجيل من هذا الجهاز مسبقاً لهذه المحاضرة.',
      token_used: 'الرابط ده اتستخدم قبل كده.', invalid_token: 'الرابط غير صحيح، اطلب رابط جديد من البوت.', token_required: 'التسجيل من بوت التليجرام فقط.' };
    if (err.message === 'closed') { activeStudentSession = { ...s, isOpen: false }; renderStudentView(); }
    if (err.message === 'duplicate' || err.message === 'invalid_name') loadRoster().catch(() => {});
    showToast(m[err.message] || 'حدث خطأ أثناء التسجيل، حاول مرة أخرى.', 'error');
  } finally {
    submitBtn.disabled = false; submitText.textContent = 'تأكيد وتسجيل الحضور';
  }
});

// لو الأدمن حذف تسجيل الطالب، نمسح القفل من موبايله ونرجّعله القائمة
function verifyRegistration(j) {
  const s = activeStudentSession, saved = s && getSaved(s.id);
  if (!saved || !j) return;
  const names = j.names || [];
  if (!names.length) return;
  const taken = new Set(j.taken || []);
  let idx = names.findIndex(n => normName(n) === normName(saved.studentName));
  if (idx < 0 && Number.isInteger(saved.rosterIdx)) idx = saved.rosterIdx;
  if (idx < 0 || !taken.has(idx)) {
    try { localStorage.removeItem(lockKey(s.id)); } catch {}
    renderStudentView();
    if (s.isOpen !== false) renderNameList();
    showToast('تم إلغاء تسجيلك، تقدر تسجل من جديد', 'info');
  }
        }
// ===== Admin view =====
function renderAdminView() {
  hideLoader();
  $('admin-mode-wrapper').classList.remove('hidden');
  document.title = 'لوحة تحكم الحضور - فرقة 4';
  const sorted = [...sessionsList].sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0));
  if (!selectedAdminSessionId || !sorted.some(s => s.id === selectedAdminSessionId)) selectedAdminSessionId = sorted[0]?.id || null;
  renderSessionsGrid(sorted);
  renderRoster();
}

function renderSessionsGrid(sorted) {
  const grid = $('sessions-grid');
  if (!sorted.length) { grid.innerHTML = '<div class="col-span-full text-center py-12 text-slate-400 text-sm card">لا توجد محاضرات بعد. اضغط "محاضرة" للبدء.</div>'; return; }
  grid.innerHTML = sorted.map(s => {
    const sel = s.id === selectedAdminSessionId, id = esc(s.id);
    const expired = s.rawOpen && !s.isOpen;
    const badge = s.isOpen
      ? '<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-ink-900 text-gold-300 shrink-0"><i class="live w-1.5 h-1.5 rounded-full bg-gold-400"></i>مفتوح</span>'
      : `<span class="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-500 shrink-0">${expired ? 'انتهى الوقت' : 'مغلق'}</span>`;
    const until = s.isOpen && s.closeAtMs ? `<div class="flex items-center gap-1.5 text-[11px] font-bold text-gold-600 mt-2">${icon('hourglass', 'w-3.5 h-3.5')}يقفل ${fmtHM(s.closeAtMs)}</div>` : '';
    const doc = s.doctor ? `<div class="flex items-center gap-1.5 text-xs font-extrabold text-gold-600 mb-2">${icon('user', 'w-3.5 h-3.5')}${esc(dr(s.doctor))}</div>` : '';
    return `<div data-select-session="${id}" class="cursor-pointer rounded-3xl p-4 border-2 flex flex-col gap-3 bg-white transition shadow-sm ${sel ? 'border-gold-500 shadow-xl ring-4 ring-gold-500/15' : 'border-transparent hover:border-gold-300'}">
      <div>
        <div class="flex items-start justify-between gap-2 mb-1.5"><h3 class="font-display font-bold text-xl text-ink-900 leading-7">${esc(s.courseName)}</h3>${badge}</div>
        ${doc}
        <div class="flex items-center justify-between gap-2 text-xs text-slate-500 font-semibold">
          <span class="flex items-center gap-1.5">${icon('cal', 'w-3.5 h-3.5')}${esc(s.sessionDate)}</span>
          <span class="font-extrabold bg-gold-200/40 text-ink-800 px-2.5 py-1 rounded-lg shrink-0">${counts[s.id] || 0} حاضر</span>
        </div>${until}
      </div>
      <div class="pt-3 border-t border-slate-100 flex gap-1.5" data-stop>
        <button data-copy-session="${id}" class="flex-1 py-2.5 rounded-xl bg-gradient-to-l from-ink-900 to-ink-700 text-white font-bold text-xs inline-flex items-center justify-center gap-1.5">${icon('link', 'w-3.5 h-3.5')}رابط الطلاب</button>
        <button data-qr-session="${id}" title="QR" class="w-10 rounded-xl bg-slate-100 hover:bg-gold-200/50 text-ink-800 flex items-center justify-center">${icon('qr')}</button>
        <button data-edit-session="${id}" title="تعديل" class="w-10 rounded-xl bg-slate-100 hover:bg-gold-200/50 text-ink-800 flex items-center justify-center">${icon('edit')}</button>
        <button data-delete-session="${id}" title="حذف" class="w-10 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center">${icon('trash')}</button>
      </div></div>`;
  }).join('');

  grid.querySelectorAll('[data-stop]').forEach(el => el.addEventListener('click', e => e.stopPropagation()));
  grid.querySelectorAll('[data-select-session]').forEach(c => c.addEventListener('click', async () => {
    selectedAdminSessionId = c.dataset.selectSession; await loadAdminData();
  }));
  grid.querySelectorAll('[data-copy-session]').forEach(b => b.addEventListener('click', () => copyText(studentUrl(b.dataset.copySession), 'تم نسخ رابط الطلاب')));
  grid.querySelectorAll('[data-qr-session]').forEach(b => b.addEventListener('click', () => openQr(b.dataset.qrSession)));
  grid.querySelectorAll('[data-edit-session]').forEach(b => b.addEventListener('click', () => openSessionModal(b.dataset.editSession)));
  grid.querySelectorAll('[data-delete-session]').forEach(b => b.addEventListener('click', async () => {
    const id = b.dataset.deleteSession, s = findSession(id);
    if (!await confirmDialog('حذف محاضرة', `هل أنت متأكد من حذف "${s?.courseName}" وكل تسجيلات طلابها؟`)) return;
    try { await api({ action: 'deleteSession', id }); await loadAdminData(); showToast('تم حذف المحاضرة', 'info'); }
    catch (err) { showToast('تعذر حذف المحاضرة', 'error'); }
  }));
}

let rosterList = [], adminFilter = 'all';
const pillCls = on => `px-5 py-2 rounded-full text-xs font-extrabold border transition ${on ? 'bg-ink-900 text-gold-300 border-ink-900' : 'bg-white text-slate-600 border-slate-200 hover:border-gold-400'}`;

function buildRows() {
  const byName = new Map(), used = new Set();
  records.forEach(r => byName.set(normName(r.studentName), r));
  const rows = rosterList.map((n, i) => { const r = byName.get(normName(n)) || null; if (r) used.add(r.id); return { no: i + 1, name: n, rec: r }; });
  records.filter(r => !used.has(r.id)).forEach((r, k) => rows.push({ no: rosterList.length + k + 1, name: r.studentName, rec: r, extra: true }));
  return rows;
}

function renderRoster() {
  const cur = findSession(selectedAdminSessionId), body = $('attendance-table-body');
  document.querySelectorAll('[data-filter]').forEach(b => b.className = pillCls(b.dataset.filter === adminFilter));
  if (!cur) { $('roster-session-title').textContent = 'لم يتم اختيار محاضرة'; $('roster-session-sub').textContent = ''; body.innerHTML = ''; return; }
  $('roster-session-title').textContent = cur.courseName;
  $('roster-session-sub').textContent = [dr(cur.doctor), cur.sessionDate].filter(Boolean).join('  —  ');
  const all = buildRows(), present = all.filter(x => x.rec).length, total = all.length;
  const pct = total ? Math.round(present / total * 100) : 0;
  $('st-present').textContent = present; $('st-absent').textContent = total - present; $('st-total').textContent = total;
  $('st-bar').style.width = pct + '%'; $('st-pct').textContent = pct + '%';
  const q = $('admin-search-input').value;
  const rows = all.filter(x => (adminFilter === 'all' || (adminFilter === 'present') === !!x.rec) && matchName(x.name, q));
  if (!rows.length) { body.innerHTML = '<div class="py-12 text-center text-slate-400 font-bold">مفيش نتائج</div>'; return; }
  body.innerHTML = rows.map(x => `<div class="flex items-center gap-2 px-3 py-2.5 ${x.rec ? 'bg-gold-200/20' : ''}">
    <span class="w-9 text-center text-xs font-extrabold text-slate-400">${x.no}</span>
    <span class="flex-1 font-bold leading-6 ${x.rec ? 'text-ink-900' : 'text-slate-500'}">${esc(x.name)}${x.extra ? ' <span class="text-[10px] text-gold-600">(يدوي)</span>' : ''}</span>
    <span class="w-12 flex justify-center">${x.rec ? `<span class="inline-flex w-7 h-7 items-center justify-center rounded-full bg-ink-900 text-gold-300">${icon('check')}</span>` : '<span class="text-slate-300">—</span>'}</span>
    <span class="hidden sm:block w-20 text-center text-[11px] font-semibold text-slate-500">${x.rec ? fmtTime(x.rec.timestamp) : ''}</span>
    <span class="w-14 text-center">${x.rec ? `<button data-del-rec="${esc(x.rec.id)}" class="text-rose-500 text-xs font-bold px-1.5 py-1 rounded-lg hover:bg-rose-50">حذف</button>`
      : `<button data-add-rec="${x.no - 1}" class="text-gold-600 text-xs font-bold px-1.5 py-1 rounded-lg hover:bg-gold-200/40">تسجيل</button>`}</span></div>`).join('');
  body.querySelectorAll('[data-del-rec]').forEach(btn => btn.addEventListener('click', async () => {
    const id = btn.dataset.delRec, rec = records.find(r => r.id === id);
    if (!await confirmDialog('حذف تسجيل', `هل تريد حذف تسجيل "${rec?.studentName || ''}"؟`)) return;
    try { await api({ action: 'deleteRecord', id }); await loadAdminData(); showToast('تم حذف التسجيل', 'info'); }
    catch { showToast('حدث خطأ أثناء الحذف', 'error'); }
  }));
  body.querySelectorAll('[data-add-rec]').forEach(btn => btn.addEventListener('click', async () => {
    const name = rosterList[Number(btn.dataset.addRec)];
    if (!await confirmDialog('تسجيل حضور يدوي', `تسجيل "${name}" حاضر؟`)) return;
    try { await api({ action: 'adminAddRecord', sessionId: selectedAdminSessionId, studentName: name }); await loadAdminData(); showToast('تم التسجيل'); }
    catch { showToast('تعذر التسجيل', 'error'); }
  }));
}
document.querySelectorAll('[data-filter]').forEach(b => b.addEventListener('click', () => { adminFilter = b.dataset.filter; renderRoster(); }));

async function loadAdminData() {
  let j = await api({ action: 'adminList', sid: selectedAdminSessionId || '' });
  if (!selectedAdminSessionId || !j.sessions.some(x => x.id === selectedAdminSessionId)) {
    const newest = [...j.sessions].sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0))[0];
    selectedAdminSessionId = newest ? newest.id : null;
    if (selectedAdminSessionId) j = await api({ action: 'adminList', sid: selectedAdminSessionId });
  }
  if (!rosterList.length) { try { rosterList = (await api({ action: 'roster', sid: selectedAdminSessionId || '' })).names || []; } catch {} }
  sessionsList = j.sessions.map(cleanSession); counts = j.counts || {}; records = j.records;
  renderAdminView();
}

$('copy-student-link-header-btn').addEventListener('click', () => { if (selectedAdminSessionId) copyText(studentUrl(selectedAdminSessionId), 'تم نسخ رابط الطلاب'); });
$('admin-search-input').addEventListener('input', renderRoster);

// ===== التصدير =====
const safeFile = s => String(s).replace(/\s+/g, '_').replace(/[\/\\:*?"<>|]/g, '-');
const exportRows = () => buildRows().map(x => [x.no, x.name, x.rec ? 'حاضر' : 'غائب', x.rec ? fmtTime(x.rec.timestamp) : '']);

$('export-excel-btn').addEventListener('click', () => {
  const cur = findSession(selectedAdminSessionId); if (!cur) return;
  if (!window.XLSX) { showToast('مكتبة Excel لم تُحمّل، تأكد من الإنترنت', 'error'); return; }
  const ws = XLSX.utils.aoa_to_sheet([
    ['المادة', cur.courseName], ['الدكتور', dr(cur.doctor)], ['التاريخ', cur.sessionDate], [],
    ['م', 'اسم الطالب', 'الحالة', 'وقت التسجيل'], ...exportRows()
  ]);
  ws['!cols'] = [{ wch: 10 }, { wch: 44 }, { wch: 10 }, { wch: 14 }];
  const wb = XLSX.utils.book_new();
  wb.Workbook = { Views: [{ RTL: true }] };
  XLSX.utils.book_append_sheet(wb, ws, 'الحضور');
  const name = `حضور_${safeFile(cur.courseName)}_${safeFile(cur.sessionDate)}.xlsx`;
  XLSX.writeFile(wb, name);
  showToast(`تم تنزيل الملف: ${name}`);
});

$('export-pdf-btn').addEventListener('click', () => {
  const cur = findSession(selectedAdminSessionId); if (!cur) return;
  const w = window.open('', '_blank');
  if (!w) { showToast('المتصفح منع النافذة، اسمح بالنوافذ المنبثقة', 'error'); return; }
  const all = buildRows(), present = all.filter(x => x.rec).length;
  const rows = all.map(x => `<tr class="${x.rec ? '' : 'a'}"><td>${x.no}</td><td class="n">${esc(x.name)}</td><td>${x.rec ? '✓' : ''}</td><td>${x.rec ? fmtTime(x.rec.timestamp) : ''}</td></tr>`).join('');
  w.document.write(`<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>${esc(cur.courseName)} ${esc(cur.sessionDate)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@700&family=Cairo:wght@400;700&display=swap" rel="stylesheet">
  <style>body{font-family:'Cairo',sans-serif;padding:24px;color:#2e0b11}h1{font-family:'Amiri',serif;font-size:24px;margin:0 0 4px;border-bottom:2px solid #c9a15c;padding-bottom:8px}h2{font-size:14px;margin:6px 0 0;color:#a98342}p{margin:8px 0 14px;color:#475569;font-size:12px}
  table{width:100%;border-collapse:collapse;font-size:12px}th,td{border:1px solid #d9ccb6;padding:5px 8px;text-align:center}th{background:#2e0b11;color:#e2c48f}td.n{text-align:right}tr.a td{color:#b8949a}tr{page-break-inside:avoid}</style></head><body>
  <h1>كشف حضور: ${esc(cur.courseName)}</h1>${cur.doctor ? `<h2>${esc(dr(cur.doctor))}</h2>` : ''}<p>${esc(cur.sessionDate)} | حاضر: ${present} | غائب: ${all.length - present} | الإجمالي: ${all.length}</p>
  <table><thead><tr><th style="width:40px">م</th><th>اسم الطالب</th><th style="width:50px">حضور</th><th style="width:90px">الوقت</th></tr></thead><tbody>${rows}</tbody></table></body></html>`);
  w.document.close();
  setTimeout(() => { try { w.focus(); w.print(); } catch {} }, 900);
  showToast('اختر "حفظ كملف PDF" من شاشة الطباعة', 'info');
});

$('copy-whatsapp-btn').addEventListener('click', () => {
  const cur = findSession(selectedAdminSessionId); if (!cur) return;
  const pr = buildRows().filter(x => x.rec);
  if (!pr.length) { showToast('مفيش حاضرين لسه', 'error'); return; }
  copyText(`كشف حضور: ${cur.courseName}\n${cur.doctor ? dr(cur.doctor) + '\n' : ''}التاريخ: ${cur.sessionDate}\nالحاضرين: ${pr.length}\n------------------------\n` + pr.map(x => `${x.no}. ${x.name}`).join('\n'), 'تم نسخ الحاضرين');
});
// ===== Add student (admin) =====
const addModal = $('add-modal');
$('add-student-btn').addEventListener('click', () => {
  if (!selectedAdminSessionId) { showToast('اختار محاضرة الأول', 'error'); return; }
  $('add-name-input').value = ''; addModal.classList.remove('hidden'); $('add-name-input').focus();
});
$('add-cancel-btn').addEventListener('click', () => addModal.classList.add('hidden'));
$('add-form').addEventListener('submit', async e => {
  e.preventDefault();
  const name = $('add-name-input').value.trim().replace(/\s+/g, ' ');
  if (!name) return;
  const btn = $('add-ok-btn'); btn.disabled = true;
  try {
    await api({ action: 'adminAddRecord', sessionId: selectedAdminSessionId, studentName: name });
    addModal.classList.add('hidden');
    await loadAdminData(); showToast('تمت إضافة الطالب');
  } catch (err) {
    showToast(err.message === 'duplicate' ? 'الاسم موجود بالفعل في الكشف' : 'تعذرت الإضافة', 'error');
  } finally { btn.disabled = false; }
});

// ===== Session modal =====
const sessionModal = $('session-modal');
let closeMode = 'none', sDate = '', sClose = '', sCourse = '', sDoctor = '';

function refreshSessionLabels() {
  $('session-course-btn').innerHTML = `<span class="${sCourse ? '' : 'text-slate-400'}">${sCourse ? esc(sCourse) : 'اختر المادة'}</span>${icon('book', 'w-5 h-5 text-gold-600')}`;
  const docs = doctorsOf(sCourse);
  $('session-doctor-btn').innerHTML = `<span class="${sDoctor ? '' : 'text-slate-400'}">${sDoctor ? esc(dr(sDoctor)) : (docs.length ? 'اختر الدكتور' : '—')}</span>${icon('user', 'w-5 h-5 text-gold-600')}`;
  $('session-date-btn').innerHTML = `<span>${sDate ? buildSessionDate(sDate) : 'اختر التاريخ'}</span>${icon('cal', 'w-5 h-5 text-gold-600')}`;
  $('session-close-btn').innerHTML = `<span>${sClose ? t12(sClose) : 'اختر وقت الإقفال'}</span>${icon('clock', 'w-5 h-5 text-gold-600')}`;
  const parts = [sCourse, dr(sDoctor), sDate ? buildSessionDate(sDate) : ''].filter(Boolean);
  $('session-preview').textContent = parts.length ? `سيظهر للطلاب: ${parts.join('  —  ')}` : 'اختر المادة والتاريخ';
}
function setCloseMode(m) {
  closeMode = m;
  document.querySelectorAll('[data-closemode]').forEach(b => {
    const on = b.dataset.closemode === m;
    b.className = 'seg ' + (on ? 'bg-ink-900 text-gold-300 border-ink-900' : 'bg-white text-slate-600 border-slate-200');
  });
  $('session-close-wrap').classList.toggle('hidden', m !== 'time');
}
function openSessionModal(editId = null) {
  const s = editId ? findSession(editId) : null;
  if (editId && !s) return;
  $('session-modal-title').textContent = s ? 'تعديل بيانات المحاضرة' : 'إضافة محاضرة';
  $('session-edit-id').value = s ? s.id : '';
  sCourse = s ? s.courseName : '';
  sDoctor = s ? (s.doctor || '') : '';
  sDate = (s && parseSessionDate(s.sessionDate)) || todayISO();
  sClose = '';
  $('session-open-input').checked = s ? s.rawOpen !== false : true;
  if (s && s.closeAtMs) { sClose = hmOf(s.closeAtMs); setCloseMode('time'); } else setCloseMode('none');
  refreshSessionLabels();
  sessionModal.classList.remove('hidden');
}

$('session-course-btn').addEventListener('click', async () => {
  const items = coursesList.map(c => ({ value: c.name, label: c.name }));
  if (sCourse && !items.some(i => i.value === sCourse)) items.unshift({ value: sCourse, label: sCourse });
  const v = await pickFrom('اختر المادة', items, sCourse);
  if (!v) return;
  sCourse = v;
  const docs = doctorsOf(v);
  if (docs.length === 1) sDoctor = docs[0];
  else if (!docs.includes(sDoctor)) sDoctor = '';
  refreshSessionLabels();
});
$('session-doctor-btn').addEventListener('click', async () => {
  if (!sCourse) { showToast('اختر المادة أولاً', 'error'); return; }
  const docs = doctorsOf(sCourse);
  if (!docs.length) { showToast('أضف دكاترة لهذه المادة من زر "المواد"', 'info'); return; }
  const v = await pickFrom('اختر الدكتور', docs.map(d => ({ value: d, label: dr(d) })), sDoctor);
  if (v) { sDoctor = v; refreshSessionLabels(); }
});
$('session-date-btn').addEventListener('click', async () => { const v = await pickDate(sDate); if (v) { sDate = v; refreshSessionLabels(); } });
$('session-close-btn').addEventListener('click', async () => { const v = await pickTime(sClose); if (v) { sClose = v; refreshSessionLabels(); } });
document.querySelectorAll('[data-closemode]').forEach(b => b.addEventListener('click', () => setCloseMode(b.dataset.closemode)));
$('open-create-session-btn').addEventListener('click', () => openSessionModal());
$('close-session-modal').addEventListener('click', () => sessionModal.classList.add('hidden'));
$('cancel-session-btn').addEventListener('click', () => sessionModal.classList.add('hidden'));

$('session-form').addEventListener('submit', async e => {
  e.preventDefault();
  const editId = $('session-edit-id').value;
  const isOpen = $('session-open-input').checked;
  if (!sCourse) { showToast('اختر المادة', 'error'); return; }
  if (doctorsOf(sCourse).length && !sDoctor) { showToast('اختر الدكتور', 'error'); return; }
  if (!sDate) { showToast('اختار تاريخ المحاضرة', 'error'); return; }
  const sessionDate = buildSessionDate(sDate);
  let closeAfterMin = 0, keepClose = false;
  if (isOpen && closeMode === 'time') {
    if (!sClose) { showToast('اختار وقت الإقفال', 'error'); return; }
    const orig = editId ? findSession(editId) : null;
    if (orig && orig.closeAtMs && sClose === hmOf(orig.closeAtMs) && sDate === parseSessionDate(orig.sessionDate)) keepClose = true;
    else {
      const [y, mo, d] = sDate.split('-').map(Number), [h, mi] = sClose.split(':').map(Number);
      const diff = new Date(y, mo - 1, d, h, mi).getTime() - Date.now();
      if (diff <= 0) { showToast('وقت الإقفال فات بالفعل، اختار وقت قادم', 'error'); return; }
      closeAfterMin = Math.ceil(diff / 60000);
    }
  }
  const id = editId || ('lec_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6));
  const createdAtMs = editId ? (findSession(editId)?.createdAtMs || Date.now()) : Date.now();
  await busy($('session-save-btn'), 'جاري الحفظ...', async () => {
    try { await api({ action: 'saveSession', id, courseName: sCourse, doctor: sDoctor, sessionDate, isOpen, createdAtMs, closeAfterMin, keepClose }); }
    catch (err) { showToast(err.message === 'timeout' ? 'السيرفر اتأخر، جرب تاني' : 'حدث خطأ أثناء حفظ المحاضرة', 'error'); return; }
    sessionModal.classList.add('hidden');
    selectedAdminSessionId = id;
    loadAdminData().catch(() => {});
    if (!editId) copyText(studentUrl(id), `تم إنشاء ونسخ رابط "${sCourse}"`);
    else showToast('تم تحديث المحاضرة');
  });
});

// ===== QR modal =====
const qrModal = $('qr-modal');
function openQr(id) {
  const s = findSession(id); if (!s) return;
  const url = studentUrl(id);
  $('qr-session-title').textContent = s.courseName;
  $('qr-session-doctor').textContent = dr(s.doctor);
  $('qr-session-date').textContent = s.sessionDate;
  $('qr-link-input').value = url;
  const c = $('qr-code-container'); c.innerHTML = '';
  if (window.QRCode) new QRCode(c, { text: url, width: 190, height: 190, colorDark: '#2e0b11', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.M });
  qrModal.classList.remove('hidden');
}
$('close-qr-modal').addEventListener('click', () => qrModal.classList.add('hidden'));
$('qr-copy-btn').addEventListener('click', () => copyText($('qr-link-input').value, 'تم نسخ الرابط'));

// ===== المواد والدكاترة (قابلة للتعديل) =====
const coursesModal = $('courses-modal');
let cList = [], cOrig = '';
const cSnap = () => JSON.stringify(cList);
function markCDirty() {
  const d = cSnap() !== cOrig;
  $('courses-save').disabled = !d;
  $('courses-dirty').classList.toggle('hidden', !d);
  return d;
}
function openCourses() {
  cList = cloneCourses(coursesList); cOrig = cSnap();
  renderCourses();
  coursesModal.classList.remove('hidden');
}
function renderCourses(focus = null) {
  $('courses-count').textContent = `${cList.length} مادة`;
  const body = $('courses-body');
  if (!cList.length) { body.innerHTML = '<div class="p-8 text-center text-sm text-slate-400">لا توجد مواد. اضغط "مادة جديدة".</div>'; markCDirty(); return; }
  const inpCls = 'flex-1 min-w-0 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold focus:bg-white focus:border-gold-500 focus:ring-4 focus:ring-gold-500/20 outline-none';
  body.innerHTML = cList.map((c, ci) => `
    <div class="rounded-2xl border border-slate-200 bg-white p-3 space-y-2.5 shadow-sm">
      <div class="flex items-center gap-2">
        <span class="w-9 h-9 shrink-0 rounded-xl bg-ink-900 text-gold-300 flex items-center justify-center">${icon('book')}</span>
        <input data-cn="${ci}" value="${esc(c.name)}" maxlength="80" placeholder="اسم المادة" class="${inpCls} font-display !text-lg">
        <button data-cdel="${ci}" title="حذف المادة" class="shrink-0 text-rose-500 px-3 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100">${icon('trash')}</button>
      </div>
      <div class="space-y-1.5 pr-2 border-r-2 border-gold-300">
        ${c.doctors.map((d, di) => `<div class="flex items-center gap-2">
          <span class="w-8 text-gold-600 font-extrabold text-sm text-center shrink-0">د/</span>
          <input data-cd="${ci}.${di}" value="${esc(d)}" maxlength="60" placeholder="اسم الدكتور" class="${inpCls}">
          <button data-ddel="${ci}.${di}" title="حذف" class="shrink-0 text-slate-400 hover:text-rose-500 w-9 h-9 rounded-xl hover:bg-rose-50 flex items-center justify-center">${icon('x')}</button></div>`).join('')}
        <button data-dadd="${ci}" class="btn-out !py-2 text-xs">${icon('plus', 'w-3.5 h-3.5')}دكتور</button>
      </div>
    </div>`).join('');
  markCDirty();
  if (focus) {
    const el = body.querySelector(focus);
    if (el) { el.scrollIntoView({ block: 'center' }); el.focus(); }
  }
}
$('courses-btn').addEventListener('click', openCourses);
$('course-add-btn').addEventListener('click', () => {
  cList.unshift({ name: '', doctors: [''] });
  renderCourses('[data-cn="0"]');
  $('courses-body').scrollTop = 0;
});
$('courses-body').addEventListener('input', e => {
  const t = e.target;
  if (t.dataset.cn !== undefined) cList[Number(t.dataset.cn)].name = t.value;
  else if (t.dataset.cd !== undefined) { const [ci, di] = t.dataset.cd.split('.').map(Number); cList[ci].doctors[di] = t.value; }
  else return;
  markCDirty();
});
$('courses-body').addEventListener('click', async e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.cdel !== undefined) {
    const ci = Number(b.dataset.cdel), nm = cList[ci].name || 'هذه المادة';
    if (!await confirmDialog('حذف مادة', `حذف "${nm}" من القائمة؟ المحاضرات القديمة مش هتتأثر.`)) return;
    cList.splice(ci, 1); renderCourses();
  } else if (b.dataset.ddel !== undefined) {
    const [ci, di] = b.dataset.ddel.split('.').map(Number);
    cList[ci].doctors.splice(di, 1); renderCourses();
  } else if (b.dataset.dadd !== undefined) {
    const ci = Number(b.dataset.dadd);
    cList[ci].doctors.push('');
    renderCourses(`[data-cd="${ci}.${cList[ci].doctors.length - 1}"]`);
  }
});
async function saveCourses() {
  const out = [], seen = new Set();
  for (const c of cList) {
    const name = c.name.trim().replace(/\s+/g, ' ');
    if (!name) continue;
    const k = normName(name);
    if (seen.has(k)) { showToast(`المادة مكررة: ${name}`, 'error'); return; }
    seen.add(k);
    const ds = [];
    c.doctors.forEach(d => { const x = stripDr(d); if (x && !ds.some(y => normName(y) === normName(x))) ds.push(x); });
    out.push({ name, doctors: ds });
  }
  if (!out.length) { showToast('لازم تفضل مادة واحدة على الأقل', 'error'); return; }
  await busy($('courses-save'), 'جاري الحفظ...', async () => {
    try {
      await api({ action: 'setCourses', courses: out });
      coursesList = out;
      cList = cloneCourses(out); cOrig = cSnap();
      renderCourses();
      showToast('تم حفظ المواد والدكاترة');
    } catch (err) {
      showToast(err.message === 'unknown_action' ? 'حدّث Code.gs وانشر نسخة جديدة (New version)' : err.message === 'busy' ? 'السيرفر مشغول، جرب كمان شوية' : 'تعذر حفظ المواد', 'error');
    }
  });
}
async function closeCourses() {
  if (markCDirty() && !await confirmDialog('تعديلات غير محفوظة', 'في تعديلات ماتحفظتش. تقفل وتتجاهلها؟')) return;
  coursesModal.classList.add('hidden');
}
$('courses-save').addEventListener('click', saveCourses);
$('courses-close').addEventListener('click', closeCourses);
$('courses-cancel').addEventListener('click', closeCourses);
// ===== كشف الأسماء: كله قابل للتعديل مباشرة =====
const rosterModal = $('roster-modal');
let rList = [], rOrig = '';
const rSnap = () => JSON.stringify(rList.map(r => r.name));
function markRDirty() {
  const d = rSnap() !== rOrig;
  $('roster-save').disabled = !d;
  $('roster-dirty').classList.toggle('hidden', !d);
  return d;
}

function renderRosterModal(focusIdx = null) {
  $('roster-count').textContent = `${rList.length} اسم`;
  const body = $('roster-body'), keep = body.scrollTop, q = $('roster-search').value;
  const items = rList.map((r, i) => ({ r, i })).filter(x => !q || !x.r.name || matchName(x.r.name, q));
  if (!items.length) {
    body.innerHTML = '<div class="p-8 text-center text-sm text-slate-400">الكشف فاضي أو مفيش نتائج</div>';
    markRDirty(); return;
  }
  body.innerHTML = items.map(({ r, i }) => `<div class="flex items-center gap-2 px-2 py-2">
    <span class="num">${i + 1}</span>
    <input data-ri="${i}" value="${esc(r.name)}" maxlength="60" placeholder="اسم الطالب" class="flex-1 min-w-0 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-base font-bold focus:bg-white focus:border-gold-500 focus:ring-4 focus:ring-gold-500/20 outline-none">
    <button data-rdel="${i}" title="حذف" class="shrink-0 text-rose-500 w-10 h-10 rounded-xl bg-rose-50 hover:bg-rose-100 flex items-center justify-center">${icon('trash')}</button></div>`).join('');
  body.scrollTop = keep;
  markRDirty();
  if (focusIdx !== null) {
    const el = body.querySelector(`[data-ri="${focusIdx}"]`);
    if (el) { el.scrollIntoView({ block: 'center' }); el.focus(); }
  }
}

async function openRoster() {
  rosterModal.classList.remove('hidden');
  $('roster-search').value = '';
  $('roster-paste').classList.add('hidden');
  $('roster-body').innerHTML = '<div class="p-8 text-center text-sm text-slate-400">جاري التحميل...</div>';
  try { rosterList = (await api({ action: 'roster', sid: '' })).names || []; }
  catch { rosterModal.classList.add('hidden'); showToast('تعذر تحميل الكشف', 'error'); return; }
  rList = rosterList.map(n => ({ name: n, orig: n }));
  rOrig = rSnap();
  renderRosterModal();
}

async function saveRoster() {
  const cl = rList.map(r => ({ name: r.name.trim().replace(/\s+/g, ' '), orig: r.orig })).filter(r => r.name);
  if (!cl.length) { showToast('الكشف فاضي', 'error'); return; }
  const seen = new Set();
  for (const r of cl) {
    const k = normName(r.name);
    if (seen.has(k)) { showToast(`الاسم مكرر: ${r.name}`, 'error'); return; }
    seen.add(k);
  }
  const names = cl.map(r => r.name);
  const renames = cl.filter(r => r.orig && r.orig !== r.name).map(r => [r.orig, r.name]);
  if (!await confirmDialog('حفظ الكشف', `الكشف هيبقى ${names.length} اسم${renames.length ? `، منهم ${renames.length} اسم متعدّل` : ''}. متأكد؟`)) return;
  await busy($('roster-save'), 'جاري الحفظ...', async () => {
    try {
      await api({ action: 'setRoster', names, renames });
      rosterList = names;
      rList = names.map(n => ({ name: n, orig: n }));
      rOrig = rSnap();
      renderRosterModal();
      showToast('تم حفظ الكشف');
      loadAdminData().catch(() => {});
    } catch (err) {
      showToast(err.message === 'busy' ? 'السيرفر مشغول، جرب كمان شوية' : err.message === 'timeout' ? 'السيرفر اتأخر، جرب تاني' : err.message === 'unknown_action' ? 'حدّث Code.gs وانشر نسخة جديدة (New version)' : 'تعذر حفظ الكشف', 'error');
    }
  });
  markRDirty();
}

async function closeRoster() {
  if (markRDirty() && !await confirmDialog('تعديلات غير محفوظة', 'في تعديلات ماتحفظتش. تقفل وتتجاهلها؟')) return;
  rosterModal.classList.add('hidden');
}

$('roster-upload-btn').addEventListener('click', openRoster);
$('roster-save').addEventListener('click', saveRoster);
$('roster-close').addEventListener('click', closeRoster);
$('roster-cancel').addEventListener('click', closeRoster);
$('roster-search').addEventListener('input', () => renderRosterModal());

$('roster-add-btn').addEventListener('click', () => {
  $('roster-search').value = '';
  rList.push({ name: '', orig: null });
  renderRosterModal(rList.length - 1);
});
$('roster-paste-btn').addEventListener('click', () => $('roster-paste').classList.toggle('hidden'));
$('roster-paste-ok').addEventListener('click', () => {
  const have = new Set(rList.map(r => normName(r.name)));
  let add = 0, dup = 0;
  $('roster-text').value.split('\n')
    .map(s => s.replace(/^\s*[\d٠-٩]+\s*[.\-)،:–]*\s*/, '').trim().replace(/\s+/g, ' '))
    .filter(Boolean)
    .forEach(n => {
      const k = normName(n);
      if (have.has(k)) { dup++; return; }
      have.add(k); rList.push({ name: n, orig: null }); add++;
    });
  if (!add) { showToast(dup ? 'كل الأسماء موجودة بالفعل' : 'مفيش أسماء للإضافة', 'error'); return; }
  $('roster-text').value = '';
  $('roster-paste').classList.add('hidden');
  $('roster-search').value = '';
  renderRosterModal();
  const bd = $('roster-body'); bd.scrollTop = bd.scrollHeight;
  showToast(`اتضاف ${add} اسم${dup ? ` (${dup} مكرر اتجاهل)` : ''}، اضغط "حفظ التعديلات"`, 'info');
});

$('roster-body').addEventListener('input', e => {
  const i = e.target.dataset.ri;
  if (i === undefined) return;
  rList[Number(i)].name = e.target.value;
  markRDirty();
});
$('roster-body').addEventListener('click', e => {
  const b = e.target.closest('[data-rdel]'); if (!b) return;
  rList.splice(Number(b.dataset.rdel), 1);
  renderRosterModal();
});

// ===== Boot =====
async function bootstrapApp() {
  if (!isAdminMode && !isStudentLink) { activeStudentSession = null; renderStudentView(); return; }
  try {
    if (isAdminMode) {
      loadCourses();
      await loadAdminData();
      setInterval(() => { if (document.visibilityState === 'visible') loadAdminData().catch(() => {}); }, 30000);
      return;
    }
    let j = null;
    try {
      try { j = await apiRetry({ action: 'init', sid: requestedSessionId, t: tokenParam }); }
      catch (err) {
        if (err.message !== 'unknown_action') throw err;
        // Code.gs القديم: نستخدم الطلبات المنفصلة
        const s = await apiRetry({ action: 'session', sid: requestedSessionId });
        const r = await apiRetry({ action: 'roster', sid: requestedSessionId });
        j = { session: s.session, names: r.names, taken: r.taken };
      }
      activeStudentSession = cleanSession(j.session);
      tokenName = j.tokenName || ''; requireToken = !!j.requireToken; tokenUsed = !!j.tokenUsed;
    } catch (err) {
      if (err.message === 'not_found') activeStudentSession = null; else throw err;
    }
    if (activeStudentSession) { rosterNames = j.names || []; takenSet = new Set(j.taken || []); pickedIdx = null; }
    renderStudentView();
    if (activeStudentSession) {
      if (getSaved(activeStudentSession.id)) verifyRegistration(j);
      else if (activeStudentSession.isOpen !== false) renderNameList();
    }
  } catch (err) { console.error(err); fatal(err.message); }
}
bootstrapApp();
