# Google Sheet Setup — RangDe Registrations

## Step 1 — Create Google Sheet
1. Go to https://sheets.google.com
2. Create a new sheet named: **RangDe Registrations**
3. Add these headers in Row 1:
   `Date | Name | Email | Phone | Type | Members | GroupMemberNames | CouponUsed | Discount | TotalPaid | PaymentMethod | TransactionID`

## Step 2 — Create Apps Script
1. In the sheet, click **Extensions → Apps Script**
2. Delete everything and paste this code:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data  = JSON.parse(e.postData.contents);
    var headers = ['Date','Name','Email','Phone','Type','Members',
                   'GroupMemberNames','CouponUsed','Discount',
                   'TotalPaid','PaymentMethod','TransactionID'];
    var row = headers.map(h => data[h] || '');
    sheet.appendRow(row);
    return ContentService
      .createTextOutput(JSON.stringify({status:'ok'}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({status:'error', msg: err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

## Step 3 — Deploy
1. Click **Deploy → New Deployment**
2. Type: **Web app**
3. Execute as: **Me**
4. Who has access: **Anyone**
5. Click **Deploy** → copy the Web App URL

## Step 4 — Paste URL in script.js
Open `script.js` and replace:
```
const SHEET_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
```
with your copied URL.

---

## Without Google Sheets (Offline backup)
Every registration is **automatically saved in the browser's localStorage**.
Scroll to the bottom of the website and click:
**"Admin: Download Registrations CSV"**
This downloads an Excel-compatible `.csv` file with all columns:
Date, Name, Email, Phone, Type, Members, Group Members, Coupon Used, Discount, Total Paid, Payment Method, Transaction ID
