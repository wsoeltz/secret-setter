const  express = require('express');
const  http = require('http');
const path = require('path');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {
	generateMessage,
	generateLocationMessage,
} = require('./utils/messages');
const {
	addUser,
	removeUser,
	getUser,
	getUsersInRoom,
} = require('./utils/users')

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {
	console.log('new web socket connection');

	socket.on('join', ({username, room}, callback) => {
		const {error, user} = addUser({
			id: socket.id,
			username,
			room,
		});

		if (error) {
			return callback(error);
		}

		socket.join(user.room);

		socket.emit('message', generateMessage('admin', 'Welcome!'));
		socket.broadcast.to(user.room).emit('message', generateMessage('admin', `${user.username} has joined.`));
		io.to(user.room).emit('roomData', {
			room: user.room,
			users: getUsersInRoom(user.room)
		})

		callback();
	})

	socket.on('sendMessage', (message, callback) => {
		const filter = new Filter();

		if (filter.isProfane(message)) {
			return callback('Profanity is not allowed');
		}

		const { username, room } = getUser(socket.id);

		io.to(room).emit('message', generateMessage(username, message));
		callback();
	});

	socket.on('sendLocation', (location, callback) => {
		const { username, room } = getUser(socket.id);
		io.to(room).emit('locationMessage', generateLocationMessage(username, location));
		callback();
	})

	socket.on('disconnect', () => {
		const user = removeUser(socket.id);

		if (user) {
			io.to(user.room).emit('message', generateMessage('admin', `${user.username} has left.`))
			io.to(user.room).emit('roomData', {
				room: user.room,
				users: getUsersInRoom(user.room)
			})
		}
	})
})

server.listen(port, () => {
    console.log('server is up on port ' + port);
});