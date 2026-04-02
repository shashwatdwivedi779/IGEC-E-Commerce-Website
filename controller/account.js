const Users = require('../model/users');
const Products = require('../model/products');
const { check, validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');




exports.GetAccount = async (req, res) => {
    const user = await Users.findById(req.userId);
    res.render('account', { user });
}

exports.GetChangepass = async (req, res) => {
    res.render('changepass', { errors: [],  changepass: true });
}
exports.PostChangepass = [
    check('password')
        .notEmpty()
        .withMessage('Plese create password')
        .matches(/[!@&]/)
        .withMessage('password contains atleast one special corrector')
        .isLength({ min: 5})
        .withMessage('Password must be atleast 5 Charecters')
        .trim(),
    ,
    check('confirmPassword')
    .trim()
    .custom((value, {req}) => {
        if(value!==req.body.password){
            throw new Error('Password Not Matched');
        }
        return true;
    })
    ,
    
    async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
    return res.status(402).render('changepass',{ errors: errors.array().map(err => err.msg) });
}
try{ 
    const user = await Users.findById(req.userId);
    const hashedpass = await bcrypt.hash(req.body.password, 12);
    user.password  = hashedpass;
    await user.save();
    res.render('success', {Message: 'Password Changed', Back: '/account'})
} catch(err){
    console.log(err);
    res.redirect('/');
}
}]

exports.GetUsername = (req, res) => {
    res.render('changepass',{ errors: [], changepass: false });
}

exports.PostUsername = async (req, res) => {
    try{
    const newusername = req.body.username;
    await Users.findByIdAndUpdate(req.userId,{
            username: newusername
       });
    res.render('success', { Message: 'Username Changed', Back: '/account'});
    } catch(err){
        console.log(err);
        res.redirect('/');
    }
    
}


exports.GetYours = async (req, res) => {
    const Products = await Users.findById(req.userId).populate('yourproducts');
    const Product = await Products.yourproducts;

    res.render('yours', { favourite: false, Product, Head: 'Products'});
}


exports.GetFavourites = async (req, res) => {
     const Products = await Users.findById(req.userId).populate('favourites');
     const Product = await Products.favourites;
    res.render('yours', { favourite: true, Product, Head: 'favourites'});

}

exports.PostFavourite = async (req, res) => {
    try{
        const id = req.params.id;
        const user = await Users.findById(req.userId);
        if(!user.favourites.includes(id)){
            user.favourites.push(id);
        await user.save();
        }
        res.render('success', { Message: 'Add To Favourite', Back: `/details/${id}`});
    } catch(err){
        console.log(err);
        res.redirect('/');
    }
}

exports.PostDeleteFavourites = async (req, res) => {
try{
    const id = req.params.id;
        const user = await Users.findById(req.userId);
        if(user.favourites.includes(id)){
            user.favourites.pull(id);
        await user.save();
        }
        res.redirect('/favourites');

}catch(err){
    console.log(err);
    res.redirect('/');
}

}




exports.PostDelete = async (req, res) => {
    try{
        const id = req.params.id;
        const products = await Products.findById(id);
         if(products && products.imagepath){
            const filePath = path.join(__dirname, '..', products.imagepath);
            fs.unlink(filePath, (err) => {
                if(err) console.log(err)
            });
        await Products.findByIdAndDelete(id);
        await Users.updateMany(
            {},
            { $pull: {
                favourites: id,
                yourproducts: id
            }})}

        res.render('success', { Message: 'Product Deleted', Back: '/yours'});
    } catch(err){
        console.log(err);
        res.redirect('/');
    }
}

exports.GetBugs = (req, res) => {

    res.render('bugs');
}

exports.PostBugs = async (req, res) => {
const bug = req.body.Bugs;

const user = await Users.findById(req.userId);

user.Bugs.push(bug);
await user.save();

res.render('success', { Message: 'Your Report Is Reported', Back: '/account' })
}

exports.PostLogout = async (req, res) => {
    res.clearCookie('token');
    res.redirect('/account');
}