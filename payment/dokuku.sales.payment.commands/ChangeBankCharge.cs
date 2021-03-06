﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Ncqrs.Commanding.CommandExecution.Mapping.Attributes;
using dokuku.sales.payment.common;
namespace dokuku.sales.payment.commands
{
    [Serializable]
    [MapsToAggregateRootMethod("dokuku.sales.payment.domain.InvoicePayment, dokuku.sales.payment.domain", "ChangeBankCharge")]
    public class ChangeBankCharge : PaymentCommand
    {
        public decimal BankCharge { get; set; }
    }
}