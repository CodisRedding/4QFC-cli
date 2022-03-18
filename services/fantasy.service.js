const filter = (players) => {
    return players.filter(x => x.stats.last_match_points !== null && 
        // x.stats.last_match_points > 6 && 
        x.stats.avg_points > 3.5 &&
        // x.stats.last_5_avg > 5 &&
        // x.stats.last_3_avg > 6 &&
        x.stats.games_played > 1);
};

const sort = (players) => {
    return filter(players)
        .sort((a, b) => a.stats.avg_points - b.stats.avg_points).reverse();
};

const powerset = (players) => {
    const ps = [[]];

    for (let i = 0; i < players.length; i++) {
        for (let j = 0, len = ps.length; j < len; j++) {
            const s = ps[j].concat(players[i]);
            if (s.length <= 15)
                ps.push(s);
        }
    }

    return ps;
};

const sum = (playerSet) => {
    let total = 0;

    for (let i = 0; i < playerSet.length; i++) {
        total += playerSet[i].cost;
    }

    return total;
};

const combos = (players, targetSum) => {
    players = filter(players);

    const slimPlayers = players.map(x => {
        return { id: x.id, cost: x.cost };
    });

    const sumSets = [];
    const playerSets = powerset(slimPlayers);

    for (let i = 0; i < playerSets.length; i++) {
        let playerSet = playerSets[i]; 
        
        const s = sum(playerSet);
        if (s <= targetSum && s >= 90000000 && playerSet.length === 15) {
            playerSet = { total: s, players: playerSet.length };
            // console.log(playerSet)
            sumSets.push(playerSet);
        }
    }

    return sumSets; 
};

// const combos = (players) => {
    // INCLUDE SUBS: 1 keepers 2 forwards 4 midfielders 4 defenders + 4 subs (1 of each)
    // IGNORE SUBS:  2 keepers 3 forwards 5 midfielders 5 defenders


// };

const makeTeam = (players) => {
    const maxplayer = 15;
    const maxAmount = 1000000;
    const team = {
        amount: 0,
        remaining: 0,
        keepers: [],
        defenders: [],
        midfielders: [],
        forwards: []
    };

    const sorted = sort(players);

    sorted.forEach((x, i) => {
        // TODO
    });
}

exports.makeTeam = makeTeam;
exports.sort = sort;
exports.combos = combos;
exports.filter = filter;