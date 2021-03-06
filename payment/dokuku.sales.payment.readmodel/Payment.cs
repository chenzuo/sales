﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using dokuku.sales.payment.common;
namespace dokuku.sales.payment.readmodel
{
    [Serializable]
    public class Payment
    {
        public Guid InvoiceId { get; set; }
        public Guid PaymentId { get; set; }
        public string OwnerId { get; set; }
        public decimal AmountPaid { get; set; }
        public decimal BankCharge { get; set; }
        public DateTime PaymentDate { get; set; }
        public PaymentMode PaymentMode { get; set; }
        public string Reference { get; set; }
        public string Notes { get; set; }
        public decimal BalanceDue { get; set; }
        public bool PaidOff { get; set; }
        public Guid _id { get; set; }
    }
}