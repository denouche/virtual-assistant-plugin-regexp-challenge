let subject = `Les ensembles de caractères permettent aussi d'exclure des caractères grâce à l'accent circonflexe.
Par exemple pour matcher un caractère qui n'est pas un chiffre, on peut écrire \`[^0-9]\`.
Ou pour matcher un caractère qui n'est pas un chiffre, ni une lettre, ni une étoile, on peut écrire \`[^0-9a-z*]\`.

----------------------------------------------------------------------

Pour ce challenge nous allons donc devoir matcher la lettre \`t\` suivie de n'importe quoi sauf d'un chiffre, d'une lettre minuscules, ou d'un tiret bas.
`;

module.exports = {
    mode: 'MATCH',
    subject: subject,
    game: [
        { input: 'to', output: false },
        { input: 'ta', output: false },
        { input: 't9', output: false },
        { input: 't_', output: false },
        { input: 'tA', output: true },
        { input: 't买', output: true }
    ]
};
