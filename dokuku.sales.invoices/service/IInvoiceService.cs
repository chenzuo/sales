﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using dokuku.sales.invoices.model;

namespace dokuku.sales.invoices.service
{
    public interface IInvoiceService
    {
        Invoices Create(string jsonInvoice, string ownerId);
        Invoices Update(string jsonInvoice, string ownerId);
    }
}
