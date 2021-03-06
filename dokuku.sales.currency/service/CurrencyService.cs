﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using dokuku.sales.config;
using MongoDB.Bson;
using MongoDB.Driver;
using dokuku.sales.currency.model;
using NServiceBus;
using Newtonsoft.Json;
using dokuku.sales.currency.messages;
using MongoDB.Driver.Builders;

namespace dokuku.sales.currency.service
{
    public class CurrencyService : ICurrencyService
    {
        MongoCollection<BsonDocument> _collections;
        IBus _bus;
        public CurrencyService(MongoConfig mongo,IBus bus)
        {
            _collections = mongo.MongoDatabase.GetCollection(typeof(Currencies).Name);
            _bus = bus;
        }

        public Currencies Create(string data, string ownerId)
        {
            Currencies ccy = JsonConvert.DeserializeObject<Currencies>(data);
            ccy.OwnerId = ownerId;
            ccy._id = Guid.NewGuid();
            _collections.Save(ccy);

            if (_bus != null)
                _bus.Publish(new CurrencyCreated { CurrenciesCreatedJson = ccy.ToJson() });
            return ccy;
        }

        public void UpdateCurrency(string currenciesJson, string ownerId)
        {
            Currencies ccy = Newtonsoft.Json.JsonConvert.DeserializeObject<Currencies>(currenciesJson);
            ccy.OwnerId = ownerId;

            _collections.Save<Currencies>(ccy);

            if (_bus != null)
                _bus.Publish<CurrenciesUpdated>(new CurrenciesUpdated { CurrenciesUpdatedJson = ccy.ToJson() });
        }

        public void Delete(Guid id)
        {
            _collections.Remove(Query.EQ("_id", id));

            if (_bus != null)
                _bus.Publish(new CurrencyDeleted { Id = id });
        }
    }
}
