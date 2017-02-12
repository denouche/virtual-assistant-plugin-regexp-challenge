module.exports = {
    mode: 'MATCH',
    subject: "Le but de ce challenge est de matcher des numéros de téléphone au format français, avec un séparateur entre les groupes de chiffres, ou pas.\n",
    game: [
        { input: '0320304050', output: true },
        { input: '03.20.30.40.50', output: true },
        { input: '03 20 90 65 32', output: true },
        { input: '03 20.567898', output: true },
        { input: '06 78 98 98 9', output: false },
        { input: 'azertyuiop', output: false },
        { input: '0745W24544', output: false },
        { input: '0.1.2.3.4.5.6.7.8.9', output: false }
    ]
};
