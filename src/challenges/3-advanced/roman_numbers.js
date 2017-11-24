module.exports = {
    mode: 'MATCH',
    subject: "Le but de ce challenge est de matcher des nombres écrits en chiffres romains.\n",
    game: [
        { input: 'I', output: true },
        { input: 'III', output: true },
        { input: 'IV', output: true },
        { input: 'VIII', output: true },
        { input: 'XI', output: true },
        { input: 'L', output: true},
        { input: 'C', output: true},
        { input: 'M', output: true},
        { input: 'MI', output: true},
        { input: 'MCXI', output: true},
        { input: 'MMMMCMXCIX', output: true },

        { input: 'MISSISSIPPI', output: false },
        { input: 'IIIII', output: false },
        { input: 'XXXX', output: false },
        { input: 'XIXIXIXIX', output: false }
    ]
};
// \b((?=\\b[MCDXVI]+\\b)(?:M{1,4})?(?:C{1,3}|CD|DC{0,3}|C?M)?(?:X{1,3}|XL|LX{0,3}|X?C)?(?:I{1,3}|IV|VI{0,3}|I?X)?)\b
