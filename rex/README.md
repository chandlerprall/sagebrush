# Rex

**R**egular **ex**pression engine for *sagebrush*

## Support/Features

* UTF-8 (unicode) characters in regular expressions and in matched-against text
* character sets `[a-zA-Z]` & negation `[^a-zA-Z]`
* dotall `.` (always matches all characters, including line breaks)
* match beginning `^`, only start of input, does not include line breaks 
* match end `$`, only end of input, does not include line breaks 
* special characters, escapes
    * whitespace `\s\S`, matches `[ \t\n\r]`
    * digit `\d\D`
    * word `\w\W`, matches `[a-zA-Z0-9_]`
    * `\n`, `\r`, and `\t` are understood as their common whitespace equivalent
    * all other escape sequences match the escaped character, e.g. `\\` for `\`, `\a` for `a`
* greedy and non-greedy matching with `*`, `+`, `?`, `*?`, and `??`
* alternatives/or `|`
* groups `()`
* named capture groups `(?<capturename>)` - see [Named capture groups](#named-capture-groups)
* lookahead assertions `foo(?=bar)`

## Usage

```javascript
import Rex from '@sagebrush/rex';

const regex = new Rex('foo|bar');

regex.match('a fool and his money are soon parted');
// { text: 'foo', captures: {} }

regex.match('an open mouth catches no flies');
// undefined
```

The `match` method optionally takes an index to begin searching:

```javascript
// start match at the 4th character, won't find "foo"
regex.match('a fool and his money are soon parted', 3); // undefined
```

## Named capture groups

Unnamed groups only provide a means to associate pieces of the expression. To extract specific instances the group must be _named_.

```javascript
const regex = new Rex('it was the (?<type>.*?) of times');

regex.match('it was the best of times, it was the worst of times');
// { text: 'it was the best of times', captures: { type: 'best' } }
``` 

If the same name is used (and matches) multiple times, all matching values are recorded.

```javascript
const regex = new Rex('it was the (?<type>\\S+) of times, it was the (?<type>\\S+) of times');

regex.match('it was the best of times, it was the worst of times');
// {
//   text: 'it was the best of times, it was the worst of times',
//   captures: { type: 'bestworst' }
// }
```

This also happens when a single named capture group matches multiple times.

```javascript
const regex = new Rex('(it was the (?<type>\\S+) of times(, )?)+');

regex.match('it was the best of times, it was the worst of times');
// {
//   text: 'it was the best of times, it was the worst of times',
//   captures: { type: 'bestworst' }
// }
```