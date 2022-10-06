const express = require('express');
const http = require('http');
const app = express();
const cors = require('cors')
const mongoose = require('mongoose');
const bodyParser = require("body-parser")

mongoose.connect('mongodb://localhost/chat_realtime');


const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({
    extended:true
}));

const socketIo = require("socket.io")(server, {
	cors: {
		origin: "*",
	}
})

// Mongodb
var Message = mongoose.model('Message', {username: String, ipAddress: String, message: String, date: Date, success: Boolean});
var User = mongoose.model('User', {username: String, ipAddress: String, password: String, image: String})

// socket
socketIo.on('connection', (socket) =>{
	console.log('client connect on:', socket.id);
	socket.on("sendDataClient", (data) => {
		var newMessage = new Message({username: data.username, ipAddress: data.ipAddress, message: data.message, date: data.date, success: true})
		newMessage.save(function(err, obj) {
			if (err) {console.log(err);}
			else {console.log('save success: ', obj)}
		})
		socketIo.emit("sendDataServer", {data});

	})
	socket.on('disconnect', () => {
		console.log("disconnected");
	})
})

// home page
app.get('/', (req, res) =>{
	Message.find({}, function(err, messages) {
		if (err) {console.log(err)}
			else {res.json(messages); console.log(messages);}
	})
})

// login page
app.post('/login', (req, res) => {
	const username = req.body.username;
	const ipAddress = req.body.ipAddress;
	if (req.body.typeLogin === "anonymous") {res.json(req.body);}

	if (req.body.typeLogin === "user") { 
		const findUser = User.find({username: username}, function(err, user) {
		if (err) {console.log(err)}
		if(user.length == 0) {res.json("Not found user"); console.log("hong tim thay rui!")}
		if(user.length == 1 && user[0].password === req.body.password) {res.json(user[0]); console.log(user[0])}
		if (user.length == 1 && user[0].password !== req.body.password) {res.json("Password is incorrect!");}
	})}
})

//Message.find({}).remove().exec();
app.post('/register', (req, res) => {
	var newUser = new User({username: req.body.username, ipAddress: req.body.ipAddress, password: req.body.password, image: req.body.image})
		newUser.save(function(err, obj) {
			if (err) {console.log(err);}
			else {res.json(obj);}
})
}) 


server.listen(3001, ()=> {
	console.log('server listen on: 3001')
})