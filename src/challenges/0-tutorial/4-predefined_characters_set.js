let subject = `Il existe des classes de caractères prédéfinies, aussi appellées ensembles préconçus.
Il s'agit d'un raccourci pour certaines classes de caractères.

En voici quelques uns :
• \`\\w\` : "word", correspond à \`[a-zA-Z0-9_]\`
• \`\\d\` : "digit", correspond à \`[0-9]\`
• \`\\s\` : "space", correspond à \`[ \\t\\n\\x0B\\f\\r]\` (autrement dit, un espace, une tabulation, une fin de ligne)

Et leurs opposés :
• \`\\W\` : "non word", correspond à \`[^\\w]\`
• \`\\D\` : "non digit", correspond à \`[^\\d]\`
• \`\\S\` : "non space", correspond à \`[^\\s]\`
----------------------------------------------------------------------

Pour ce challenge nous allons matcher tous les caractères qui ne sont pas des chiffres, des lettres, ou des espaces.
`;

module.exports = {
    mode: 'MATCH',
    subject: subject,
    game: [
        { input: '买', output: true },
        { input: '!', output: true },
        { input: 'a', output: false },
        { input: '4', output: false }
    ]
};
