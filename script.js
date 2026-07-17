// ── COUPON CODES ─────────────────────────────────────────────────────
// code → discount percentage
const COUPONS = {
  'MUN27':      100,   // 100% off — full free
  'FRIENDS10':  10,    // 10% off — friends
  'BLOGGERS25': 25,    // 25% off — bloggers
  'BLOGGER50':  50,    // 50% off — bloggers
  'BUSH25':     25,    // 25% off
  'FRIEND50':   50,    // 50% off — friends
  'RANGDE75':   75,    // 75% off
  'ROYAAM25':   25,    // 25% off
  'SABAOON25':  25,    // 25% off
  'NADIA25':    25,    // 25% off
};
const BASE_PRICE = 1800;

// ── STATE ────────────────────────────────────────────────────────────
let state = {
  type: 'individual',
  members: 1,
  couponApplied: false,
  couponCode: '',
  discountPct: 0,
  paymentMethod: '',
  fileUploaded: false,
  currentStep: 1,
};

// ── CAROUSEL ─────────────────────────────────────────────────────────
(function initCarousel() {
  const track = document.getElementById('track');
  const dotsWrap = document.getElementById('dots');
  const slides = track.querySelectorAll('.slide');
  let current = 0;
  let timer;

  slides.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'cdot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', 'Slide ' + (i + 1));
    d.addEventListener('click', () => go(i));
    dotsWrap.appendChild(d);
  });

  function go(n) {
    current = (n + slides.length) % slides.length;
    track.style.transform = 'translateX(-' + current * 100 + '%)';
    dotsWrap.querySelectorAll('.cdot').forEach((d, i) =>
      d.classList.toggle('active', i === current)
    );
  }

  function autoPlay() {
    timer = setInterval(() => go(current + 1), 3500);
  }

  document.getElementById('prev').addEventListener('click', () => { clearInterval(timer); go(current - 1); autoPlay(); });
  document.getElementById('next').addEventListener('click', () => { clearInterval(timer); go(current + 1); autoPlay(); });

  // Swipe support
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { clearInterval(timer); go(current + (diff > 0 ? 1 : -1)); autoPlay(); }
  });

  autoPlay();
})();

// ── NAV ──────────────────────────────────────────────────────────────
document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('navMobile').classList.toggle('open');
});

document.querySelectorAll('.nav-mobile a').forEach(a => {
  a.addEventListener('click', () => document.getElementById('navMobile').classList.remove('open'));
});

// Sticky nav shadow on scroll
window.addEventListener('scroll', () => {
  document.querySelector('.nav').style.boxShadow =
    window.scrollY > 10 ? '0 4px 20px rgba(232,132,154,.15)' : 'none';
});

