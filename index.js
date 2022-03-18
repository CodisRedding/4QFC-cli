#!/usr/bin/env node

const playerService = require('./services/player.service');
const fantasyService = require('./services/fantasy.service');
const positions = require('./data/positions.json');
const clubs = require('./data/clubs.json');
var G = require('generatorics');
var util = require('util');
var stream = require('stream');
var fs = require('fs');
var once = require('events').once;

const WITHOUT_SUBS = 84000000;
const WITH_SUBS = 100000000;
const MAX_AMOUNT = WITH_SUBS;
const MIN_AMOUNT = MAX_AMOUNT - 90000000;
const NUMBER_OF_PLAYERS = 15;
const MAX_PLAYERS_PER_TEAM = 3;
const MAX_KEEPERS = 2;
const MAX_FORWARDS = 3;
const MAX_DEFENDERS = 5;
const MAX_MIDFIELDERS = 5;
const WEEK = 4;
const RESULT_FILE = 'results.json';

(async () => {
    let players = await playerService.all();
    players = fantasyService.filter(players.all);
    console.log(players.length)

    const finished = util.promisify(stream.finished);
    let i = 0;

    async function writeIterableToFile(teams, filePath) {
        const writables = {};
        // const writable = fs.createWriteStream(filePath, { encoding: 'utf8' });

        for await (const players of teams) {
            const keepers = players.filter(player => player.position.id === positions.keeper).length;
            const defenders = players.filter(player => player.position.id === positions.defender).length;
            const forwards = players.filter(player => player.position.id === positions.forward).length;
            const midfielders = players.filter(player => player.position.id === positions.midfielder).length;

            const teamIds = {};
            let playersPerTeamOK = true;

            players.forEach(x => {
                const current = teamIds[x.team.id];
                teamIds[x.team.id] = current ? current + 1 : 1;

                if (teamIds[x.team.id] > MAX_PLAYERS_PER_TEAM) {
                    playersPerTeamOK = false;
                }
            });

            if (playersPerTeamOK && keepers === MAX_KEEPERS && forwards === MAX_FORWARDS && defenders === MAX_DEFENDERS && midfielders === MAX_MIDFIELDERS) {

                const team = {
                    cost: players.reduce((p, c) => p + c.cost, 0),
                    avg_points: players.reduce((p, c) => p + c.avg, 0),
                    last_5_avg_points: players.reduce((p, c) => p + c.last_5_avg, 0),
                    last_3_avg_points: players.reduce((p, c) => p + c.last_3_avg, 0),
                    players
                };

                if ((team.cost >= MIN_AMOUNT) && (team.cost <= MAX_AMOUNT)) {
                    let filename;

                    switch(true) {
                        case team.cost <= 100000000 && team.cost > 95000000:
                            filename = '100m-95m';
                            break;
                        case team.cost <= 95000000 && team.cost > 90000000:
                            filename = '95m-90m';
                            break;
                        case team.cost <= 90000000 && team.cost > 85000000:
                            filename = '90m-85m';
                            break;
                        case team.cost <= 85000000 && team.cost > 80000000:
                            filename = '85m-80m';
                            break;
                        case team.cost <= 80000000 && team.cost > 75000000:
                            filename = '80m-75m';
                            break;
                        case team.cost <= 75000000 && team.cost > 70000000:
                            filename = '75m-70m';
                            break;
                        case team.cost <= 70000000 && team.cost > 65000000:
                            filename = '70m-65m';
                            break;
                        case team.cost <= 65000000 && team.cost > 60000000:
                            filename = '65m-60m';
                            break;
                        case team.cost <= 60000000 && team.cost > 55000000:
                            filename = '60m-55m';
                            break;
                        case team.cost <= 55000000 && team.cost > 50000000:
                            filename = '55m-50m';
                            break;
                        case team.cost <= 50000000 && team.cost > 45000000:
                            filename = '50m-45m';
                            break;
                        case team.cost <= 45000000 && team.cost > 40000000:
                            filename = '45m-40m';
                            break;
                        case team.cost <= 40000000 && team.cost > 35000000:
                            filename = '40m-35m';
                            break;
                        case team.cost <= 35000000 && team.cost > 30000000:
                            filename = '35m-30m';
                            break;
                        case team.cost <= 30000000 && team.cost > 25000000:
                            filename = '30m-25m';
                            break;
                        case team.cost <= 25000000 && team.cost > 20000000:
                            filename = '35m-20m';
                            break;
                        case team.cost <= 20000000 && team.cost > 15000000:
                            filename = '20m-15m';
                            break;
                        case team.cost <= 15000000 && team.cost > 10000000:
                            filename = '15m-10m';
                            break;
                        default:
                            filename = 'junk'
                            break;
                    }

                    if (!writables[filename]) {
                        writables[filename] = fs.createWriteStream(`./data/teams/week-${WEEK}/${filename}.json`, { encoding: 'utf8' });
                    }

                    console.log('team:' + ++i, filename, team.cost);
                    if (!writables[filename].write(i === 1 ? '[' : '' + JSON.stringify(team) + ',')) {
                        await once(writables[filename], 'drain');
                    }
                }
            }
        }

        writables.forEach(async (writable) => {
            writable.write(']');
            writable.end();
            await finished(writable);
        });
    }

    const p = players.map(x => { 
        const team = clubs.find(club => club.id === x.squad_id);
        const position = { id: x.positions[0], name: playerService.getPosition(x.positions[0]) };
        let name = x.first_name + ' ' + x.last_name;
        name = name === ' ' ? x.known_name : name;

        return { 
            id: x.id,
            cost: x.cost,
            avg: x.stats.avg_points,
            last_5_avg: x.stats.last_5_avg,
            last_3_avg: x.stats.last_3_avg,
            position,
            positionName: position.name,
            team,
            teamName: team.name,
            name: name
        }
    });

    await writeIterableToFile(G.combination(p, NUMBER_OF_PLAYERS), RESULT_FILE);
})();

