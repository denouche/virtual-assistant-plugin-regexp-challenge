module.exports = {
    mode: 'MATCH',
    subject: "Le but de ce challenge est de matcher des URL en http ou https, avec des sous domaines ou pas, et un port ou pas.\n",
    game: [
        { input: 'http://sousdomaine.mondomaine.fr', output: true },
        { input: 'https://sousdomaine.mondomaine.com:8080', output: true },
        { input: 'http://toto.tata.tutu.fr', output: true },
        { input: 'https://toto.sousdomaine.mondomaine.fr', output: true },
        { input: 'p://sousdomaine.mondomaine.fr', output: false },
        { input: 'oupshttp://sousdomaine.mondomaine.fr', output: false },
        { input: 'http://sousdomaine.mondomaine.', output: false },
        { input: 'http://sousdomaine.mondomaine.fr:azerty', output: false },
        { input: 'http://', output: false },
        { input: 'https//mondomaine.fr', output: false },
        { input: 'https://mondomaine.fr', output: true },
        { input: 'https//.fr', output: false },
        { input: 'mondomaine.fr', output: false },
    ]
};