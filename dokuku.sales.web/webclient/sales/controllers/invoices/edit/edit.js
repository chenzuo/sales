steal('jquery/controller',
        'jquery/view/ejs',
	    'jquery/dom/form_params',
        'jquery/controller/view',
        './editinvoices.css',
        'sales/controllers/invoices/Invoice.js',
        'sales/controllers/invoices/AddCustomer.js',
        'sales/controllers/invoices/AddItem.js',
        'sales/scripts/jquery-ui-1.8.11.min.js',
        'sales/styles/jquery-ui-1.8.14.custom.css',
        'sales/repository/ItemRepository.js',
        'sales/repository/CustomerRepository.js',
        'sales/repository/InvoiceRepository.js',
        'sales/models')
	.then('./views/editinvoices.ejs',
            '../create/views/AddCustomer.ejs',
            '../create/views/AddItem.ejs', function ($) {

                $.Controller('Sales.Invoices.Edit',
        {
            defaults: (tabIndexTr = 0,
                        $this = null,
                        inv = null,
                        itmRepo = null,
                        custRepo = null,
                        invRepo = null,
                        baseCcy = null,
                        isDifferentCcy = true)
        },
        {
            init: function (el, ev, id) {
                $this = this;
                itmRepo = new ItemRepository();
                custRepo = new CustomerRepository();
                invRepo = new InvoiceRepository();
                inv = new Invoice();
                this.load(id);
                this.SetCurrency();
            },
            load: function (id) {
                tabIndexTr = 0;
                var invoice = this.GetInvoice(id);
                if (invoice == null)
                    return;
                var term = invoice.Terms;
                var late = invoice.LateFee;
                var count = invoice.Items.length;

                this.ShowCurrencyToView();
                this.element.html("//sales/controllers/invoices/edit/views/editinvoices.ejs", invoice);
                this.ShowExchangRate(invoice.Currency,invoice.BaseCcy, invoice.ExchangeRate);
                if (invoice.BaseCcy != invoice.Currency) {
                    $("#divExchangeRate").show();
                } else {
                    $("#divExchangeRate").hide();
                }
                this.LoadListItem(count, invoice.Items);
                this.SetDatePicker();
                this.selectTerm(term);
                this.selectLateFee(late);
            },
            '#terms change': function (el) {
                var invDate = $("#invDate").val();
                var dueDate = new Date(invDate);
                dueDate.setDate(dueDate.getDate() + parseInt(el.val()));
                $("#dueDate").val($.datepicker.formatDate('dd M yy', dueDate));
            },
            '#tambahPelangganEdit click': function () {
                new ModalDialog("Tambah Pelanggan Baru");
                $("#dialogContent").html(this.view("//sales/controllers/invoices/create/views/AddCustomer.ejs"));
                var addCust = new AddCustomer();
                addCust.TriggerEvent();
            },
            '.additem click': function (el, ev) {
                new ModalDialog("Tambah Barang Baru");
                $("#dialogContent").html(this.view("//sales/controllers/invoices/create/views/AddItem.ejs"));
                var addItem = new AddItem(el.attr("id").split('_')[1]);
                addItem.TriggerEvent();
            },
            '#selectcust change': function (el, ev) {
                /*
                $("#keteranganSelectCust").empty();
                var dataCust = custRepo.GetCustomerByName(el.val());
                if (dataCust != null) {
                $("#selectcust").val(dataCust.Name);
                $("#currency").text(dataCust.Currency).show();
                $("#CustomerIdEdit").val(dataCust._id);
                return;
                }
                $("#currency").hide();
                $("#keteranganSelectCust").text("Pelanggan '" + el.val() + "' tidak ditemukan");
                $("#selectcust").focus().select();
                */
            },
            '#addItemRowEdit click': function () {
                this.CreateListItem(1);
            },
            '#itemInvoice tbody tr hover': function (el) {
                var index = el.attr('tabindex');
                $("#deleteItem_" + index).show();
            },
            "#itemInvoice tbody tr mouseleave": function (el) {
                var index = el.attr("tabindex");
                $("#deleteItem_" + index).hide();
            },
            ".clsDeleteItem click": function (el) {
                if ($("#itemInvoice > tbody > tr").size() == 1)
                    return;
                var index = el.attr('id').split('_')[1];
                $("#itemInvoice tbody tr#tr_" + index + "").remove();
                inv.GetSubTotal();
            },
            '.partname change': function (el) {
                var partName = el.val();
                var index = el.attr("id").split('_')[1];
                var part = itmRepo.GetItemByName(partName);
                if (part != null) {
                    inv.ShowListItem(part, index);
                    this.GetSubTotal();
                    this.GetTotal();
                    $("#additem_" + index).hide();
                    return;
                }
                this.ClearItemField(index);
                $("#additem_" + index).show();
                this.GetSubTotal();
                this.GetTotal();
                $("#itemInvoice tbody tr#tr_" + index).addClass('errItemNotFound');
            },
            '.quantity change': function (el) {
                this.CalculateItem(el);
            },
            '.price change': function (el) {
                this.CalculateItem(el);
            },
            '.discount change': function (el) {
                this.CalculateItem(el);
            },
            '#formUpdateIvoice submit': function (el, ev) {
                ev.preventDefault();
                inv.UpdateInvoice();
            },
            '#btnCancelInvoice click': function () {
                $("#body").sales_invoices_list('load');
            },
            '#custRate change': function () {
                inv.CalculateByRate($("#custRate").val());
            },
            CalculateItem: function (element) {
                var index = element.attr("id").split('_')[1];
                var qty = $("#qty_" + index).val();
                //var rate = $("#baseprice_" + index).val() / $("#custRate").val();
                var rate = $("#rate_" + index).val();
                var disc = $("#disc_" + index).val();
                var amount = inv.CalculateAmountPerItem(qty, rate, disc);
                $("#amount_" + index).val(amount);
                $("#amounttext_" + index).text(String.format("{0:C}", amount));
                this.GetSubTotal();
                this.GetTotal();
            },
            ClearItemField: function (index) {
                $("#desc_" + index).empty();
                $("#qty_" + index).val('');
                $("#rate_" + index).val('');
                $("#disc_" + index).val('');
                $("#amounttext_" + index).empty();
                $("#amount_" + index).val('');
            },
            LoadTax: function (index) {
                $("#taxed_" + index).append("<option value=1>None</option>");
            },
            CreateListItem: function (count) {
                var i = 0;
                while (count > 0) {
                    $("#itemInvoice tbody").append("<tr id='tr_" + tabIndexTr + "' tabindex='" + tabIndexTr + "'>" +
                                    "<td><input type='text' name='part' class='partname' id='part_" + tabIndexTr + "'/>" +
                                    "<input type='hidden' class='partid' id='partid_" + tabIndexTr + "'/>" +
                                    "<label class='additem' id='additem_" + tabIndexTr + "'>Tambah Barang</label></td>" +
                                    "<td><textarea name='description' class='description' id='desc_" + tabIndexTr + "'></textarea></td>" +
                                    "<td><input type='text' name='quantity' class='quantity right' id='qty_" + tabIndexTr + "'></input></td>" +
                                    "<td><input type='text' name='price' class='price right' id='rate_" + tabIndexTr + "'></input>" +
                                    "<input type='hidden' class='baseprice' id='baseprice_" + tabIndexTr + "'/></td>" +
                                    "<td><input type='text' name='discount' class='discount right' id='disc_" + tabIndexTr + "'></input></td>" +
                                    "<td><select name='taxed' class='taxed' id='taxed_" + tabIndexTr + "'>" +
                                    "</select></td>" +
                                    "<td class='right'><span class='amounttext' id='amounttext_" + tabIndexTr + "'></span>" +
                                    "<input type='hidden' class='amount' id='amount_" + tabIndexTr + "'/></td>" +
                                    "<td valign='middle'><div class='clsDeleteItem' id='deleteItem_" + tabIndexTr + "'>X</div></td></tr>");
                    this.LoadTax(tabIndexTr);
                    i++;
                    count--;
                    tabIndexTr++;
                }
            },
            LoadListItem: function (count, item) {
                var i = 0;
                while (count > 0) {
                    $("#itemInvoice tbody").append("<tr id='tr_" + tabIndexTr + "' tabindex='" + tabIndexTr + "'>" +
                                    "<td><input type='text' name='part' class='partname' id='part_" + tabIndexTr + "' value='" + item[i].PartName + "'/>" +
                                    "<input type='hidden' class='partid' id='partid_" + tabIndexTr + "'  value='" + item[i].ItemId + "' />" +
                                    "<label class='additem' id='additem_" + tabIndexTr + "'>Tambah Barang</label></td>" +
                                    "<td><textarea name='description' class='description' id='desc_" + tabIndexTr + "'>" + item[i].Description + "</textarea></td>" +
                                    "<td><input type='text' name='quantity' class='quantity right' id='qty_" + tabIndexTr + "' value='" + item[i].Qty + "'></input></td>" +
                                    "<td><input type='text' name='price' class='price right' id='rate_" + tabIndexTr + "' value='" + item[i].Rate + "'></input>" +
                                    "<input type='hidden' class='baseprice' id='baseprice_" + tabIndexTr + "' value='" + item[i].BaseRate + "'/></td>" +
                                    "<td><input type='text' name='discount' class='discount right' id='disc_" + tabIndexTr + "' value='" + item[i].Discount + "'></input></td>" +
                                    "<td><select name='taxed' class='taxed' id='taxed_" + tabIndexTr + "'>" +
                                    "</select></td>" +
                                    "<td class='right'><span class='amounttext' id='amounttext_" + tabIndexTr + "'>" + String.format("{0:C}", item[i].Amount) + "</span>" +
                                    "<input type='hidden' class='amount' id='amount_" + tabIndexTr + "' value='" + item[i].Amount + "'/></td>" +
                                    "<td valign='middle'><div class='clsDeleteItem' id='deleteItem_" + tabIndexTr + "'>X</div></td></tr>");
                    this.LoadTax(tabIndexTr);
                    i++;
                    count--;
                    tabIndexTr++;
                }
                inv.GetSubTotal();
                inv.GetTotal();
            },
            GetSubTotal: function () {
                var subtotal = inv.CalculateSubTotal();
                $("#subtotaltext").text(String.format("{0:C}", subtotal));
                $("#subtotal").val(subtotal);
            },
            GetTotal: function () {
                var total = inv.CalculateTotal();
                $("#totaltext").text(String.format("{0:C}", total));
                $("#total").val(total);
            },
            GetInvoice: function (id) {
                var invoice = invRepo.GetInvoiceById(id);
                var InvoiceDate = new Date(parseInt(invoice.InvoiceDate.replace(/\/Date\((-?\d+)\)\//, '$1')));
                var DueDate = new Date(parseInt(invoice.DueDate.replace(/\/Date\((-?\d+)\)\//, '$1')));
                invoice.InvoiceDate = $.datepicker.formatDate('dd M yy', InvoiceDate);
                invoice.DueDate = $.datepicker.formatDate('dd M yy', DueDate);
                return invoice;
            },
            SetDatePicker: function () {
                var dates = $("#invDate, #dueDate").datepicker({ dateFormat: 'dd M yy',
                    defaultDate: "+1w",
                    changeMonth: true,
                    numberOfMonths: 1,
                    onSelect: function (selectedDate) {
                        var option = this.id == "invDate" ? "" : "",
					instance = $(this).data("datepicker"),
					date = $.datepicker.parseDate(
						instance.settings.dateFormat ||
						$.datepicker._defaults.dateFormat,
						selectedDate, instance.settings);
                        if (this.id == "invDate") {
                            var currdate = new Date(date);
                            var term = $("#terms").val();
                            currdate.setDate(currdate.getDate() + parseInt(term));
                            dates.not(this).val($.datepicker.formatDate('dd M yy', currdate));
                        }
                    }
                });
            },
            selectTerm: function (term) {
                $('.TermOpt').each(function (index) {
                    if ($(this).val() == term) {
                        $(this).attr('selected', true);
                    }
                });
            },
            selectLateFee: function (LateFee) {
                $('.LateFeeOpt').each(function (index) {
                    if ($(this).val() == LateFee) {
                        $(this).attr('selected', true);
                    }
                });
            },
            SetCurrency: function () {
                Sales.Models.Currency.findOne({ id: '1' }, function (data) {
                    baseCcy = data.curr;
                });
            },
            ShowCurrencyToView: function () {
                $("#curr").text(baseCcy);
            },
            ShowExchangRate: function (custCcy, baseCcy,ExchangeRate) {
                $("#curr").text(custCcy);
                $("#custCcy").val("1 " + custCcy + " =");
                $("#baseCcy").val(baseCcy);
                $("#custCcyCode").val(custCcy);
                if (ExchangeRate != 1)
                    $("#custRate").val(ExchangeRate); 
            }
        })
            });