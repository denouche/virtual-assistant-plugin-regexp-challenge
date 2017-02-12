module.exports = {
    // New
    mode: 'MATCH',
    subject: `Le but de ce challenge est de matcher des nombres, quelque soit leur séparateur décimal, et dans leurs notations Française et Anglaise.
    En Anglais un nombre s'écrit par groupe de 3 chiffres séparés par des virgules, et le séparateur décimal est le point.
    En Français un nombre s'écrit par groupe de 3 chiffres séparés par des espaces, ou pas, et le séparateur décimal est la virgule.`,
    game: [
        { input: '10', output: true },
        { input: '10,5', output: true },
        { input: '10.5', output: true },
        { input: '200', output: true },
        { input: '4000,1234', output: true },
        { input: '4 000,1234', output: true },
        { input: '4,000.1234', output: true },
        { input: '5000000', output: true },
        { input: '5,000,000', output: true },
        { input: '5 000 000', output: true },
        { input: '7000000000000000000000', output: true },
        { input: '7,000,000,000,000,000,000,000', output: true },
        { input: '7 000 000 000 000 000 000 000', output: true },
        { input: '8000,5', output: true },
        { input: '8,000,5', output: false },
        { input: '8,000,55', output: false },
        { input: '9,000,', output: false },
        { input: '9000.', output: false },
        { input: 'azerty', output: false }
    ]
};