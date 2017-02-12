module.exports = {
    mode: 'MATCH',
    subject: "Le but de ce challenge est de matcher des regexp contenant *AU MOINS* la classe de caractères 'word' dans sa version longue : `[a-zA-Z0-9_]`.",
    game: [
        { input: '[a-zA-Z0-9_]', output: true },
        { input: '[a-z0-9A-Z_]', output: true },
        { input: '[0-9a-zA-Z_]', output: true },
        { input: '[A-Z_a-z0-9]', output: true },
        { input: '[A-Za-z_0-9]', output: true },
        { input: '[a-zA-Z0-9_]', output: true },
        { input: '[A-Za-z0-9_]', output: true },
        { input: '[A-Z0-9a-z_]', output: true },
        { input: '[a-zA-Z_0-9]', output: true },
        { input: '[a-z0-9_A-Z]', output: true },
        { input: '[a-z_A-Z0-9]', output: true },
        { input: '[_a-zA-Z0-9]', output: true },
        { input: '[_A-Za-z0-9]', output: true },
        { input: '[_a-z0-9A-Z]', output: true },
        { input: '[_0-9a-zA-Z]', output: true },

        { input: '[*%_0-9a-zA-Zéà&]', output: true },
        { input: '[_0-9a-zA-Z.$-]', output: true },
        { input: '[_a-zè=+0-9A-Z]', output: true },
        { input: '[a-z電电電買买買A-Z無无無鳥鸟鳥熱0-9開東东_開开東車车車紅红紅馬马馬热熱時时時語语語]', output: true }

        { input: '[A-Z0-9_]', output: false },
        { input: '[A-Z0-9_][a-z]', output: false },
        { input: '[a-z0-9_]', output: false },
        { input: '[a-zA-Z_]', output: false },
        { input: '[a-zA-Z0-9]', output: false },
        { input: 'a-zA-Z0-9_', output: false },
    ]
};