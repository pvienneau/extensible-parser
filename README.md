# JSON-parser

[![CircleCI](https://circleci.com/gh/pvienneau/extensible-parser/tree/develop.svg?style=shield)](https://circleci.com/gh/pvienneau/extensible-parser/tree/develop)
[![Coverage Status](https://coveralls.io/repos/github/pvienneau/extensible-parser/badge.svg?branch=develop)](https://coveralls.io/github/pvienneau/extensible-parser?branch=develop)
[![Code Climate](https://codeclimate.com/github/pvienneau/extensible-parser/badges/gpa.svg)](https://codeclimate.com/github/pvienneau/extensible-parser)

A simple JSON parser.

## How to use

```
const input = '{"some":["json", "to", "validate"]}';
const map = require('./examples/json.js');

const schema = new Schema(map, input);

if (schema.parse()) alert('Yay! That's some valid JSON!');
```
