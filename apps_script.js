const SHEET_NAME = 'Sheet1';
const ADMIN_USER = 'admin@rangde.com';
const ADMIN_PASS = 'rangde2025';
// ⚠️ Set these only in Code.gs — never commit real values to GitHub
const TG_TOKEN   = 'PASTE_YOUR_BOT_TOKEN_HERE';
const TG_CHAT_ID = 'PASTE_YOUR_CHAT_ID_HERE';

// ── Telegram: send text message ───────────────────────────────────────
function sendTelegram(message) {
  try {
    UrlFetchApp.fetch('https://api.telegram.org/bot' + TG_TOKEN + '/sendMessage', {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({ chat_id: TG_CHAT_ID, text: message, parse_mode: 'HTML' }),
      muteHttpExceptions: true,
    });
  } catch(e) {}
}

// ── Telegram: send photo ──────────────────────────────────────────────
function sendTelegramPhoto(blob, caption) {
  try {
    UrlFetchApp.fetch('https://api.telegram.org/bot' + TG_TOKEN + '/sendPhoto', {
      method: 'post',
      payload: { chat_id: TG_CHAT_ID, caption: caption, photo: blob },
      muteHttpExceptions: true,
    });
  } catch(e) {}
}

// ── Update Summary tab (separate sheet) ──────────────────────────────
function updateSummaryTab() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var summSheet = ss.getSheetByName('Summary');
    if (!summSheet) summSheet = ss.insertSheet('Summary');
    summSheet.clearContents();
    summSheet.clearFormats();

    // ── Title ──────────────────────────────────────────────────────
    summSheet.getRange('A1').setValue('RangDe Registration Summary');
    summSheet.getRange('A1').setFontWeight('bold').setFontSize(14)
      .setBackground('#ca3027').setFontColor('#ffffff');

    // ── TABLE 1: Trinket Tray ──────────────────────────────────────
    summSheet.getRange('A3').setValue('🪆 TRINKET TRAY');
    summSheet.getRange('A3').setFontWeight('bold').setFontSize(12)
      .setBackground('#f0615a').setFontColor('#ffffff');
    summSheet.getRange('A4').setValue('Name');
    summSheet.getRange('B4').setValue('Phone');
    summSheet.getRange('C4').setValue('Role');
    summSheet.getRange('A4:C4').setFontWeight('bold').setBackground('#ffe0de').setFontColor('#2c1810');
    summSheet.getRange('A5').setFormula(
      '=IFERROR(FILTER(Sheet1!B:B,Sheet1!K:K="Trinket Tray",Sheet1!B:B<>"",Sheet1!B:B<>"Name"),"No trinket registrations yet")');
    summSheet.getRange('B5').setFormula(
      '=IFERROR(FILTER(Sheet1!D:D,Sheet1!K:K="Trinket Tray",Sheet1!B:B<>"",Sheet1!B:B<>"Name"),"")');
    summSheet.getRange('C5').setFormula(
      '=IFERROR(FILTER(Sheet1!E:E,Sheet1!K:K="Trinket Tray",Sheet1!B:B<>"",Sheet1!B:B<>"Name"),"")');

    // ── TABLE 2: Canvas Painting ───────────────────────────────────
    summSheet.getRange('E3').setValue('🎨 CANVAS PAINTING');
    summSheet.getRange('E3').setFontWeight('bold').setFontSize(12)
      .setBackground('#ca3027').setFontColor('#ffffff');
    summSheet.getRange('E4').setValue('Name');
    summSheet.getRange('F4').setValue('Phone');
    summSheet.getRange('G4').setValue('Role');
    summSheet.getRange('E4:G4').setFontWeight('bold').setBackground('#ffe0de').setFontColor('#2c1810');
    summSheet.getRange('E5').setFormula(
      '=IFERROR(FILTER(Sheet1!B:B,Sheet1!K:K="Canvas Painting",Sheet1!B:B<>"",Sheet1!B:B<>"Name"),"No canvas registrations yet")');
    summSheet.getRange('F5').setFormula(
      '=IFERROR(FILTER(Sheet1!D:D,Sheet1!K:K="Canvas Painting",Sheet1!B:B<>"",Sheet1!B:B<>"Name"),"")');
    summSheet.getRange('G5').setFormula(
      '=IFERROR(FILTER(Sheet1!E:E,Sheet1!K:K="Canvas Painting",Sheet1!B:B<>"",Sheet1!B:B<>"Name"),"")');

    // ── TABLE 3: Free / Heavy Discount (100% + 75%) ────────────────
    summSheet.getRange('I3').setValue('🎉 FREE / 75%+ DISCOUNT');
    summSheet.getRange('I3').setFontWeight('bold').setFontSize(12)
      .setBackground('#2c1810').setFontColor('#ffffff');
    summSheet.getRange('I4').setValue('Name');
    summSheet.getRange('J4').setValue('Phone');
    summSheet.getRange('K4').setValue('Coupon');
    summSheet.getRange('L4').setValue('Discount');
    summSheet.getRange('I4:L4').setFontWeight('bold').setBackground('#ffe0de').setFontColor('#2c1810');
    summSheet.getRange('I5').setFormula(
      '=IFERROR(FILTER(Sheet1!B:B,(Sheet1!H:H="100%")+(Sheet1!H:H="75%"),Sheet1!B:B<>"",Sheet1!B:B<>"Name"),"No free/75% registrations yet")');
    summSheet.getRange('J5').setFormula(
      '=IFERROR(FILTER(Sheet1!D:D,(Sheet1!H:H="100%")+(Sheet1!H:H="75%"),Sheet1!B:B<>"",Sheet1!B:B<>"Name"),"")');
    summSheet.getRange('K5').setFormula(
      '=IFERROR(FILTER(Sheet1!G:G,(Sheet1!H:H="100%")+(Sheet1!H:H="75%"),Sheet1!B:B<>"",Sheet1!B:B<>"Name"),"")');
    summSheet.getRange('L5').setFormula(
      '=IFERROR(FILTER(Sheet1!H:H,(Sheet1!H:H="100%")+(Sheet1!H:H="75%"),Sheet1!B:B<>"",Sheet1!B:B<>"Name"),"")');

    // ── Counts row at bottom ───────────────────────────────────────
    summSheet.getRange('A2').setValue('Trinket: ' );
    summSheet.getRange('B2').setFormula('=COUNTIF(Sheet1!K:K,"Trinket Tray")');
    summSheet.getRange('E2').setValue('Canvas: ');
    summSheet.getRange('F2').setFormula('=COUNTIF(Sheet1!K:K,"Canvas Painting")');
    summSheet.getRange('I2').setValue('Free/75%: ');
    summSheet.getRange('J2').setFormula('=COUNTIF(Sheet1!H:H,"100%")+COUNTIF(Sheet1!H:H,"75%")');

    summSheet.getRange('A2:B2').setFontWeight('bold').setFontColor('#ca3027');
    summSheet.getRange('E2:F2').setFontWeight('bold').setFontColor('#ca3027');
    summSheet.getRange('I2:J2').setFontWeight('bold').setFontColor('#ca3027');

    // Column widths
    summSheet.setColumnWidth(1, 180);
    summSheet.setColumnWidth(2, 130);
    summSheet.setColumnWidth(3, 110);
    summSheet.setColumnWidth(5, 180);
    summSheet.setColumnWidth(6, 130);
    summSheet.setColumnWidth(7, 110);
    summSheet.setColumnWidth(9, 180);
    summSheet.setColumnWidth(10, 130);
    summSheet.setColumnWidth(11, 100);
    summSheet.setColumnWidth(12, 80);

  } catch(e) { Logger.log('Summary error: ' + e.toString()); }
}

