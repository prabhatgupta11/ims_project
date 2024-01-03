
module.exports = (req, res, next) => {

    if (req.session.isLoggedIn) {
        next()
    } else {
        req.flash('message', 'Your Session is Expired Please Login Again');
        res.redirect('/')
        // next()  
    }
}



