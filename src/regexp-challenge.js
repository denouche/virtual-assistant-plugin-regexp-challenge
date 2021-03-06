const VirtualAssistant = require('virtual-assistant').VirtualAssistant,
    AssistantFeature = require('virtual-assistant').AssistantFeature,
    ConfigurationService = require('virtual-assistant').ConfigurationService,
    Statistics = require('virtual-assistant').StatisticsService,
    RegexAdvisor = require('./regexp-advisor'),
    StateMachine = require('javascript-state-machine'),
    _ = require('lodash'),
    vm = require('vm'),
    path = require('path'),
    fs = require('fs-extra');

const myRegexpAdvisor = new RegexAdvisor();


class RegexpChallenge extends AssistantFeature {

    static init() {
        super.init();
        Statistics.register('REGEXP_END');
    }

    static getTriggerKeywords() {
        return [
            'regex', 'regexp'
        ];
    }

    static getDescription() {
        return 'Lancer un challenge de regexp';
    }

    static getTTL() {
        return 120 /* min */ * 60;
    }



    constructor(interfac, context) {
        super(interfac, context);
        StateMachine.create({
            target: RegexpChallenge.prototype,
            error: function(eventName, from, to, args, errorCode, errorMessage) {
                this.debug('Uncatched error',  'event ' + eventName + ' was naughty :- ' + errorMessage);
                this.debug(args);
            },
            initial: { state: 'Init', event: 'startup', defer: true }, // defer is important since the startup event is launched after the fsm is stored in cache
            terminal: 'End',
            events: [
                { name: 'startup', from: 'none',   to: 'Init' },

                { name: 'text', from: 'Init',   to: 'ChallengeChosen' },

                { name: 'help', from: 'ChallengeChosen',   to: 'Help' },

                { name: 'wait', from: 'Help',   to: 'Wait' },

                { name: 'im', from: 'Wait',   to: 'Answer' },
                { name: 'channel', from: 'Wait',   to: 'AnswerChannel' },

                { name: 'wait', from: 'AnswerChannel',   to: 'Wait' },
                { name: 'wait', from: 'Answer',   to: 'Wait' },

                { name: 'end', from: '*', to: 'End' },
            ]
        });

        // context is : 
        // { 
        //  userId: xxx, // the user who launched the fsm
        //  channelId: xxx, // the channel where the fsm was launched
        //  model: {
        //    players: {
        //      'USERID': {
        //        bestScore: 0 // number of valid lines best answer
        //        bestAnswer: 'regex',
        //        tries: 0, // number of tries
        //        win: 1
        //      }
        //    },
        //    currentGame: undefined,
        //    currentGameName: undefined
        //  }
        // }
        this.context.model = {
            players: {},
            currentGame: undefined,
            currentGameName: undefined
        };
    }


    handle(message, context) {
        if(this.current === 'none') {
            this.startup();
        }
        else {
            if(message.match(/\b(?:help|aide)\b/i) && this.canTriggerEvent('help')) {
                this.help(context.userId);
            }
            else if(message.match(/\b(?:fin|end|exit|stop|quit|quitter|bye)\b/i) && this.canTriggerEvent('end')) {
                this.end(context.userId);
            }
            else if(this.canTriggerEvent('text')) {
                this.text(message, context.userId);
            }
            else if('channel' === context.interfaceType && this.canTriggerEvent('channel')) {
                this.channel(message, context.userId, context.channelId);
            }
            else if('im' === context.interfaceType && this.canTriggerEvent('im')) {
                this.im(message, context.userId);
            }
        }
    }




    /************ HELPERS *****************/

    getAvailableGames() {
        let results = [];
        let files = fs.walkSync(path.join(__dirname, 'challenges'));
        files.forEach(function(f) {
            let matcher = f.match(new RegExp('^' + path.join(__dirname, 'challenges') + '/(.+)\.js$'))
            if(matcher && matcher[1]) {
                results.push(matcher[1]);
            }
        });
        return results;
    }

