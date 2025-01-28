import express from 'express';
import { protectedRoute } from '../middlewares/authMiddleware.js';

const router = express.Router()

router.get('/', (req, res) => {
    res.render('index', {title: 'Home Page', active: 'home'})
})
router.get('/create-post', protectedRoute, (req, res) => {
    res.render('posts/create-post', {title: 'Create Post', active: 'create-post'})
})

router.get('/my-posts', protectedRoute, (req, res) => { 
    res.render('posts/my-posts', {title: 'My Posts', active: 'my-posts'})
})
    
router.get('/edit-post/:id', protectedRoute, (req, res) => {
    res.render('posts/edit-post', {title: 'Edit Post', active: 'edit-post'})
})

router.get('/view-posts/:id', (req, res) => {
    res.render('posts/view-posts', {title: 'View Post', active: 'view-post'})
})

export default router