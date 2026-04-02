const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        req.isLoggedIn = false;
        res.locals.isLoggedIn = true;
        return next();
    }
    try {
        const decoded = jwt.verify(token, "Badmoshi Nii Mittar");
        req.userId = decoded.userId;
        req.isLoggedIn = true;
        res.locals.isLoggedIn = true;

    } catch (err) {
        req.isLoggedIn = false;
        res.locals.isLoggedIn = true;
        console.log(err);
    }

    next();
};