    getGame() {
        /*{
            mode: 'REPLACE', // MATCH | REPLACE
            game: [
                {
                    input: '',
                    output: '', // string en REPLACE mode, boolean in MATCH mode
                    message: '', // optional
                }
            ]
        }*/
        if(!this.context.model.currentGame) {
            if(!this.context.model.currentGameName) {
                this.context.model.currentGameName = ConfigurationService.get('regexpchallenge.game');
            }
            let gameName = this.context.model.currentGameName;
            try {
                this.context.model.currentGame = require(`./challenges/${gameName}.js`);
            } catch(e) {
                this.debug(`Error while loading regexp game ${gameName}`, e);
                let toSend = [`Une erreur est survenue, le jeu à charger *${gameName}* n'existe pas.`];
                toSend.push("Pour configurer le challenge en cours, utilisez le mode configuration et affectez l'une des valeurs suivantes à la propriété `regexpchallenge.game` :");
                
                this.getAvailableGames().forEach(function(g) {
                    toSend.push('`' + matcher[1] + '`');
                });

                this.send(toSend);
                this.send('Fin du challenge.');
                this.clearCache();
            }
        }
        return this.context.model.currentGame;
    }

    getPlayersArray() {
        var playersArray = [];
        _.forOwn(this.context.model.players, function(player, playerId) {
            if(player.bestScore !== undefined) {
                playersArray.push(_.assignIn(_.cloneDeep(player), {playerId: playerId}));
            }
        });
        return playersArray;
    }

    getGameToDisplay(regexText) {
        var toSend = [],
            game = this.getGame(),
            validCount = 0;
        switch(game.mode) {
            case 'MATCH':
                var regexp,
                    regexpError;
                if(regexText) {
                    try {
                        regexp = new RegExp(regexText)
                    }
                    catch(e) {
                        regexpError = e.message;
                    }
                }
                if(regexText && regexpError) {
                    toSend.push("Une erreur est survenue lors de l'évaluation de votre regexp");
                    toSend.push('```' + regexpError + '```');
                }
                else {
                    toSend.push(game.subject);
                    toSend.push('\n\n');
                    toSend.push('Vous devez trouver la regexp respectant les cas suivants : ' + (regexText ? '(les lignes barrées correspondent aux cas validés par votre réponse précédente)' : ''));
                    var correction = [];
                    _.forEach(game.game, function(caze, i) {
                        var match = false,
                            errorMessage;
                        if(regexText) {
                            var sandbox = {
                                result: null,
                                regexp: new RegExp(regexText),
                                caze: caze.input
                            },
                            context = vm.createContext(sandbox),
                            script = new vm.Script('result = regexp.test(caze);');
                            try {
                                // One could argue if a RegExp hasn't processed in a given time.
                                // then, its likely it will take exponential time.
                                script.runInContext(context, { timeout: '500' }); // milliseconds
                                
                                var match = (regexText !== undefined) && (context.result === caze.output);
                                if(match) {
                                    validCount++;
                                }
                            } catch(e) {
                                // ReDos occurred
                                errorMessage = 'Timeout while evaluating regexp, please check your evil regex ...'
                            }
                        }
                        var line = (match ? '~' : '') + '`' + caze.input + '`  >>> ' + (caze.output ? 'must match' : 'must not match') + (caze.message ? ' : ' + caze.message : '') + (errorMessage ? ' (' + errorMessage + ')' : '') + (match ? '~' : '');
                        //if(correction.length > 0 && 
                        //    (correction[correction.length-1].length + line.length) < (120-(5*4)) ) {
                        //    // Because the max is around 120, and need 5 tabs, so 4*5 characters (1 tab is converted to 4 spaces by slack)
                        //    correction[correction.length-1] = correction[correction.length-1] + '\t\t\t\t\t' + line;
                        //}
                        //else {
                        correction.push(line);
                        //}
                    });
                    toSend = _.concat(toSend, correction);
                }
                break;
            // Later add others modes, like REPLACE etc
        }
        return {
            toSend: toSend,
            validCount: validCount
        };
    }

