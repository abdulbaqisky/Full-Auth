import express from 'express'
import connectMongoDB from './db.js';
import authRoutes from './routes/authRoutes.js'
import postRoutes from './routes/postRoutes.js'
import cookieParser from 'cookie-parser';
import session from 'express-session';
import flash from 'connect-flash'
import path from 'path'
import ConnectMongoDBSession from 'connect-mongodb-session';
const connectMongoDBStore = ConnectMongoDBSession(session)


const app = express();
const PORT = process.env.PORT || 3000

connectMongoDB()

app.use(express.json())
app.use(express.urlencoded({extended: false}))

//make uploads folder static
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads') ))

app.use(cookieParser(process.env.COOKIE_SECRET))

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60000 * 60 * 24 * 7 // 1 week
        
    },
    store: new connectMongoDBStore({
        uri: process.env.MONGO_DB_URI,
        collection: 'sessions'  
    })
    
}))

app.use(flash())

app.use(function(req, res, next){
    res.locals.user = req.session.user || null
    next()
})

app.use(function(req, res, next){
    res.locals.message = req.flash(),
    next()
})

app.set('view engine', 'ejs')

app.use('/', postRoutes)

app.use('/', authRoutes)

app.listen(PORT, () => {
    console.log(`server is running on http://localhost:${PORT}`);
    
})