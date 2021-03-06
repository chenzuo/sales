﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using dokuku.sales.invoices.model;

namespace dokuku.sales.invoices.query
{
    public interface IInvoicesQueryRepository
    {
        IEnumerable<InvoiceReports> Search(string ownerId, string[] keywords);
        IEnumerable<Invoices> AllInvoices(string OwnerId);
        Invoices FindById(Guid id, string ownerId);
        Invoices FindById(Guid guid);
        int CountInvoice(string OwnerId);
        IEnumerable<Invoices> GetDataInvoiceToPaging(string ownerId, int start, int limit);
    }
}