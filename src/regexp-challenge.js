const AssistantFeature = require('virtual-assistant').AssistantFeature,
    ConfigurationService = require('virtual-assistant').ConfigurationService,
    SlackService = require('virtual-assistant').SlackService,
    RegexAdvisor = require('./regexp-advisor'),
    StateMachine = require('javascript-state-machine'),
    _ = require('lodash'),
    util = require('util'),
    vm = require('vm'),
    path = require('path'),
    fs = require('fs-extra');

const myRegexpAdvisor = new RegexAdvisor();


class RegexpChallenge extends AssistantFeature {

    static getId(interfaceType, channelOrImId) {
        var id = 'RegexpChallenge-' + interfaceType + '-';
        if(interfaceType === 'im') {
            id += channelOrImId;
        }
        return id;
    }

    static getTriggerKeywords() {
        return [
            'regex', 'regexp'
        ];
    }

    static getTTL() {
        return 120 /* min */ * 60;
    }



    constructor(interfac, context, id) {
        super(interfac, context, id);
        StateMachine.create({
            target: RegexpChallenge.prototype,
            error: function(eventName, from, to, args, errorCode, errorMessage) {
                console.error('Uncatched error',  'event ' + eventName + ' was naughty :- ' + errorMessage);
                console.error(args);
            },
            initial: { state: 'Init', event: 'startup', defer: true }, // defer is important since the startup event is launched after the fsm is stored in cache
            terminal: 'End',
            events: [
                { name: 'startup', from: 'none',   to: 'Init' },

                { name: 'help', from: 'Init',   to: 'Help' },

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
        //    }
        //  }
        // }
        this.context.model = {
            players: {},
            currenGame: undefined
        };
    }


    handle(message, context) {
        super.handle(message, context);
        if(this.current === 'none') {
            this.startup();
        }
        else {
            if(message.match(/(?:help|aide)/i) && this.canTriggerEvent('help')) {
                this.help(context.userId);
            }
            else if(message.match(/^(?:fin|end|exit|stop|quit|quitter|bye)$/i) && this.canTriggerEvent('end')) {
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
            var gameName = ConfigurationService.get('regexpchallenge.game');
            this.context.model.currentGame = undefined;
            try {
                this.context.model.currentGame = require(`./challenges/${gameName}.js`);
            } catch(e) {
                console.error(`Error while loading regexp game ${gameName}`);
                let toSend = [`Une erreur est survenue, le jeu à charger *${gameName}* n'existe pas.`];
                let files = fs.walkSync(path.join(__dirname, 'challenges'));
                toSend.push("Pour configurer le challenge en cours, utilisez le mode configuration et affectez l'une des valeurs suivantes à la propriété `regexpchallenge.game` :");
                files.forEach(function(f) {
                    let matcher = f.match(new RegExp('^' + path.join(__dirname, 'challenges') + '/(.+)\.js$'))
                    if(matcher && matcher[1]) {
                        toSend.push('`' + matcher[1] + '`');
                    }
                });
                this.send(toSend);
                this.send('Fin du challenge.');
                this.endAndClearCache();
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
        let playersArray = this.getPlayersArray();
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



    /******** STATES *********/

    onInit(event, from, to) {
        var fromUser = SlackService.getDataStore().getUserById(this.context.userId),
            imPlayerId = SlackService.getDataStore().getDMByUserId(this.context.userId).id;
        if(!fromUser.is_admin 
            && 'U2Q4ALC6B' !== this.context.userId /* xee */ 
            && 'U0DHA6T5L' !== this.context.userId /* sfeirgroup*/
            && imPlayerId !== this.context.channelId /* playing alone in training mode */) {
            this.send('Désolé, seul un administrateur peut lancer un challenge.');
            this.endAndClearCache();
        }
        else {
            this.send("C'est parti pour le Challenge Regex !");
            this.help();
        }
    }

    onHelp(event, from, to) {
        var toSend = this.getGameToDisplay().toSend;
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
        this.send('Merci de me faire vos propositions de réponse en *message privé* !', channelId);
        this.displayScoreboard(channelId);
        this.wait();
    }

    onAnswer(event, from, to, text, playerId) {
        console.log('BEGIN ###################################################');
        console.log('ANSWER', playerId, text);
        try {
        var imPlayerId = SlackService.getDataStore().getDMByUserId(playerId).id;
        //TODO ICI on doit récupérer lID du DM à partir de lID du player
        //En attente de https://github.com/slackapi/node-slack-sdk/pull/264
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
            console.log('onAnswer', 'testTEXT', text);
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
            console.error('------------------------------------------')
            console.error('onAnswer error', e);
            console.error('------------------------------------------')
        }
        console.log('END ###################################################');
        this.wait();
    }

    onleaveWait(event, from, to, fromUserId) {
        if(event === 'end' && fromUserId) {
            var fromUser = SlackService.getDataStore().getUserById(fromUserId),
                imPlayerId = SlackService.getDataStore().getDMByUserId(fromUserId).id;
            if(!fromUser.is_admin 
                && 'U2Q4ALC6B' !== fromUserId /* xee */ 
                && 'U0DHA6T5L' !== fromUserId /* sfeirgroup*/
                && imPlayerId !== this.context.channelId /* playing alone in training mode */) {
                this.send('Désolé, seul un administrateur peut mettre fin au challenge.');
                return false;
            }
        }
    }

    onEnd(event, from, to) {
        var bestPlayersByScore = _.chain(this.getPlayersArray())
                .orderBy(['win', 'bestScore'], ['asc', 'desc'])
                .value(),
            gameLength = this.getGame().game.length,
            toSend = [
                'Challenge terminé !'
            ];
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
        this.endAndClearCache();
    }

}


module.exports = RegexpChallenge;
