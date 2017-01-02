module.exports = {
    // New
    mode: 'MATCH',
    subject: `Le but de ce challenge est de matcher l'heure, au format 24h et au format 12h.`,
    game: [
        { input: '00:00', output: true },
        { input: '01:59', output: true },
        { input: '10:12', output: true },
        { input: '12:59', output: true },
        { input: '14:00', output: true },
        { input: '23:59', output: true },
        { input: '12:00 AM', output: true },
        { input: '1:00 AM', output: true },
        { input: '11:00 AM', output: true },
        { input: '12:00 PM', output: true },
        { input: '1:00 PM', output: true },
        { input: '11:00 PM', output: true },
        
        { input: '0:00 AM', output: false },
        { input: '0:00 PM', output: false },
        { input: '24:00', output: false },
        { input: '30:00', output: false },
        { input: '12:60', output: false },
        { input: '12:', output: false },
        { input: ':00', output: false },
        { input: '-1', output: false },
        { input: 'azerty', output: false }
    ]
};  