const express = require('express');
const home = express.Router();
const LoginController = require('../controller/login');
const HomeController = require('../controller/home');
const ProfileController = require('../controller/account');
const uploadd = require('../multer/multer');

home.get('/', HomeController.GetHome);
home.get('/signup', LoginController.GetSignup);
home.post('/signup', LoginController.PostSignup);
home.get('/login', LoginController.GetLogin);
home.post('/login', LoginController.PostLogin);
home.get('/sell', HomeController.GetSell);
home.post('/sell', uploadd.single('imagepath'), HomeController.PostSell);
home.get('/details/:id', HomeController.GetDetails);
home.post('/chatting', HomeController.PostDetails);
home.get('/client_chats', HomeController.GetClients);
home.get('/owner_chats', HomeController.GetOwner);
home.get('/chats', HomeController.GetChats);
home.get('/account', ProfileController.GetAccount);
home.get('/changepass', ProfileController.GetChangepass);
home.post('/changepass', ProfileController.PostChangepass);
home.get('/changeusername', ProfileController.GetUsername);
home.post('/changeusername', ProfileController.PostUsername);
home.get('/favourites', ProfileController.GetFavourites);
home.post('/favourites/:id', ProfileController.PostFavourite);
home.get('/yours', ProfileController.GetYours);
home.post('/favourite/:id', ProfileController.PostDeleteFavourites);
home.post('/delete/:id', ProfileController.PostDelete);
home.get('/bugs', ProfileController.GetBugs);
home.post('/bugs', ProfileController.PostBugs);
home.post('/logout', ProfileController.PostLogout);




module.exports = home;