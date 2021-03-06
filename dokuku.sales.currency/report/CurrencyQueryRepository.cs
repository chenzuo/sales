﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using dokuku.sales.currency.model;
using dokuku.sales.config;
using MongoDB.Driver;
using MongoDB.Bson;
using MongoDB.Driver.Builders;

namespace dokuku.sales.currency.report
{
    public class CurrencyQueryRepository : ICurrencyQueryRepository
    {
        MongoCollection<BsonDocument> _collections;
        public CurrencyQueryRepository(MongoConfig mongo)
        {
            _collections = mongo.ReportingDatabase.GetCollection(typeof(Currencies).Name);
        }
        public IEnumerable<Currencies> GetAllCurrency(string ownerId)
        {
            return _collections.FindAs<Currencies>(Query.EQ("OwnerId", ownerId));
        }
        public Currencies GetCurrencyById(Guid id, string ownerId)
        {
            return _collections.FindOneAs<Currencies>(Query.And(Query.EQ("_id", id), Query.EQ("OwnerId", ownerId)));
        }
    }
}
