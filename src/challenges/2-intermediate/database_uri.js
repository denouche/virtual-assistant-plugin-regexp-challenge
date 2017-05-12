module.exports = {
    mode: 'MATCH',
    subject: "Le but de ce challenge est de matcher des URI de connexion à des bases de données.\n" +
            "Tip: voici le schéma d'une URI de connexion : `protocol://[:login[:pwd]]@url[:port][/:uri[?:parameter=:value]]`\n",
    game: [
        { input: 'couchbase://sousdomaine.mondomaine.fr', output: true },
        { input: 'mongodb://sousdomaine.mondomaine.com:8080', output: true },
        { input: 'postgres://toto.tata.tutu.fr', output: true },
        { input: 'postgres://localhost/test', output: true },
        { input: 'mongodb://db1.example.net,db2.example.net:2500/?replicaSet=test', output: true },
        { input: 'couchbase://mon.login:azerty:mondomaine.fr', output: true },
        { input: 'couchbase://sousdomaine.mondomaine.fr:azerty', output: false },
        { input: 'mongodb://', output: false },
        { input: 'mongodb//.fr', output: false },
        { input: 'mondomaine.fr', output: false },
        { input: 'youpi!', output: false }
    ]
};
