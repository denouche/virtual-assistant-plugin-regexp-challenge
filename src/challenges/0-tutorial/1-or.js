let subject = `Imaginons maintenant que nous voulons rechercher, dans le texte, les mots \`bonjour\` et \`revoir\`, c'est à dire le mot \`bonjour\` OU le mot \`revoir\`.
Pour ce faire nous devrons alors utiliser la barre verticale \`|\` (le pipe).

Pour être certains de bien matcher uniquement le mot \`bonjour\` et le mot \`revoir\` nous pouvons les placer entre parenthèses.
Cela donnerait : \`^(bonjour|revoir)$\`
----------------------------------------------------------------------

Pour ce challenge nous allons donc devoir matcher les mots \`mots\`, \`mats\` ou \`mits\`.
`;

module.exports = {
    mode: 'MATCH',
    subject: subject,
    game: [
        { input: 'mots', output: true },
        { input: 'mats', output: true },
        { input: 'mits', output: true },
        { input: 'muts', output: false },
        { input: 'azer', output: false }
    ]
};
