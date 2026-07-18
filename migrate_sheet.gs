// ── ONE-TIME MIGRATION — run once then delete ─────────────────────────
function migrateSheet() {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Sheet1');

  // Clear everything in Sheet1
  sheet.clearContents();

  // New headers
  var headers = ['Date','Name','Phone','Email','Role','Type','CouponUsed',
                 'Discount','ReferredBy','TotalPaid','Activity',
                 'PaymentMethod','TransactionID','InvoiceID'];
  sheet.appendRow(headers);
  sheet.getRange(1,1,1,headers.length).setFontWeight('bold').setBackground('#2c1810').setFontColor('#ffffff');

  // Old registration data
  var old = [
    {Date:'16/07/2026, 12:28:18 pm', Name:'Mujtaba',          Phone:'',            Email:'',                             Type:'Individual', Members:1, GroupMemberNames:'', GroupMemNumB:'', GroupMemberActivities:'', CouponUsed:'MUN27',    Discount:'100%', TotalPaid:'FREE',    Activity:'Trinket Tray',     PaymentMethod:'N/A (Free)', TransactionID:'N/A',          InvoiceID:''},
    {Date:'16/07/2026, 1:28:11 PM',  Name:'Waniya',            Phone:'3459151146',  Email:'rabi.art24@gmail.com',         Type:'Individual', Members:1, GroupMemberNames:'', GroupMemNumB:'', GroupMemberActivities:'', CouponUsed:'FRIEND50', Discount:'50%',  TotalPaid:'Rs. 900', Activity:'Trinket Tray',     PaymentMethod:'easypaisa',  TransactionID:'692575',       InvoiceID:'RD-8WBEKQ'},
    {Date:'16/07/2026, 4:00:11 pm',  Name:'Warisha Ali',       Phone:'3238914131',  Email:'ayeshaashali@gmail.com',       Type:'Group',      Members:4, GroupMemberNames:'Fatima | Sara | Hiba', GroupMemNumB:'03161589169 | 03339152884 | 03330984217', GroupMemberActivities:'Canvas Painting | Canvas Painting | Canvas Painting', CouponUsed:'-', Discount:'50%', TotalPaid:'Rs. 3600', Activity:'Canvas Painting', PaymentMethod:'easypaisa', TransactionID:'52794438123', InvoiceID:'RD-DUV7H6'},
    {Date:'16/07/2026, 10:50:16 pm', Name:'Khadija Arshad',    Phone:'3318844527',  Email:'khadijaarshad.1428@gmail.com', Type:'Individual', Members:1, GroupMemberNames:'', GroupMemNumB:'', GroupMemberActivities:'', CouponUsed:'MUN27',    Discount:'100%', TotalPaid:'FREE',    Activity:'-',                PaymentMethod:'N/A (Free)', TransactionID:'N/A',          InvoiceID:'RD-95AK6W'},
    {Date:'17/07/2026, 7:50:30 PM',  Name:'Abeera asif',       Phone:'3329229923',  Email:'khannoor6112@gmail.com',       Type:'Group',      Members:3, GroupMemberNames:'Muskan khan | Arham', GroupMemNumB:'03115090588 | 03115090588', GroupMemberActivities:'Canvas Painting | Canvas Painting', CouponUsed:'-', Discount:'50%', TotalPaid:'Rs. 2700', Activity:'-', PaymentMethod:'easypaisa', TransactionID:'52852201990', InvoiceID:'RD-CH3PKY'},
    {Date:'17/07/2026, 7:57:31 PM',  Name:'Areeba misal khan', Phone:'3434833196',  Email:'khanoor6112@gmail.com',        Type:'Individual', Members:1, GroupMemberNames:'', GroupMemNumB:'', GroupMemberActivities:'', CouponUsed:'MUN27',    Discount:'100%', TotalPaid:'FREE',    Activity:'-',                PaymentMethod:'easypaisa',  TransactionID:'N/A',          InvoiceID:'RD-K7HDJ2'},
    {Date:'17/07/2026, 11:05:09 PM', Name:'fatiqa muneeeerr',  Phone:'3178556174',  Email:'fatiqa.munir@gmail.com',       Type:'Individual', Members:1, GroupMemberNames:'', GroupMemNumB:'', GroupMemberActivities:'', CouponUsed:'MUN27',    Discount:'100%', TotalPaid:'FREE',    Activity:'-',                PaymentMethod:'N/A (Free)', TransactionID:'N/A',          InvoiceID:'RD-39E6CB'},
    {Date:'18/07/2026, 6:10:27 pm',  Name:'Zara Kaleem',       Phone:'3236989833',  Email:'zarakaleem31@gmail.com',       Type:'Individual', Members:1, GroupMemberNames:'', GroupMemNumB:'', GroupMemberActivities:'', CouponUsed:'MUN27',    Discount:'100%', TotalPaid:'FREE',    Activity:'-',                PaymentMethod:'N/A (Free)', TransactionID:'N/A',          InvoiceID:'RD-FRG6QQ'},
    {Date:'18/07/2026, 6:54:30 pm',  Name:'Joanne',            Phone:'03320377700', Email:'jarakaleem3@gmail.com',        Type:'Group',      Members:3, GroupMemberNames:'Anoosha | Miraj', GroupMemNumB:'03005993236 | 03005955264', GroupMemberActivities:'Canvas Painting | Canvas Painting', CouponUsed:'-', Discount:'50%', TotalPaid:'Rs. 2700', Activity:'-', PaymentMethod:'easypaisa', TransactionID:'52892404755', InvoiceID:'RD-JK7JFM'},
  ];

  old.forEach(function(d) {
    var role    = d.Type === 'Individual' ? 'Individual' : 'Group Lead';
    var isFree  = (d.TotalPaid||'').toString().toUpperCase().includes('FREE');
    var leadAmt = isFree ? '0' : d.TotalPaid;

    // Main person row
    sheet.appendRow([d.Date, d.Name, d.Phone, d.Email, role, d.Type,
                     d.CouponUsed, d.Discount, '-', leadAmt, d.Activity,
                     d.PaymentMethod, d.TransactionID, d.InvoiceID]);

    // Group member rows — amount 0
    if (d.GroupMemberNames && d.GroupMemberNames !== '') {
      var names = d.GroupMemberNames.split(' | ');
      var phones = d.GroupMemNumB.split(' | ');
      var acts   = d.GroupMemberActivities ? d.GroupMemberActivities.split(' | ') : [];
      names.forEach(function(n, i) {
        if (!n.trim()) return;
        sheet.appendRow([d.Date, n.trim(), (phones[i]||'').trim(), '',
                         'Group Member', d.Type, d.CouponUsed, d.Discount, '-',
                         '0', (acts[i]||'Canvas Painting').trim(),
                         d.PaymentMethod, d.TransactionID, d.InvoiceID]);
      });
    }
  });

  // Create/update Summary tab
  buildSummaryTab(ss);

  Logger.log('Migration complete!');
}

