# JSON-parser

[![CircleCI](https://circleci.com/gh/pvienneau/extensible-parser/tree/develop.svg?style=shield)](https://circleci.com/gh/pvienneau/extensible-parser/tree/develop)

[![Code Climate](https://codeclimate.com/github/pvienneau/JSON-parser/badges/gpa.svg)](https://codeclimate.com/github/pvienneau/JSON-parser)

A simple JSON parser.

## How to use

```
const input = '{"some":["json", "to", "validate"]}';
const map = require('./examples/json');

const schema = new Schema(map, input);

if (schema.parse('nonEmptyValue')) alert('Yay! That's some valid JSON!');
```
