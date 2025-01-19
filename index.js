const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// set up middlewares 

app.use(express.json());
app.use(cors({
    origin: [
        'https://cars-doctor-5e8a8.web.app',
        'https://cars-doctor-5e8a8.firebaseapp.com'
        // 'http://localhost:5173', //Deveopment er jonno local host. Production e gele production er link die etake replace kore dite hobe. 
    ],
    credentials: true // Normally cookies same domain e kj kore. etake cross origin server e kaj koranor jonno credentials true kora hoyeche. 
}));
app.use(cookieParser());


// own middleware

// jehetu ei middleware get, post, delete er majhe bose eitate next use kora hoy jeno next operation e chole jay. middle ware, api & handler er majhe bose always. 
const logger = async (req, res, next) => {
    console.log('log: info', req.method, req.url);
    // console.log('called', req.hostname, req.originalUrl)
    next();
}

const verifyToken = async (req, res, next) => {
    const token = req?.cookies?.token;
    console.log('token in the middleware', token);
    // token na thakle error return asbe. no token available
    if (!token) {
        return res.status(401).send({ message: 'authorized access' });
    }
    // token thakle below steps e verify korbo
    jwt.verify(token, process.env.ACCEESS_TOKEN_SECRET, (err, decoded) => {
        //     // token paisi but token expired or nosto . any type of token error.
        if (err) {
            console.log(err);
            return res.status(401).send({ message: 'unauthorized access' })
        }
        //     // if token is valid it will be decoded. docode refers that token take decode kore user er against e verify kora hobe.
        console.log('value in the token', decoded)
        req.user = decoded;
        next();
        //**we will use next() only when decoded is successfull. tai eita verify function er vitore decode er pore use hoise. jodi eita verify function er pore bosto tahole err hok ba success jai hok, next e chole jeto.. jeta amra chai na**
    })

}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fguqs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const serviceCollection = client.db('CarDoctor').collection('services');
        const bookingCollection = client.db('CarDoctor').collection('bookings');
        const productCollection = client.db('CarDoctor').collection('products');
        const teamCollection = client.db('CarDoctor').collection('team');



        // Data read in the backend server 

        // all services data read in backend server

        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        // all product data read in backend server

        app.get('/products', async (req, res) => {
            const cursor = productCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        // all team Member data read in backend server

        app.get('/team', async (req, res) => {
            const cursor = teamCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        // individual services data read in backend server

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }

            const options = {
                // Include only the `title` and `imdb` fields in the returned document
                projection: { title: 1, price: 1, servie_id: 1, img: 1 }
            };

            const result = await serviceCollection.findOne(query, options);
            res.send(result);
        })



        // booking data read in backend server

        app.get('/bookings', logger, verifyToken, async (req, res) => {
            console.log(req.query.email);
            // console.log('token owner info',req.cookies);
            // console.log('tok tok token',req.cookies.token)
            console.log('token owner info', req.user)
            // ekhane req.user er majhe token user er email ache. jodi token user er email & je token request korche tader email match kore only then amra token verify korbo. naile verify kora hoibena. ekhane req.user.email holo token owner & req.query.email holo jar data call kore api request korechi tar email. 
        
            if (req.query.email !== req.user.email) {
                return res.status(403).send({ message: 'forbidden access' });
            }

            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await bookingCollection.find(query).toArray();
            res.send(result);
        })

        // data add in the mongodb

        // Auth related data create on the backend server from client side on jwt route. auth related api

        app.post('/jwt', logger, async (req, res) => {
            // jwt route er body te ja ache seta request korbo
            const user = req.body;
            // user is used as a payload here 
            console.log('user for token', user);
            // generate a token jwt.sign(object, token secret, expiration time)
            const token = jwt.sign(user, process.env.ACCEESS_TOKEN_SECRET, { expiresIn: '5hr' })
            // response hisebe normally token amra client side login/authprovider e send korte pari. But amra eivabe na kore jinista cookie format e send korbo. 

            res
                .cookie('token', token, {
                    httpOnly: true,
                    secure: true, // http://localhost:5173/login (production e true thake)
                    sameSite: 'none'
                })
                .send({ success: true });
        })

        // need to remove token during logOut
        app.post('/logout', async (req, res) => {
            const user = req.body;
            console.log('logging out', user);
            res
                .clearCookie('token',
                    { maxAge: 0 }
                )
                .send({ success: true });
        })

        // add individual booking each time 

        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const result = await bookingCollection.insertOne(booking);
            res.send(result);
        });

        // update a booking (document) from MongoDB
        // Put is creating or updating full doc, patch is only updating partial portion of a document. Below are given both the examples. 

        // app.put('/bookings/:id',async (req,res)=>{
        //     // express json jehetu dea ase, body req korle full updated data eksathe paoa jabe
        //     const updatedBooking = req.body;
        // })


        // ei case e jehetu amra only confirm status or single ekta portion update korbo. ekhetre Put na must be patch hobe 

        app.patch('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedBooking = req.body;
            console.log(updatedBooking);
            const updateDoc = {
                $set: {
                    status: updatedBooking.status
                },
            };
            const result = await bookingCollection.updateOne(filter, updateDoc);
            res.send(result);
        })


        // delete a booking (document) from mongodb

        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await bookingCollection.deleteOne(query);
            res.send(result);
        })


        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Doctor is running')
})

app.listen(port, () => {
    console.log(`Car Doctor Server is running on port ${port}`)
})