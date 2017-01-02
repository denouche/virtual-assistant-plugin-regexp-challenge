module.exports = {
    mode: 'MATCH',
    subject: "Le but de ce challenge est de matcher les dates au format YYYY/MM/DD HH:MM(:SS).\n"
            + "YYYY est l'année comprise entre 1000 et " + new Date().getFullYear() + "\n"
            + "Le reste doit être un mois, une heure, une minute, une seconde valides.\n"
            + "Les secondes doivent être optionnelles.\n"
            + "Ne nous occupons pas des années bissextiles et partons du principe que tous les mois ont 30 jours.",
    game: [
        { input: '2012/09/18 12:10', output: true },
        { input: '2001/09/30 23:59:11', output: true },
        { input: '1995/12/01 12:12:12', output: true },
        { input: '1001/01/07 14:27', output: true },
        { input: '2010/10/20 10:10', output: true },
        { input: '2000/01/01 01:01:01', output: true },
        { input: '2007/07/22 22:34:59', output: true },
        { input: '2010/05/05 00:00:00', output: true },
        { input: '2012/9/18 23:40', output: false },
        { input: (new Date().getFullYear() + 1) + '/09/09 09:09', output: false },
        { input: '2012/00/01 01:49:59', output: false },
        { input: '2012/13/25 22:17:00', output: false },
        { input: '1994/11/00 12:12', output: false },
        { input: '2012/12/4 12:12', output: false },
        { input: '2009/11/11 24:00:00', output: false },
        { input: '2012/06/24 13:60', output: false },
        { input: '2002/10/10 14:59:60', output: false },
        { input: 'a2011/11/11 11:11:11', output: false },
        { input: '2005/05/05 05:05:05d', output: false }
    ]
};