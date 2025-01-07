import express from 'express'

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

export default router