function buildSummaryTab(ss) {
  var summSheet = ss.getSheetByName('Summary');
  if (!summSheet) summSheet = ss.insertSheet('Summary');
  summSheet.clearContents();

  summSheet.getRange('A1').setValue('RangDe Registration Summary');
  summSheet.getRange('A1').setFontWeight('bold').setFontSize(14).setBackground('#ca3027').setFontColor('#ffffff');

  summSheet.getRange('A3').setValue('Activity');
  summSheet.getRange('B3').setValue('Count');
  summSheet.getRange('A3:B3').setFontWeight('bold').setBackground('#f0615a').setFontColor('#ffffff');

  summSheet.getRange('A4').setValue('Canvas Painting');
  summSheet.getRange('B4').setFormula('=COUNTIF(Sheet1!K:K,"Canvas Painting")');

  summSheet.getRange('A5').setValue('Trinket Tray');
  summSheet.getRange('B5').setFormula('=COUNTIF(Sheet1!K:K,"Trinket Tray")');

  summSheet.getRange('A7').setValue('Total Registrations');
  summSheet.getRange('B7').setFormula('=COUNTA(Sheet1!B:B)-1');

  summSheet.getRange('A8').setValue('Total Revenue (Rs.)');
  summSheet.getRange('B8').setFormula('=SUMPRODUCT(IFERROR(VALUE(SUBSTITUTE(IF(ISNUMBER(SEARCH("Rs.",Sheet1!J:J)),SUBSTITUTE(Sheet1!J:J,"Rs. ",""),"0"),",","")),0))');

  summSheet.getRange('A7:B8').setFontWeight('bold');
  summSheet.setColumnWidth(1, 220);
  summSheet.setColumnWidth(2, 120);

  Logger.log('Summary tab created!');
}
