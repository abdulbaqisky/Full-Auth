import express from 'express'
import Post from '../models/postModel.js'
import User from '../models/userModel.js'
import bcrypt from 'bcryptjs'

const router = express.Router()

router.get('/login', (req, res) => {
    res.render('login', {title: 'Login Page'})
})

router.get('/register', (req, res) => {
    res.render('register', {title: 'registration Page'})
})

router.get('/forgot-password', (req, res) => {
    res.render('forgot-password', {title: 'forgot-password'})
})


router.get('/reset-password', (req, res) => {
    res.render('reset-password', {title: 'reset-password'})
})

router.get('/profile', (req, res) => {
    res.render('profile',  {title: 'Profile Page'})
})  

router.post('/register', async (req, res) => {
    const {name, email, password} = req.body
    try {
        const userExists = await User.findOne({email})
        if (userExists) {
            req.flash('error', 'User already exists with this mail')
            return res.redirect('/register')
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = new User({
            name,
            email,
            password: hashedPassword
        })

        user.save();
        req.flash('success', 'user registered successfully, you can log in now!')
        res.redirect('/login')

    } catch (error) {
       console.error(error);
       req.flash('error', 'something went wrong')
       res.redirect('/register')
        
    }
})

router.post('/login', async (req, res) => {
    const {email, password} = req.body
    try {
        const user = await User.findOne({email})

        if (user && (await bcrypt.compare(password, user.password))) {
            req.session.user = user
            res.redirect('/profile')
        } else {
            req.flash('error', 'invalid email or password!')
            res.redirect('/login')
        }
    } catch (error) {
        console.error(error);
        req.flash('error', 'something went wrong, try again!')
        res.redirect('/login')
        
    }
})

export default router
