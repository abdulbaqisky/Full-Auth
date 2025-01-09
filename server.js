import express from 'express'
import connectMongoDB from './db.js';
import authRoutes from './routes/authRoutes.js'
import cookieParser from 'cookie-parser';
import session from 'express-session';
import flash from 'connect-flash'


const app = express();
const PORT = process.env.PORT || 5000

connectMongoDB()

app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.use(cookieParser(process.env.COOKIE_SECRET))

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60000 * 60 * 24 * 7 // 1 week
    }
}))

app.use(flash())

app.use(function(req, res, next){
    res.locals.message = req.flash(),
    next()
})

app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.render('index', {title: 'Home Page'})
})

app.use('/', authRoutes)

app.listen(PORT, () => {
    console.log(`server is running on http://localhost:${PORT}`);
    
})