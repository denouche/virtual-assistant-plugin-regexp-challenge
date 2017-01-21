// TODO
// {1,} >>> +
// {0,1} >>> ?
// {0,} >>> *
// (x)QUANTIFIER >>> xQUANTIFIER
// (azerty)NO_QUANTIFIER >>> azerty
// (\d) >>> \d
// (a) >>> a
// [s]? >>> s?
// (?:X) >>> X
// (http|https) >>> https?
// (azerty|azehjk) >>> aze(rty|hjk)
// (a|b|c|\s) >>> [abc\s]

const advices = [
    { input: /(?:^[^\^]|[^\$]$)/, tip: 'Pour être sûr de bien matcher les lignes complètes et non des parties des strings, il vaut mieux placer un `^` au début de votre regexp, et un `$` à la fin de celle-ci.'},
    { input: /\[[^\]]*0-9[^\]]*\]/, tip: 'Vous pouvez remplacer la classe de caracères `[0-9]` par le raccourci `\\d`' },
    { input: /\[[^\]]*(?:a-z[^\]]*A-Z[^\]]*0-9[^\]]*_|a-z[^\]]*A-Z[^\]]*_[^\]]*0-9|a-z[^\]]*0-9[^\]]*A-Z[^\]]*_|a-z[^\]]*0-9[^\]]*_[^\]]*A-Z|a-z[^\]]*_[^\]]*A-Z[^\]]*0-9|a-z[^\]]*_[^\]]*0-9[^\]]*A-Z|A-Z[^\]]*a-z[^\]]*0-9[^\]]*_|A-Z[^\]]*a-z[^\]]*_[^\]]*0-9|A-Z[^\]]*0-9[^\]]*a-z[^\]]*_|A-Z[^\]]*0-9[^\]]*_[^\]]*a-z|A-Z[^\]]*_[^\]]*a-z[^\]]*0-9|A-Z[^\]]*_[^\]]*0-9[^\]]*a-z|0-9[^\]]*a-z[^\]]*A-Z[^\]]*_|0-9[^\]]*a-z[^\]]*_[^\]]*A-Z|0-9[^\]]*A-Z[^\]]*a-z[^\]]*_|0-9[^\]]*A-Z[^\]]*_[^\]]*a-z|0-9[^\]]*_[^\]]*a-z[^\]]*A-Z|0-9[^\]]*_[^\]]*A-Z[^\]]*a-z|_[^\]]*a-z[^\]]*A-Z[^\]]*0-9|_[^\]]*a-z[^\]]*0-9[^\]]*A-Z|_[^\]]*A-Z[^\]]*a-z[^\]]*0-9|_[^\]]*A-Z[^\]]*0-9[^\]]*a-z|_[^\]]*0-9[^\]]*a-z[^\]]*A-Z|_[^\]]*0-9[^\]]*A-Z[^\]]*a-z)[^\]]*\]/, tip: 'Vous pouvez remplacer la classe de caracères `[a-zA-Z0-9_]` par le raccourci `\\w`' }
];

class RegexAdvisor {

	getTips(text) {
		var result = [];
		advices.forEach(function(ad) {
            if(ad.input.test(text)) {
                result.push(`- ${ad.tip}`)
            }
        });
        return result;
	}

}


module.exports = RegexAdvisor;
