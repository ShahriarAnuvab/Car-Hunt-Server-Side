const express = require("express");
const cors = require("cors");
const app = express();
const data = require("./data.json");
var jwt = require("jsonwebtoken");

var cookieParser = require("cookie-parser");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
const uri =
  "mongodb+srv://carHunt:JLsBFaGFWOOegBI7@cluster0.knrtjno.mongodb.net/?retryWrites=true&w=majority";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const carCollection = client.db("carDB").collection("car");
    const cartCollection = client.db("carDB").collection("cart");

    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // auth realted api
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });

      res
        .cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
        })
        .send({ success: true });
    });
    app.get("/cars", async (req, res) => {
      let query = {};
      if (req.query?.userEmail) {
        query = { userEmail: req.query.userEmail };
      }
      const result = await carCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/cars", async (req, res) => {
      const newCar = req.body;
      // console.log(newCar)
      const result = await carCollection.insertOne(newCar);
      res.send(result);
    });

    app.get("/cars/:id", async (req, res) => {
      id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await carCollection.findOne(query);
      res.send(result);
    });

    // app.get("cars/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const query = {
    //     _id: new ObjectId(id),
    //   };
    //   const result = await carCollection.findOne(query);
    //   res.send(result);
    // });

    app.delete("/cars/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await carCollection.deleteOne(query);
      res.send(result);
    });

    app.put("/cars/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const oldCar = req.body;
      const options = { upsert: true };
      const updatedCar = {
        $set: {
          brand: oldCar.brand,
          car: oldCar.car,
          price: oldCar.price,
          rating: oldCar.rating,
          category: oldCar.category,
          description: oldCar.description,
          image: oldCar.image,
          brandImage: oldCar.brandImage,
        },
      };
      const result = await carCollection.updateOne(filter, updatedCar, options);
      res.send(result);
    });

    app.post("/cart", async (req, res) => {
      const { _id, ...cart } = req.body;
      const result = await cartCollection.insertOne(cart);
      res.send(result);
    });

    app.get("/cart", async (req, res) => {
      console.log("TOK TOK TOK", req.cookies.token);
      console.log(req.query.userEmail);
      let query = {};
      if (req.query?.userEmail) {
        query = { userEmail: req.query.userEmail };
      }
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    });

    app.delete("/cart/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/brand", async (req, res) => {
      res.send(data);
    });
    app.get("/brand/:Brand", async (req, res) => {
      const brand = req.params.Brand.toLocaleLowerCase();
      const result =
        data.filter((car) => car.brand.toLocaleLowerCase() === brand) || {};
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server is running");
});
app.listen(port, () => {
  console.log(`server running at port: ${port}`);
});
