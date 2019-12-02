const MIN_PLAYERS = 5;
const MAX_PLAYERS = 10;

const PARTY_LIBERAL = 'PARTY_LIBERAL';
const PARTY_FASCIST = 'PARTY_FASCIST';

const ROLE_LIBERAL = 'ROLE_LIBERAL';
const ROLE_FASCIST = 'ROLE_FASCIST';
const ROLE_HITLER = 'ROLE_HITLER';

const liberal = { party: PARTY_LIBERAL, role: ROLE_LIBERAL }
const fascist = { party: PARTY_FASCIST, role: ROLE_FASCIST }
const hitler  = { party: PARTY_FASCIST, role: ROLE_HITLER }

const min_liberals = [
  {...liberal},
  {...liberal},
  {...liberal},
];

const min_fascists = [
  {...fascist},
  {...hitler},
];

const ROLES_5  = [ ...min_liberals, ...min_fascists ];

const ROLES_6  = [ ...ROLES_5, {...liberal} ];

const ROLES_7  = [ ...ROLES_6, {...fascist} ];

const ROLES_8  = [ ...ROLES_7, {...liberal} ];

const ROLES_9  = [ ...ROLES_8, {...fascist} ];

const ROLES_10 = [ ...ROLES_9, {...liberal} ];

const ROLES = {
  ROLES_5,
  ROLES_6,
  ROLES_7,
  ROLES_8,
  ROLES_9,
  ROLES_10,
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}


const getRoles = players => {
  if (players.length >= MIN_PLAYERS && players.length <= MAX_PLAYERS) {
    const roles = shuffle(ROLES[`ROLES_${players.length}`]);
    return roles.map((role, i) => {
      return {...role, user: players[i]};
    });
  } else {
    return [{error: 'Incorrect player count'}];
  }
}


module.exports = {
  getRoles,
}
