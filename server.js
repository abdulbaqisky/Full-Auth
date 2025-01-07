import express from 'express'
import connectMongoDB from './db.js';
import authRoutes from './routes/authRoutes.js'


const app = express();
const PORT = process.env.PORT || 5000

connectMongoDB()

app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.render('index', {title: 'Home Page'})
})

app.use('/', authRoutes)

app.listen(PORT, () => {
    console.log(`server is running on http://localhost:${PORT}`);
    
})