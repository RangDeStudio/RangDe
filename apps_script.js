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

    // Headers
    summSheet.getRange('A1').setValue('🪆 Trinket Tray');
    summSheet.getRange('B1').setValue('🎨 Canvas Painting');
    summSheet.getRange('C1').setValue('🎉 100% Free (MUN27)');
    summSheet.getRange('A1:C1').setFontWeight('bold').setFontSize(11)
      .setBackground('#ca3027').setFontColor('#ffffff').setHorizontalAlignment('center');

    // Names only — FILTER formula pulls from Sheet1 automatically
    summSheet.getRange('A2').setFormula(
      '=IFERROR(FILTER(Sheet1!B:B,Sheet1!K:K="Trinket Tray",Sheet1!B:B<>"",Sheet1!B:B<>"Name"),"")');
    summSheet.getRange('B2').setFormula(
      '=IFERROR(FILTER(Sheet1!B:B,Sheet1!K:K="Canvas Painting",Sheet1!B:B<>"",Sheet1!B:B<>"Name"),"")');
    summSheet.getRange('C2').setFormula(
      '=IFERROR(FILTER(Sheet1!B:B,Sheet1!G:G="MUN27",Sheet1!B:B<>"",Sheet1!B:B<>"Name"),"")');

    summSheet.setColumnWidth(1, 200);
    summSheet.setColumnWidth(2, 200);
    summSheet.setColumnWidth(3, 200);

    // ── Stats table starting from column E ────────────────────────
    summSheet.getRange('E1').setValue('📊 Stats');
    summSheet.getRange('E1').setFontWeight('bold').setFontSize(11)
      .setBackground('#2c1810').setFontColor('#ffffff').setHorizontalAlignment('center');

    summSheet.getRange('E2').setValue('Canvas Painting');
    summSheet.getRange('F2').setFormula('=COUNTIF(Sheet1!K:K,"Canvas Painting")');

    summSheet.getRange('E3').setValue('Trinket Tray');
    summSheet.getRange('F3').setFormula('=COUNTIF(Sheet1!K:K,"Trinket Tray")');

    summSheet.getRange('E4').setValue('Total Registrations');
    summSheet.getRange('F4').setFormula('=COUNTA(Sheet1!B:B)-1');

    summSheet.getRange('E5').setValue('Total Revenue (Rs.)');
    summSheet.getRange('F5').setFormula('=SUMPRODUCT(IFERROR(VALUE(SUBSTITUTE(IF(ISNUMBER(SEARCH("Rs.",Sheet1!J:J)),SUBSTITUTE(Sheet1!J:J,"Rs. ",""),"0"),",","")),0))');

    summSheet.getRange('E2:E5').setFontWeight('bold');
    summSheet.getRange('F4:F5').setFontWeight('bold').setFontColor('#ca3027');
    summSheet.setColumnWidth(5, 180);
    summSheet.setColumnWidth(6, 100);

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
