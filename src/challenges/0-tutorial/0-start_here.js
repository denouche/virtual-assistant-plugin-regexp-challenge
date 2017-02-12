let subject = `Bienvenue ! Nous allons nous entrainer et apprendre ensemble les regexp.
Nous allons voir dans ces premiers challenges "tutorial" quelques concepts de base.

Voici ci dessous une série de string : ce sont les cas sur lesquels nous allons travailler.
Le but de chaque challenge est d'écrire une regexp correspondant à tous ces cas.
A côté de chacun de ces cas vous avez le résultat attendu :
• \`must match\` signifie que votre regexp doit matcher la string
• \`must not match\` signifie que votre regexp ne doit pas matcher la string

Vous devez m'envoyer votre regexp réponse en message privé.
En retour je vous listerai les cas qui sont validés par votre regex (ils seront ~barrés~), et ceux qui ne sont pas validés.
Votre but est donc de trouver une regexp permettant de valider tous les cas !

----------------------------------------------------------------------
Pour ce premier challenge il faut trouver une regexp matchant les strings qui ne contiennent QUE que le mot \`bonjour\`.
En d'autres termes, il faut vérifier que le mot \`bonjour\` est encadré par un début de ligne et par une fin de ligne.

Voici quelques indices ...
Dans une regexp :
• le début d'une ligne est représenté par \`^\`
• le fin d'une ligne est représenté par \`$\`

Essayez de commencer en m'envoyant juste \`bonjour\` ! Bon amusement ! :)
`;

module.exports = {
    mode: 'MATCH',
    subject: subject,
    game: [
        { input: 'bonjour', output: true },
        { input: 'Hey ! bonjour ! ça va ?', output: false }
    ]
};
