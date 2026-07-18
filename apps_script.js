const SHEET_NAME = 'Sheet1';
const ADMIN_USER = 'admin@rangde.com';
const ADMIN_PASS = 'rangde2025';
// ⚠️ TG_TOKEN and TG_CHAT_ID are set directly in Code.gs only — never commit these to GitHub
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

// ── Telegram: send photo (blob) with caption ──────────────────────────
function sendTelegramPhoto(blob, caption) {
  try {
    var formData = {
      chat_id: TG_CHAT_ID,
      caption: caption,
      photo: blob,
    };
    UrlFetchApp.fetch('https://api.telegram.org/bot' + TG_TOKEN + '/sendPhoto', {
      method: 'post',
      payload: formData,
      muteHttpExceptions: true,
    });
  } catch(e) {}
}

// ── Google Drive folder for payment screenshots ───────────────────────
function getPaymentFolder() {
  var name = 'RangDe_PaymentScreenshots';
  var folders = DriveApp.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(name);
}

// ── doGet: handles registration data + photo upload + admin fetch ─────
function doGet(e) {

  // 1. Save registration row + send Telegram text notification
  if (e.parameter.data) {
    try {
      var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
      var data  = JSON.parse(e.parameter.data);

      if (sheet.getLastRow() === 0) {
        sheet.appendRow(['Date','Name','Phone','Email','Role','Type','CouponUsed','Discount',
                         'ReferredBy','TotalPaid','Activity','PaymentMethod','TransactionID','InvoiceID']);
      }

      var date    = data.Date   || '';
      var invId   = data.InvoiceID || '';
      var coupon  = data.CouponUsed || '-';
      var disc    = data.Discount || '0%';
      var ref     = data.ReferredBy || '-';
      var total   = data.TotalPaid || '-';
      var method  = data.PaymentMethod || '-';
      var txn     = data.TransactionID || '-';
      var regType = data.Type || 'Individual';
      var activity = data.Activity || '-';

      // Main registrant row
      sheet.appendRow([date, data.Name||'', data.Phone||'', data.Email||'',
                       regType === 'Individual' ? 'Individual' : 'Group Lead',
                       regType, coupon, disc, ref, total, activity, method, txn, invId]);

      // Group/Duo member rows
      if (data.GroupMemberNames && data.GroupMemberNames !== '-') {
        var names     = (data.GroupMemberNames || '').split(' | ');
        var phones    = (data.GroupMemNumB     || '').split(' | ');
        var acts      = (data.MemberActivities || '').split(' | ');
        names.forEach(function(n, i) {
          if (!n || n === '-') return;
          sheet.appendRow([date, n.trim(), (phones[i]||'').trim(), '',
                           'Group Member', regType, coupon, disc, ref,
                           total, (acts[i]||'Canvas Painting').trim(),
                           method, txn, invId]);
        });
      }

      // Telegram text
      var msg = '🎨 <b>New RangDe Registration!</b>\n\n'
        + '👤 <b>Name:</b> '      + (data.Name         || '-') + '\n'
        + '📞 <b>Phone:</b> '     + (data.Phone        || '-') + '\n'
        + '📧 <b>Email:</b> '     + (data.Email        || '-') + '\n'
        + '🎫 <b>Type:</b> '      + (data.Type         || '-') + '\n'
        + '👥 <b>Members:</b> '   + (data.Members      || 1)   + '\n';

      // Add group member details if group registration
      if (data.Type === 'Group' && data.GroupMemberNames && data.GroupMemberNames !== '-') {
        var names  = (data.GroupMemberNames || '').split(' | ');
        var phones = (data.GroupMemNumB     || '').split(' | ');
        var acts   = (data.MemberActivities || '').split(' | ');
        msg += '\n👥 <b>Group Members:</b>\n';
        names.forEach(function(n, i) {
          msg += '  ' + (i+2) + '. ' + n
            + (phones[i] ? ' — ' + phones[i] : '')
            + (acts[i]   ? ' (' + acts[i] + ')' : '') + '\n';
        });
        msg += '\n';
      }

      msg += '🏷 <b>Coupon:</b> '    + (data.CouponUsed   || '-') + '\n'
        + '� <b>Referred by:</b> '+ (data.ReferredBy   || '-') + '\n'
        + '�💸 <b>Discount:</b> '  + (data.Discount     || '0%')+ '\n'
        + '💰 <b>Total Paid:</b> '+ (data.TotalPaid    || '-') + '\n'
        + '🎨 <b>Activity:</b> '  + (data.Activity     || '-') + '\n'
        + '💳 <b>Payment:</b> '   + (data.PaymentMethod|| '-') + '\n'
        + '🔖 <b>Txn ID:</b> '    + (data.TransactionID|| '-') + '\n'
        + '🎟 <b>Invoice ID:</b> '+ (data.InvoiceID    || '-') + '\n'
        + '🕐 <b>Date:</b> '      + (data.Date         || '-') + '\n\n'
        + '⏳ Payment screenshot will follow...';
      sendTelegram(msg);

      return ContentService
        .createTextOutput(JSON.stringify({status:'ok'}))
        .setMimeType(ContentService.MimeType.JSON);
    } catch(err) {
      return ContentService
        .createTextOutput(JSON.stringify({status:'error', msg: err.toString()}))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  // 2. Admin fetch all rows
  if (e.parameter.u !== ADMIN_USER || e.parameter.p !== ADMIN_PASS) {
    return ContentService
      .createTextOutput(JSON.stringify({status:'unauthorized'}))
      .setMimeType(ContentService.MimeType.JSON);
  }
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  var rows  = sheet.getDataRange().getValues();
  if (rows.length < 2) {
    return ContentService
      .createTextOutput(JSON.stringify({status:'ok', rows:[]}))
      .setMimeType(ContentService.MimeType.JSON);
  }
  var headers = rows[0];
  var data = rows.slice(1).map(function(r) {
    var o = {}; headers.forEach(function(h,i){ o[h] = r[i]; }); return o;
  });
  return ContentService
    .createTextOutput(JSON.stringify({status:'ok', rows:data}))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── doPost: receives payment screenshot + sends to Telegram ──────────
function doPost(e) {
  try {
    var params = e.parameter;

    // Payment screenshot upload
    if (params.action === 'uploadScreenshot') {
      var base64   = params.base64Data || '';
      var mimeType = params.mimeType   || 'image/jpeg';
      var name     = params.name       || 'Unknown';
      var txn      = params.txn        || '-';
      var amount   = params.amount     || '-';
      var invId    = params.invoiceId  || '-';
      var phone    = params.phone      || '-';

      if (!base64) {
        return ContentService
          .createTextOutput(JSON.stringify({status:'error', msg:'No image data'}))
          .setMimeType(ContentService.MimeType.JSON);
      }

      // Decode and create blob
      var decoded  = Utilities.base64Decode(base64);
      var ext      = mimeType.split('/')[1] || 'jpg';
      var fileName = name.replace(/\s+/g,'_') + '_' + txn + '.' + ext;
      var blob     = Utilities.newBlob(decoded, mimeType, fileName);

      // Save to Drive
      var folder = getPaymentFolder();
      var file   = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      // Send photo to Telegram with caption
      var caption = '💳 Payment Screenshot\n\n'
        + '👤 ' + name   + '\n'
        + '📞 ' + phone  + '\n'
        + '💰 ' + amount + '\n'
        + '🔖 Txn: ' + txn + '\n'
        + '🎟 Invoice: ' + invId;

      // Send the blob as photo to Telegram
      sendTelegramPhoto(blob.copyBlob(), caption);

      return ContentService
        .createTextOutput(JSON.stringify({status:'ok', fileId: file.getId()}))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Fallback: plain registration row via POST
    var data;
    try { data = JSON.parse(e.postData.contents); }
    catch(x) { data = JSON.parse(params.data); }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Date','Name','Email','Phone','Type','Members',
                       'Groc']);
    }
    var cols = ['Date','Name','Email','Phone','Type','Members',
                'GroupMemberNames','GroupMemNumB','CouponUsed','Discount',
                'TotalPaid','PaymentMethod','TransactionID','InvoiceID'];
    sheet.appendRow(cols.map(function(h){ return data[h] || ''; }));

    return ContentService
      .createTextOutput(JSON.stringify({status:'ok'}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({status:'error', msg: err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
