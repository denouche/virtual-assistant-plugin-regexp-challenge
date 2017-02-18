let subject = `Nous venons de voir qu'un ensemble de caractères permet de définir de manière très simple les valeurs possible d'un caractère.
Mais qu'en est-il si l'on définir les mêmes valeurs possibles pour plusieurs caractères ?
Par exemple, si l'on veut sélectionner les parties du texte où il y a un m, suivi d'un a, suivi de 3 fois n'importe quelle lettre minuscule, est-on obligé d'utiliser une regex de ce type \`ma[a-z][a-z][a-z]\` ?
Non. Il existe une méthode plus simple qui consiste à utiliser les quantificateurs.
Ce sont des caractères qui indiquent le nombre de répétition du caractère ou de la suite de caractère qui les précèdent.

On peut les trouver sous différentes formes :
• \`{min,max}\` : le nombre de répétition varie entre la valeur minimale et la valeur maximale incluses
• \`{min,}\` : le nombre de répétition varie entre la valeur minimale incluse et l'infini
• \`{nombre}\` : le nombre de répétition correspond au nombre marqué entre les accolades
• \`*\` : 0 ou plusieurs répétitions
• \`+\` : 1 ou plusieurs répétitions
• \`?\` : 0 ou 1 répétition

----------------------------------------------------------------------

Pour ce challenge nous allons matcher des numéros de téléphones au format français, composés d'une répétition de 10 chiffres.
`;

module.exports = {
    mode: 'MATCH',
    subject: subject,
    game: [
        { input: '0102030405', output: true },
        { input: '0689784556', output: true },
        { input: '42', output: false },
        { input: 'azertyuiop', output: false }
    ]
};
