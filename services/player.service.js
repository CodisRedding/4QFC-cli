const axios = require('axios');
const positions = require('../data/positions.json');

const active = (players) => {
    return players.filter(x => x.status === 'playing');
};

const keepers = (players) => {
    return players.filter(x => x.positions.includes(positions.keeper));
};

const defenders = (players) => {
    return players.filter(x => x.positions.includes(positions.defender));
};

const midfielders = (players) => {
    return players.filter(x => x.positions.includes(positions.midfielder));
};

const forwards = (players) => {
    return players.filter(x => x.positions.includes(positions.forward));
};

const onClub = (players, id) => {
    return players.filter(x => x.squad_id === id);
};

const getPosition = (pos) => {
    let position = '';

    switch(pos) {
        case positions.defender:
            position = 'defender';
            break;
        case positions.forward:
            position = 'forward';
            break;
        case positions.keeper:
            position = 'keeper';
            break;
        case positions.midfielder:
            position = 'midfielder';
            break;
        default:
            position = 'unknown';
    };

    return position;
}

const all = async (limit) => {
    const response = await axios.get('https://fgp-data-us.s3.us-east-1.amazonaws.com/json/mls_mls/players.json');
    const activePlayers = active(response.data);

    const players = {
        all: limit ? activePlayers.splice(0, limit) : activePlayers,
        keepers: keepers(activePlayers),
        defenders: defenders(activePlayers),
        midfielders: midfielders(activePlayers),
        forwards: forwards(activePlayers)
    }

    return players;
};

exports.all = all;
exports.onClub = onClub;
exports.getPosition = getPosition;