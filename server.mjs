import express from "express"
import path from 'path'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'

const SECRET = process.env.SECRET || "topsecret";

const app = express()
const port = process.env.PORT || 6001;
console.log('hello world as module javascript')

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// app.use(cors({
//   origin : ['http://localhost:6001', "*"],
//   credentials: true
// }));

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
      "email firstName lastName age password",
      (err, data) => {
          if (!err) {
              console.log("data: ", data);

              if (data) { // user found
                  varifyHash(body.password, data.password).then(isMatched => {
                      console.log("isMatched: ", isMatched);

                      if (isMatched) {
                          var token = jwt.sign({
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
                          console.log("user not found");
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


// //Ip Address From Network properties
// //http://192.168.43.166:3000

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})