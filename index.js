
const express = require('express');
const cors = require('cors')

require('dotenv').config()
const port = process.env.PORT || 5000
const app = express();
app.use(cors());
app.use(express.json())
// ///////




const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.idv3iik.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.get('/', (req, res) => {
  res.send('Server is working')
})
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection

    const toysCollection = client.db("toyCollection").collection("allToys");

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    /////////////////////////////////



    app.post('/addToys', async (req, res) => {
      const body = req.body;
      const result = await toysCollection.insertOne(body)
      res.send(result)
    })

    app.get('/allToys', async (req, res) => {
      const result = await toysCollection.find({}).toArray();
      res.send(result)
    })

    app.get('/allToys/:id', async (req, res) => {
      const id = req.params.id;
      if (id != "") {
        const result = await toysCollection.find({ toyCategory: id }).toArray();
        return res.send(result)
      }
      else {
        const result = await toysCollection.find({}).toArray();
        return res.send(result)
      }
    })


    app.get('/singleToy/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toysCollection.findOne(query)

      res.send(result)
    })
    // all toys-shop
    app.get('/allToysShop', async (req, res) => {
      const result = await toysCollection.find({}).limit(20).toArray();
      res.send(result);
    })

    // all toys search data
    app.get('/allToysShop/:search', async (req, res) => {
      const search = req.params.search;
      const result = await toysCollection.find({ toyName: search }).toArray();
      res.send(result);
    })

    // my toys only user filer data
    app.get('/myToys/:email', async (req, res) => {
      const email = req.params.email;
      const result = await toysCollection.find({ sellerEmail: email }).toArray();
      res.send(result)
    })


    // my toys only user delete data
    app.delete('/myToys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toysCollection.deleteOne(query)
      res.send(result)
    })

    // for toy update

    app.put('/updateToys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const updatedToys = req.body;

      // console.log("updated 999", updatedToys, updatedToys.toyName);
      const update = {
        $set: {
          toyPrice: updatedToys.toyPrice,
          toyQuantity: updatedToys.toyQuantity,
          toyDetails: updatedToys.toyDetails,

        }
      }

      const result = await toysCollection.updateOne(query, update)
      res.send(result)
    })


    app.get('/sort/data/:email', async (req, res) => {
      const email = req.params.email;
      const result = await toysCollection.find({ sellerEmail: email }).sort({ "toyPrice": 1 }).toArray()
      res.send(result)
    })

    /////////////////////////////
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




// ////////
app.listen(port, () => {
  console.log("server running at", port)
})