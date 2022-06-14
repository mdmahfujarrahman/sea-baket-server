const express = require('express');
const app = express();
const cors = require('cors');
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zemxo.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});


function verifyToken(req, res, next) {
    const authHeaders = req.headers.authorization;
    if (!authHeaders){
        return res.status(401).send({ message: "unAuthorized access" })

    }
    const token = authHeaders.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err,decoded) {
        if (err) {

            return res.status(403).send({ message: "Forbidden Access" });
            
        }
        res.decoded = decoded;
        next()
        
    })
}


async function run (){
    try{
        await client.connect();
        const userCollection = client.db("sea_basket").collection("users");
        const categoriesCollection = client
            .db("sea_basket")
            .collection("categories");
        const faqsCollection = client.db("sea_basket").collection("faqs");
        const articlesCollection = client
            .db("sea_basket")
            .collection("articles");
        const guidesCollection = client.db("sea_basket").collection("guides");

        //user add
        app.put("/user/:email", async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const results = await userCollection.updateOne(
                filter,
                updateDoc,
                options
            );
            const token = jwt.sign(
                { email: email },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: "1d" }
            );

            res.send({ results, token });
        });

        //get all categories
        app.get("/categories", async (req, res) => {
            const categories = await categoriesCollection.find().toArray();
            res.send(categories);
        });

        //get all faqs
        app.get("/faqs", async (req, res) => {
            const faqs = await faqsCollection.find().toArray();
            res.send(faqs);
        });
        //get all products articles
        app.get("/articles", async (req, res) => {
            const articles = await articlesCollection.find().toArray();
            res.send(articles);
        });
        //get guides articles
        app.get("/guides", async (req, res) => {
            const guides = await guidesCollection.find().toArray();
            res.send(guides);
        });

    }
    finally{

    }

    



}

run().catch(console.dir)


app.get('/', (req, res) => {
    res.send('Hello World')
})


app.listen(port,() =>{
    console.log('sea basket server is runing');
})