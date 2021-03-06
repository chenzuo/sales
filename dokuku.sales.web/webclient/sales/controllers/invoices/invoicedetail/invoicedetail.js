steal(
      'sales/controllers/invoices/list/DeleteConfirmBox.css',
      'sales/controllers/invoices/invoicedetail/invoicedetail.css',
      'jquery/controller', 'jquery/view/ejs',
      'jquery/controller/view')
	.then('./views/invoicedetail.ejs', 'sales/controllers/invoices/list/views/ConfirmWithNote.ejs', function ($) {
	    $.Controller('sales.Controllers.invoices.invoicedetail',
{
    defaults: ($this = null, invo = null, invRepo = null)
},
{
    init: function (el, ev, invoice) {
        this.load(invoice);
        $this = this;
        invo = new Invoiceclass();
        invRepo = new InvoiceRepository();
    },
    load: function (invoice) {
        var inv = this.GetDetailCustomer(invoice);
        invo = new Invoiceclass();
        this.element.html(this.view("//sales/controllers/invoices/invoicedetail/views/invoicedetail.ejs", inv));
        this.GetStatusInvoice(inv.Status);
    },
    '#newinvoicesByDetails click': function () {
        $("#body").sales_invoices_create("load");
    },
    '#menuItemRightUbah click': function () {
        var id = $(".idIvoDetil").attr("id");
        $('#body').sales_invoices_edit('load', id);
    },
    '#menuItemRightCetakKePDF click': function () {
        var id = $(".invoiceDetail").attr("id");
        window.open("/GetDataInvoiceToPDF/" + id, 'Invoice', null, null);
    },
    GetStatusInvoice: function (status) {
        var IsStatus = status;
        if (IsStatus != "Draft") {
            $("#menuItemRightSetujui").remove();
        }
    },
    '#menuItemRightBatal click': function () {
        var InvID = $(".idIvoDetil").attr("id");
        $(".BodyConfirmMassage").remove();
        var message = $("<div>Apakah anda yakin akan membatalkan faktur ini</div>" +
                                    "<div><input type='hidden' id='invID' value='" + InvID + "'/></div>" +
                                    "<div><br>Catatan: <textarea name='NoteCancel' id='NoteCancelDetail' class='NoteCancelTxtArea'></textarea></div>" +
                                    "<div class='buttonDIV'><div class='ButtonConfirm CancelYesDetail'>Ya</div>" +
                                    "<div class='ButtonConfirm CancelNoDetail' id='Close'>Tidak</div></div>");
        $("#body").append(this.view("//sales/controllers/invoices/list/views/ConfirmWithNote.ejs"));
        $(".BodyConfirmMassage").append(message);
    },

    '.CancelYesDetail click': function () {
        var result;
        var Note = $("#NoteCancelDetail").val().trim();
        var no = $("#invID").val();

        if (Note.length < 1) {
            $("#errorCancelInv").text("Catatan Batal harus diisi").show();
            return false;
        }
        result = inv.CancelInvoiceByID(no, Note);

        if (result.error == true) {
            $(".BodyConfirmMassage").empty();
            var message = $("<div class='deleteConfirmMessage'>" + result.message + "</div>" +
                                    "<div class='buttonDIV'><div class='ButtonConfirm Close' id='Close'>Tutup Pesan</div></div>");
            $(".BodyConfirmMassage").append(message);
            return false;
        }
        if (result.error == false) {
            $(".DeleteConfirmation").remove();
            $("#body").sales_invoices_list('load');
        }
    },

    '#menuItemRightBatalPaksa click': function () {
        var InvID = $(".idIvoDetil").attr("id");
        $(".BodyConfirmMassage").remove();
        var message = $("<div>Apakah anda yakin akan membatalkan secara paksa faktur ini</div>" +
                                    "<div><input type='hidden' id='invID' value='" + InvID + "'/></div>" +
                                    "<div><br>Catatan: <textarea name='NoteCancel' id='NoteForceCancelDetail' class='NoteCancelTxtArea'></textarea></div>" +
                                    "<div class='buttonDIV'><div class='ButtonConfirm ForceCancelYesDetail'>Ya</div>" +
                                    "<div class='ButtonConfirm ForceCancelNoDetail' id='Close'>Tidak</div></div>");
        $("#body").append(this.view("//sales/controllers/invoices/list/views/ConfirmWithNote.ejs"));
        $(".BodyConfirmMassage").append(message);
    },

    '.ForceCancelYesDetail click': function () {
        var result;
        var Note = $("#NoteForceCancelDetail").val().trim();
        var no = $("#invID").val();

        if (Note.length < 1) {
            $("#errorCancelInv").text("Catatan Batal harus diisi").show();
            return false;
        }
        result = inv.ForceCancelInvoiceByID(no, Note);

        if (result.error == true) {
            $(".BodyConfirmMassage").empty();
            var message = $("<div class='deleteConfirmMessage'>" + result.message + "</div>" +
                                    "<div class='buttonDIV'><div class='ButtonConfirm Close' id='Close'>Tutup Pesan</div></div>");
            $(".BodyConfirmMassage").append(message);
            return false;
        }


        if (result.error == false) {
            $(".DeleteConfirmation").remove();
            $("#body").sales_invoices_list('load');
        }
    },
    '#menuItemRightHapus click': function () {
        var InvID = $(".idIvoDetil").attr("id");
        $(".BodyConfirmMassage").remove();
        var message = $("<div>Apakah anda yakin akan menghapus faktur ini</div>" +
                                    "<div><input type='hidden' id='invID' value='" + InvID + "'/></div>" +
                                    "<div class='buttonDIV'><div class='ButtonConfirm DeleteYesDetail'>Ya</div>" +
                                    "<div class='ButtonConfirm DeleteNoDetail' id='Close'>Tidak</div></div>");
        $("#body").append(this.view("//sales/controllers/invoices/list/views/ConfirmWithNote.ejs"));
        $(".BodyConfirmMassage").append(message);
    },

    '.DeleteYesDetail click': function () {
        var result;
        var no = $("#invID").val();
        result = inv.DeleteInvoice(no);

        if (result.error == true) {
            $(".BodyConfirmMassage").empty();
            var message = $("<div class='deleteConfirmMessage'>" + result.message + "</div>" +
                                    "<div class='buttonDIV'><div class='ButtonConfirm Close' id='Close'>Tutup Pesan</div></div>");
            $(".BodyConfirmMassage").append(message);
            return false;
        }

        if (result.error == false) {
            $(".DeleteConfirmation").remove();
            $("#body").sales_invoices_list('load');
        }
    },
    GetStatusInvoice: function (status) {
        var IsStatus = status;
        if (IsStatus != "Draft") {
            $("#menuItemRightSetujui").remove();
            $("#menuItemRightHapus").remove();
            $("#menuItemRightUbah").remove();
        }
        if (IsStatus != "Belum Bayar") {
            $("#menuItemRightBatal").remove();
            $("#menuItemRightUbah").remove();
        }
        if (IsStatus != "Belum Lunas") {
            $("#menuItemRightBatalPaksa").remove();
        }
    },
    GetDetailCustomer: function (invoice) {
        $.ajax({
            type: 'GET',
            url: '/GetDataCustomer/' + invoice.CustomerId,
            dataType: 'json',
            async: false,
            success: function (data) {
                invoice.InvoiceDate = new Date(parseInt(invoice.InvoiceDate.replace(/\/Date\((-?\d+)\)\//, '$1')));
                invoice.DueDate = new Date(parseInt(invoice.DueDate.replace(/\/Date\((-?\d+)\)\//, '$1')));
                invoice.InvoiceDate = $.datepicker.formatDate('dd M yy', invoice.InvoiceDate);
                invoice.DueDate = $.datepicker.formatDate('dd M yy', invoice.DueDate);
                invoice.Email = data.Email;
                invoice.BillingAddress = data.BillingAddress;
                invoice.City = data.City;
                invoice.Province = data.Province;
                invoice.PostalCode = data.PostalCode;
                invoice.State = data.State;
            }
        });
        return invoice;
    },
    SetCurrencyToView: function () {
        Sales.Models.Currency.findOne({ id: '1' }, function (data) {
            $(".ccy").text(data.curr);
        });
    }
})

	});