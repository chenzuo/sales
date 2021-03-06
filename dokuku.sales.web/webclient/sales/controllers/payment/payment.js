steal('jquery/controller', 'sales/controllers/payment/payment.css',
    'sales/repository/InvoiceRepository.js',
    'sales/repository/PaymentModeRepository.js',
       'sales/controllers/invoices/list',
       'sales/scripts/jquery-ui-1.8.11.min.js',
       'sales/styles/jquery-ui-1.8.14.custom.css', 'jquery/view/ejs', 'sales/repository/InvoicePaymentRepository.js')
	.then('./views/init.ejs', './views/recordpayment.ejs', 'sales/controllers/invoices/list/views/listinvoice.ejs', './views/confirmPaymentBox.ejs', function ($) {

	    /**
	    * @class Sales.Controllers.Payment
	    */
	    $.Controller('Sales.Controllers.Payment',
	    /** @Static */
{
defaults: (payRepo = null, invRepo = null)
},
	    /** @Prototype */
{
init: function (id) {

    if (typeof id != "object") {

        this.load(id);
    }
    else {

        return false;
    }
},
load: function (id) {
    invRepo = new InvoiceRepository();
    var invoice = invRepo.GetInvoiceById(id);
    payRepo = new InvoicePaymentRepository();
    var paymentMode = payRepo.getAllPaymentMode();
    if (invoice != null) {
        this.element.html(this.view("//sales/controllers/payment/views/recordpayment.ejs", invoice));
    }
    this.SetPaymentMode(paymentMode);
    this.SetDatePicker();
    this.SetDefaultDate();
},
SetPaymentMode: function (PaymentModeData) {
    $.each(PaymentModeData, function (item) {
        $("#vPaymentMethod").append("<option value=" + PaymentModeData[item]._id + ">" +
        " " + PaymentModeData[item].Name + "</option>");
    });
},
SetDatePicker: function () {
    var dates = $("#PayDate").datepicker({ dateFormat: 'dd M yy',
        defaultDate: "+1w",
        changeMonth: true,
        numberOfMonths: 1,
        onSelect: function (selectedDate) {
            var option = this.id == "PayDate" ? "" : "",
					instance = $(this).data("datepicker"),
					date = $.datepicker.parseDate(
						instance.settings.dateFormat ||
						$.datepicker._defaults.dateFormat,
						selectedDate, instance.settings);
            if (this.id == "PayDate") {
                var currdate = new Date(date);
                currdate.setDate(currdate.getDate());
                dates.not(this).val($.datepicker.formatDate('dd M yy', currdate));
            }
        }
    });
},
SetDefaultDate: function () {
    var currdate = new Date();
    var dueDate = currdate;
    $("#PayDate").val($.datepicker.formatDate('dd M yy', currdate));
},
'#PayButton click': function () {
    Payment = new Object();

    if ($('#valueBankCharges').val() == "") {
        Payment.BankCharge = 0;
    }
    else {
        Payment.BankCharge = $('#valueBankCharges').val();
    }
    var _id = $('#vPaymentMethod').val();

    Payment.AmountPaid = $('#vAmountReceived').val();
    Payment.InvoiceId = $('#InvoiceId').val();
    Payment.PaymentDate = $('#PayDate').val();
    Payment.PaymentMode = this.createObjectPaymentMode(this.getPaymentModeData(_id));
    Payment.Reference = $('#vReference').val();
    Payment.Notes = $('#valueNotes').val();   
    var PaymentRepo = new InvoicePaymentRepository();
    var dataRepo = PaymentRepo.pay(Payment);
    if ($('#checkEmail').is(':checked')) {
        PaymentRepo.sendToEmail($('vEmail').text().trim());
    }
    $('#body').sales_invoices_list('load')
},
createObjectPaymentMode: function (dataPaymentMode) {
    var PaymentMode = new Object();
    PaymentMode.Id = $('#vPaymentMethod').val().trim();
    PaymentMode.Code = dataPaymentMode.Code;
    PaymentMode.Name = dataPaymentMode.Name;
    return PaymentMode;
},
getPaymentModeData: function (paymentmodeid) {
    return new PaymentModeRepository().getPaymentModeById(paymentmodeid);
},
'#tax click': function () {
    $("AmountWithheld").empty();
    var checked = $('#tax').is(':checked');
    if (checked) {
        $("AmountWithheld").append("<label id='lbl-withheld' class='cls-withheld' >Jumlah yang ditanggung</label><br><input type='text' name='AmountWittheld' id='vAmountWittheld' class='cls-withheld'/>");
    };
},
'#checkEmail click': function () {
    var checked = $('#checkEmail').is(':checked');
    if (checked) {

    };
},
"#btnCancelInvoice click": function () {
    $("#body").append(this.view("//sales/controllers/payment/views/confirmPaymentBox.ejs"));
},
"#confirmPaymentYes click": function () {

    $(".ModalDialog").remove();
    $("#body").sales_invoices_list()
    //$(".checkBoxItem")
    $('#body').sales_invoices_list('load')
    // $this.ChangePage();
},
"#confirmPaymentNo click": function () {
    $('.ModalDialog').remove();
}
})
	});

  