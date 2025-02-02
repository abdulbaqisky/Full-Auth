import express from 'express';
import { protectedRoute } from '../middlewares/authMiddleware.js';
import multer from 'multer'
import path from 'path'
import Post from '../models/postModel.js'
import User from '../models/userModel.js'
import { unlink } from 'fs';

// storage engine using multer

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, 'uploads/')
    },
    filename: function(req, file, cb){
        cb(null, Date.now() + path.extname(file.originalname))
    }
}) 

const upload = multer({ storage: storage })
const router = express.Router()

router.get('/', (req, res) => {
    res.render('index', {title: 'Home Page', active: 'home'})
})
router.get('/create-post', protectedRoute, async (req, res) => {
    res.render('posts/create-post', {title: 'Create Post', active: 'create-post'})
})

router.get('/my-posts', protectedRoute, async (req, res) => { 
    
try {
    const userId = req.session.user._id
    const user = await User.findById(userId).populate('posts')

    if (!user) {
        req.flash('error', 'User not found')
        res.redirect('/')
    }

    res.render('posts/my-posts', {title: 'My Posts', active: 'my-posts', posts: user.posts})

    
} catch (error) {
    console.log(error) 
    req.flash('error', 'An error occured while fetching your post') 
    res.redirect('/my-posts')
    
}
})
    
router.get('/edit-post/:id', protectedRoute, async(req, res) => {
    try {
        const postId = req.params.id
        const post = await Post.findById(postId)
        if (!post) {
            req.flash('error', 'Post not found')
            res.redirect('/my-posts')
        }
        res.render('posts/edit-post', {title: 'Edit Post', active: 'edit-post', post})

    } catch (error) {
        console.log(error)  
        req.flash('error', 'An error occured while fetching your post')
        res.redirect('/my-posts')
        
    }
})

    router.post('/update-post/:id', protectedRoute, upload.single('image'), async (req, res) => {   
        try {
            const {title, content} = req.body
            const postId = req.params.id
            const post = await Post.findById(postId)
            if (!post) {
                req.flash('error', 'Post not found')
                res.redirect('/my-posts')
            }
            post.title = title
            post.content = content
            post.slug = title.replace(/\s+/g, '-').toLowerCase()

            
            if (req.file) {
                unlink(path.join(process.cwd(), 'uploads')+'/'+ post.image), (err) => {
                    if (err) {
                        console.log(err)
                    }
                }
                post.image = req.file.filename
            }
        
            await post.save()
            req.flash('success', 'Post updated successfully')
            res.redirect('/my-posts')
            
        } catch (error) {   
            console.log(error)
            req.flash('error', 'An error occured while updating your post')
            res.redirect('/my-posts')
            
        }
    }
)



router.get('/view-posts/:id', (req, res) => {
    res.render('posts/view-posts', {title: 'View Post', active: 'view-post'})
})

router.post('/create-post', protectedRoute, upload.single('image') , async (req, res) => {
    try {
        const {title, content} = req.body
        const image = req.file.filename
        const slug = title.replace(/\s+/g, '-').toLowerCase()

        const user = await User.findById(req.session.user._id)

        const post = new Post({title, slug, content, image, user })

        await User.updateOne({_id: req.session.user._id}, {$push: {posts: post._id}}),

        await post.save()

        req.flash('success', 'post created successfully')
        res.redirect('/my-posts')
        
    } catch (error) {   
        console.log(error)
        req.flash('error', 'something went wrong')
        res.redirect('/create-post')
        
    }
    
})

export default router