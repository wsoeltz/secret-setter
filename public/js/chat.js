const socket = io();

// Elements
const $messageForm = document.querySelector('#messageForm');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $locationButton = document.querySelector('#sendLocation');
const $messages = document.querySelector('#messages');
const $sidebar = document.querySelector('#sidebar');

// Templates
const messageTemplate = document.querySelector('#messageTemplate').innerHTML;
const locationTemplate = document.querySelector('#locationTemplate').innerHTML;
const $sidebarTemplate = document.querySelector('#sidebarTemplate').innerHTML;

// Options
const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoScroll = () => {
	// new message element
	const $newMessage = $messages.lastElementChild;
	const newMessageStyles =getComputedStyle($newMessage);
	const newMessageMargin = parseInt(newMessageStyles.marginBottom);
	const newMessageHeight =$newMessage.offsetHeight + newMessageMargin;

	// get visible height
	const visibleHeight = $messages.offsetHeight;

	// height of messages container
	const containerHeight = $messages.scrollHeight;

	// how far have i scrolled
	const scrollOffset = $messages.scrollTop + visibleHeight;

	if (containerHeight - newMessageHeight <= scrollOffset) {
		$messages.scrollTop = $messages.scrollHeight;
	}
}

socket.on('message', ({username, text, createdAt}) => {
	const html = Mustache.render(messageTemplate, {
		username,
		message: text,
		createdAt: moment(createdAt).format('h:mm a')
	});
	$messages.insertAdjacentHTML('beforeend', html);
	autoScroll();
});

socket.on('locationMessage', ({username, url, createdAt}) => {
	const html = Mustache.render(locationTemplate, {
		username,
		url,
		createdAt: moment(createdAt).format('h:mm a')
	});
	$messages.insertAdjacentHTML('beforeend', html);
	autoScroll();
});

socket.on('roomData', ({ rooms, users }) => {
	const html = Mustache.render($sidebarTemplate, {
		rooms,
		users
	});
	$sidebar.innerHTML = html;
})

$messageForm.addEventListener('submit', e => {
	e.preventDefault();

	$messageFormButton.setAttribute('disabled', 'disabled')

	const message = e.target.elements.message.value;

	socket.emit('sendMessage', message, (error) => {
		$messageFormButton.removeAttribute('disabled')
		$messageFormInput.value = '';
		$messageFormInput.focus();
		if (error) {
			return console.log(error);
		}
		console.log('The message was delivered')
	});
});

$locationButton.addEventListener('click', e => {
	if (!navigator.geolocation) {
		return alert('gelocation is not supported by your browser');
	}

	$locationButton.setAttribute('disabled', 'disabled')

	navigator.geolocation.getCurrentPosition(position => {
		socket.emit('sendLocation', {
			latitude: position.coords.latitude,
			longitude: position.coords.longitude,
		}, () => {
			console.log('Location shared!');
			$locationButton.removeAttribute('disabled')
		});
	})
});

socket.emit('join', {username, room}, error => {
	if (error) {
		alert(error);
		location.href = '/';
	}
});