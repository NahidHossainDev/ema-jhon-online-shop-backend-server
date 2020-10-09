const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require("dotenv").config();

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("i am on")
})

const MongoClient = require("mongodb").MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.b31bz.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const productCollection = client.db(`${process.env.DB_NAME}`).collection("products");
  const orderCollection = client.db(`${process.env.DB_NAME}`).collection("orders");

  app.post("/addProduct", (req, res) => {
    productCollection.insertOne(req.body)
      .then((result) => {
        res.send(result.insertedCount > 0);
     });
  });
  

  app.get('/products', (req, res) => {
    const search = req.query.search;
    productCollection.find({name:{$regex:search}})
      .toArray((err, document) => {
      res.send(document)
    })
  })

  app.get('/productDetail/:key', (req, res) => {
    productCollection.find({key:req.params.key})
      .toArray((err, document) => {
        res.send(document[0]);
      })
  })

  app.post("/findProductsByKeys", (req, res) => {
    productCollection.find({ key:{ $in:req.body} })
      .toArray((err, document) => {
        res.send(document);
    })
  });

  app.post('/orders', (req, res) => {
    orderCollection.insertOne(req.body)
      .then(result => {
      res.send(result.insertedCount>0)
    })
  })


});


app.listen(process.env.PORT || 5000)