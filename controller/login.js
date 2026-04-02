const Users = require('../model/users');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');





exports.GetSignup = async (req, res, next) => {
    res.render('signup', {
        errors: [],
        OldInput: {username: '', email: '', gender: ''}
    });
}

exports.PostSignup = [
    check('username')
    .notEmpty()
    .withMessage('Name Is Required')
    .trim(),

    check('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('inter valid e-mail')
    .normalizeEmail(),

    check('gender')
    .notEmpty()
    .withMessage('Please select gender')
    .isIn(['male', 'female', 'other'])
    .withMessage('Invalid Gender Type'),
    
    check('password')
    .notEmpty()
    .withMessage('Plese create password')
    .matches(/[!@&]/)
    .withMessage('password contains atleast one special corrector')
    .isLength({ min: 5})
    .withMessage('Password must be atleast 5 Charecters')
    .trim(),


    check('confirmpass')
    .trim()
    .custom((value, {req}) => {
        if(value !== req.body.password){
            throw new Error('Password do not match')
        }
        return true;
    }),


    async (req, res) => {
        const { username, email, gender, password } = req.body;
        const errors = validationResult(req);
        const existingUser = await Users.findOne({email: email});

        if(!errors.isEmpty()){
           return res.status(400).render('signup', {
                errors: errors.array().map(err => err.msg),
                OldInput: { username, email, gender }
            })
        }
          if(existingUser){
            return res.status(409).render('signup', {
                errors: ['User already exist'],
                OldInput: { username, email, gender }
            })
        }

        try{

        const hashedpass = await bcrypt.hash(password, 12);
        
        const User = new Users({
            username,
            email,
            gender,
            password: hashedpass
        })

        await User.save();
        res.redirect('/login')

    } catch(err){
        res.redirect('/signup');
        console.log(err);
    }

    }

]

exports.GetLogin = async (req, res) => {
    res.render('login', {
        errors: [],
        OldInput: {email: ''}
    })
}

exports.PostLogin = async (req, res) => {

    const { email , password } = req.body;
    const Uzer = await Users.findOne({ email });

    if(!Uzer){
        return res.status(402).render('login', {
            errors: ['User Does Not Exist'],
            OldInput: { email }
        })
    }

    const isMatch = await bcrypt.compare(password, Uzer.password) ;

    if(!isMatch){
        return res.status(402).render('login', {
            errors: ['Password Does Not Matched'],
            OldInput: { email }
        })
    }

    //token create

    const token = jwt.sign({
        userId: Uzer._id,
    }, "Badmoshi Nii Mittar", { expiresIn: '7d'});

    res.cookie('token', token, {httpOnly: true});
    res.redirect('/');

}