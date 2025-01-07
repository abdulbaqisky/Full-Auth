import express from 'express'
import connectMongoDB from './db.js';

const app = express();
const PORT = process.env.PORT || 5000

connectMongoDB()

app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.render('index', {title: 'Home Page'})
})

app.get('/login', (req, res) => {
    res.render('login', {title: 'Login Page'})
})

app.listen(PORT, () => {
    console.log(`server is running on http://localhost:${PORT}`);
    
})