    getScoreBoard() {
        let playersArray = this.getPlayersArray(),
            topCount = 10;
        if(ConfigurationService.get('regexpchallenge.scoreboadSize') !== undefined
            && ConfigurationService.get('regexpchallenge.scoreboadSize') !== null) {
            if(ConfigurationService.get('regexpchallenge.scoreboadSize') > 0) {
                topCount = ConfigurationService.get('regexpchallenge.scoreboadSize') + _.filter(playersArray, 'win').length;
            }
            else {
                topCount = undefined;
            }
        }
        let bestPlayersByScore = _.chain(playersArray)
            .orderBy(['win', 'bestScore'], ['asc', 'desc'])
            .slice(0, topCount)
            .value();
        return bestPlayersByScore;
    }

    displayScoreboard(channelId) {
        var toSend = [],
            gameLength = this.getGame().game.length,
            bestPlayersByScore = this.getScoreBoard();
        if(bestPlayersByScore.length > 0) {
            toSend.push('Voici le tableau de score actuel :');
            _.forEach(bestPlayersByScore, function(p) {
                toSend.push('• ' + '<@' + p.playerId + '> : ' + p.bestScore + ' / ' + gameLength + ' en ' + p.tries + ' tentative' + (p.tries>1?'s':''));
            });
        }
        this.send(toSend, channelId);
    }

    sendAdvices(text, imPlayerId) {
        var that = this,
            tips = myRegexpAdvisor.getTips(text);
        
        if(tips.length > 0) {
            this.send('----------------\n\n*Voici quelques conseils suite à votre réponse précédente :*', imPlayerId);
            this.send(tips, imPlayerId);
        }
    }



    /**************** STATES *****************/

    onInit(event, from, to) {
        var fromUser = this.interface.getDataStore().getUserById(this.context.userId),
            imPlayerId = this.interface.getDataStore().getDMByUserId(this.context.userId).id;
        if(!fromUser.is_admin 
            && !this.interface.isAdministrator(this.context.userId)
            && imPlayerId !== this.context.channelId /* playing alone in training mode */) {
            this.send('Désolé, seul un administrateur peut lancer un challenge public. Mais vous pouvez vous entrainer seul, pour cela venez me parler en message privé.');
            this.clearCache();
        }
        else {
            this.send("C'est parti pour le Challenge Regex !");

            let games = this.getAvailableGames(),
                toSend = [];

            toSend.push('Voici les challenges disponibles :');
            games.forEach(function(g) {
                toSend.push('`' + g + '`');
            });
            toSend.push('Quel challenge voulez-vous lancer ?');
            this.send(toSend);
        }
    }

    onleaveInit(event, from, to, text) {
        let gameName = text.trim();
        try {
            require(`./challenges/${gameName}.js`); // try to load the given game
            this.context.model.currentGameName = gameName;
        } catch(e) {
            this.send(`Une erreur est survenue, le jeu à charger *${gameName}* n'existe pas.`);
            return false;
        }
    }

    onChallengeChosen(event, from, to) {
        let channelOrGroup = this.interface.getDataStore().getChannelById(this.context.channelId) || this.interface.getDataStore().getGroupById(this.context.channelId);
        if(channelOrGroup) {
            // Challenge was launched on a public channel or in a group
            channelOrGroup.members.forEach((member) => {
                this.interface.getDMIdByUserId(member)
                    .then((imId) => {
                        VirtualAssistant.getUsersCache().put(imId, this.id)
                        this.send([
                            `Bonjour, un Challenge Regex vient d'être lancé sur <#${channelOrGroup.id}|${channelOrGroup.name}>.`,
                            "Vous avez rejoint le challenge. Pour le quitter dites 'fin'"
                        ], imId);
                    }, (err) => {
                        // Do nothing, error
                    });
            });
        }
        this.help();
    }

