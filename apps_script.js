const SHEET_NAME = 'Sheet1';
const ADMIN_USER = 'admin@rangde.com';
const ADMIN_PASS = 'rangde2025';

// ── Create/reuse a folder in Drive for payment screenshots ────────────
function getPaymentFolder() {
  var folderName = 'RangDe_PaymentScreenshots';
  var folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(folderName);
}

function doPost(e) {
  try {
    // ── File upload action ──────────────────────────────────────────
    if (e.parameter.action === 'uploadFile') {
      var fileName  = e.parameter.fileName  || ('upload_' + Date.now());
      var mimeType  = e.parameter.mimeType  || 'image/jpeg';
      var base64    = e.parameter.base64Data || '';
      if (!base64) {
        return ContentService
          .createTextOutput(JSON.stringify({status:'error', msg:'No file data'}))
          .setMimeType(ContentService.MimeType.JSON);
      }
      var decoded = Utilities.base64Decode(base64);
      var blob    = Utilities.newBlob(decoded, mimeType, fileName);
      var folder  = getPaymentFolder();
      var file    = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      return ContentService
        .createTextOutput(JSON.stringify({status:'ok', fileId: file.getId()}))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // ── Registration row ────────────────────────────────────────────
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    var data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch(x) {
      data = JSON.parse(e.parameter.data);
    }

    // Add headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      var headers = ['Date','Name','Email','Phone','Type','Members',
                     'GroupMemberNames','GroupMemNumB','CouponUsed','Discount',
                     'TotalPaid','PaymentMethod','TransactionID'];
      sheet.appendRow(headers);
    }

    var cols = ['Date','Name','Email','Phone','Type','Members',
                'GroupMemberNames','GroupMemNumB','CouponUsed','Discount',
                'TotalPaid','PaymentMethod','TransactionID'];
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

function doGet(e) {
  if (e.parameter.u !== ADMIN_USER || e.parameter.p !== ADMIN_PASS) {
    return ContentService
      .createTextOutput(JSON.stringify({status:'unauthorized'}))
      .setMimeType(ContentService.MimeType.JSON);
  }
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  var data  = sheet.getDataRange().getValues();
  if (data.length < 2) {
    return ContentService
      .createTextOutput(JSON.stringify({status:'ok', rows:[]}))
      .setMimeType(ContentService.MimeType.JSON);
  }
  var headers = data[0];
  var rows = data.slice(1).map(function(row){
    var obj = {};
    headers.forEach(function(h,i){ obj[h] = row[i]; });
    return obj;
  });
  return ContentService
    .createTextOutput(JSON.stringify({status:'ok', rows:rows}))
    .setMimeType(ContentService.MimeType.JSON);
}
