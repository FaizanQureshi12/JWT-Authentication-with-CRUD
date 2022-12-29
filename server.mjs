import express from "express"
import path from 'path'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
import authApis from './Apis/auth.mjs'
import productApis from './Apis/product.mjs'


const SECRET = process.env.SECRET || "topsecret";

const app = express()
const port = process.env.PORT || 6001;

app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: ['http://localhost:3000', 'https://localhost:3000', "*"],
    credentials: true
}));


app.use('/api/v1', authApis)

app.use('/api/v1', (req, res, next) => {
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
                    httpOnly: true,
                    sameSite: 'none',
                    secure: true
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

app.use('/api/v1', productApis)

// //Ip Address From Network properties
// //http://192.168.43.166:3000

const __dirname = path.resolve();
app.use('/', express.static(path.join(__dirname, './Auth/build')))
app.use('*', express.static(path.join(__dirname, './Auth/build')))

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})