    onHelp(event, from, to) {
        let toSend = this.getGameToDisplay().toSend;
        toSend.push('\n');
        toSend.push('Pour participer envoyez-moi vos propositions de regex en *message privé* !');
        toSend.push('Le premier à trouver une bonne réponse remporte le challenge !')
        this.send(toSend);
        this.wait();
    }

    onWait(event, from, to) {
        // Do nothing
    }

    onAnswerChannel(event, from, to, text, fromUserId, channelId) {
        let fromUser = this.interface.getDataStore().getUserById(fromUserId),
            imPlayerId = this.interface.getDataStore().getDMByUserId(fromUserId).id;
        if(VirtualAssistant.getUsersCache().get(imPlayerId)) {
            this.send('Merci de me faire vos propositions de réponse en *message privé* !', channelId);
            this.displayScoreboard(channelId);
        }
        else {
            // The user is in the channel but not in the challenge, add him
            let channelOrGroup = this.interface.getDataStore().getChannelById(this.context.channelId) || this.interface.getDataStore().getGroupById(this.context.channelId);
            VirtualAssistant.getUsersCache().put(imPlayerId, this.id);
            this.send(`Bienvenue ${fromUser.name} dans ce Challenge Regex.`);
            this.send([
                `Vous avez rejoint le challenge lancé sur <#${channelOrGroup.id}|${channelOrGroup.name}>. Pour le quitter dites 'fin'`
            ], imPlayerId);
        }
        this.wait();
    }

    onAnswer(event, from, to, text, playerId) {
        this.debug('BEGIN ###################################################');
        this.debug('ANSWER', playerId, text);
        try {
        var imPlayerId = this.interface.getDataStore().getDMByUserId(playerId).id;
        this.send('Vérifions ...', imPlayerId);

        if(!this.context.model.players[playerId]) {
            // First try of this player, add his name to the score board
            this.context.model.players[playerId] = {
                tries: 0
            };
        }
        if(this.context.model.players[playerId].win !== undefined) {
            this.send('Vous avez déjà gagné ! Retournez travailler !', imPlayerId);
        }
        else {
            this.debug('onAnswer', 'testTEXT', text);
            if(text) {
                this.context.model.players[playerId].tries++;
                var gameToDisplay = this.getGameToDisplay(text);
                if(gameToDisplay.validCount === this.getGame().game.length) {
                    this.context.model.players[playerId].bestScore = gameToDisplay.validCount;
                    this.context.model.players[playerId].bestAnswer = text;
                    var lastWinner = _.maxBy(this.getPlayersArray(), 'win');
                    this.context.model.players[playerId].win = lastWinner ? lastWinner.win + 1 : 1;
                    this.send('Bravo, vous avez trouvé une bonne réponse !', imPlayerId);

                    var bestPlayersByScore = _.chain(this.getPlayersArray())
                            .orderBy(['win', 'bestScore'], ['asc', 'desc'])
                            .value(),
                        toSend = [
                            'Un joueur a trouvé la bonne réponse !'
                        ];
                    if(bestPlayersByScore.length > 0) {
                        toSend.push('<@' + playerId + '> termine le challenge !');
                    }
                    this.send(toSend);
                    this.displayScoreboard();
                    if(imPlayerId === this.context.channelId) {
                        // Game was launched in private mode, by the current user.
                        // He won, finish the game
                        this.end();
                        return;
                    }
                }
                else {
                    var toSend = gameToDisplay.toSend,
                        validCount = gameToDisplay.validCount;

                    toSend.push("\n\nMalheureusement la bonne réponse n'est pas :");
                    toSend.push("`" + text + "`");

                    var bestPlayersByScoreBefore = this.getScoreBoard();
                    if(this.context.model.players[playerId].bestScore === undefined 
                        || this.context.model.players[playerId].bestScore < validCount) {
                        this.context.model.players[playerId].bestScore = validCount;
                        this.context.model.players[playerId].bestAnswer = text;
                    }

                    var bestPlayersByScoreAfter = this.getScoreBoard(),
                        sameScoreboard = (bestPlayersByScoreBefore.length === bestPlayersByScoreAfter.length);
                    if(sameScoreboard) {
                        _.forEach(bestPlayersByScoreBefore, function(player, i) {
                            var otherScoreboardPlayer = bestPlayersByScoreAfter[i];
                            sameScoreboard = sameScoreboard &&
                                otherScoreboardPlayer &&
                                otherScoreboardPlayer.playerId === player.playerId &&
                                otherScoreboardPlayer.bestScore === player.bestScore;
                        });
                    }

                    var myScore = _.find(bestPlayersByScoreAfter, {playerId: playerId}),
                        myPosition = _.indexOf(bestPlayersByScoreAfter, myScore) + 1; // TODO ici on reçoit -1 donc, on est 0
                        // lorsqu'on est pas dans le top 5, slicer le scoreboard apres, mais garder tout le monde au début.

                    toSend.push('Cette réponse vous place en position ' + myPosition + ' du classement, avec ' + validCount + ' bonnes réponses sur ' + this.getGame().game.length);
                    this.send(toSend, imPlayerId);

                    if(!sameScoreboard) {
                        this.displayScoreboard();
                    }

                    this.sendAdvices(text, imPlayerId);
                }
            }
        }
        }
        catch(e) {
            this.debug('------------------------------------------')
            this.debug('onAnswer error', e);
            this.debug('------------------------------------------')
        }
        this.debug('END ###################################################');
        this.wait();
    }

