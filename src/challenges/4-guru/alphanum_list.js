module.exports = {
    mode: 'MATCH',
    subject: "Le but de ce challenge est de matcher des groupes de 2 à 4 caractères alphanumériques séparés par des virgules.\n",
    game: [
        { input: 'a', output: false },
        { input: 'aa', output: true },
        { input: 'aaa', output: true },
        { input: 'aaaa', output: true },
        { input: 'aaaaa', output: false },
        { input: 'aaa,111', output: true },
        { input: 'aaaa,111', output: true },
        { input: 'aaa,111,', output: false },
        { input: 'aaa,1111,bb', output: true },
        { input: 'aaa,1111,bb222', output: false },
        { input: 'aaa,1111,bb,222', output: true },
        { input: 'aaa,1111,bb,222,333', output: true },
        { input: 'aaa,1111,bb,222,333cc4', output: false },
        { input: 'aaa,1111,bb,222,333,cc4', output: true },
        { input: 'aaa,1111,bb,222,333,cc4,55d', output: true },
        { input: 'aaa,1111,bb,222,333,cc4,55d,666', output: true }
    ]
};