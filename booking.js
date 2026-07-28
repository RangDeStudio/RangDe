// ── RANG DE BOOKING FORM ─────────────────────────────────────────────
const RD_PRICES = { tote: 2000, ceramic: 1400, addon: 300 };
const RD_COUPONS = {
  'FRIENDS10':10,'BLOGGERS25':25,'BLOGGER50':50,'BUSH25':25,'FRIEND50':50,
  'RANGDE75':75,'ROYAAM25':25,'SABAOON25':25,'NADIA25':25,'FATIMA25':25,
  'SAIMA20':20,'SAIMA30':30,'RABIART20':20
};

let rdState = {
  step: 1,
  count: 1,
  participants: [],   // [{name, age, activity, addon}]
  coupon: '',
  discountPct: 0,
  referredBy: '',
  fileUploaded: false,
};

// ── STEP NAVIGATION ────────────────────────────────────────────────────
function rdGoStep(n) {
  if (n > rdState.step && !rdValidate(rdState.step)) return;
  rdState.step = n;

  // Update panes
  document.querySelectorAll('.rd-pane').forEach(p => p.classList.remove('active'));
  const pane = document.getElementById('rdStep' + n);
  if (pane) pane.classList.add('active');

  // Update progress
  for (let i = 1; i <= 4; i++) {
    const ps = document.getElementById('ps' + i);
    if (!ps) continue;
    ps.classList.remove('active','done');
    if (i === n) ps.classList.add('active');
    else if (i < n) ps.classList.add('done');
  }
  // Update lines
  document.querySelectorAll('.rd-line').forEach((l, i) => {
    l.classList.toggle('done', i < n - 1);
  });

  // Build dynamic content
  if (n === 1) rdBuildParticipants();
  if (n === 2) rdBuildActivityCards();
  if (n === 3) rdBuildSummary();
  if (n === 4) rdSetPaymentAmount();

  document.getElementById('rdCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── VALIDATION ─────────────────────────────────────────────────────────
function rdValidate(step) {
  if (step === 1) {
    const email = document.getElementById('rdEmail').value.trim();
    if (!email || !email.includes('@')) { alert('Please enter a valid email.'); return false; }
    if (rdState.coupon && rdState.discountPct > 0) {
      const ref = document.getElementById('rdReferredBy').value.trim();
      if (!ref) { alert('Please enter who referred this coupon to you.'); return false; }
      rdState.referredBy = ref;
    }
    rdSaveParticipants();
    for (let i = 0; i < rdState.participants.length; i++) {
      const p = rdState.participants[i];
      if (!p.name) { alert('Please enter name for participant ' + (i+1) + '.'); return false; }
      const ph = (p.phone || '').replace(/\D/g,'');
      if (ph.length !== 11) { alert('Please enter an 11-digit phone number for participant ' + (i+1) + '.'); return false; }
    }
  }
  if (step === 2) {
    for (let i = 0; i < rdState.participants.length; i++) {
      if (!rdState.participants[i].activity) {
        alert('Please choose an activity for ' + (rdState.participants[i].name || 'participant ' + (i+1)) + '.');
        return false;
      }
      if (!rdState.participants[i].food) {
        alert('Please choose a food/drink option for ' + (rdState.participants[i].name || 'participant ' + (i+1)) + '.');
        return false;
      }
      if (rdState.participants[i].food === 'deal' && !rdState.participants[i].drink) {
        alert('Please choose a drink for ' + (rdState.participants[i].name || 'participant ' + (i+1)) + '\'s deal.');
        return false;
      }
    }
  }
  if (step === 4) {
    const txn = document.getElementById('rdTxnId').value.trim();
    if (rdTotal() > 0 && !txn) { alert('Please enter your Transaction ID.'); return false; }
    if (rdTotal() > 0 && !rdState.fileUploaded) { alert('Please upload your payment screenshot.'); return false; }
  }
  return true;
}

// ── PARTICIPANT COUNT ──────────────────────────────────────────────────
function rdSetCount(n) {
  rdState.count = n;
  document.querySelectorAll('.rd-count-btn').forEach((b, i) => {
    b.classList.toggle('active', i + 1 === n);
  });
  // Adjust participants array
  while (rdState.participants.length < n) rdState.participants.push({ name:'', phone:'', age:'adult', activity:'', addon:false, food:'' });
  rdState.participants = rdState.participants.slice(0, n);
  // Auto discount — only if no coupon applied
  if (!rdState.coupon) {
    if (n === 2) rdState.discountPct = 15;
    else if (n >= 3) rdState.discountPct = 30;
    else rdState.discountPct = 0;
  }
  rdBuildParticipants();
  rdUpdateDiscountNotice();
}

function rdBuildParticipants() {
  const list = document.getElementById('rdParticipantList');
  list.innerHTML = '';
  for (let i = 0; i < rdState.count; i++) {
    const p = rdState.participants[i] || { name:'', phone:'', age:'adult' };
    const div = document.createElement('div');
    div.className = 'rd-participant';
    div.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;width:100%;flex-wrap:wrap;">
        <div class="rd-p-num">${i+1}</div>
        <div class="rd-p-name" style="flex:1;min-width:140px;">
          <input type="text" placeholder="${i===0?'Your name':'Participant '+(i+1)+' name'} *" value="${p.name}" oninput="rdState.participants[${i}].name=this.value">
        </div>
        <div class="rd-p-name" style="flex:1;min-width:140px;">
          <input type="tel" placeholder="Phone (11 digits) *" maxlength="11" value="${p.phone||''}" oninput="rdState.participants[${i}].phone=this.value">
        </div>
        <div class="rd-age-btns">
          <button type="button" class="rd-age-btn ${p.age==='adult'?'active':''}" onclick="rdSetAge(${i},'adult')">&#128100; Adult</button>
          <button type="button" class="rd-age-btn ${p.age==='kid'?'active':''}" onclick="rdSetAge(${i},'kid')">&#128102; Kid</button>
        </div>
        ${i > 0 ? '<button type="button" onclick="rdRemoveParticipant('+i+')" style="background:none;border:1.5px solid rgba(192,57,43,.25);color:#C0392B;width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:.8rem;flex-shrink:0;display:flex;align-items:center;justify-content:center;" title="Remove">&#10005;</button>' : ''}
      </div>
    `;
    list.appendChild(div);
  }
  // Add participant button
  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'rd-add-participant-btn';
  addBtn.innerHTML = '+ Add Participant';
  addBtn.onclick = rdAddParticipant;
  list.appendChild(addBtn);

  rdUpdateDiscountNotice();
}

function rdSetAge(idx, age) {
  rdState.participants[idx].age = age;
  rdBuildParticipants();
}

function rdAddParticipant() {
  rdState.participants.push({ name:'', phone:'', age:'adult', activity:'', addon:false, food:'' });
  rdState.count = rdState.participants.length;
  if (!rdState.coupon) {
    if (rdState.count === 2) rdState.discountPct = 15;
    else if (rdState.count >= 3) rdState.discountPct = 30;
  }
  rdBuildParticipants();
  // Sync count buttons
  document.querySelectorAll('.rd-count-btn').forEach((b, i) => {
    b.classList.toggle('active', i + 1 === rdState.count);
  });
}

function rdRemoveParticipant(idx) {
  if (rdState.count <= 1) return;
  rdState.participants.splice(idx, 1);
  rdState.count = rdState.participants.length;
  if (!rdState.coupon) {
    if (rdState.count === 1) rdState.discountPct = 0;
    else if (rdState.count === 2) rdState.discountPct = 15;
    else rdState.discountPct = 30;
  }
  rdBuildParticipants();
  document.querySelectorAll('.rd-count-btn').forEach((b, i) => {
    b.classList.toggle('active', i + 1 === rdState.count);
  });
}

function rdSaveParticipants() {
  document.querySelectorAll('.rd-participant').forEach((row, i) => {
    const inputs = row.querySelectorAll('input');
    if (rdState.participants[i]) {
      if (inputs[0]) rdState.participants[i].name  = inputs[0].value.trim();
      if (inputs[1]) rdState.participants[i].phone = inputs[1].value.trim();
    }
  });
}

function rdUpdateDiscountNotice() {
  const notice = document.getElementById('rdDiscountNotice');
  let msg = '';
  if (!rdState.coupon) {
    if (rdState.count === 2) msg = '&#128145; Duo discount: <strong>15% off</strong> applied automatically!';
    else if (rdState.count >= 3) msg = '&#128111; Group discount: <strong>30% off</strong> applied automatically!';
  } else {
    msg = '&#10003; Coupon <strong>' + rdState.coupon + '</strong> (' + rdState.discountPct + '% off) applied!';
  }
  if (msg) { notice.innerHTML = msg; notice.style.display = 'block'; }
  else notice.style.display = 'none';
}

// ── ACTIVITY CARDS ─────────────────────────────────────────────────────
function rdBuildActivityCards() {
  const wrap = document.getElementById('rdActivityCards');
  wrap.innerHTML = '';
  rdState.participants.forEach((p, i) => {
    const div = document.createElement('div');
    div.className = 'rd-act-participant';
    div.innerHTML = `
      <div class="rd-act-p-label">Participant ${i+1}</div>
      <div class="rd-act-name">${p.name || 'Participant '+(i+1)}</div>
      <div class="rd-act-cards">
        <div class="rd-act-card ${p.activity==='tote'?'selected':''}" onclick="rdSetActivity(${i},'tote',this.closest('.rd-act-cards'))">
          <div class="rd-act-emoji">&#127912;</div>
          <div class="rd-act-title">Tote Bag Painting</div>
          <div class="rd-act-price">PKR 2,000</div>
          <div class="rd-act-desc">Paint &amp; take home</div>
        </div>
        <div class="rd-act-card ${p.activity==='ceramic'?'selected':''}" onclick="rdSetActivity(${i},'ceramic',this.closest('.rd-act-cards'))">
          <div class="rd-act-emoji">&#129522;</div>
          <div class="rd-act-title">3 Ceramic Toy Magnets + Mini Canvas</div>
          <div class="rd-act-price">PKR 1,400</div>
          <div class="rd-act-desc">Decorate &amp; take home</div>
        </div>
      </div>
      <div class="rd-addon-card ${p.addon?'selected':''}" onclick="rdToggleAddon(${i},this)">
        <div class="rd-addon-check">${p.addon?'&#10003;':''}</div>
        <div class="rd-addon-text">
          <div class="rd-addon-title">&#43; Extra Ceramic Toy Magnet</div>
          <div class="rd-addon-price">+PKR 300</div>
        </div>
      </div>
      <div class="rd-food-section">
        <div class="rd-food-label">&#127828; Refreshment Choice <span class="rd-food-required">*</span></div>
        <div class="rd-food-cards">
          <div class="rd-food-card ${p.food==='deal'?'selected':''}" onclick="rdSetFood(${i},'deal')">
            <div class="rd-food-emoji">&#127828;</div>
            <div class="rd-food-title">Deal</div>
            <div class="rd-food-desc">Burger + Fries + Drink</div>
          </div>
          <div class="rd-food-card ${p.food==='menu'?'selected':''}" onclick="rdSetFood(${i},'menu')">
            <div class="rd-food-emoji">&#127974;</div>
            <div class="rd-food-title">15% Off Menu</div>
            <div class="rd-food-desc">Order anything you like</div>
          </div>
        </div>
        ${p.food==='deal' ? `
        <div class="rd-drink-wrap">
          <div class="rd-drink-label">Choose your drink</div>
          <div class="rd-drink-pills">
            <button type="button" class="rd-drink-pill ${p.drink==='freshlime'?'active':''}" onclick="rdSetDrink(${i},'freshlime')">&#127819; Fresh Lime</button>
            <button type="button" class="rd-drink-pill ${p.drink==='soda'?'active':''}" onclick="rdSetDrink(${i},'soda')">&#129482; Soda (Pepsi/Sprite)</button>
            <button type="button" class="rd-drink-pill ${p.drink==='margarita'?'active':''}" onclick="rdSetDrink(${i},'margarita')">&#127381; Margarita</button>
          </div>
        </div>` : ''}
      </div>
    `;
    wrap.appendChild(div);
  });
}

function rdSetActivity(idx, act, cardsEl) {
  rdState.participants[idx].activity = act;
  cardsEl.querySelectorAll('.rd-act-card').forEach((c, i) => {
    c.classList.toggle('selected', (i === 0 && act === 'tote') || (i === 1 && act === 'ceramic'));
  });
}

function rdToggleAddon(idx, el) {
  rdState.participants[idx].addon = !rdState.participants[idx].addon;
  el.classList.toggle('selected', rdState.participants[idx].addon);
  el.querySelector('.rd-addon-check').innerHTML = rdState.participants[idx].addon ? '&#10003;' : '';
}

function rdSetFood(idx, food) {
  rdState.participants[idx].food = food;
  if (food !== 'deal') rdState.participants[idx].drink = '';
  rdBuildActivityCards();
}

function rdSetDrink(idx, drink) {
  rdState.participants[idx].drink = drink;
  rdBuildActivityCards();
}

// ── SUMMARY ────────────────────────────────────────────────────────────
function rdTotal() {
  let sub = 0;
  rdState.participants.forEach(p => {
    const base = p.activity === 'tote' ? RD_PRICES.tote : RD_PRICES.ceramic;
    sub += base + (p.addon ? RD_PRICES.addon : 0);
  });
  const discount = Math.round(sub * rdState.discountPct / 100);
  return sub - discount;
}

function rdSubtotal() {
  let sub = 0;
  rdState.participants.forEach(p => {
    const base = p.activity === 'tote' ? RD_PRICES.tote : RD_PRICES.ceramic;
    sub += base + (p.addon ? RD_PRICES.addon : 0);
  });
  return sub;
}

function rdBuildSummary() {
  const wrap = document.getElementById('rdSummaryContent');
  wrap.innerHTML = '';

  // Participant rows
  const card = document.createElement('div');
  card.className = 'rd-summary-card';
  rdState.participants.forEach((p, i) => {
    const base = p.activity === 'tote' ? RD_PRICES.tote : RD_PRICES.ceramic;
    const total = base + (p.addon ? RD_PRICES.addon : 0);
    const actName = p.activity === 'tote' ? '&#127912; Tote Bag Painting' : '&#129522; Ceramic Toy + Mini Canvas';
    const foodLabel = { burger:'&#127828; Burger', freshlime:'&#127819; Fresh Lime', margarita:'&#127381; Margarita', soda:'&#127863; Soda' };
    const foodStr = p.food ? ' + ' + (foodLabel[p.food] || p.food) : '';
    const row = document.createElement('div');
    row.className = 'rd-summary-row';
    row.innerHTML = `
      <div class="rd-sum-num">${i+1}</div>
      <div class="rd-sum-info">
        <div class="rd-sum-name">${p.name || 'Participant '+(i+1)} <span style="font-size:.75rem;opacity:.6;">(${p.age})</span></div>
        <div class="rd-sum-details">${actName}${p.addon?' + Extra Mini Canvas':''}</div>
      </div>
      <div class="rd-sum-price">PKR ${total.toLocaleString()}</div>
    `;
    card.appendChild(row);
  });
  wrap.appendChild(card);

  // Discount line
  if (rdState.discountPct > 0) {
    const sub = rdSubtotal();
    const disc = Math.round(sub * rdState.discountPct / 100);
    const dl = document.createElement('div');
    dl.className = 'rd-discount-line';
    let label = rdState.coupon ? `Coupon ${rdState.coupon}` : rdState.count === 2 ? 'Duo Discount' : 'Group Discount';
    dl.innerHTML = `<span>${label} (${rdState.discountPct}% off)</span><span>-PKR ${disc.toLocaleString()}</span>`;
    wrap.appendChild(dl);
  }

  // Total
  const tc = document.createElement('div');
  tc.className = 'rd-total-card';
  tc.innerHTML = `<div><div class="rd-total-label">Total Amount</div><div style="font-size:.78rem;opacity:.7;">${rdState.participants.length} participant${rdState.participants.length>1?'s':''}</div></div><div class="rd-total-amount">PKR ${rdTotal().toLocaleString()}</div>`;
  wrap.appendChild(tc);
}

// ── PAYMENT ────────────────────────────────────────────────────────────
function rdSetPaymentAmount() {
  const t = rdTotal();
  document.getElementById('rdPayAmt').textContent = 'PKR ' + t.toLocaleString();
  document.getElementById('rdSendAmt').textContent = 'PKR ' + t.toLocaleString();
}

function rdHandleUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 5*1024*1024) { alert('File too large. Max 5MB.'); return; }
  rdState.fileUploaded = true;
  const preview = document.getElementById('rdUploadPreview');
  if (file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = e => { preview.innerHTML = '<img src="' + e.target.result + '" alt="Payment proof">'; };
    reader.readAsDataURL(file);
  } else {
    preview.innerHTML = '<p style="margin-top:8px;font-weight:700;color:#C0392B;">' + file.name + ' uploaded.</p>';
  }
}

// Drag & drop
(function() {
  const area = document.getElementById('rdUploadArea');
  if (!area) return;
  area.addEventListener('dragover', e => { e.preventDefault(); area.style.background='#f0f4e8'; });
  area.addEventListener('dragleave', () => { area.style.background=''; });
  area.addEventListener('drop', e => {
    e.preventDefault(); area.style.background='';
    const dt = new DataTransfer(); dt.items.add(e.dataTransfer.files[0]);
    document.getElementById('rdProofFile').files = dt.files;
    rdHandleUpload({ target: { files: e.dataTransfer.files } });
  });
})();

// ── COUPON ─────────────────────────────────────────────────────────────
function rdApplyCoupon() {
  const code = document.getElementById('rdCoupon').value.trim().toUpperCase();
  const msg  = document.getElementById('rdCouponMsg');
  if (!code) { msg.textContent = 'Please enter a coupon code.'; msg.className = 'rd-coupon-msg err'; return; }
  const pct = RD_COUPONS[code];
  if (pct !== undefined) {
    rdState.coupon = code;
    rdState.discountPct = pct;
    msg.innerHTML = pct === 100 ? '&#127881; 100% off — Free!' : '&#10003; Coupon applied! ' + pct + '% off.';
    msg.className = 'rd-coupon-msg ok';
    document.getElementById('rdReferredFg').style.display = 'block';
  } else {
    rdState.coupon = '';
    rdState.discountPct = (rdState.count === 2 ? 15 : rdState.count >= 3 ? 30 : 0);
    msg.textContent = 'Invalid coupon. Please try again.';
    msg.className = 'rd-coupon-msg err';
    document.getElementById('rdReferredFg').style.display = 'none';
  }
}

// ── SUBMIT ─────────────────────────────────────────────────────────────
function rdSubmit() {
  if (!rdValidate(4)) return;

  const name  = rdState.participants[0] ? rdState.participants[0].name : '';
  const phone = rdState.participants[0] ? rdState.participants[0].phone : '';
  const email = document.getElementById('rdEmail').value.trim();
  const txn   = document.getElementById('rdTxnId').value.trim() || 'N/A';
  const date  = new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' });
  const total = rdTotal();

  const memberNames  = rdState.participants.map(p => p.name).join(' | ') || '-';
  const memberPhones = rdState.participants.map(p => p.phone || '-').join(' | ') || '-';
  const memberActivities = rdState.participants.map(p => (p.activity==='tote'?'Tote Bag Painting':'Ceramic Toy + Mini Canvas') + (p.addon?' + Extra Canvas':'')).join(' | ');

  const invId = rdGenerateInvId();

  const row = {
    Date: date, Name: name, Email: email, Phone: phone,
    Type: rdState.count > 1 ? 'Group' : 'Individual',
    Members: rdState.count,
    GroupMemberNames: memberNames,
    GroupMemNumB: memberPhones,
    CouponUsed: rdState.coupon || '-',
    Discount: rdState.discountPct + '%',
    ReferredBy: rdState.referredBy || '-',
    TotalPaid: total === 0 ? 'FREE' : 'Rs. ' + total,
    Activity: rdState.participants[0] ? (rdState.participants[0].activity==='tote'?'Tote Bag Painting':'Ceramic Toy + Mini Canvas') : '-',
    MemberActivities: memberActivities,
    PaymentMethod: total === 0 ? 'N/A (Free)' : 'easypaisa',
    TransactionID: txn,
    InvoiceID: invId,
  };

  // Send to sheet
  if (typeof SHEET_URL !== 'undefined' && SHEET_URL && !SHEET_URL.includes('YOUR_GOOGLE')) {
    row.InvoiceID = invId;
    const params = new URLSearchParams({ data: JSON.stringify(row) });
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = SHEET_URL + '?' + params.toString();
    document.body.appendChild(iframe);
    setTimeout(() => { try { document.body.removeChild(iframe); } catch(e){} }, 5000);

    // Screenshot
    const proofFile = document.getElementById('rdProofFile').files[0];
    if (proofFile) {
      const fr = new FileReader();
      fr.onload = function(ev) {
        const base64 = ev.target.result.split(',')[1];
        const fd = new FormData();
        fd.append('action','uploadScreenshot');
        fd.append('base64Data', base64);
        fd.append('mimeType', proofFile.type);
        fd.append('name', name);
        fd.append('phone', phone);
        fd.append('txn', txn);
        fd.append('amount', total === 0 ? 'FREE' : 'Rs. ' + total);
        fd.append('invoiceId', invId);
        fetch(SHEET_URL, { method:'POST', mode:'no-cors', body: fd }).catch(()=>{});
      };
      fr.readAsDataURL(proofFile);
    }
  }

  // Show confirmation
  document.getElementById('rdConfName').textContent = name + ' (+' + (rdState.count-1) + (rdState.count>1?' more)':'0)');
  if (rdState.count === 1) document.getElementById('rdConfName').textContent = name;

  // Generate invoices
  rdBuildInvoices(name, phone, email, txn, total, invId);

  rdGoStep(5);
}

function rdGenerateInvId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = 'RD-';
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

function rdBuildInvoices(name, phone, email, txn, total, invId) {
  const wrap = document.getElementById('rdInvoicesWrap');
  if (!wrap) return;
  wrap.innerHTML = '';

  const heading = document.createElement('div');
  heading.className = 'invoices-heading';
  heading.textContent = rdState.participants.length > 1
    ? '🎫 ' + rdState.participants.length + ' Entry Passes'
    : '🎫 Your Entry Pass';
  wrap.appendChild(heading);

  rdState.participants.forEach((p, idx) => {
    const thisInvId = idx === 0 ? invId : rdGenerateInvId();
    const perAmt = idx === 0 ? (total > 0 ? 'PKR ' + total.toLocaleString() : '🎉 FREE') : 'Included';
    const actName = p.activity === 'tote' ? '🎨 Tote Bag Painting' : '🧸 Ceramic Toy + Mini Canvas';
    const card = document.createElement('div');
    card.className = 'invoice-card';
    card.id = 'rdinv-' + idx;
    const initial = (p.name || 'P').charAt(0).toUpperCase();
    card.innerHTML = `
      <div class="inv-header">
        <div class="inv-brand">RangDe <small>Art Studio · Peshawar</small></div>
        <div class="inv-meta"><div><strong>${thisInvId}</strong></div><div>${new Date().toLocaleDateString('en-PK',{day:'2-digit',month:'short',year:'numeric'})}</div></div>
      </div>
      <hr class="inv-divider">
      <div class="inv-name-row">
        <div class="inv-avatar">${initial}</div>
        <div>
          <div class="inv-attendee-name">${p.name || 'Participant '+(idx+1)}</div>
          <div class="inv-attendee-sub">${idx===0?phone+' · '+email:p.name}</div>
        </div>
      </div>
      <div class="inv-rows">
        <div class="inv-row"><div class="ilabel">Event</div><div class="ival">Paint &amp; Yap Ep.2</div></div>
        <div class="inv-row"><div class="ilabel">Activity</div><div class="ival">${actName}</div></div>
        <div class="inv-row"><div class="ilabel">Date</div><div class="ival">Mon, 3 Aug 2025</div></div>
        <div class="inv-row"><div class="ilabel">Venue</div><div class="ival">Nook Cafe, Peshawar</div></div>
        ${txn!=='N/A'?'<div class="inv-row"><div class="ilabel">Txn ID</div><div class="ival">'+txn+'</div></div>':''}
      </div>
      <div class="inv-total-row"><span class="itl">Amount</span><span class="itv">${perAmt}</span></div>
      <div class="inv-entry-badge"><span class="badge-icon">🎨</span><p><strong>Show this pass at the door.</strong><br>Save to gallery or screenshot.</p></div>
      <button class="inv-save-btn" onclick="rdSaveInvoice(${idx},'${(p.name||'pass').replace(/'/g,'\\\'').replace(/\s+/g,'_')}')">📸 Save to Gallery</button>
      <div class="inv-save-hint">Tap to download</div>
    `;
    wrap.appendChild(card);
  });
}

function rdSaveInvoice(idx, name) {
  const card = document.getElementById('rdinv-' + idx);
  const btn = card.querySelector('.inv-save-btn');
  const hint = card.querySelector('.inv-save-hint');
  if (typeof html2canvas === 'undefined') {
    alert('Take a screenshot of your pass manually. On mobile: Home + Power button.');
    return;
  }
  btn.disabled = true; btn.textContent = '⏳ Saving...';
  btn.style.display='none'; if(hint) hint.style.display='none';
  html2canvas(card, { backgroundColor:'#ffffff', scale:2, useCORS:true })
    .then(canvas => {
      btn.style.display=''; if(hint) hint.style.display='';
      btn.disabled=false; btn.innerHTML='📸 Save to Gallery';
      const a = document.createElement('a');
      a.download = 'RangDe_Pass_' + name + '.png';
      a.href = canvas.toDataURL('image/png');
      a.click();
    }).catch(() => {
      btn.style.display=''; if(hint) hint.style.display='';
      btn.disabled=false; btn.innerHTML='📸 Save to Gallery';
      alert('Could not auto-save. Screenshot manually.');
    });
}

// Init count buttons
document.addEventListener('DOMContentLoaded', function() {
  rdSetCount(1);
});
