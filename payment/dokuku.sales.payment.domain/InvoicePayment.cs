﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Ncqrs.Domain;
using System.Diagnostics.Contracts;
using Ncqrs;
using dokuku.sales.payment.events;
using dokuku.sales.payment.common;
namespace dokuku.sales.payment.domain
{
    public class InvoicePayment : AggregateRootMappedByConvention
    {
        #region Domain state

        private decimal _amount;
        private decimal _balanceDue;
        private DateTime _invoiceDate;
        private string _ownerId;
        private IList<PaymentRecord> _paymentRecords = new List<PaymentRecord>();

        #endregion

        #region Temporary calculation
        private decimal _balanceDueCalculationResult;
        #endregion

        #region Command handler

        public InvoicePayment(string ownerId, Guid invoiceId, string invoiceNumber, DateTime invoiceDate, decimal amount, string username) : base(invoiceId)
        {
            ApplyEvent(new InvoicePaymentCreated() {
                 InvoiceId = invoiceId,
                 InvoiceNumber = invoiceNumber,
                 InvoiceDate = invoiceDate,
                 Amount = amount,
                 BalanceDue = amount,
                 PaidOff = false,
                 OwnerId = ownerId,
                 Username = username
            });
        }
        public void PayInvoice(Guid paymentId, 
            decimal amountPaid, decimal bankCharge, 
            DateTime paymentDate, PaymentMode paymentMode, 
            string reference, string notes, string username)
        {
            Contract.Requires(amountPaid > 0m, "Jumlah yang dibayarkan tidak boleh nol");
            Contract.Requires(paymentDate.Date >= InvoiceDate, "Pembayaran hanya bisa dilakukan setelah atau pada hari yang bersamaan dengan tanggal invoice");
            Contract.Requires(amountPaid <= BalanceDue, "Jumlah yang dibayarkan melebihi sisa hutang yang harus dibayarkan");

            decimal balDue = _balanceDue - amountPaid;
            bool paidOff = balDue == 0m;

            ApplyEvent(new InvoicePaid
            {
                InvoiceId = this.EventSourceId,
                PaymentId = paymentId,
                PaymentDate = paymentDate,
                AmountPaid = amountPaid,
                BankCharge = bankCharge,
                PaymentMode = paymentMode,
                Reference = reference,
                Notes = notes,
                BalanceDue = balDue,
                PaidOff = paidOff,
                OwnerId = _ownerId,
                Username = username
            });
        }
        public void ChangeAmountPaid(Guid paymentId, decimal amountPaid, string username)
        {
            Contract.Requires(amountPaid > 0m, "Jumlah yang dibayarkan tidak boleh nol");
            Contract.Requires(RevisedPaymentExist(paymentId), "Pembayaran yang anda edit tidak ditemukan");
            Contract.Ensures(_balanceDueCalculationResult >= 0, "Jumlah yang dibayarkan melebihi sisa hutang yang harus dibayarkan");

            PaymentRecord pr = _paymentRecords.Where(p => p.PaymentId == paymentId).FirstOrDefault();
            decimal revisedBalance = _balanceDue + pr.AmountPaid;
            _balanceDueCalculationResult = revisedBalance - amountPaid;
            bool paidOff = _balanceDueCalculationResult == 0m;

            ApplyEvent(new AmountPaidChanged
            {
                OwnerId = this._ownerId,
                InvoiceId = this.EventSourceId,
                PaymentId = paymentId,
                AmountPaid = amountPaid,
                BalanceDue = _balanceDueCalculationResult,
                PaidOff = paidOff,
                Username = username
            });
        }
        public void ChangeBankCharge(Guid paymentId, decimal bankCharge, string username)
        {
            Contract.Requires(RevisedPaymentExist(paymentId));
            Contract.Requires( bankCharge > 0m, "Biaya bank tidak boleh nol");

            ApplyEvent(new BankChargeChanged{
                InvoiceId = this.EventSourceId,
                PaymentId = paymentId,
                BankCharge = bankCharge,
                OwnerId = this._ownerId,
                Username = username
            });
        }
        public void ChangePaymentMode(Guid paymentId, PaymentMode paymentMode, string username)
        {
            Contract.Requires(RevisedPaymentExist(paymentId));

            ApplyEvent(new PaymentModeChanged
            {
                OwnerId = this._ownerId,
                InvoiceId = this.EventSourceId,
                PaymentId = paymentId,
                PaymentMode = paymentMode,
                Username = username
            });
        }
        public void ChangePaymentDate(Guid paymentId, DateTime paymentDate, string username)
        {
            Contract.Requires(RevisedPaymentExist(paymentId));

            ApplyEvent(new PaymentDateChanged
            {
                OwnerId = this._ownerId,
                InvoiceId = this.EventSourceId,
                PaymentId = paymentId,
                PaymentDate = paymentDate,
                Username = username
            });
        }
        public void CorrectReference(Guid paymentId, string reference, string username)
        {
            Contract.Requires(RevisedPaymentExist(paymentId));

            ApplyEvent(new ReferenceCorrected
            {
                OwnerId = this._ownerId,
                InvoiceId = this.EventSourceId,
                PaymentId = paymentId,
                Reference = reference,
                Username = username
            });
        }
        public void CorrectNotes(Guid paymentId, string notes, string username)
        {
            Contract.Requires(RevisedPaymentExist(paymentId));

            ApplyEvent(new NotesCorrected
            {
                OwnerId = this._ownerId,
                InvoiceId = this.EventSourceId,
                PaymentId = paymentId,
                Notes = notes,
                Username = username
            });
        }

        #endregion

        #region Event handler

        private void OnInvoicePaymentCreated(InvoicePaymentCreated @event)
        {
            _amount = @event.Amount;
            _balanceDue = @event.BalanceDue;
            _invoiceDate = @event.InvoiceDate.Date;
            _ownerId = @event.OwnerId;
        }
        private void OnInvoicePaid(InvoicePaid @event)
        {
            _balanceDue = @event.BalanceDue;
            _paymentRecords.Add(new PaymentRecord(@event.PaymentId, @event.AmountPaid));
        }
        private void OnAmountPaidChanged(AmountPaidChanged @event)
        {
            _balanceDue = @event.BalanceDue;
            PaymentRecord pr = _paymentRecords.Where(p => p.PaymentId == @event.PaymentId).FirstOrDefault();
            pr.AmountPaid = @event.AmountPaid;
        }
        private void OnBankChargeChanged(BankChargeChanged @event)
        {
        }
        private void OnPaymentModeChanged(PaymentModeChanged @event)
        {

        }
        private void OnPaymentDateChanged(PaymentDateChanged @event)
        {

        }
        private void OnReferenceCorrected(ReferenceCorrected @event)
        {

        }
        private void OnNotesCorrected(NotesCorrected @event)
        {
        }

        #endregion

        public InvoicePayment()
        {
        }
        public DateTime InvoiceDate { get { return _invoiceDate.Date; } }
        public decimal BalanceDue { get { return _balanceDue; } }
        public bool RevisedPaymentExist(Guid revisedPaymentId)
        {
            return _paymentRecords.Where(p => p.PaymentId == revisedPaymentId).FirstOrDefault() != null;
        }

        class PaymentRecord
        {
            public Guid PaymentId { get; private set; }
            public decimal AmountPaid { get; set; }

            public PaymentRecord(Guid paymentRecordId, decimal amountPaid)
            {
                this.PaymentId = paymentRecordId;
                this.AmountPaid = amountPaid;
            }
        }
    }
}