// ── STEP NAVIGATION ──────────────────────────────────────────────────
function goStep(n) {
  // Validate current step before moving forward
  if (n > state.currentStep && !validateStep(state.currentStep)) return;

  // If total is 0 and we're moving forward past step 2, skip payment entirely
  if (n === 3 && finalTotal() === 0) {
    saveAndConfirm();
    return;
  }

  // Show correct step
  document.querySelectorAll('.fstep').forEach(s => s.classList.remove('active'));
  document.getElementById('step' + n).classList.add('active');

  // Update step indicator dots
  for (let i = 1; i <= 4; i++) {
    const el = document.getElementById('sd' + i);
    el.classList.remove('active', 'done');
    if (i === n) el.classList.add('active');
    else if (i < n) el.classList.add('done');
  }

  if (n === 2) updatePriceSummary();
  if (n === 3) {
    const total = finalTotal();
    document.getElementById('payAmt').textContent = formatRs(total);
    document.getElementById('sendAmt').textContent = formatRs(total);
    // Auto-select JazzCash
    const jcRadio = document.querySelector('input[value="easypaisa"]');
    if (jcRadio && !jcRadio.checked) { jcRadio.checked = true; selectPM('easypaisa'); }
  }

  state.currentStep = n;
  document.getElementById('formCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function validateStep(n) {
  if (n === 1) {
    const name = document.getElementById('fullName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    if (!name) { alert('Please enter your full name.'); return false; }
    if (!phone) { alert('Please enter your phone number.'); return false; }
    if (phone.replace(/\D/g,'').length !== 11) { alert('Phone number must be exactly 11 digits.'); return false; }
    if (!email || !email.includes('@')) { alert('Please enter a valid email address.'); return false; }
    if (state.type === 'group') {
      const rows = document.querySelectorAll('#grpList .gmrow');
      for (const row of rows) {
        const name  = row.querySelector('.mname');
        const phone = row.querySelector('.mphone');
        if (!name || !name.value.trim()) {
          alert('Please fill in all group member names.'); return false;
        }
        if (!phone || phone.value.replace(/\D/g,'').length !== 11) {
          alert('Each group member needs an 11-digit phone number.'); return false;
        }
      }
      updateMemberCount();
    } else {
      state.members = 1;
    }
  }
  if (n === 3) {
    if (finalTotal() === 0) return true; // free — skip payment validation
    if (!state.paymentMethod) { alert('Please choose a payment method.'); return false; }
    const txn = document.getElementById('txnId').value.trim();
    if (!txn) { alert('Please enter your Transaction ID.'); return false; }
    if (!state.fileUploaded) { alert('Please upload your payment screenshot.'); return false; }
  }
  if (n === 2) {
    if (state.couponApplied) {
      const ref = document.getElementById('referredBy').value.trim();
      if (!ref) { alert('Please enter who referred this coupon to you.'); return false; }
    }
  }
  return true;
}

// ── REGISTRATION TYPE TOGGLE ─────────────────────────────────────────
function setType(t) {
  state.type = t;
  state.couponApplied = false;
  state.couponCode = '';
  document.getElementById('coupon').value = '';
  clearCouponMsg();
  document.getElementById('referredFg').style.display = 'none';
  document.getElementById('referredBy').value = '';

  document.getElementById('btnInd').classList.toggle('active', t === 'individual');
  document.getElementById('btnGrp').classList.toggle('active', t === 'group');
  document.getElementById('grpSection').style.display = t === 'group' ? 'block' : 'none';

  if (t === 'group') {
    state.discountPct = 50;
    lockCoupon(true);
    document.getElementById('couponFg').style.display = 'none';
    document.getElementById('grpCouponBlock').style.display = 'flex';
  } else {
    state.discountPct = 0;
    lockCoupon(false);
    document.getElementById('couponFg').style.display = 'block';
    document.getElementById('grpCouponBlock').style.display = 'none';
  }
  updatePriceSummary();
}

function lockCoupon(lock) {
  const inp = document.getElementById('coupon');
  inp.disabled = lock;
  inp.style.opacity = lock ? '0.5' : '1';
}

// ── GROUP MEMBERS ─────────────────────────────────────────────────────
function addMember() {
  const list = document.getElementById('grpList');
  const row = document.createElement('div');
  row.className = 'gmrow';
  row.innerHTML = '<span class="gnum"></span>'
    + '<input type="text" class="minput mname" placeholder="Member name *">'
    + '<input type="tel" class="minput mphone" placeholder="Phone (11 digits) *" maxlength="11">'
    + '<button type="button" class="remove-member" onclick="removeMember(this)">&#10005;</button>';
  list.appendChild(row);
  renumberMembers();
  updateMemberCount();
}

function removeMember(btn) {
  const list = document.getElementById('grpList');
  if (list.querySelectorAll('.gmrow').length <= 2) {
    alert('Minimum 3 people required for group registration.');
    return;
  }
  btn.closest('.gmrow').remove();
  renumberMembers();
  updateMemberCount();
}

function renumberMembers() {
  const rows = document.getElementById('grpList').querySelectorAll('.gmrow');
  rows.forEach((row, i) => {
    const num = row.querySelector('.gnum');
    if (num) num.textContent = (i + 2) + '.';
    const nameInp = row.querySelector('.mname');
    if (nameInp && !nameInp.value) nameInp.placeholder = 'Member ' + (i + 2) + ' name *';
  });
}

function updateMemberCount() {
  state.members = document.getElementById('grpList').querySelectorAll('.gmrow').length + 1;
}

// ── COUPON ────────────────────────────────────────────────────────────
function applyCoupon() {
  if (state.type === 'group') {
    showCouponMsg('Group discount (50%) already applied — coupon cannot be combined.', 'err');
    return;
  }
  const code = document.getElementById('coupon').value.trim().toUpperCase();
  if (!code) { showCouponMsg('Please enter a coupon code.', 'err'); return; }

  const pct = COUPONS[code];
  if (pct !== undefined) {
    state.couponApplied = true;
    state.couponCode    = code;
    state.discountPct   = pct;
    const msg = pct === 100
      ? "🎉 100% off — it's on us! Free registration!"
      : `✅ Coupon applied! ${pct}% discount unlocked.`;
    showCouponMsg(msg, 'ok');
    document.getElementById('referredFg').style.display = 'block';
  } else {
    state.couponApplied = false;
    state.discountPct   = 0;
    showCouponMsg('Invalid coupon code. Please try again.', 'err');
    document.getElementById('referredFg').style.display = 'none';
  }
  updatePriceSummary();
}

function showCouponMsg(text, type) {
  const el = document.getElementById('couponMsg');
  el.textContent = text;
  el.className = 'cmsg ' + type;
}

function clearCouponMsg() {
  const el = document.getElementById('couponMsg');
  el.textContent = '';
  el.className = 'cmsg';
}

// ── PRICE CALCULATION ─────────────────────────────────────────────────
function finalTotal() {
  const base = BASE_PRICE * state.members;
  const discount = Math.round(base * state.discountPct / 100);
  return base - discount;
}

function formatRs(n) {
  return 'Rs. ' + n.toLocaleString('en-PK');
}

function updatePriceSummary() {
  const base = BASE_PRICE * state.members;
  const discount = Math.round(base * state.discountPct / 100);
  const total = base - discount;

  document.getElementById('baseP').textContent =
    formatRs(BASE_PRICE) + (state.members > 1 ? ' x ' + state.members + ' = ' + formatRs(base) : '');
  document.getElementById('totalP').textContent = total === 0 ? '🎉 FREE' : formatRs(total);

  const discRow = document.getElementById('discRow');
  if (state.discountPct > 0) {
    discRow.style.display = 'flex';
    document.getElementById('discLabel').textContent =
      state.type === 'group'
        ? 'Group discount (50%)'
        : `Coupon discount (${state.discountPct}%)`;
    document.getElementById('discAmt').textContent = '- ' + formatRs(discount);
  } else {
    discRow.style.display = 'none';
  }

  // Show/hide group notice
  document.getElementById('grpNotice').style.display =
    state.type === 'group' ? 'flex' : 'none';
}

// ── PAYMENT METHOD ────────────────────────────────────────────────────
function selectPM(method) {
  state.paymentMethod = method;
  document.getElementById('payInstr').style.display = 'block';
  document.getElementById('txnFg').style.display = 'block';
  document.getElementById('uploadFg').style.display = 'block';
  document.getElementById('pmTitle').textContent = 'Send via EasyPaisa to:';
  document.getElementById('accNum').textContent = '03369146789';
  document.getElementById('pmName').textContent = 'EasyPaisa';
}

// ── FILE UPLOAD ───────────────────────────────────────────────────────
function handleUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { alert('File too large. Max 5MB.'); return; }
  state.fileUploaded = true;
  const preview = document.getElementById('uploadPreview');
  if (file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = e => {
      preview.innerHTML = '<img src="' + e.target.result + '" alt="Payment proof">';
    };
    reader.readAsDataURL(file);
  } else {
    preview.innerHTML = '<p style="margin-top:10px;color:var(--rose);font-weight:700;">' + file.name + ' uploaded.</p>';
  }
}

// Drag & drop
const uploadArea = document.getElementById('uploadArea');
if (uploadArea) {
  uploadArea.addEventListener('dragover', e => { e.preventDefault(); uploadArea.style.background = 'var(--blush)'; });
  uploadArea.addEventListener('dragleave', () => { uploadArea.style.background = ''; });
  uploadArea.addEventListener('drop', e => {
    e.preventDefault();
    uploadArea.style.background = '';
    const dt = new DataTransfer();
    dt.items.add(e.dataTransfer.files[0]);
    document.getElementById('proofFile').files = dt.files;
    handleUpload({ target: { files: e.dataTransfer.files } });
  });
}

// ── SUBMIT ────────────────────────────────────────────────────────────
// ── GOOGLE SHEETS ENDPOINT ───────────────────────────────────────────
// Paste your Google Apps Script Web App URL here after deploying
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbyipzbwnwkGgpp7xoyFkGuaX0l23BkZ8JpfmsJn7pNOFSb8qxdVF8v96uc50mjgif07/exec';

// ── SUBMIT ────────────────────────────────────────────────────────────
function submitReg() {
  if (finalTotal() === 0) {
    saveAndConfirm();
    return;
  }
  if (!validateStep(3)) return;
  saveAndConfirm();
}

function saveAndConfirm() {
  const name    = document.getElementById('fullName').value.trim();
  const phone   = document.getElementById('phone').value.trim();
  const email   = document.getElementById('email').value.trim();
  const coupon  = state.couponApplied ? state.couponCode : '';
  const referredBy = (document.getElementById('referredBy').value || '').trim();
  const regType = state.type === 'group' ? 'Group' : 'Individual';
  const members = state.members;
  const total   = finalTotal();
  const method  = state.paymentMethod || 'N/A (Free)';
  const txn     = (document.getElementById('txnId').value || '').trim() || 'N/A';
  const date    = new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' });

  // Group member names + phones
  const memberRows   = document.querySelectorAll('#grpList .gmrow');
  const memberNames  = Array.from(memberRows).map(row => {
    const n = row.querySelector('.mname');
    return n ? n.value.trim() : '';
  }).filter(Boolean);
  const memberPhones = Array.from(memberRows).map(row => {
    const p = row.querySelector('.mphone');
    return p ? p.value.trim() : '';
  }).filter(Boolean);

  const row = {
    Date: date,
    Name: name,
    Email: email,
    Phone: phone,
    Type: regType,
    Members: members,
    GroupMemberNames:  memberNames.join(' | ')  || '-',
    GroupMemNumB:      memberPhones.join(' | ') || '-',
    CouponUsed: coupon || '-',
    Discount: state.discountPct + '%',
    ReferredBy: referredBy || '-',
    TotalPaid: total === 0 ? 'FREE' : 'Rs. ' + total,
    PaymentMethod: method,
    TransactionID: txn,
  };

  // ── Save to Google Sheet + send Telegram + upload screenshot ────
  if (SHEET_URL && !SHEET_URL.includes('YOUR_GOOGLE_APPS_SCRIPT_URL_HERE')) {

    // Generate invoice ID first so we can include it in the sheet row
    const firstInvoiceId = generateInvoiceId();
    row.InvoiceID = firstInvoiceId;

    // Send registration data to sheet via iframe (GET)
    const params = new URLSearchParams({ data: JSON.stringify(row) });
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = SHEET_URL + '?' + params.toString();
    document.body.appendChild(iframe);
    setTimeout(() => { try { document.body.removeChild(iframe); } catch(e){} }, 5000);

    // Send payment screenshot via POST → Apps Script → Telegram + Drive
    const proofFile = document.getElementById('proofFile').files[0];
    if (proofFile) {
      const fileReader = new FileReader();
      fileReader.onload = function(ev) {
        const base64 = ev.target.result.split(',')[1];
        const fd = new FormData();
        fd.append('action',     'uploadScreenshot');
        fd.append('base64Data', base64);
        fd.append('mimeType',   proofFile.type);
        fd.append('name',       name);
        fd.append('phone',      phone);
        fd.append('txn',        txn);
        fd.append('amount',     total === 0 ? 'FREE' : 'Rs. ' + total);
        fd.append('invoiceId',  firstInvoiceId);
        fetch(SHEET_URL, { method: 'POST', mode: 'no-cors', body: fd })
          .then(() => console.log('✅ Screenshot sent to Telegram + Drive'))
          .catch(err => console.error('❌ Screenshot error:', err));
      };
      fileReader.readAsDataURL(proofFile);
    }

    // Render invoices with the pre-generated first invoice ID
    const invoiceData = {
      name, phone, email, coupon, regType, members, total,
      method, txn, date, memberNames, memberPhones,
      discountPct: state.discountPct,
      firstInvoiceId,
    };
    renderInvoices(invoiceData);
  } else {
    // No sheet URL — just render invoices normally
    const invoiceData = {
      name, phone, email, coupon, regType, members, total,
      method, txn, date, memberNames, memberPhones,
      discountPct: state.discountPct,
    };
    renderInvoices(invoiceData);
  }

  // ── Show confirmation ─────────────────────────────────────────────
  document.getElementById('confName').textContent = name;
  document.querySelectorAll('.fstep').forEach(s => s.classList.remove('active'));
  document.getElementById('step4').classList.add('active');
  for (let i = 1; i <= 4; i++) {
    const el = document.getElementById('sd' + i);
    el.classList.remove('active','done');
    if (i === 4) el.classList.add('active');
    else el.classList.add('done');
  }
  state.currentStep = 4;
  document.getElementById('formCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── INVOICE GENERATION ────────────────────────────────────────────────
function generateInvoiceId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = 'RD-';
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

function renderInvoices(data) {
  const wrap = document.getElementById('invoicesWrap');
  wrap.innerHTML = '';

  // Build attendee list
  const attendees = [];
  attendees.push({ name: data.name, phone: data.phone, isPrimary: true });
  if (data.regType === 'Group') {
    data.memberNames.forEach((n, i) => {
      attendees.push({ name: n, phone: data.memberPhones[i] || '-', isPrimary: false });
    });
  }

  const heading = document.createElement('div');
  heading.className = 'invoices-heading';
  heading.textContent = attendees.length > 1
    ? '\uD83C\uDFAB ' + attendees.length + ' Entry Passes \u2014 one per person'
    : '\uD83C\uDFAB Your Entry Pass';
  wrap.appendChild(heading);

  attendees.forEach(function(attendee, idx) {
    const invId = idx === 0 && data.firstInvoiceId ? data.firstInvoiceId : generateInvoiceId();
    const perPersonAmt = data.regType === 'Group'
      ? formatRs(Math.round(BASE_PRICE * (1 - data.discountPct / 100)))
      : (data.total === 0 ? '\uD83C\uDF89 FREE' : formatRs(data.total));

    const card = document.createElement('div');
    card.className = 'invoice-card';
    card.id = 'invoice-' + idx;

    const initial = attendee.name.trim().charAt(0).toUpperCase() || '?';
    const safeAttendeeName = attendee.name.replace(/\\/g,'\\\\').replace(/'/g,"\\'");

    card.innerHTML =
      '<div class="inv-header">'
      + '<div class="inv-brand">RangDe <small>Art Studio &middot; Peshawar</small></div>'
      + '<div class="inv-meta">'
      + '<div><strong>' + invId + '</strong></div>'
      + '<div>Issued: ' + new Date().toLocaleDateString('en-PK',{day:'2-digit',month:'short',year:'numeric'}) + '</div>'
      + (data.regType === 'Group' ? '<div style="color:var(--red);font-weight:700;">Group Pass ' + (idx+1) + '/' + attendees.length + '</div>' : '')
      + '</div>'
      + '</div>'
      + '<hr class="inv-divider">'
      + '<div class="inv-name-row">'
      + '<div class="inv-avatar">' + initial + '</div>'
      + '<div>'
      + '<div class="inv-attendee-name">' + attendee.name + '</div>'
      + '<div class="inv-attendee-sub">' + attendee.phone + (data.email && attendee.isPrimary ? ' &middot; ' + data.email : '') + '</div>'
      + '</div>'
      + '</div>'
      + '<div class="inv-rows">'
      + '<div class="inv-row"><div class="ilabel">Workshop</div><div class="ival">Canvas + Trinket Tray</div></div>'
      + '<div class="inv-row"><div class="ilabel">Date</div><div class="ival">Mon, 20 July 2025</div></div>'
      + '<div class="inv-row"><div class="ilabel">Time</div><div class="ival">2:00 PM &ndash; 5:00 PM</div></div>'
      + '<div class="inv-row"><div class="ilabel">Venue</div><div class="ival">Mr. COD, University Town</div></div>'
      + (data.coupon ? '<div class="inv-row"><div class="ilabel">Coupon</div><div class="ival" style="color:var(--red)">' + data.coupon + ' (' + data.discountPct + '% off)</div></div>' : '')
      + (data.txn !== 'N/A' ? '<div class="inv-row"><div class="ilabel">Txn ID</div><div class="ival">' + data.txn + '</div></div>' : '')
      + '</div>'
      + '<div class="inv-total-row"><span class="itl">Amount Paid</span><span class="itv">' + perPersonAmt + '</span></div>'
      + '<div class="inv-entry-badge">'
      + '<span class="badge-icon">\uD83C\uDFA8</span>'
      + '<p><strong>Show this pass at the door on event day.</strong><br>Save it to your gallery or screenshot it.</p>'
      + '</div>'
      + '<button class="inv-save-btn" onclick="saveInvoiceAsImage(' + idx + ', \'' + safeAttendeeName + '\')">'
      + '\uD83D\uDCF8 Save to Gallery'
      + '</button>'
      + '<div class="inv-save-hint">Tap to download as image &mdash; show at entry</div>';

    wrap.appendChild(card);
  });
}

// ── SAVE INVOICE AS IMAGE ─────────────────────────────────────────────
function saveInvoiceAsImage(idx, attendeeName) {
  const card = document.getElementById('invoice-' + idx);
  const btn  = card.querySelector('.inv-save-btn');
  const hint = card.querySelector('.inv-save-hint');

  if (typeof html2canvas === 'undefined') {
    alert('Tip: Take a screenshot of your pass and save it to your gallery.\n\nOn mobile: press Home + Power button together.');
    return;
  }

  btn.disabled = true;
  btn.textContent = '\u23F3 Saving...';
  btn.style.display = 'none';
  if (hint) hint.style.display = 'none';

  html2canvas(card, { backgroundColor: '#ffffff', scale: 2, useCORS: true })
    .then(function(canvas) {
      btn.style.display = '';
      if (hint) hint.style.display = '';
      btn.disabled = false;
      btn.innerHTML = '\uD83D\uDCF8 Save to Gallery';

      const link = document.createElement('a');
      link.download = 'RangDe_Pass_' + attendeeName.replace(/\s+/g,'_') + '.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    })
    .catch(function() {
      btn.style.display = '';
      if (hint) hint.style.display = '';
      btn.disabled = false;
      btn.innerHTML = '\uD83D\uDCF8 Save to Gallery';
      alert('Could not auto-save. Please screenshot the pass manually.');
    });
}

// ── LOCAL CSV DOWNLOAD ────────────────────────────────────────────────
const CSV_KEY = 'rangde_registrations';

function saveToLocalCSV(row) {
  // Load existing records from localStorage
  let records = [];
  try { records = JSON.parse(localStorage.getItem(CSV_KEY) || '[]'); } catch(e) {}
  records.push(row);
  localStorage.setItem(CSV_KEY, JSON.stringify(records));
}

function downloadCSV() {
  let records = [];
  try { records = JSON.parse(localStorage.getItem(CSV_KEY) || '[]'); } catch(e) {}

  if (!records.length) {
    alert('No registrations yet!');
    return;
  }

  const headers = Object.keys(records[0]);
  const csv = [
    headers.join(','),
    ...records.map(r =>
      headers.map(h => '"' + String(r[h] || '').replace(/"/g, '""') + '"').join(',')
    )
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'RangDe_Registrations_' + new Date().toISOString().slice(0,10) + '.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// ── SCROLL REVEAL ────────────────────────────────────────────────────
(function initReveal() {
  const els = document.querySelectorAll(
    '.event-card, .gallery, .soon-card, .rev-card, .form-card, .sec-title, .sec-label, .washi'
  );
  els.forEach(el => el.classList.add('reveal'));

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();

// ── SMOOTH ACTIVE NAV LINK ───────────────────────────────────────────
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav-links a');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 100) current = s.id;
    });
    links.forEach(a => {
      a.style.color = a.getAttribute('href') === '#' + current ? 'var(--rose)' : '';
    });
  }, { passive: true });
})();
