const http = require('http');
const express = require('express');
const { Server } = require("socket.io");
const mongoose = require('mongoose');
const CookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// local modules
const UTILS = require('../utils/path');
const DB_PATH = "mongodb://localhost:27017/FirstDB";
const auth = require('../controller/auth');
const home = require('../routes/home');
const Users = require('../model/users');
const Messages = require('../model/messages');

// middlewares
app.use(CookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(UTILS, 'Public')));
app.use('/uploads', express.static(path.join(UTILS, 'Uploads')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'Views'));

app.use(auth);

app.use((req, res, next) => {
    res.locals.isLoggedIn = req.isLoggedIn;
    next();
});

app.use(async (req, res, next) => {
    try {
        if (req.userId && mongoose.Types.ObjectId.isValid(req.userId)) {
            const user = await Users.findById(req.userId);
            res.locals.user = user || null;
        } else {
            res.locals.user = null;
        }
        next();
    } catch (err) {
        console.log(err);
        res.locals.user = null;
        next();
    }
});

app.use(['/yours', '/details', '/sell', '/bugs', '/favourites', '/changepass', '/changeusername', '/client_chats', '/owner_chats'], (req, res, next) => {
    if(req.isLoggedIn){
        next();
    } else{
        res.redirect('/login')
    }
})

app.use(home);

// ---------------- CHAT SECTION ----------------

app.get('/chatting_box/:id', async (req, res) => {
    try {
        if (!req.userId) {
            return res.redirect('/login');
        }

        const ReceiverId = req.params.id;
        const SenderId = req.userId;

        if (!mongoose.Types.ObjectId.isValid(ReceiverId)) {
            return res.status(400).send('Invalid receiver id');
        }

        if (!mongoose.Types.ObjectId.isValid(SenderId)) {
            return res.status(400).send('Invalid sender id');
        }

        const Receiver = await Users.findById(ReceiverId);
        const Sender = await Users.findById(SenderId);

        if (!Receiver) {
            return res.status(404).send('Receiver not found');
        }

        if (!Sender) {
            return res.status(404).send('Sender not found');
        }

        const messages = await Messages.find({
            $or: [
                { Sender: SenderId, Receiver: ReceiverId },
                { Sender: ReceiverId, Receiver: SenderId }
            ]
        }).sort({ createdAt: 1 });

        res.render('chatting_box', {
            SenderId,
            Sender,
            ReceiverId,
            Receiver,
            messages,
        });

    } catch (err) {
        console.log(err);
        res.status(500).send('Server Error');
    }
});

const OnlineUsers = {};

io.on('connection', (socket) => {

    socket.on('join_room', async ({ SenderID, ReceiverID }) => {
        try {
            if (
                !mongoose.Types.ObjectId.isValid(SenderID) ||
                !mongoose.Types.ObjectId.isValid(ReceiverID)
            ) {
                return;
            }

            OnlineUsers[SenderID] = socket.id;

            const room = [SenderID, ReceiverID].sort().join('_');
            socket.join(room);

            if (OnlineUsers[ReceiverID]) {
                io.to(OnlineUsers[ReceiverID]).emit('User_Online');
                socket.emit('User_Online');
            }

            await Messages.updateMany(
                {
                    Sender: ReceiverID,
                    Receiver: SenderID,
                    seen: false
                },
                {
                    $set: { seen: true }
                }
            );

            socket.emit("unseen_messages", {
                senderId: ReceiverID,
                count: 0
            });

        } catch (err) {
            console.log(err);
        }
    });

    socket.on("send_messages", async ({ SenderID, ReceiverID, text }) => {
        try {
            if (
                !mongoose.Types.ObjectId.isValid(SenderID) ||
                !mongoose.Types.ObjectId.isValid(ReceiverID)
            ) {
                return;
            }

            if (!text || !text.trim()) {
                return;
            }

            const cleanText = text.trim();
            const room = [SenderID, ReceiverID].sort().join('_');

            await Messages.create({
                Sender: SenderID,
                Receiver: ReceiverID,
                text: cleanText,
                seen: false
            });

            io.to(room).emit("receive_messages", {
                SenderID,
                ReceiverID,
                text: cleanText,
                createdAt: new Date()
            });

            const unSeenCount = await Messages.countDocuments({
                Sender: SenderID,
                Receiver: ReceiverID,
                seen: false
            });

            if (OnlineUsers[ReceiverID]) {
                io.to(OnlineUsers[ReceiverID]).emit("unseen_messages", {
                    senderId: SenderID,
                    count: unSeenCount
                });
            }

        } catch (err) {
            console.log(err);
        }
    });

    socket.on('disconnect', () => {
        for (let userId in OnlineUsers) {
            if (OnlineUsers[userId] === socket.id) {
                delete OnlineUsers[userId];
                socket.broadcast.emit('user_offline');
                break;
            }
        }
    });

});

mongoose.connect(DB_PATH).then(() => {
    console.log('Connected to mongoDB');
    server.listen(3000, "0.0.0.0", () => {
        console.log("server running at - http://localhost:3000");
    });
}).catch(error => {
    console.log(error);
});