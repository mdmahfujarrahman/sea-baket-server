const express = require('express');
const app = express();
const cors = require('cors');
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
        const imagesCollection = client.db("sea_basket").collection("images");
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

        //add new categories

        app.post("/categories", verifyToken, async (req, res) => {
            const categories = req.body;
            const query = { name: categories.name };
            const exists = await categoriesCollection.findOne(query);
            if (exists) {
                return res.send({ success: false });
            }
            const results = await categoriesCollection.insertOne(categories);
            res.send({ success: true, results });
        });

        //single category find
        app.get("/categories/:id", async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const filter = { _id: ObjectId(id) };
            const results = await categoriesCollection.findOne(filter);
            res.send(results);
        });

        app.put("/categories/:id", async (req, res) => {
            const id = req.params.id;
            const updateCategory = req.body;
            const filter = { _id: ObjectId(id) };
            const updateDoc = {
                $set: {
                    img: updateCategory.img,
                    name: updateCategory.name,
                },
            };
            const results = await categoriesCollection.updateOne(
                filter,
                updateDoc
            );
            res.send(results);
        });

        //single categories delete
        app.delete("/categories/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const results = await categoriesCollection.deleteOne(filter);
            res.send(results);
        });
        //post faqs
        app.post("/faqs", async (req, res) => {
            const faqs = req.body;
            const query = { question: faqs.question };
            const exists = await faqsCollection.findOne(query);
            if (exists) {
                return res.send({ success: false, faq: exists });
            }
            const results = await faqsCollection.insertOne(faqs);
            res.send({ success: true, results });
        });

        //get all faqs
        app.get("/faqs", async (req, res) => {
            const faqs = await faqsCollection.find().toArray();
            res.send(faqs);
        });

        //get single faqs
        app.get("/faqs/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const results = await faqsCollection.findOne(filter);
            res.send(results);
        });
        // update faqs
        app.put("/faqs/:id", async (req, res) => {
            const id = req.params.id;

            const updateFaqs = req.body;
            const filter = { _id: ObjectId(id) };
            const updateDoc = {
                $set: {
                    question: updateFaqs.question,
                    question: updateFaqs.question,
                },
            };
            const results = await faqsCollection.updateOne(filter, updateDoc);
            res.send(results);
        });

        app.delete("/faqs/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const results = await faqsCollection.deleteOne(filter);
            res.send(results);
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

        //get guides blogs
        app.get("/guides/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const results = await guidesCollection.findOne(filter);
            res.send(results);
        });
        app.post("/guides", async (req, res) => {
            const blogs = req.body;
            const query = { title: blogs.title };
            const exists = await guidesCollection.findOne(query);
            if (exists) {
                return res.send({ success: false, blogs: exists });
            }
            const results = await guidesCollection.insertOne(blogs);
            res.send({ success: true, results });
        });

        // update guides blogs
        app.put("/guides/:id", async (req, res) => {
            const id = req.params.id;
            const updateBlogs = req.body;
            const filter = { _id: ObjectId(id) };
            const updateDoc = {
                $set: {
                    img: updateBlogs.img,
                    title: updateBlogs.title,
                    guideIntro: updateBlogs.guideIntro,
                },
            };
            const results = await guidesCollection.updateOne(filter, updateDoc);
            res.send(results);
        });
        //guides blog deletes
        app.delete("/guides/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const results = await guidesCollection.deleteOne(filter);
            res.send(results);
        });

        //get logo
        app.get('/logo', async (req, res) => {
            const filter = {type: 'logo'}
            const results = await imagesCollection.findOne(filter);
            res.send(results);
        })
        //get banner
        app.get('/banner', async (req, res) => {
            const filter = { type: "banner" };
            const results = await imagesCollection.findOne(filter);
            res.send(results);
        })
        //update image
        app.put('/images',  async (req, res) => {
            const updateImage = req.body
            const filter = {_id: ObjectId(updateImage._id)}
            console.log(updateImage);
            console.log(filter);
            const updateDoc = {
                $set: {
                    img: updateImage.img
                },
            };
            console.log(updateDoc);
            const results = await imagesCollection.updateOne(filter, updateDoc);
            res.send(results);
        })




    }
    finally{

    }

    



}

run().catch(console.dir)


app.get('/', (req, res) => {
    res.send('Welcome to Sea basket Server')
})


app.listen(port,() =>{
    console.log('sea basket server is runing');
})