// ── Google Drive folder for payment screenshots ───────────────────────
function getPaymentFolder() {
  var name = 'RangDe_PaymentScreenshots';
  var folders = DriveApp.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(name);
}

// ── doGet: registration data + admin fetch ────────────────────────────
function doGet(e) {

  // Save registration row
  if (e.parameter.data) {
    try {
      var ss    = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName(SHEET_NAME);
      var data  = JSON.parse(e.parameter.data);

      // Add headers if sheet is empty
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(['Date','Name','Email','Phone','Role','Type','CouponUsed',
                         'Discount','ReferredBy','TotalPaid','Activity',
                         'PaymentMethod','TransactionID','InvoiceID']);
        sheet.getRange(1,1,1,14).setFontWeight('bold').setBackground('#2c1810').setFontColor('#ffffff');
      }

      var date     = data.Date          || '';
      var invId    = data.InvoiceID     || '';
      var coupon   = data.CouponUsed    || '-';
      var disc     = data.Discount      || '0%';
      var ref      = data.ReferredBy    || '-';
      var total    = data.TotalPaid     || '-';
      var method   = data.PaymentMethod || '-';
      var txn      = data.TransactionID || '-';
      var regType  = data.Type          || 'Individual';
      var activity = data.Activity      || '-';
      var isFree   = (total+'').toUpperCase().includes('FREE');
      var leadAmt  = isFree ? '0' : total;

      // Main registrant
      sheet.appendRow([date, data.Name||'', data.Email||'', data.Phone||'',
                       regType==='Individual' ? 'Individual' : 'Group Lead',
                       regType, coupon, disc, ref, leadAmt, activity, method, txn, invId]);

      // Group/Duo members — each on own row, amount 0
      if (data.GroupMemberNames && data.GroupMemberNames !== '-') {
        var names = (data.GroupMemberNames||'').split(' | ');
        var phones= (data.GroupMemNumB   ||'').split(' | ');
        var acts  = (data.MemberActivities||'').split(' | ');
        names.forEach(function(n,i){
          if (!n||n==='-') return;
          sheet.appendRow([date, n.trim(), '', (phones[i]||'').trim(),
                           'Group Member', regType, coupon, disc, ref, '0',
                           (acts[i]||'Canvas Painting').trim(), method, txn, invId]);
        });
      }

      // Update Summary tab
      updateSummaryTab();

      // Telegram notification
      var msg = '🎨 <b>New RangDe Registration!</b>\n\n'
        + '👤 <b>Name:</b> '       + (data.Name          ||'-') + '\n'
        + '📞 <b>Phone:</b> '      + (data.Phone         ||'-') + '\n'
        + '📧 <b>Email:</b> '      + (data.Email         ||'-') + '\n'
        + '🎫 <b>Type:</b> '       + (data.Type          ||'-') + '\n'
        + '👥 <b>Members:</b> '    + (data.Members       ||1)   + '\n';

      if (data.Type==='Group'&&data.GroupMemberNames&&data.GroupMemberNames!=='-') {
        var ns=(data.GroupMemberNames||'').split(' | ');
        var ps=(data.GroupMemNumB||'').split(' | ');
        var as=(data.MemberActivities||'').split(' | ');
        msg+='\n👥 <b>Group Members:</b>\n';
        ns.forEach(function(n,i){
          msg+='  '+(i+2)+'. '+n+(ps[i]?' — '+ps[i]:'')+(as[i]?' ('+as[i]+')':'')+'\n';
        });
        msg+='\n';
      }

      msg += '🏷 <b>Coupon:</b> '     + (data.CouponUsed   ||'-') + '\n'
           + '📣 <b>Referred by:</b> '+ (data.ReferredBy   ||'-') + '\n'
           + '💸 <b>Discount:</b> '   + (data.Discount     ||'0%')+ '\n'
           + '💰 <b>Total Paid:</b> ' + (data.TotalPaid    ||'-') + '\n'
           + '🎨 <b>Activity:</b> '   + (data.Activity     ||'-') + '\n'
           + '💳 <b>Payment:</b> '    + (data.PaymentMethod||'-') + '\n'
           + '🔖 <b>Txn ID:</b> '     + (data.TransactionID||'-') + '\n'
           + '🎟 <b>Invoice ID:</b> ' + (data.InvoiceID    ||'-') + '\n'
           + '🕐 <b>Date:</b> '       + (data.Date         ||'-') + '\n\n'
           + '⏳ Payment screenshot will follow...';
      sendTelegram(msg);

      return ContentService.createTextOutput(JSON.stringify({status:'ok'}))
        .setMimeType(ContentService.MimeType.JSON);
    } catch(err) {
      return ContentService.createTextOutput(JSON.stringify({status:'error',msg:err.toString()}))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  // Admin fetch
  if (e.parameter.u !== ADMIN_USER || e.parameter.p !== ADMIN_PASS) {
    return ContentService.createTextOutput(JSON.stringify({status:'unauthorized'}))
      .setMimeType(ContentService.MimeType.JSON);
  }
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  var rows  = sheet.getDataRange().getValues();
  if (rows.length < 2) return ContentService.createTextOutput(JSON.stringify({status:'ok',rows:[]}))
    .setMimeType(ContentService.MimeType.JSON);
  var headers = rows[0];
  var data = rows.slice(1).map(function(r){
    var o={}; headers.forEach(function(h,i){o[h]=r[i];}); return o;
  });
  return ContentService.createTextOutput(JSON.stringify({status:'ok',rows:data}))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── doPost: payment screenshot → Telegram + Drive ────────────────────
function doPost(e) {
  try {
    var params = e.parameter;
    if (params.action === 'uploadScreenshot') {
      var base64   = params.base64Data || '';
      var mimeType = params.mimeType   || 'image/jpeg';
      var name     = params.name       || 'Unknown';
      var txn      = params.txn        || '-';
      var amount   = params.amount     || '-';
      var invId    = params.invoiceId  || '-';
      var phone    = params.phone      || '-';
      if (!base64) return ContentService.createTextOutput(JSON.stringify({status:'error',msg:'No image data'}))
        .setMimeType(ContentService.MimeType.JSON);
      var decoded  = Utilities.base64Decode(base64);
      var ext      = mimeType.split('/')[1] || 'jpg';
      var blob     = Utilities.newBlob(decoded, mimeType, name.replace(/\s+/g,'_')+'_'+txn+'.'+ext);
      var file     = getPaymentFolder().createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      sendTelegramPhoto(blob.copyBlob(),
        '💳 Payment Screenshot\n\n👤 '+name+'\n📞 '+phone+'\n💰 '+amount+'\n🔖 Txn: '+txn+'\n🎟 Invoice: '+invId);
      return ContentService.createTextOutput(JSON.stringify({status:'ok',fileId:file.getId()}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    var data;
    try { data=JSON.parse(e.postData.contents); } catch(x) { data=JSON.parse(params.data); }
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    sheet.appendRow([data.Date||'',data.Name||'',data.Phone||'',data.Email||'','Individual',
                     data.Type||'',data.CouponUsed||'-',data.Discount||'0%',data.ReferredBy||'-',
                     data.TotalPaid||'-',data.Activity||'-',data.PaymentMethod||'-',
                     data.TransactionID||'-',data.InvoiceID||'']);
    return ContentService.createTextOutput(JSON.stringify({status:'ok'}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({status:'error',msg:err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
