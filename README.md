# JSON-parser
A simple JSON parser.

[![Code Climate](https://codeclimate.com/github/pvienneau/JSON-parser/badges/gpa.svg)](https://codeclimate.com/github/pvienneau/JSON-parser)

## How to use

```
const json = '{"some":["json", "to", "validate"]}';
let parser = new Parser(json);

parser.parse();
```
