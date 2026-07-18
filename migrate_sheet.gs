// ── ONE-TIME MIGRATION — run once then delete ─────────────────────────
function migrateSheet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
  
  // Clear everything
  sheet.clearContents();
  
  // New headers
  var headers = ['Date','Name','Phone','Email','Role','Type','CouponUsed',
                 'Discount','ReferredBy','TotalPaid','Activity',
                 'PaymentMethod','TransactionID','InvoiceID'];
  sheet.appendRow(headers);
  
  // Old data — each entry
  var old = [
    {Date:'16/07/2026, 12:28:18 pm', Name:'Mujtaba',       Phone:'',           Email:'',                          Type:'Individual', Members:1, GroupMemberNames:'', GroupMemNumB:'', CouponUsed:'MUN27',    Discount:'100%', TotalPaid:'FREE',      Activity:'Trinket Tray',     PaymentMethod:'N/A (Free)', TransactionID:'N/A',          InvoiceID:''},
    {Date:'16/07/2026, 1:28:11 PM',  Name:'Waniya',        Phone:'3459151146', Email:'rabi.art24@gmail.com',      Type:'Individual', Members:1, GroupMemberNames:'', GroupMemNumB:'', CouponUsed:'FRIEND50', Discount:'50%',  TotalPaid:'Rs. 900',   Activity:'Trinket Tray',     PaymentMethod:'easypaisa',  TransactionID:'692575',       InvoiceID:'RD-8WBEKQ'},
    {Date:'16/07/2026, 4:00:11 pm',  Name:'Warisha Ali',   Phone:'3238914131', Email:'ayeshaashali@gmail.com',    Type:'Group',      Members:4, GroupMemberNames:'Fatima | Sara | Hiba', GroupMemNumB:'03161589169 | 03339152884 | 03330984217', CouponUsed:'-', Discount:'50%', TotalPaid:'Rs. 3600', Activity:'Canvas Painting', PaymentMethod:'easypaisa', TransactionID:'52794438123', InvoiceID:'RD-DUV7H6'},
    {Date:'16/07/2026, 10:50:16 pm', Name:'Khadija Arshad',Phone:'3318844527', Email:'khadijaarshad.1428@gmail.com', Type:'Individual', Members:1, GroupMemberNames:'', GroupMemNumB:'', CouponUsed:'MUN27', Discount:'100%', TotalPaid:'FREE', Activity:'-', PaymentMethod:'N/A (Free)', TransactionID:'N/A', InvoiceID:'RD-95AK6W'},
    {Date:'17/07/2026, 7:50:30 PM',  Name:'Abeera asif',   Phone:'3329229923', Email:'khannoor6112@gmail.com',    Type:'Group',      Members:3, GroupMemberNames:'Muskan khan | Arham', GroupMemNumB:'03115090588 | 03115090588', CouponUsed:'-', Discount:'50%', TotalPaid:'Rs. 2700', Activity:'-', PaymentMethod:'easypaisa', TransactionID:'52852201990', InvoiceID:'RD-CH3PKY'},
    {Date:'17/07/2026, 7:57:31 PM',  Name:'Areeba misal khan', Phone:'3434833196', Email:'khanoor6112@gmail.com', Type:'Individual', Members:1, GroupMemberNames:'', GroupMemNumB:'', CouponUsed:'MUN27', Discount:'100%', TotalPaid:'FREE', Activity:'-', PaymentMethod:'easypaisa', TransactionID:'N/A', InvoiceID:'RD-K7HDJ2'},
    {Date:'17/07/2026, 11:05:09 PM', Name:'fatiqa muneeeerr', Phone:'3178556174', Email:'fatiqa.munir@gmail.com', Type:'Individual', Members:1, GroupMemberNames:'', GroupMemNumB:'', CouponUsed:'MUN27', Discount:'100%', TotalPaid:'FREE', Activity:'-', PaymentMethod:'N/A (Free)', TransactionID:'N/A', InvoiceID:'RD-39E6CB'},
    {Date:'18/07/2026, 6:10:27 pm',  Name:'Zara Kaleem',   Phone:'3236989833', Email:'zarakaleem31@gmail.com',   Type:'Individual', Members:1, GroupMemberNames:'', GroupMemNumB:'', CouponUsed:'MUN27', Discount:'100%', TotalPaid:'FREE', Activity:'-', PaymentMethod:'N/A (Free)', TransactionID:'N/A', InvoiceID:'RD-FRG6QQ'},
    {Date:'18/07/2026, 6:54:30 pm',  Name:'Joanne',        Phone:'03320377700', Email:'jarakaleem3@gmail.com',   Type:'Group',      Members:3, GroupMemberNames:'Anoosha | Miraj', GroupMemNumB:'03005993236 | 03005955264', CouponUsed:'-', Discount:'50%', TotalPaid:'Rs. 2700', Activity:'-', PaymentMethod:'easypaisa', TransactionID:'52892404755', InvoiceID:'RD-JK7JFM'},
  ];
  
  old.forEach(function(d) {
    var role = d.Type === 'Individual' ? 'Individual' : 'Group Lead';
    var isFree = (d.TotalPaid || '').toString().toUpperCase().includes('FREE');
    var leadAmount = isFree ? '0' : d.TotalPaid;

    // Main person row
    sheet.appendRow([d.Date, d.Name, d.Phone, d.Email, role, d.Type,
                     d.CouponUsed, d.Discount, '-', leadAmount, d.Activity,
                     d.PaymentMethod, d.TransactionID, d.InvoiceID]);

    // Group member rows — always 0
    if (d.GroupMemberNames && d.GroupMemberNames !== '') {
      var names  = d.GroupMemberNames.split(' | ');
      var phones = d.GroupMemNumB.split(' | ');
      names.forEach(function(n, i) {
        if (!n.trim()) return;
        sheet.appendRow([d.Date, n.trim(), (phones[i]||'').trim(), '',
                         'Group Member', d.Type, d.CouponUsed, d.Discount, '-',
                         '0', '-', d.PaymentMethod, d.TransactionID, d.InvoiceID]);
      });
    }
  });
  
  Logger.log('Migration complete!');
  
  // Add summary below data
  addSummary(sheet);
}

function addSummary(sheet) {
  var lastRow = sheet.getLastRow();
  for (var r = lastRow; r >= 1; r--) {
    var val = sheet.getRange(r, 1).getValue();
    if (val === '--- SUMMARY ---') {
      sheet.deleteRows(r, lastRow - r + 1);
      break;
    }
  }
  sheet.appendRow(['']);
  sheet.appendRow(['--- SUMMARY ---']);
  sheet.appendRow(['Activity', 'Count']);
  sheet.appendRow(['Canvas Painting', '=COUNTIF(K:K,"Canvas Painting")']);
  sheet.appendRow(['Trinket Tray',    '=COUNTIF(K:K,"Trinket Tray")']);
  sheet.appendRow(['']);
  sheet.appendRow(['Total Revenue (Rs.)', '=SUMPRODUCT(IFERROR(VALUE(SUBSTITUTE(IF(ISNUMBER(SEARCH("Rs.",J:J)),SUBSTITUTE(J:J,"Rs. ",""),"0"),",","")),0))']);
  var summRow = sheet.getLastRow() - 6;
  sheet.getRange(summRow, 1).setFontWeight('bold').setBackground('#ca3027').setFontColor('#ffffff');
  Logger.log('Summary added!');
}
