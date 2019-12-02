const  express = require('express');
const  http = require('http');
const path = require('path');
const socketio = require('socket.io');
const {
	addUser,
	removeUser,
	getUser,
	getUsersInRoom,
} = require('./utils/users')
const { getRoles } = require('./utils/roles');

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

		io.to(user.room).emit('roomData', {
			room: user.room,
			users: getUsersInRoom(user.room)
		})

		callback();
	})

	socket.on('newGame', callback => {
		const user = getUser(socket.id);
		const players = getUsersInRoom(user.room);
		const roles = getRoles(players);
		io.to(user.room).emit('newRole', roles);
		callback();
	});

	socket.on('disconnect', () => {
		const user = removeUser(socket.id);

		if (user) {
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