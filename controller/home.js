const Users = require('../model/users');
const Products = require('../model/products');
const messages = require('../model/messages');


exports.GetHome = async (req, res) => {
    const Product = await Products.find();
    res.render('home', { Products: Product });
}

exports.GetSell = (req, res) => {
    res.render('sell');
}


exports.PostSell = async (req, res) => {
    try{
    const { productname, price, description } = req.body;

    if(!req.file){
        req.status(402).send('Invalid File');
    }

    const imagepath = "/uploads/" + req.file.filename ;
    const Product = new Products({ productname, price, description, imagepath});
    const user = await Users.findById(req.userId);

    const savepro = await Product.save();
    user.yourproducts.push(savepro._id);
    await user.save();
    res.render('success', { Message: 'Your Product Submitted For Sell', Back: '/'});

} catch(err){
    console.log(err);
    res.redirect('/');
}

}

exports.GetDetails = async (req, res) => {
    const id = req.params.id;
    const userId = req.userId;

    const Productss = await Products.find({
  _id: { $ne: id }
});

    const ProductData = await Products.findById(id);
    const userData = await Users.findOne({ yourproducts: id });
    res.render('details', { Products: ProductData, userData, userId, Productss });
}

exports.PostDetails = async (req, res) => {
    const clientId = req.body.clientId;
    const selfId = req.userId;
    const id = req.params.id;
    const product = await Products.findById(id);

    const seller = await Users.findById(clientId);
    const selfdata = await Users.findById(selfId);

    if(seller.clients){
         if(!seller.clients.includes(selfId)){
        seller.clients.push(selfId);
        await seller.save();
    }}

    if(selfdata.owner){
        if(!selfdata.owner.includes(clientId)){
            selfdata.owner.push(clientId);
            await selfdata.save();
        }
        const dMessage = new messages ({
                Sender: selfdata,
                Receiver: seller,
                text: `I want to buy your "${product.productname}" product`
            })
             await dMessage.save();
    
    }

           
   
    res.redirect(`/chatting_box/${clientId}`);;
}


// ================= SELECT CHAT TYPE PAGE =================
exports.GetChatSelection = async (req, res) => {
    try {
        res.render('chat_box', {
            clientdata: [],
            ownerdata: [],
            owner: false,
            select: true
        });
    } catch (err) {
        console.log(err);
        res.status(500).send('Server Error');
    }
};


exports.GetClients = async (req, res) => {
    try {
        const user = await Users.findById(req.userId).populate('clients');

        const clientdataWithCount = [];

        for (let client of user.clients) {
            const unSeenCount = await messages.countDocuments({
                Sender: client._id,
                Receiver: req.userId,
                seen: false
            });

            clientdataWithCount.push({
                ...client._doc,
                unSeenCount
            });
        }

        res.render('chat_box', {
            clientdata: clientdataWithCount,
            ownerdata: [],
            owner: false,
            select: false
        });

    } catch (err) {
        console.log(err);
        res.status(500).send('Server Error');
    }
};



exports.GetOwner = async (req, res) => {
    try {
        const user = await Users.findById(req.userId).populate('owner');

        const ownerdataWithCount = [];

        for (let ownerUser of user.owner) {
            const unSeenCount = await messages.countDocuments({
                Sender: ownerUser._id,
                Receiver: req.userId,
                seen: false
            });

            ownerdataWithCount.push({
                ...ownerUser._doc,
                unSeenCount
            });
        }

        res.render('chat_box', {
            ownerdata: ownerdataWithCount,
            clientdata: [],
            owner: true,
            select: false
        });

    } catch (err) {
        console.log(err);
        res.status(500).send('Server Error');
    }
};


exports.GetChats = async(req, res) => {
    res.render('chat_box', { select: true});
}
