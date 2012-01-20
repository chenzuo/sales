﻿using System;
using System.Collections.Generic;
using System.Linq;  
using System.Text;
namespace dokuku.sales.organization.model
{
    public class Organization
    {
        public string _id { get; set; }
        public string OwnerId { get; set; }
        public string Name { get; set; }
        public string Currency { get; set; }
        public int FiscalYearPeriod { get; set; }

        public Organization(string id, string ownerId, string name, string ccy, int fiscalYearPeriod)
        {
            _id = id;
            OwnerId = ownerId;
            Name = name;
            Currency = ccy;
            FiscalYearPeriod = fiscalYearPeriod;
        }
    }
}