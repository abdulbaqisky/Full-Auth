import express from 'express'
import Post from '../models/postModel.js'
import User from '../models/userModel.js'
import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'
import { guestRoute, protectedRoute } from '../middlewares/authMiddleware.js'

const router = express.Router()

// Looking to send emails in production? Check out our Email API/SMTP product!

var transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "2873a422deb3cc",
      pass: "da1f8b474a96ff"
    }
  });

router.get('/login', guestRoute, (req, res) => {
    res.render('login', {title: 'Login Page',active: 'login'}) 
})

router.get('/register',guestRoute, (req, res) => {
    res.render('register', {title: 'registration Page', active: 'register'})
})

router.get('/forgot-password',guestRoute, (req, res) => {
    res.render('forgot-password', {title: 'forgot-password', active: 'forgot-password'  })
})


router.get('/reset-password/:token',guestRoute, async (req, res) => {
    const {token} = req.params
    const user = await User.findOne({token})

    if (!user) {
        req.flash('error', 'invalid token')
        return res.redirect('/forgot-password')
    }
    res.render('reset-password', {title: 'Reset password Page', active: 'reset', token })
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

router.post('/forgot-password', guestRoute, async (req, res) => {
    const {email} = req.body
    try {
        const user = await User.findOne({email})
        if (!user) {
            req.flash('error', 'user not found with this email')
            return res.redirect('/forgot-password') 
            
        }
        if (user) {
            req.flash('success', 'check your email for password reset link')
        }

        const token = Math.random().toString(36).slice(2)
        user.token = token
        await user.save()

        const info = await transport.sendMail({
            from: '"Qisky LA" <qisky@ethereal.email>', // sender address
            to: email, // list of receivers
            subject: "Password Reser", // Subject line
            text: "Reset your Password", // plain text body
            html: `<p> click this link to reset your password: <a href='http://localhost:${process.env.PORT}/reset-password/${token}'> Reset Password </a> <br> Thank you! </p>`, // html body
          });

          if (info.messageId) {
            req.flash('success', 'check your email for password reset link')
            res.redirect('/forgot-password')
            console.log('message sent: %s', info.messageId)
          } else {
            req.flash('error', 'something went wrong, try again!')  
            res.redirect('/forgot-password')

          }
        
    } catch (error) {
        console.error(error);
        req.flash('error', 'something went wrong, try again!')
        res.redirect('/forgot-password' )   
    }

})

router.post('/reset-password', guestRoute, async (req, res) => {
    const {token, new_password, new1_password} = req.body
    console.log(req.body)
    try {
        const user = await User.findOne({token}) 
        if (new_password !== new1_password) {
            req.flash('error', 'passwords do not match')
            return res.redirect(`/reset-password/${token}`) 
        }
        if (!user) {
            req.flash('error', 'invalid token') 
            return res.redirect('/forgot-password') 
        }
        const hashedPassword = await bcrypt.hash(new_password, 10)  
        user.password = hashedPassword
        user.token = null
        await user.save()
        req.flash('success', 'password reset successfully') 
        res.redirect('/login')
    }
        catch (error) {   
        console.error(error);
        req.flash('error', 'something went wrong, try again!') 
        res.redirect('/reset-password') 
    }   
}
)


export default router
