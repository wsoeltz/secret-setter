const socket = io();

// Elements
const $pregameContainer = document.querySelector('#pregameContainer');
const $activeGameContainer = document.querySelector('#activeGameContainer');
const $userList = document.querySelector('#userList');
const $yourRole = document.querySelector('#yourRole');
const $errorContainer = document.querySelector('#errorContainer');
const $gameControls = document.querySelector('#gameControls');
const $newGameButton = $gameControls.querySelector('#newGame');

// Templates
const $userListTemplate = document.querySelector('#userListTemplate').innerHTML;
const $roleTemplate = document.querySelector('#roleTemplate').innerHTML;
const $errorTemplate = document.querySelector('#errorTemplate').innerHTML;

// Options
const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true });

socket.on('newRole', roles => {
	if (roles.length >= 5 && roles.length <= 10) {
		const you = roles.find(r => r.user.username.toLowerCase() === username.toLowerCase());

		const party = you.party === 'PARTY_FASCIST' ? 'Fascist' : 'Liberal';
		let role;
		if (you.role === 'ROLE_HITLER') {
			role = 'Hitler';
		} else {
			role = you.role === 'ROLE_FASCIST' ? 'Fascist' : 'Liberal';
		}

		if (you) {
			const teammates = [];
			if (you.role === 'ROLE_FASCIST' || (you.role === 'ROLE_HITLER' && roles.length < 7)) {
				roles.forEach(r => {
					if (r.party === 'PARTY_FASCIST') {
						const teamRole = r.role === 'ROLE_HITLER' ? '- Hitler' : '';
						teammates.push({username: r.user.username, role: teamRole})
					}
				})
			}

			const team = teammates.length ? [...teammates] : [{username: "That's for you to figure out", role: ''}];

			const html = Mustache.render($roleTemplate, {
				username: you.user.username,
				role,
				party,
				team,
			});
			$yourRole.innerHTML = html;
			$pregameContainer.classList.add('hidden');
			$activeGameContainer.classList.remove('hidden');

			const showContent = elm => {
		    elm.querySelector('.title').classList.add('hidden');
		    elm.querySelector('.content').classList.remove('hidden');
			}
			const hideContent = elm => {
		    elm.querySelector('.title').classList.remove('hidden');
		    elm.querySelector('.content').classList.add('hidden');
			}

			Array.from(document.querySelectorAll('.tap-toggle')).forEach(elm => {
			  elm.addEventListener('mousedown', (e) => {
			  	e.preventDefault();
			    showContent(elm);
			  });
			  elm.addEventListener('mouseup', (e) => {
			  	e.preventDefault();
			  	hideContent(elm);
			  });
			  elm.addEventListener('mouseleave', (e) => {
			  	e.preventDefault();
			  	hideContent(elm);
			  });
			  elm.addEventListener('touchstart', (e) => {
			  	e.preventDefault();
			    showContent(elm);
			  });
			  elm.addEventListener('touchend', (e) => {
			  	e.preventDefault();
			  	hideContent(elm);
			  });
			});
		}
	} else if (roles.length === 1 && roles[0].error) {
		const html = Mustache.render($errorTemplate, {error: roles[0].error});
		$errorContainer.innerHTML = html;
	} else {
		const html = Mustache.render($errorTemplate, {error: 'There was an unknown error'});
		$errorContainer.innerHTML = html;
	}
});

socket.on('roomData', ({ room, users }) => {
	const html = Mustache.render($userListTemplate, {
		room,
		users
	});
	$userList.innerHTML = html;
})

$newGameButton.addEventListener('click', e => {
	e.preventDefault();

	$newGameButton.setAttribute('disabled', 'disabled');

	socket.emit('newGame', (error) => {
		$newGameButton.removeAttribute('disabled')
		if (error) {
			return console.error(error);
		}
	});
});

socket.emit('join', {username, room}, error => {
	if (error) {
		alert(error);
		location.href = '/';
	}
});