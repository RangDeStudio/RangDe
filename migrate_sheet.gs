// ── ONE-TIME MIGRATION — run once then delete ─────────────────────────
function migrateSheet() {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Sheet1');

  sheet.clearContents();

  var headers = ['Date','Name','Email','Phone','Role','Type','CouponUsed',
                 'Discount','ReferredBy','TotalPaid','Activity',
                 'PaymentMethod','TransactionID','InvoiceID'];
  sheet.appendRow(headers);
  sheet.getRange(1,1,1,headers.length).setFontWeight('bold').setBackground('#2c1810').setFontColor('#ffffff');

  var old = [
    {Date:'16/07/2026, 12:28:18 pm', Name:'Mujtaba',          Email:'',                             Phone:'',            Type:'Individual', GroupMemberNames:'', GroupMemNumB:'', GroupMemberActivities:'', CouponUsed:'MUN27',    Discount:'100%', TotalPaid:'FREE',    Activity:'Trinket Tray',     PaymentMethod:'N/A (Free)', TransactionID:'N/A',          InvoiceID:''},
    {Date:'16/07/2026, 1:28:11 PM',  Name:'Waniya',            Email:'rabi.art24@gmail.com',         Phone:'3459151146',  Type:'Individual', GroupMemberNames:'', GroupMemNumB:'', GroupMemberActivities:'', CouponUsed:'FRIEND50', Discount:'50%',  TotalPaid:'Rs. 900', Activity:'Trinket Tray',     PaymentMethod:'easypaisa',  TransactionID:'692575',       InvoiceID:'RD-8WBEKQ'},
    {Date:'16/07/2026, 4:00:11 pm',  Name:'Warisha Ali',       Email:'ayeshaashali@gmail.com',       Phone:'3238914131',  Type:'Group',      GroupMemberNames:'Fatima | Sara | Hiba', GroupMemNumB:'03161589169 | 03339152884 | 03330984217', GroupMemberActivities:'Canvas Painting | Canvas Painting | Canvas Painting', CouponUsed:'-', Discount:'50%', TotalPaid:'Rs. 3600', Activity:'Canvas Painting', PaymentMethod:'easypaisa', TransactionID:'52794438123', InvoiceID:'RD-DUV7H6'},
    {Date:'16/07/2026, 10:50:16 pm', Name:'Khadija Arshad',    Email:'khadijaarshad.1428@gmail.com', Phone:'3318844527',  Type:'Individual', GroupMemberNames:'', GroupMemNumB:'', GroupMemberActivities:'', CouponUsed:'MUN27',    Discount:'100%', TotalPaid:'FREE',    Activity:'-',                PaymentMethod:'N/A (Free)', TransactionID:'N/A',          InvoiceID:'RD-95AK6W'},
    {Date:'17/07/2026, 7:50:30 PM',  Name:'Abeera asif',       Email:'khannoor6112@gmail.com',       Phone:'3329229923',  Type:'Group',      GroupMemberNames:'Muskan khan | Arham', GroupMemNumB:'03115090588 | 03115090588', GroupMemberActivities:'Canvas Painting | Canvas Painting', CouponUsed:'-', Discount:'50%', TotalPaid:'Rs. 2700', Activity:'-', PaymentMethod:'easypaisa', TransactionID:'52852201990', InvoiceID:'RD-CH3PKY'},
    {Date:'17/07/2026, 7:57:31 PM',  Name:'Areeba misal khan', Email:'khanoor6112@gmail.com',        Phone:'3434833196',  Type:'Individual', GroupMemberNames:'', GroupMemNumB:'', GroupMemberActivities:'', CouponUsed:'MUN27',    Discount:'100%', TotalPaid:'FREE',    Activity:'-',                PaymentMethod:'easypaisa',  TransactionID:'N/A',          InvoiceID:'RD-K7HDJ2'},
    {Date:'17/07/2026, 11:05:09 PM', Name:'fatiqa muneeeerr',  Email:'fatiqa.munir@gmail.com',       Phone:'3178556174',  Type:'Individual', GroupMemberNames:'', GroupMemNumB:'', GroupMemberActivities:'', CouponUsed:'MUN27',    Discount:'100%', TotalPaid:'FREE',    Activity:'-',                PaymentMethod:'N/A (Free)', TransactionID:'N/A',          InvoiceID:'RD-39E6CB'},
    {Date:'18/07/2026, 6:10:27 pm',  Name:'Zara Kaleem',       Email:'zarakaleem31@gmail.com',       Phone:'3236989833',  Type:'Individual', GroupMemberNames:'', GroupMemNumB:'', GroupMemberActivities:'', CouponUsed:'MUN27',    Discount:'100%', TotalPaid:'FREE',    Activity:'-',                PaymentMethod:'N/A (Free)', TransactionID:'N/A',          InvoiceID:'RD-FRG6QQ'},
    {Date:'18/07/2026, 6:54:30 pm',  Name:'Joanne',            Email:'jarakaleem3@gmail.com',        Phone:'03320377700', Type:'Group',      GroupMemberNames:'Anoosha | Miraj', GroupMemNumB:'03005993236 | 03005955264', GroupMemberActivities:'Canvas Painting | Canvas Painting', CouponUsed:'-', Discount:'50%', TotalPaid:'Rs. 2700', Activity:'-', PaymentMethod:'easypaisa', TransactionID:'52892404755', InvoiceID:'RD-JK7JFM'},
    {Date:'18/07/2026, 10:42:22 pm', Name:'Noor',              Email:'nt884054@gmail.com',           Phone:'3005494151',  Type:'Group',      GroupMemberNames:'Sadaf | Marosha', GroupMemNumB:'03019869692 | 03139191633', GroupMemberActivities:'Canvas Painting | Canvas Painting', CouponUsed:'-', Discount:'50%', TotalPaid:'Rs. 2700', Activity:'-', PaymentMethod:'easypaisa', TransactionID:'52904864358', InvoiceID:'RD-JRA6MJ'},
  ];

  old.forEach(function(d) {
    var role    = d.Type === 'Individual' ? 'Individual' : 'Group Lead';
    var isFree  = (d.TotalPaid||'').toString().toUpperCase().includes('FREE');
    var leadAmt = isFree ? '0' : d.TotalPaid;

    sheet.appendRow([d.Date, d.Name, d.Email, d.Phone, role, d.Type,
                     d.CouponUsed, d.Discount, '-', leadAmt, d.Activity,
                     d.PaymentMethod, d.TransactionID, d.InvoiceID]);

    if (d.GroupMemberNames && d.GroupMemberNames !== '') {
      var names = d.GroupMemberNames.split(' | ');
      var phones = d.GroupMemNumB.split(' | ');
      var acts   = d.GroupMemberActivities ? d.GroupMemberActivities.split(' | ') : [];
      names.forEach(function(n, i) {
        if (!n.trim()) return;
        sheet.appendRow([d.Date, n.trim(), '', (phones[i]||'').trim(),
                         'Group Member', d.Type, d.CouponUsed, d.Discount, '-',
                         '0', (acts[i]||'-').trim(),
                         d.PaymentMethod, d.TransactionID, d.InvoiceID]);
      });
    }
  });

  buildSummaryTab(ss);
  Logger.log('Migration complete!');
}

