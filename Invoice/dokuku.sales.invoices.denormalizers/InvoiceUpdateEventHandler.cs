﻿//using System;
//using NServiceBus;
//using Ncqrs.NServiceBus;
//using dokuku.sales.invoices.events;
//using MongoDB.Driver;
//using dokuku.sales.config;
//using MongoDB.Bson;
//namespace dokuku.sales.invoices.denormalizers
//{
//    public class InvoiceUpdateEventHandler : IMessageHandler<EventMessage<InvoiceUpdated>>
//    {
//        public MongoConfig Mongo { get; set; }
//        public void Handle(EventMessage<InvoiceUpdated> message)
//        {
//            BsonDocument doc = message.Payload.ToBsonDocument();
//            doc["_id"] = message.Payload.InvoiceId;
//            Collection.Save(doc);
//        }
//        private MongoCollection Collection
//        {
//            get
//            {
//                return Mongo.ReportingDatabase.GetCollection(invoiceresources.InvoiceReportCollectionName);
//            }
//        }
//    }
//}
