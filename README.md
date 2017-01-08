# JSON-parser

[![CircleCI](https://circleci.com/gh/pvienneau/JSON-parser/tree/master.svg?style=shield)](https://circleci.com/gh/pvienneau/JSON-parser/tree/master)
[![Code Climate](https://codeclimate.com/github/pvienneau/JSON-parser/badges/gpa.svg)](https://codeclimate.com/github/pvienneau/JSON-parser)

A simple JSON parser.

## How to use

```
const json = '{"some":["json", "to", "validate"]}';
let parser = new Parser(json);

parser.parse();
```
