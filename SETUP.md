# RangDe — Google Sheets Setup (5 minutes)

## Step 1 — Create the Sheet

1. Go to: https://sheets.google.com
2. Create a new spreadsheet
3. Rename it: **RangDe Registrations**
4. In Row 1, add these headers exactly:
   `Date | Name | Email | Phone | Type | Members | GroupMemberNames | CouponUsed | Discount | TotalPaid | PaymentMethod | TransactionID`

---

## Step 2 — Create the Apps Script

1. In your sheet: click **Extensions → Apps Script**
2. Delete all existing code
3. Paste this entire script:

```javascript
const SHEET_NAME = 'Sheet1';
const ADMIN_USER = 'admin@rangde.com';
const ADMIN_PASS = 'rangde2025';

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    var data  = JSON.parse(e.postData.contents);
    var headers = ['Date','Name','Email','Phone','Type','Members',
                   'GroupMemberNames','CouponUsed','Discount',
                   'TotalPaid','PaymentMethod','TransactionID'];
    sheet.appendRow(headers.map(h => data[h] || ''));
    return ContentService
      .createTextOutput(JSON.stringify({status:'ok'}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({status:'error',msg:err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  // Admin read endpoint — password protected
  var user = e.parameter.u;
  var pass = e.parameter.p;
  if (user !== ADMIN_USER || pass !== ADMIN_PASS) {
    return ContentService
      .createTextOutput(JSON.stringify({status:'unauthorized'}))
      .setMimeType(ContentService.MimeType.JSON);
  }
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  var data  = sheet.getDataRange().getValues();
  var headers = data[0];
  var rows = data.slice(1).map(row => {
    var obj = {};
    headers.forEach((h,i) => obj[h] = row[i]);
    return obj;
  });
  return ContentService
    .createTextOutput(JSON.stringify({status:'ok', rows: rows}))
    .setMimeType(ContentService.MimeType.JSON);
}
```

4. Click **Save** (Ctrl+S)
5. Click **Deploy → New Deployment**
6. Click the gear icon → select **Web app**
7. Set:
   - Execute as: **Me**
   - Who has access: **Anyone**
8. Click **Deploy**
9. Click **Authorize access** → allow permissions
10. **Copy the Web App URL** (looks like: `https://script.google.com/macros/s/XXXXX/exec`)

---

## Step 3 — Paste URL into the website

Open `script.js` and replace line 2:
```
const SHEET_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
```
with:
```
https://script.google.com/macros/s/AKfycbyipzbwnwkGgpp7xoyFkGuaX0l23BkZ8JpfmsJn7pNOFSb8qxdVF8v96uc50mjgif07/exec
const SHEET_URL = 'https://script.google.com/macros/s/YOUR_ID/exec';
```

Open `admin.html` and replace line near the top:
```
const SHEET_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
```
with the same URL.

---

## Done!
- Every registration now saves to your Google Sheet in real time
- Admin panel reads live data from the sheet
- Works from any browser, any device, anywhere in the world