    onleaveWait(event, from, to, fromUserId) {
        if(event === 'end' && fromUserId) {
            let fromUser = this.interface.getDataStore().getUserById(fromUserId),
                imPlayerId = this.interface.getDataStore().getDMByUserId(fromUserId).id;
            if(!fromUser.is_admin 
                && !this.interface.isAdministrator(this.context.userId)
                && imPlayerId !== this.context.channelId /* playing alone in training mode */) {
                this.send('Vous quittez le challenge.', imPlayerId);
                this.send(`${fromUser.name} a quitté le challenge.`);
                VirtualAssistant.getUsersCache().del(imPlayerId, this.id);
                return false;
            }
        }
    }

    onEnd(event, from, to) {
        let bestPlayersByScore = _.chain(this.getPlayersArray())
                .orderBy(['win', 'bestScore'], ['asc', 'desc'])
                .value(),
            gameLength = this.getGame().game.length,
            toSend = [
                'Challenge terminé !'
            ],
            winnerCount = _.filter(bestPlayersByScore, function(e) {
                return e.win !== undefined;
            }),
            launchedByImPlayerId = this.interface.getDataStore().getDMByUserId(this.context.userId).id;

        Statistics.event(Statistics.events.REGEXP_END, {
            challengeId: this.id,
            game: this.context.model.currentGameName,
            userId: this.context.userId,
            winnersCount: winnerCount.length,
            playersCount: bestPlayersByScore.length,
            privateChallenge: (launchedByImPlayerId === this.context.channelId)
        });

        if(bestPlayersByScore.length > 0) {
            _.forEach(bestPlayersByScore, function(player) {
                if(player.win !== undefined) {
                    toSend.push('<@' + player.playerId + '> remporte le challenge avec la regex suivante : `' + player.bestAnswer + '` en ' + player.tries + ' tentative' + (player.tries>1?'s':''));
                }
                else {
                    toSend.push('<@' + player.playerId + '> termine avec un score de ' + player.bestScore + '/' + gameLength + ' avec la regex suivante : `' + player.bestAnswer + '` en ' + player.tries + ' tentative' + (player.tries>1?'s':''));
                }
            })
        }
        else {
            toSend.push("Personne n'a trouvé la bonne réponse ...");
        }
        this.send(toSend);
        this.clearCache();
    }

}


module.exports = RegexpChallenge;
