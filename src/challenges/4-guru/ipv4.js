module.exports = {
    mode: 'MATCH',
    subject: "Le but de ce challenge est de matcher des adresse IP v4 dans les représentations suivantes :\n"
                + "- décimale séparé par des points\n"
                + "- hexadécimale séparé par des points\n"
                + "- hexadécimale\n"
                + "- binaire sous forme de 4 octets séparés par des points\n"
                + "- binaire 32 bits\n",
    game: [
        { input: '192.0.2.235', output: true },
        { input: '99.198.122.146', output: true },
        { input: '18.101.25.153', output: true },
        { input: '23.71.254.72', output: true },
        { input: '100.100.100.100', output: true },
        { input: '173.194.34.134', output: true },
        { input: '212.58.241.131', output: true },
        { input: '46.51.197.88', output: true },
        { input: '0xC0.0x00.0x02.0xEB', output: true },
        { input: '0xFF.0x12.0xF1.0x1F', output: true },
        { input: '0x11.0x22.0x33.0x44', output: true },
        { input: '00010111.11001000.01010111.10010001', output: true },
        { input: '00000000.00000000.00000000.00000000', output: true },
        { input: '11111111.11111111.11111111.11111111', output: true },
        { input: '11111111111111111111111111111111', output: true },
        { input: '00010111110010000101011110010001', output: true },
        { input: '0xC00002EC', output: true },
        { input: '0xFF12F11F', output: true },
        { input: '0x11223344', output: true },
        { input: '256.256.256.256', output: false },
        { input: '356.300.256.1', output: false },
        { input: '0x100.0x11.0x11.0x11', output: false },
        { input: '0x11.0x100.0x11.0x11', output: false },
        { input: '0xx20.0x20.0x20.0x20', output: false },
        { input: '0010101.00101.01010.110101011111', output: false },
        { input: '0x111001111', output: false },
        { input: '100.100.100', output: false },
        { input: '0x20.0x50.0x2', output: false },
        { input: '.100.100.100.100', output: false },
        { input: '100..100.100.100.', output: false },
        { input: '100.100.100.100.', output: false },
        { input: '256.100.100.100.100', output: false },
        { input: '100.100.100.100.0x40', output: false },
        { input: '0001011111001000010101111001000111011010110101', output: false, message: 'Trop long, le maximum est 11111111111111111111111111111111' }
    ]
};