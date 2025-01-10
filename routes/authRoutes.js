import express from 'express'
import Post from '../models/postModel.js'
import User from '../models/userModel.js'
import bcrypt from 'bcryptjs'
import { guestRoute, protectedRoute } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.get('/login', guestRoute, (req, res) => {
    res.render('login', {title: 'Login Page',active: 'login'}) 
})

router.get('/register',guestRoute, (req, res) => {
    res.render('register', {title: 'registration Page', active: 'register'})
})

router.get('/forgot-password',guestRoute, (req, res) => {
    res.render('forgot-password', {title: 'forgot-password',})
})


router.get('/reset-password',guestRoute, (req, res) => {
    res.render('reset-password', {title: 'reset-password'})
})

router.get('/profile', protectedRoute, (req, res) => {
    res.render('profile',  {title: 'Profile Page', active: 'profile'})
}) 

// router.get('/create-post', protectedRoute, (req, res) => {
//     res.render('create-post', {title: 'Create Post'})
// })



router.post('/register', guestRoute,  async (req, res) => {
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

router.post('/login', guestRoute, async (req, res) => {
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

router.post('/logout', protectedRoute, (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login')
    })
})


export default router
