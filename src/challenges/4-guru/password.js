module.exports = {
    mode: 'MATCH',
    subject: "Le but de ce challenge est de vérifier la validité d'un mot de passe, en vérifiant que ce mot de passe respecte les conditions suivantes :\n"
                + "- contient au moins une lettre minuscule\n"
                + "- contient au moins une lettre majuscule\n"
                + "- contient au moins un chiffre\n"
                + "- contient au moins un caractère spécial (autre que lettre ou chiffre)\n"
                + "- dans n'importe quel ordre\n",
    game: [
        { input: 'aaaaaaaaaa', output: false },
        { input: 'ZZZZZZZZZZ', output: false },
        { input: '12345678', output: false },
        { input: 'Pokemon59', output: false },
        { input: '$*!&', output: false },
        { input: '$2aP', output: false },
        { input: '$2azertyOP', output: true },
        { input: 'New-York2017', output: true },
        { input: '0xC0.0x00.0x02.0xEB', output: true }
    ]
};