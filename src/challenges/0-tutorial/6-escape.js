let subject = `Imaginons que l'on veuille matcher les noms de domaines \`johndoe.fr\` et \`johndoe.com\`.
La regex qui nous viendrait donc à la tête serait la suivante : \`johndoe.(fr|com)\`.
Malheureusement, ce n'est pas la bonne regex, car même si les deux noms de domaine sont bien matchés, la chaîne \`johndoe-fr\` l'est aussi.
Ce problème vient du point présent dans la regex, car rappelez-vous que le point est un ensemble de caractères préconçus qui représente n'importe quel caractère : il peut représenter un a, un 2 mais aussi un tiret..
Pour faire comprendre que le point présent dans la regex est bien un point et non pas un ensemble de caractères, il nous faut échapper le point avec le caractère d'échappement qui est le backslash \`\\\`.
Ainsi la regex correcte est la suivante : \`johndoe\\.(fr|com)\`

Cet échappement n'est pas seulement valable pour le point, mais pour tous les caractères qui ont, de base, une valeur différente que celle habituelle.
En voici la liste : \`^ $ \\ | { } [ ] ( ) ? # ! + * .\`

----------------------------------------------------------------------

Pour ce challenge nous allons matcher des additions simple :
`;

module.exports = {
    mode: 'MATCH',
    subject: subject,
    game: [
        { input: '1+1=2', output: true },
        { input: '2+2=4', output: true },
        { input: 'azert', output: false },
        { input: '01234', output: false }
    ]
};
