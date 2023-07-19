const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

//const uri = "mongodb+srv://socialMediaPH:ABCD2020@cluster0.boe0w.mongodb.net/?retryWrites=true&w=majority";

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.boe0w.mongodb.net/?retryWrites=true&w=majority`;
//const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.boe0w.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
//const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
async function run() {
    try {
        await client.connect();
        console.log('connected to database')
        const database = client.db("socialMediaPH");
        const mediaCollection = database.collection("medias");
        const reactionCollection = database.collection("reactions");
        ///////////////////
        app.get('/', async (req, res) => {
            res.send('Hello From Server')
        })
        //////////////////////////
        app.get('/reactions', async (req, res) => {
            const cursor = reactionCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        })
        //////////////////////////////
        app.get('/medias', async (req, res) => {
            const cursor = mediaCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        })
        /////////////////////////////
        app.get("/medias/:id", async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const query = { _id: ObjectId(id) };
            // console.log(query);
            const result = await mediaCollection.findOne(query);
            console.log(result)
            res.json(result);
            
        });
        /////////////////////////////////
        app.post('/medias', async (req, res) => {
            const service = req.body;
            // service.reactions = 0;
            const result = await mediaCollection.insertOne(service);
            //console.log(result);
            res.json(result);
        })
        ////////////////////////////////////////////
        app.get("/reactions/:id", async (req, res) => {
            const id = req.params.id;
            //console.log(id)
            const query = { id: id };
            //console.log(query);
            const result = await reactionCollection.findOne(query);
            if (result !== null) {
                res.json(result.reactions);
            }
            else (
                res.json(0)
            )
            
        });


        //////////////////////////////
        
        // });
        // ////////////////////////////////
        // app.post('/reactions', async (req, res) => {
        //     const service = req.body;
        //     service.reactions = 0;
        //     const result = await reactionCollection.insertOne(service);
        //     //console.log(result);
        //     res.json(result);
        // })

        ////////////////////
        app.put('/reactions', async (req, res) => {
            const service = req.body;
            service.reactions = 1;
            const id = req.body.id;
            //console.log('got this from html ' + id);
            const query = { id: id };
            const filtered = await reactionCollection.findOne(query)
            const options = { upsert: true };
            if (filtered === null) {
                const updateDoc = { $set: service };
                const result = await reactionCollection.updateOne(query, updateDoc, options);
                //console.log(result);
                res.json(result);
            }
            else {
                let count = filtered.reactions + 1;
                const updateDoc = { $set: { reactions: count } };
                const result = await reactionCollection.updateOne(query, updateDoc, options);
                //console.log(result);
                res.json(result);
            }
            //console.log(filtered);

            // let count = 0;
            // if (filtered.reactions === 0) {
            //     count = 1;
            //     service.reactions = count;
            //     const updateDoc = { $set: service };
            // }
            // else {
            //     count = filtered.reactions + 1;
            //     const updateDoc = { $set: { reactions: count } };
            // }
            // if (filtered === null) {
            //     const service = req.body;
            //     service.reactions = count;
            //     const result = await reactionCollection.updateOne(filtered, updateDoc, options);
            //     //console.log(result);
            //     res.json(result);
            // }
            // else {
            //     console.log('hit');

            //     // //const selected = await reactionCollection.findOne(query)
            //     // if (filtered.reactions === undefined) {
            //     //     count = 1;
            //     // }
            //     // else {
            //     //     count = filtered.reactions + 1;
            //     // }
            // }
            // console.log(count);
            // console.log('got this from server ' + filtered.id);
            // //console.log(req.body);

        })
    }
    finally {

    }
}
run().catch(console.dir);
app.listen(port, () => {
    console.log('listening to port: ', port);
})
