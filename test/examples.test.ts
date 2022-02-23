// @deno-types='../types/index.d.ts'
import XRegExp from  '../src/index.js'
import { assert, assertEquals } from "https://deno.land/std/testing/asserts.ts"

Deno.test({
    name: '01 - Using named capture and flag x for free-spacing and line comments', 
    fn: () => {
        const date = XRegExp(
            `(?<year>  [0-9]{4} ) -?  # year
             (?<month> [0-9]{2} ) -?  # month
             (?<day>   [0-9]{2} )     # day`, 'x')
        
        // XRegExp.exec provides named backreferences on the result's groups property
        let match = XRegExp.exec('2021-02-22', date)!
        assertEquals( match.groups!.year, '2021', 'Failed 01 test')

    },
    sanitizeResources: false,
    sanitizeOps: false
  })

  Deno.test({
    name: '02 - Optional pos and sticky arguments', 
    fn: () => {
        let pos = 3;
        const result = []
        let match: XRegExp.ExecArray | null
        while (match = XRegExp.exec('<1><2><3>4<5>', /<(\d+)>/, pos, 'sticky')) {
            result.push(match[1]);
            pos = match.index + match[0].length;
        }
        // result -> ['2', '3']
        assertEquals( result, ['2','3'] , 'Failed 02 test')
    },
    sanitizeResources: false,
    sanitizeOps: false
  })

  Deno.test({
    name: '03 - Backreferences in replacements', 
    fn: () => {
        const date = XRegExp(
            `(?<year>  [0-9]{4} ) -?  # year
             (?<month> [0-9]{2} ) -?  # month
             (?<day>   [0-9]{2} )     # day`, 'x');
        let res = XRegExp.replace('2021-02-22', date, '$<month>/$<day>/$<year>');
        // -> '02/22/2021'
        assertEquals( res, '02/22/2021', 'Failed 03-A test')
        res = XRegExp.replace('2021-02-22', date, (...args) => {
            // Named backreferences are on the last argument
            const groups: any = args[args.length - 1];
            return `${groups.month}/${groups.day}/${groups.year}`;
        });
        // -> '02/22/2021'
        assertEquals( res, '02/22/2021', 'Failed 03-B test')
    },
    sanitizeResources: false,
    sanitizeOps: false
  })

  Deno.test({
    name: '04 - XRegExps compile to RegExps and work with native methods', 
    fn: () => {
        const date = XRegExp(
            `(?<year>  [0-9]{4} ) -?  # year
             (?<month> [0-9]{2} ) -?  # month
             (?<day>   [0-9]{2} )     # day`, 'x');
        assertEquals( date.test('2021-02-22'), true , 'Failed 04-A test')
        // -> true
        // However, named captures must be referenced using numbered backreferences
        // if used with native methods
        assertEquals( '2021-02-22'.replace(date, '$2/$3/$1'), '02/22/2021', 'Failed 04-B test')
        // -> '02/22/2021'
    },
    sanitizeResources: false,
    sanitizeOps: false
  })

  Deno.test({
    name: '05 - XRegExps compile to RegExps and work with native methods', 
    fn: () => {
        const evens: number[] = [];
        XRegExp.forEach('1a2345', /\d/, (match, i) => {
            if (i % 2) evens.push(+match[0]);
        });
        // evens -> [2, 4]
        assertEquals( evens , [2, 4], 'Failed 05 test')
    },
    sanitizeResources: false,
    sanitizeOps: false
  })

  Deno.test({
    name: '06 - Use XRegExp.matchChain to get numbers within <b> tags', 
    fn: () => {
        const res = XRegExp.matchChain('1 <b>2</b> 3 <B>4 \n 56</B>', [
            XRegExp('<b>.*?</b>', 'is'),
            /\d+/
        ]);
        // -> ['2', '4', '56']

        assertEquals( res , ['2', '4', '56'], 'Failed 06 test')
    },
    sanitizeResources: false,
    sanitizeOps: false
  })

  Deno.test({
    name: '07 - Pass forward and return specific backreferences', 
    fn: () => {
        // You can also pass forward and return specific backreferences
        const html = `<a href="https://xregexp.com/">XRegExp</a>
        <a href="https://www.google.com/">Google</a>`;
        let res = XRegExp.matchChain(html, [
        {regex: /<a href="([^"]+)">/i, backref: 1},
        {regex: XRegExp('(?i)^https?://(?<domain>[^/?#]+)'), backref: 'domain'}
        ]);
        // -> ['xregexp.com', 'www.google.com']
        assertEquals( res , ['xregexp.com', 'www.google.com'], 'Failed 07 test')
    },
    sanitizeResources: false,
    sanitizeOps: false
  })

  Deno.test({
    name: '08 - Pass forward and return specific backreferences', 
    fn: () => {
        // You can also pass forward and return specific backreferences
        const html = `<a href="https://xregexp.com/">XRegExp</a>
        <a href="https://www.google.com/">Google</a>`;
        let res = XRegExp.matchChain(html, [
        {regex: /<a href="([^"]+)">/i, backref: 1},
        {regex: XRegExp('(?i)^https?://(?<domain>[^/?#]+)'), backref: 'domain'}
        ]);
        // -> ['xregexp.com', 'www.google.com']
        assertEquals( res , ['xregexp.com', 'www.google.com'], 'Failed 07 test')
    },
    sanitizeResources: false,
    sanitizeOps: false
  })

  Deno.test({
    name: '09 - Merge strings and regexes, with updated backreferences', 
    fn: () => {
         // Merge strings and regexes, with updated backreferences
        let regexp = XRegExp.union(['m+a*n', /(bear)\1/, /(pig)\1/], 'i', {conjunction: 'or'});
        // -> /m\+a\*n|(bear)\1|(pig)\2/i
        assertEquals( regexp , /m\+a\*n|(bear)\1|(pig)\2/i , 'Failed 09 test')
    },
    sanitizeResources: false,
    sanitizeOps: false
  })

  Deno.test({
    name: '10 - Unicode use of Script= prefix to match ES2018: \\p{Script=Hiragana}', 
    fn: () => {
         // Merge strings and regexes, with updated backreferences
        let regexp = XRegExp.union(['m+a*n', /(bear)\1/, /(pig)\1/], 'i', {conjunction: 'or'});
        // -> /m\+a\*n|(bear)\1|(pig)\2/i
        assertEquals( XRegExp('^\\p{Hiragana}+$').test('ひらがな'), true,  'Failed 10-A test')
        assertEquals( XRegExp('^[\\p{Latin}\\p{Common}]+$').test('Über Café.'), true,  'Failed 10-B test')
    },
    sanitizeResources: false,
    sanitizeOps: false
  })

  Deno.test({
    name: '11 - Unicode use the short names \\p{L} and \\p{M}', 
    fn: () => {
        const unicodeWord = XRegExp.tag()`^\p{Letter}[\p{Letter}\p{Mark}]*$`;
        assertEquals( unicodeWord.test('Русский'), true,  'Failed 11-A test')
        assertEquals( unicodeWord.test('日本語'), true,  'Failed 11-B test')
        assertEquals( unicodeWord.test('العربية'), true,  'Failed 11-C test')
    },
    sanitizeResources: false,
    sanitizeOps: false
  })

  Deno.test({
    name: '12 - Using flag A to match astral code points', 
    fn: () => {
        assertEquals( XRegExp('^\\p{S}$').test('💩'), false,  'Failed 12-A test')
        assertEquals( XRegExp('^\\p{S}$', 'A').test('💩'), true,  'Failed 12-B test')
        // Using surrogate pair U+D83D U+DCA9 to represent U+1F4A9 (pile of poo)
        assertEquals( XRegExp('^\\p{S}$', 'A').test('\uD83D\uDCA9'), true,  'Failed 12-C test')
    },
    sanitizeResources: false,
    sanitizeOps: false
  })

  Deno.test({
    name: '13 - Implicit flag A', 
    fn: () => {
        XRegExp.install('astral')
        assertEquals( XRegExp('^\\p{S}$').test('💩'), true,  'Failed 13-A test')
    },
    sanitizeResources: false,
    sanitizeOps: false
  })

  Deno.test({
    name: '14 - Build regular expressions using named subpatterns', 
    fn: () => {
        const time = XRegExp.build('(?x)^ {{hours}} ({{minutes}}) $', {
            hours: XRegExp.build('{{h12}} : | {{h24}}', {
                h12: /1[0-2]|0?[1-9]/,
                h24: /2[0-3]|[01][0-9]/
            }),
            minutes: /^[0-5][0-9]$/
        });
        assertEquals(  time.test('10:59'), true,  'Failed 14-A test')
        let res: any = XRegExp.exec('10:59', time)
        assertEquals(  res.groups.minutes, '59',  'Failed 14-B test') 
    },
    sanitizeResources: false,
    sanitizeOps: false
  })

  Deno.test({
    name: '15 - Tagged template literals that create regexes', 
    fn: () => {
        

        assertEquals( XRegExp.tag()`\b\w+\b`.test('word'), true,  'Failed 15-A test')

        const hours = /1[0-2]|0?[1-9]/;
        const minutes = /(?<minutes>[0-5][0-9])/;
        const time = XRegExp.tag('x')`\b ${hours} : ${minutes} \b`;
        assertEquals( time.test('10:59'), true,  'Failed 15-B test')
        assertEquals( XRegExp.exec('10:59', time)!.groups!.minutes, '59',  'Failed 15-C test')

        const backref1 = /(a)\1/;
        const backref2 = /(b)\1/;
        assertEquals( XRegExp.tag()`${backref1}${backref2}`.test('aabb'), true,  'Failed 15-D test')
    },
    sanitizeResources: false,
    sanitizeOps: false
  })

  Deno.test({
    name: '16 - Matching recursive constructs using XRegExp pattern strings as left and right delimiters', 
    fn: () => {
        const str1 = '(t((e))s)t()(ing)';
        assertEquals(XRegExp.matchRecursive(str1, '\\(', '\\)', 'g'), ['t((e))s', '', 'ing'],  'Failed 16-A test' )
        // -> ['t((e))s', '', 'ing']

        // Extended information mode with valueNames
        const str2 = 'Here is <div> <div>an</div></div> example';
        let res = XRegExp.matchRecursive(str2, '<div\\s*>', '</div>', 'gi', {
            valueNames: ['between', 'left', 'match', 'right']
        });
        assertEquals(res, [
            {name: 'between', value: 'Here is ',       start: 0,  end: 8},
            {name: 'left',    value: '<div>',          start: 8,  end: 13},
            {name: 'match',   value: ' <div>an</div>', start: 13, end: 27},
            {name: 'right',   value: '</div>',         start: 27, end: 33},
            {name: 'between', value: ' example',       start: 33, end: 41}
            ],  'Failed 16-B test' )

        // Omitting unneeded parts with null valueNames, and using escapeChar
        const str3 = '...{1}.\\{{function(x,y){return {y:x}}}';
        res = XRegExp.matchRecursive(str3, '{', '}', 'g', {
            valueNames: ['literal', null, 'value', null],
            escapeChar: '\\'
        });
        assertEquals(res,[
            {name: 'literal', value: '...',  start: 0, end: 3},
            {name: 'value',   value: '1',    start: 4, end: 5},
            {name: 'literal', value: '.\\{', start: 6, end: 9},
            {name: 'value',   value: 'function(x,y){return {y:x}}', start: 10, end: 37}
            ],  'Failed 16-C test' )

        // Sticky mode via flag y
        const str4 = '<1><<<2>>><3>4<5>';
        assertEquals( XRegExp.matchRecursive(str4, '<', '>', 'gy'), ['1', '<<2>>', '3'],  'Failed 16-D test' )

        // Skipping unbalanced delimiters instead of erroring
        const str5 = 'Here is <div> <div>an</div> unbalanced example';
        let res1 =  XRegExp.matchRecursive(str5, '<div\\s*>', '</div>', 'gi', {
            unbalanced: 'skip'
        });
        assertEquals( res1, ['an'] ,  'Failed 16-E test' )
    },
    sanitizeResources: false,
    sanitizeOps: false
  })
