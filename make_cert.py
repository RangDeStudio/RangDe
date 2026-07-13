content = open("certificate.html","w",encoding="utf-8")
content.write("""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Rangraiz Art Studio - Certificate of Participation</title>
<link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Nunito:wght@300;400;600&display=swap" rel="stylesheet">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }

  body {
    background: #f5e6d3;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30px 20px;
    font-family: "Nunito", sans-serif;
  }

  /* ── PRINT / DOWNLOAD BUTTON ── */
  .print-btn {
    margin-bottom: 24px;
    padding: 12px 32px;
    background: linear-gradient(135deg, #e8849a, #d4688a);
    color: #fff;
    border: none;
    border-radius: 50px;
    font-family: "Nunito", sans-serif;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 4px 16px rgba(232,100,130,.35);
    transition: transform .2s, box-shadow .2s;
  }
  .print-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(232,100,130,.45); }

  /* ── CERTIFICATE WRAPPER ── */
  .cert-wrap {
    width: 900px;
    max-width: 100%;
    background: #fffdf8;
    border-radius: 8px;
    box-shadow: 0 20px 80px rgba(180,100,120,.22), 0 4px 20px rgba(0,0,0,.08);
    overflow: hidden;
    position: relative;
  }

  /* ── OUTER BORDER FRAME ── */
  .cert-frame {
    margin: 18px;
    border: 2px solid #c9a96e;
    border-radius: 4px;
    padding: 0;
    position: relative;
  }
  .cert-frame::before {
    content: "";
    position: absolute;
    inset: 6px;
    border: 1px solid rgba(201,169,110,.4);
    border-radius: 2px;
    pointer-events: none;
  }

  /* ── CORNER ORNAMENTS ── */
  .corner {
    position: absolute;
    width: 52px;
    height: 52px;
    z-index: 5;
  }
  .corner svg { width: 100%; height: 100%; }
  .tl { top: -2px; left: -2px; }
  .tr { top: -2px; right: -2px; transform: scaleX(-1); }
  .bl { bottom: -2px; left: -2px; transform: scaleY(-1); }
  .br { bottom: -2px; right: -2px; transform: scale(-1); }

  /* ── INNER CONTENT ── */
  .cert-inner {
    padding: 48px 60px 44px;
    text-align: center;
    position: relative;
  }

  /* ── TOP RIBBON ── */
  .ribbon-top {
    background: linear-gradient(135deg, #e8849a, #f4a7b9, #c9a96e);
    height: 6px;
    margin-bottom: 36px;
    border-radius: 3px;
  }

  /* ── STUDIO NAME ── */
  .studio-name {
    font-family: "Dancing Script", cursive;
    font-size: 2.2rem;
    color: #c9a96e;
    letter-spacing: 2px;
    margin-bottom: 4px;
    text-shadow: 0 1px 2px rgba(201,169,110,.3);
  }

  .studio-sub {
    font-size: .72rem;
    letter-spacing: 5px;
    text-transform: uppercase;
    color: #b8943e;
    margin-bottom: 28px;
    font-weight: 600;
  }

  /* ── DIVIDER FLORALS ── */
  .floral-divider {
    display: flex;
    align-items: center;
    gap: 14px;
    justify-content: center;
    margin-bottom: 24px;
    color: #e8849a;
    font-size: 1rem;
    letter-spacing: 8px;
  }
  .floral-divider::before,
  .floral-divider::after {
    content: "";
    flex: 1;
    max-width: 120px;
    height: 1px;
    background: linear-gradient(90deg, transparent, #c9a96e, transparent);
  }

  /* ── CERTIFICATE OF ── */
  .cert-of {
    font-family: "Cormorant Garamond", serif;
    font-size: .85rem;
    letter-spacing: 6px;
    text-transform: uppercase;
    color: #9e7070;
    margin-bottom: 6px;
    font-weight: 400;
  }

  .cert-heading {
    font-family: "Dancing Script", cursive;
    font-size: 3.6rem;
    color: #5a3a3a;
    line-height: 1;
    margin-bottom: 28px;
    text-shadow: 0 2px 4px rgba(90,58,58,.1);
  }

  /* ── PRESENTED TO ── */
  .presented-to {
    font-family: "Cormorant Garamond", serif;
    font-style: italic;
    font-size: 1rem;
    color: #9e7070;
    letter-spacing: 2px;
    margin-bottom: 8px;
  }

  /* ── NAME LINE ── */
  .name-line {
    font-family: "Dancing Script", cursive;
    font-size: 3rem;
    color: #d4688a;
    border-bottom: 1.5px solid rgba(201,169,110,.5);
    display: inline-block;
    min-width: 400px;
    padding: 0 20px 8px;
    margin-bottom: 28px;
    line-height: 1.2;
  }
  .name-line.empty {
    color: #c9a96e;
    font-size: 2rem;
  }

  /* ── BODY TEXT ── */
  .cert-body {
    font-family: "Cormorant Garamond", serif;
    font-size: 1.15rem;
    color: #5a3a3a;
    line-height: 1.9;
    max-width: 560px;
    margin: 0 auto 28px;
    font-weight: 300;
  }
  .cert-body strong {
    font-weight: 600;
    color: #5a3a3a;
  }

  /* ── EVENT DETAILS BAND ── */
  .event-band {
    display: flex;
    justify-content: center;
    gap: 40px;
    background: linear-gradient(135deg, #fff5f8, #fffdf0);
    border: 1px solid rgba(201,169,110,.3);
    border-radius: 12px;
    padding: 18px 32px;
    margin-bottom: 36px;
    flex-wrap: wrap;
  }
  .event-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }
  .event-icon { font-size: 1.3rem; }
  .event-label {
    font-size: .65rem;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #b8943e;
    font-weight: 700;
  }
  .event-value {
    font-family: "Cormorant Garamond", serif;
    font-size: 1rem;
    color: #5a3a3a;
    font-weight: 600;
  }

  /* ── BOTTOM ROW: SEAL + SIGNATURES ── */
  .cert-bottom {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 20px;
    margin-top: 8px;
    flex-wrap: wrap;
  }

  .sig-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    min-width: 150px;
  }
  .sig-line {
    width: 160px;
    height: 1.5px;
    background: linear-gradient(90deg, transparent, #c9a96e, transparent);
  }
  .sig-name {
    font-family: "Dancing Script", cursive;
    font-size: 1.3rem;
    color: #5a3a3a;
    line-height: 1;
  }
  .sig-title {
    font-size: .68rem;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #9e7070;
    font-weight: 700;
  }

  /* ── SEAL ── */
  .seal {
    width: 110px;
    height: 110px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .seal-ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 3px solid #c9a96e;
    background: radial-gradient(circle at 40% 35%, #fffdf0, #fce4ec55);
    box-shadow: 0 0 0 6px rgba(201,169,110,.12), inset 0 2px 8px rgba(201,169,110,.15);
  }
  .seal-inner {
    position: relative;
    z-index: 2;
    text-align: center;
  }
  .seal-icon { font-size: 1.6rem; line-height: 1; }
  .seal-text {
    font-family: "Dancing Script", cursive;
    font-size: .7rem;
    color: #b8943e;
    letter-spacing: 1px;
    line-height: 1.3;
    display: block;
    margin-top: 2px;
  }

  /* ── WATERMARK ── */
  .watermark {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-25deg);
    font-family: "Dancing Script", cursive;
    font-size: 7rem;
    color: rgba(232,132,154,.05);
    white-space: nowrap;
    pointer-events: none;
    z-index: 0;
    user-select: none;
  }

  /* ── BOTTOM RIBBON ── */
  .ribbon-bottom {
    background: linear-gradient(135deg, #c9a96e, #f4a7b9, #e8849a);
    height: 6px;
    margin-top: 36px;
    border-radius: 3px;
  }

  /* ── NAME INPUT ── */
  .name-input-wrap {
    margin-bottom: 20px;
    display: flex;
    gap: 10px;
    justify-content: center;
    flex-wrap: wrap;
  }
  .name-input-wrap input {
    padding: 12px 20px;
    border: 1.5px solid rgba(244,167,185,.4);
    border-radius: 50px;
    font-family: "Nunito", sans-serif;
    font-size: 1rem;
    color: #5a3a3a;
    background: rgba(255,248,240,.8);
    width: 320px;
    outline: none;
    transition: border .2s;
  }
  .name-input-wrap input:focus { border-color: #e8849a; background: #fff; }
  .name-input-wrap button {
    padding: 12px 24px;
    background: linear-gradient(135deg, #e8849a, #d4688a);
    color: #fff;
    border: none;
    border-radius: 50px;
    font-family: "Nunito", sans-serif;
    font-weight: 700;
    cursor: pointer;
    font-size: .9rem;
  }

  /* ── PRINT STYLES ── */
  @media print {
    body { background: #fff; padding: 0; }
    .print-btn, .name-input-wrap, .page-label { display: none !important; }
    .cert-wrap {
      box-shadow: none;
      border-radius: 0;
      width: 100%;
      max-width: 100%;
    }
    @page { size: A4 landscape; margin: 10mm; }
  }

  @media (max-width: 680px) {
    .cert-inner { padding: 28px 20px 24px; }
    .cert-heading { font-size: 2.4rem; }
    .name-line { min-width: 260px; font-size: 2.2rem; }
    .cert-body { font-size: 1rem; }
    .event-band { gap: 20px; padding: 14px 20px; }
    .cert-bottom { justify-content: center; }
    .seal { width: 80px; height: 80px; }
  }
</style>
</head>
<body>

<p class="page-label" style="font-family:Nunito;font-size:.8rem;color:#9e7070;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;">
  &#10024; Enter recipient name then print / save as PDF
</p>

<!-- Name Entry -->
<div class="name-input-wrap">
  <input type="text" id="nameInput" placeholder="Enter attendee name..." oninput="updateName(this.value)">
  <button onclick="window.print()">&#128438; Print / Save PDF</button>
</div>

<!-- Certificate -->
<div class="cert-wrap" id="certificate">

  <div class="cert-frame">
    <!-- Corner ornaments -->
    <div class="corner tl">
      <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 50 L2 8 Q2 2 8 2 L50 2" stroke="#c9a96e" stroke-width="2" fill="none"/>
        <path d="M2 50 L2 14 Q2 8 8 8 L50 8" stroke="#c9a96e" stroke-width=".6" fill="none" opacity=".5"/>
        <circle cx="8" cy="8" r="3" fill="#c9a96e" opacity=".6"/>
        <path d="M14 2 Q8 8 2 14" stroke="#f4a7b9" stroke-width="1.2" fill="none"/>
        <circle cx="26" cy="2" r="1.5" fill="#e8849a" opacity=".5"/>
        <circle cx="2" cy="26" r="1.5" fill="#e8849a" opacity=".5"/>
      </svg>
    </div>
    <div class="corner tr">
      <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 50 L2 8 Q2 2 8 2 L50 2" stroke="#c9a96e" stroke-width="2" fill="none"/>
        <path d="M2 50 L2 14 Q2 8 8 8 L50 8" stroke="#c9a96e" stroke-width=".6" fill="none" opacity=".5"/>
        <circle cx="8" cy="8" r="3" fill="#c9a96e" opacity=".6"/>
        <path d="M14 2 Q8 8 2 14" stroke="#f4a7b9" stroke-width="1.2" fill="none"/>
      </svg>
    </div>
    <div class="corner bl">
      <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 50 L2 8 Q2 2 8 2 L50 2" stroke="#c9a96e" stroke-width="2" fill="none"/>
        <path d="M2 50 L2 14 Q2 8 8 8 L50 8" stroke="#c9a96e" stroke-width=".6" fill="none" opacity=".5"/>
        <circle cx="8" cy="8" r="3" fill="#c9a96e" opacity=".6"/>
        <path d="M14 2 Q8 8 2 14" stroke="#f4a7b9" stroke-width="1.2" fill="none"/>
      </svg>
    </div>
    <div class="corner br">
      <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 50 L2 8 Q2 2 8 2 L50 2" stroke="#c9a96e" stroke-width="2" fill="none"/>
        <path d="M2 50 L2 14 Q2 8 8 8 L50 8" stroke="#c9a96e" stroke-width=".6" fill="none" opacity=".5"/>
        <circle cx="8" cy="8" r="3" fill="#c9a96e" opacity=".6"/>
        <path d="M14 2 Q8 8 2 14" stroke="#f4a7b9" stroke-width="1.2" fill="none"/>
      </svg>
    </div>

    <div class="cert-inner">
      <!-- Watermark -->
      <div class="watermark">Rangraiz</div>

      <!-- Top ribbon -->
      <div class="ribbon-top"></div>

      <!-- Studio branding -->
      <div class="studio-name">Rangraiz Art Studio</div>
      <div class="studio-sub">&#10022; Peshawar &#10022;</div>

      <!-- Floral divider -->
      <div class="floral-divider">&#10038; &#10038; &#10038;</div>

      <!-- Cert heading -->
      <div class="cert-of">Certificate of Participation</div>
      <div class="cert-heading">Achievement</div>

      <!-- Presented to -->
      <div class="presented-to">This certificate is proudly presented to</div>

      <!-- Name -->
      <div class="name-line" id="certName">Your Name Here</div>

      <!-- Body -->
      <div class="cert-body">
        for their enthusiastic participation in the<br>
        <strong>Canvas Painting &amp; Trinket Tray Workshop</strong><br>
        where they created beautiful art, explored their creativity,<br>
        and painted their world with colour and joy.
      </div>

      <!-- Event details band -->
      <div class="event-band">
        <div class="event-item">
          <span class="event-icon">&#127912;</span>
          <span class="event-label">Workshop</span>
          <span class="event-value">Canvas &amp; Trinket Tray</span>
        </div>
        <div class="event-item">
          <span class="event-icon">&#128205;</span>
          <span class="event-label">Venue</span>
          <span class="event-value">Rolling Pin, Peshawar</span>
        </div>
        <div class="event-item">
          <span class="event-icon">&#128197;</span>
          <span class="event-label">Date</span>
          <span class="event-value">20 July 2026</span>
        </div>
      </div>

      <!-- Bottom row -->
      <div class="cert-bottom">
        <div class="sig-block">
          <div class="sig-name">Rangraiz Studio</div>
          <div class="sig-line"></div>
          <div class="sig-title">Studio Director</div>
        </div>

        <div class="seal">
          <div class="seal-ring"></div>
          <div class="seal-inner">
            <div class="seal-icon">&#127912;</div>
            <span class="seal-text">Rangraiz<br>Art Studio</span>
          </div>
        </div>

        <div class="sig-block">
          <div class="sig-name">Lead Instructor</div>
          <div class="sig-line"></div>
          <div class="sig-title">Workshop Instructor</div>
        </div>
      </div>

      <!-- Bottom ribbon -->
      <div class="ribbon-bottom"></div>
    </div>
  </div>
</div>

<script>
function updateName(val) {
  const el = document.getElementById('certName');
  if (val.trim()) {
    el.textContent = val;
    el.classList.remove('empty');
  } else {
    el.textContent = 'Your Name Here';
    el.classList.add('empty');
  }
}
// Auto-focus
document.getElementById('nameInput').focus();
</script>
</body>
</html>""")
content.close()
print("certificate.html written")
