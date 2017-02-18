let subject = `Nous allons maintenant découvrir les "classes de caractères".
Les classes de caractères permettent de définir en quelque sorte un "OU".
Elles sont délimitées par des crochets dans lesquels se trouvent les caractères faisant parti du OU.
Ainsi la regexp \`m[oai]ts\` est beaucoup plus succinte que \`(mots|mats|mits)\`, et sélectionne les mêmes mots.

Enfin, gros avantage des classes de caractères, elles permettent de donner un intervalle de caractères.
Pour dire "n'importe quelle lettre", au lieu d'écrire \`m[abcdefghijklmnopqrstuvwxyz]ts\` on peut ainsi écrire \`m[a-z]ts\`.

Il existe plusieurs intervalles couramment utilisés :
• \`[a-z]\` : lettres minuscules de a à z
• \`[A-Z]\` : lettres minuscules de A à Z
• \`[0-9]\` : chiffres de 0 à 9

On peut aussi mixer le tout :
• \`[a-zA-Z]\` : lettres minuscules ou majuscules
• \`[_+*0-6]\` : le \`_\`, le \`+\`, l' \`*\`, ou les chiffres de 0 à 6

----------------------------------------------------------------------

Pour ce challenge nous allons donc devoir matcher la lettre \`t\` suivie d'un chiffre, d'une lettre minuscules, ou d'un tiret bas.
`;

module.exports = {
    mode: 'MATCH',
    subject: subject,
    game: [
        { input: 'to', output: true },
        { input: 'ta', output: true },
        { input: 't9', output: true },
        { input: 't_', output: true },
        { input: 'tA', output: false },
        { input: 't买', output: false }
    ]
};