function buildSummaryTab(ss) {
  var summSheet = ss.getSheetByName('Summary');
  if (!summSheet) summSheet = ss.insertSheet('Summary');
  summSheet.clearContents();
  summSheet.clearFormats();

  summSheet.getRange('A1').setValue('🪆 Trinket Tray');
  summSheet.getRange('B1').setValue('🎨 Canvas Painting');
  summSheet.getRange('C1').setValue('🎉 100% Free (MUN27)');
  summSheet.getRange('A1:C1').setFontWeight('bold').setFontSize(11)
    .setBackground('#ca3027').setFontColor('#ffffff').setHorizontalAlignment('center');

  summSheet.getRange('A2').setFormula('=IFERROR(FILTER(Sheet1!B:B,Sheet1!K:K="Trinket Tray",Sheet1!B:B<>"",Sheet1!B:B<>"Name"),"")');
  summSheet.getRange('B2').setFormula('=IFERROR(FILTER(Sheet1!B:B,Sheet1!K:K="Canvas Painting",Sheet1!B:B<>"",Sheet1!B:B<>"Name"),"")');
  summSheet.getRange('C2').setFormula('=IFERROR(FILTER(Sheet1!B:B,Sheet1!G:G="MUN27",Sheet1!B:B<>"",Sheet1!B:B<>"Name"),"")');

  summSheet.setColumnWidth(1, 200);
  summSheet.setColumnWidth(2, 200);
  summSheet.setColumnWidth(3, 200);

  // Stats table from column E
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

  Logger.log('Summary tab built!');
}
