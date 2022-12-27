import express from "express"
import cors from 'cors'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
import mongoose from 'mongoose'
import {
    stringToHash,
    varifyHash,
} from "bcrypt-inzi"

const SECRET = process.env.SECRET || "topsecret";

const app = express()
const port = process.env.PORT || 6001;
const mongodbURI = process.env.mongodbURI || "mongodb+srv://faizan:asfan@cluster0.5ih6sce.mongodb.net/?retryWrites=true&w=majority";
console.log('hello world as module javascript')

app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: ['http://localhost:3000', "*"],
    credentials: true
}));

let productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: Number,
    description: String,
    createdOn: { type: Date, default: Date.now }
});
const productModel = mongoose.model('products', productSchema);

const userSchema = new mongoose.Schema({

    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, required: true },
    password: { type: String, required: true },
    createdOn: { type: Date, default: Date.now },
});
const userModel = mongoose.model('Users', userSchema);

app.post("/signup", (req, res) => {

    let body = req.body;
    if (!body.firstName
        || !body.lastName
        || !body.email
        || !body.password
    ) {
        res.status(400).send(
            `required fields missing, request example: 
              {
                  "firstName": "John",
                  "lastName": "Doe",
                  "email": "abc@abc.com",
                  "password": "12345"
              }`
        );
        return;
    }
    req.body.email = req.body.email.toLowerCase();
    // check if user already exist // query email user
    userModel.findOne({ email: body.email }, (err, user) => {
        if (!err) {
            console.log("user: ", user);

            if (user) { // user already exist
                console.log("user already exist: ", user);
                res.status(400).send({ message: "user already exist,, please try a different email" });
                return;
            } else { // user not already exist
                //bcrypt hash
                stringToHash(body.password).then(hashString => {
                    userModel.create({
                        firstName: body.firstName,
                        lastName: body.lastName,
                        email: body.email.toLowerCase(),
                        password: hashString
                    },
                        (err, result) => {
                            if (!err) {
                                console.log("data saved: ", result);
                                res.status(201).send({ message: "user is created" });
                            } else {
                                console.log("db error: ", err);
                                res.status(500).send({ message: "internal server error" });
                            }
                        });
                })
            }
        } else {
            console.log("db error: ", err);
            res.status(500).send({ message: "db error in query" });
            return;
        }
    })
});

app.post("/login", (req, res) => {
    let body = req.body;
    body.email = body.email.toLowerCase();
    if (!body.email || !body.password) { // null check - undefined, "", 0 , false, null , NaN
        res.status(400).send(
            `required fields missing, request example: 
              {
                  "email": "abc@abc.com",
                  "password": "12345"
              }`
        );
        return;
    }
    // check if user already exist // query email user
    userModel.findOne(
        { email: body.email },
        // { email:1, firstName:1, lastName:1, age:1, password:0 },
        " firstName lastName email  password",
        (err, data) => {
            if (!err) {
                console.log("data: ", data);

                if (data) { // user found
                    varifyHash(body.password, data.password).then(isMatched => {
                        console.log("isMatched: ", isMatched);

                        if (isMatched) {
                            const token = jwt.sign({
                                _id: data._id,
                                email: data.email,
                                iat: Math.floor(Date.now() / 1000) - 30,
                                exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24),
                            }, SECRET);
                            console.log("token: ", token);

                            res.cookie('Token', token, {
                                maxAge: 86_400_000,
                                httpOnly: true
                            });
                            res.send({
                                message: "login successful",
                                profile: {
                                    email: data.email,
                                    firstName: data.firstName,
                                    lastName: data.lastName,
                                    age: data.age,
                                    _id: data._id
                                }
                            });
                            return;
                        } else {
                            console.log("Password did not match");
                            res.status(401).send({ message: "Incorrect email or password" });
                            return;
                        }
                    })
                } else { // user not already exist
                    console.log("user not found");
                    res.status(401).send({ message: "Incorrect email or password" });
                    return;
                }
            } else {
                console.log("db error: ", err);
                res.status(500).send({ message: "login failed, please try later" });
                return;
            }
        })
})

app.post("/profile",(req,res)=>{
    res.send('Hello World!')
})

app.post("/logout", (req, res) => {
    res.cookie('Token', '', {
        maxAge: 1,
        httpOnly: true
    });
    res.send({ message: "Logout successful" });
})

app.use(function (req, res, next) {
    console.log("req.cookies: ", req.cookies);

    if (!req?.cookies?.Token) {
        res.status(401).send({
            message: "include http-only credentials with every request"
        })
        return;
    }
    jwt.verify(req.cookies.Token, SECRET, function (err, decodedData) {
        if (!err) {
            console.log("decodedData: ", decodedData);

            const nowDate = new Date().getTime() / 1000;
            if (decodedData.exp < nowDate) {
                res.status(401);
                res.cookie('Token', '', {
                    maxAge: 1,
                    httpOnly: true
                });
                res.send({ message: "token expired" })
            } else {
                console.log("token approved");
                req.body.token = decodedData
                next();
            }
        } else {
            res.status(401).send("invalid token")
        }
    });
})

// //Ip Address From Network properties
// //http://192.168.43.166:3000

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
///////////////////////////////////////////////////////////////////////
mongoose.connect(mongodbURI);

////////////////mongodb connected disconnected events/////////////////
mongoose.connection.on('connected', function () {//connected
    console.log("Mongoose is connected");
});
mongoose.connection.on('disconnected', function () {//disconnected
    console.log("Mongoose is disconnected");
    process.exit(1);
});
mongoose.connection.on('error', function (err) {//any error
    console.log('Mongoose connection error: ', err);
    process.exit(1);
});
process.on('SIGINT', function () {/////this function will run jst before app is closing
    console.log("app is terminating");
    mongoose.connection.close(function () {
        console.log('Mongoose default connection closed');
        process.exit(0);
    });
});
////////////////mongodb connected disconnected events////////////////////////