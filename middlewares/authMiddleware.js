export const protectedRoute = (req, res, next) => { 
    if (!req.session.user) {
        req.flash('error', 'you need to login first!')
        return res.redirect('/login')
    }
    next()
}

export const guestRoute = (req, res, next) => {
    if (req.session.user) {
        return res.redirect('/profile')
    }
    next()
}