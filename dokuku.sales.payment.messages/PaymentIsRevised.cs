﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using NServiceBus;

namespace dokuku.sales.payment.messages
{
    public class PaymentIsRevised : IMessage
    {
        public string PaymentRevisedJson { get; set; }
    }
}