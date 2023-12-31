const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const cors = require('cors');
require('dotenv').config();

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5500;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;

const uri = `mongodb+srv://${dbUser}:${dbPassword}@cluster0.o7krr.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const mmCartProductCollection = client.db('mmCart').collection('products');
    const mmCartCartCollection = client.db('mmCart').collection('cartItems');
    app.get('/', (req, res) => {
      res.send('Welcome to the home route!');
    });

    app.post('/add-product', async (req, res) => {
      console.log(req.body);
      const response = await mmCartProductCollection.insertOne(req.body);
      res.send(response);
    });

    app.get('/cartItems/:uid', async (req, res) => {
      const response = await mmCartCartCollection.find({ uId: req.params.uid }).toArray();
      res.send(response);
    });

    app.post('/cartItems', async (req, res) => {
      const response = await mmCartCartCollection.insertOne(req.body);
      res.send(response);
    });

    app.delete('/cartItems/:id', async (req, res) => {
      const response = await mmCartCartCollection.deleteOne({ _id: new ObjectId(req.params.id) });
      res.send(response);
    });

    app.get('/products/product-details/:id', async (req, res) => {
      console.log(req.params.id);
      const response = await mmCartProductCollection.findOne({ _id: new ObjectId(req.params.id) });
      res.send(response);
    });

    app.put('/products/product-update/:id', async (req, res) => {
      const { image, name, brandName, type, price, shortDescription, rating } = req.body;
      const response = await mmCartProductCollection.findOneAndUpdate({ _id: new ObjectId(req.params.id) }, { $set: { image, name, brandName, type, price, shortDescription, rating } });
      res.send(response);
    });

    app.get('/products/:name', async (req, res) => {
      console.log(req.params.name);
      const response = await mmCartProductCollection
        .find({
          brandName: { $regex: new RegExp(req.params.name, 'i') }
        })
        .toArray();
      res.send(response);
    });

    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log('Pinged your deployment. You successfully connected to MongoDB!');
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
