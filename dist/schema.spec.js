'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _index = require('./index.js');

var _index2 = _interopRequireDefault(_index);

var _sinon = require('sinon');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('Schema', function () {
    it('should instantiate', function () {
        var schema = new _index2.default();
    });

    it('should generate a method for each node passed through the schema map', function () {
        var map = {
            node: function node() {},
            word: function word() {}
        };
        var schema = new _index2.default(map);

        Object.keys(map).map(function (name) {
            expect(schema[name]).not.toBeUndefined();
        });
    });

    it('should provide a Schema class instance to each node function when executed', function () {
        var map = {
            node: (0, _sinon.spy)(function () {
                return true;
            })
        };
        var schema = new _index2.default(map);

        schema.node();

        expect(map.node.calledOnce).toBeTruthy();
        expect(map.node.args[0][0] instanceof _index2.default).toBeTruthy();
        expect(map.node.args[0][0]).not.toEqual(schema);
    });

    it('should provide a new Schema instance for every new node function called', function () {
        var map = {
            level_1: (0, _sinon.spy)(function (schema) {
                return schema.level_2_1() && schema.level_2_2();
            }),
            level_2_1: (0, _sinon.spy)(function (schema) {
                return schema.level_3_1() && schema.level_3_2();
            }),
            level_2_2: (0, _sinon.spy)(function (schema) {
                return schema.level_4_1() && schema.level_4_2();
            }),
            level_3_1: (0, _sinon.spy)(function () {
                return true;
            }),
            level_3_2: (0, _sinon.spy)(function () {
                return true;
            }),
            level_4_1: (0, _sinon.spy)(function () {
                return true;
            }),
            level_4_2: (0, _sinon.spy)(function () {
                return true;
            })
        };
        var schema = new _index2.default(map);

        var nodeSchema = schema.level_1();

        Object.keys(map).map(function (node) {
            Object.keys(map).filter(function (n) {
                return node !== n;
            }).map(function (n) {
                expect(map[node].args[0][0]).not.toEqual(map[n].args[0][0]);
            });
        });
    });

    it('should register an input value', function () {
        var input = 'Hello World.';
        var map = {
            node: function node(schema) {
                return schema.word();
            },
            word: function word() {
                return true;
            }
        };
        var schema = new _index2.default(map, input);

        expect(schema.input).toEqual(input);
    });

    it('should reduce the provided input by the matched string', function () {
        var input = 'abc123';
        var map = {
            threeLetters: function threeLetters() {
                return '[a-z]{3}';
            }
        };
        var schema = new _index2.default(map, input);

        schema.threeLetters();

        expect(schema.input).toBe(input.substring(3));
        expect(schema.eatenInput).toBe(input.substr(0, 3));
    });

    it('should reduce the provided input in sibling node functions', function () {
        var input = 'abc123';
        var map = {
            node: (0, _sinon.spy)(function (schema) {
                return schema.threeLetters() && schema.threeNumbers();
            }),
            threeLetters: function threeLetters() {
                return '[a-z]{3}';
            },
            threeNumbers: function threeNumbers() {
                return '[0-9]{3}';
            }
        };

        var schema = new _index2.default(map, input);
        schema.node();

        var nodeSchema = map.node.args[0][0];

        expect(nodeSchema.input.length).toBe(0);
        expect(nodeSchema.eatenInput).toBe(input);
    });

    it('should push up the new input value once a schema has successfully run', function () {
        var input = 'abc123...';
        var map = {
            node: function node(schema) {
                return schema.threeLetters() && schema.threeNumbers();
            },
            threeLetters: function threeLetters() {
                return '[a-z]{3}';
            },
            threeNumbers: function threeNumbers() {
                return '[0-9]{3}';
            }
        };

        var schema = new _index2.default(map, input);
        schema.node();

        expect(schema.input).toBe(input.substr(6));
        expect(schema.eatenInput).toBe(input.substr(0, 6));
    });

    it('should respect boolean operators when executing sibling node functions', function () {
        var input = '123abc';
        var map = {
            node: function node(schema) {
                return schema.threeLetters() && schema.threeNumbers();
            },
            threeLetters: (0, _sinon.spy)(function () {
                return '[a-z]{3}';
            }),
            threeNumbers: (0, _sinon.spy)(function () {
                return '[0-9]{3}';
            })
        };

        var schema = new _index2.default(map, input);
        schema.node();

        expect(map.threeLetters.calledOnce).toBeTruthy();
        expect(map.threeNumbers.called).toBeFalsy();
    });

    it('should store schema information after node function execution', function () {
        var input = 'abc';
        var map = {
            threeLetters: function threeLetters() {
                return '[a-z]{3}';
            }
        };

        var schema = new _index2.default(map, input);
        schema.threeLetters();

        expect(schema.tree).toEqual([{
            input: '',
            eatenInput: 'abc',
            tree: []
        }]);
    });

    it('should store schema instances pushed up to its parent node', function () {
        var input = 'abc123';
        var map = {
            node: function node(schema) {
                return schema.threeLetters() && schema.threeNumbers();
            },
            threeLetters: function threeLetters() {
                return '[a-z]{3}';
            },
            threeNumbers: function threeNumbers() {
                return '[0-9]{3}';
            }
        };

        var schema = new _index2.default(map, input);
        schema.node();

        expect(schema.tree).toEqual([{
            input: '',
            eatenInput: 'abc123',
            tree: [{
                eatenInput: 'abc',
                input: '123',
                tree: []
            }, {
                eatenInput: '123',
                input: '',
                tree: []
            }]
        }]);
    });

    it('should return true if the schema was able to match the start of an input', function () {
        var input = 'abc123';
        var map = {
            node: function node(schema) {
                return schema.threeLetters() && schema.threeNumbers();
            },
            threeLetters: function threeLetters() {
                return '[a-z]{3}';
            },
            threeNumbers: function threeNumbers() {
                return '[0-9]{3}';
            }
        };

        var schema = new _index2.default(map, input);
        var result = schema.node();

        expect(result).toBeTruthy();
    });

    it('should return false if the schema was not able to match the start of an input', function () {
        var input = '123abc';
        var map = {
            node: function node(schema) {
                return schema.threeLetters() && schema.threeNumbers();
            },
            threeLetters: function threeLetters() {
                return '[a-z]{3}';
            },
            threeNumbers: function threeNumbers() {
                return '[0-9]{3}';
            }
        };

        var schema = new _index2.default(map, input);
        var result = schema.node();

        expect(result).toBeFalsy();
    });

    it('should rebuild the correct string as it parses the input even if it dives into the wrong node branch', function () {
        var input = '1312';
        var map = {
            node: function node(schema) {
                return schema.oneAndTwo() || schema.oneAndThree();
            },
            oneAndTwo: function oneAndTwo(schema) {
                return schema.one() && schema.two();
            },
            oneAndThree: function oneAndThree(schema) {
                return schema.one() && schema.three();
            },
            one: function one() {
                return '1';
            },
            two: function two() {
                return '2';
            },
            three: function three() {
                return '3';
            }
        };

        var schema = new _index2.default(map, input);
        var result = schema.parse('node');

        expect(result).toBeTruthy();
    });
});
//import jsonSchemaMap from '../examples/json';

describe('eat()', function () {
    it('should return true if the regexp matches the provided string', function () {
        var schema = new _index2.default();

        var result = schema.eat('[a-z]{2}[0-9]{3}', 'ab0123');

        expect(result).toBeTruthy();
    });

    it('should return false if the regexp does not match the provided string', function () {
        var schema = new _index2.default();

        var result = schema.eat('[a-z]{2}[0-9]{3}', '01234ab0123');

        expect(result).toBeFalsy();
    });
});

describe('parse()', function () {
    it('should pass if the full input has been parsed successfully', function () {
        var input = 'abc123';
        var map = {
            node: function node(schema) {
                return schema.threeLetters() && schema.threeNumbers();
            },
            threeLetters: function threeLetters() {
                return '[a-z]{3}';
            },
            threeNumbers: function threeNumbers() {
                return '[0-9]{3}';
            }
        };

        var schema = new _index2.default(map, input);
        var result = schema.parse('node');

        expect(result).toBeTruthy();
    });

    it('should fail if the input has not been completely parsed', function () {
        var input = 'abc123';
        var map = {
            node: function node(schema) {
                return schema.threeNumbers() && schema.threeLetters();
            },
            threeLetters: function threeLetters() {
                return '[a-z]{3}';
            },
            threeNumbers: function threeNumbers() {
                return '[0-9]{3}';
            }
        };

        var schema = new _index2.default(map, input);
        var result = schema.parse('node');

        expect(result).toBeFalsy();
    });

    it('should fail if no map or input is provided', function () {
        var input = 'abc123';
        var map = {
            node: function node() {
                return 'someRegExp';
            }
        };

        expect(new _index2.default(map, undefined).parse('node')).toBeFalsy();
        expect(new _index2.default(undefined, input).parse('node')).toBeFalsy();
    });

    it('should log an error if the starting node function is not specified', function () {
        var cErrorSpy = (0, _sinon.stub)(console, 'error');

        var schema = new _index2.default({}, '');
        schema.parse();

        expect(cErrorSpy.called).toBeTruthy();

        cErrorSpy.restore();
    });
});

describe('callback', function () {
    var input = 'abc123';
    var map = {
        node: function node(schema) {
            return schema.threeLetters() && schema.threeNumbers();
        },
        threeLetters: function threeLetters() {
            return '[a-z]{3}';
        },
        threeNumbers: function threeNumbers() {
            return '[0-9]{3}';
        }
    };

    it('should execute a callback after a node has been executed', function () {
        var callbackSpy = (0, _sinon.spy)();
        map.node = function (schema) {
            return schema.threeLetters() && schema.threeNumbers(callbackSpy);
        };

        var schema = new _index2.default(map, input);
        schema.parse('node');

        expect(callbackSpy.calledOnce).toBeTruthy();
    });

    it('should push a node match if no value is returned', function () {
        map.node = function (schema) {
            return schema.threeLetters() && schema.threeNumbers(function () {});
        };

        var schema = new _index2.default(map, input);
        var result = schema.parse('node');

        expect(result).toBeTruthy();
    });

    it('should not push a node match if false is returned', function () {
        map.node = function (schema) {
            return schema.threeLetters() && schema.threeNumbers(function () {
                return false;
            });
        };

        var schema = new _index2.default(map, input);
        var result = schema.parse('node');

        expect(result).toBeFalsy();
    });

    it('should continue to the next node should a callback return false, rejecting the current node match', function () {
        var rejectionCallbackSpy = (0, _sinon.spy)(function () {
            return false;
        });

        map.node = function (schema) {
            return schema.threeLetters() && (schema.threeNumbers(rejectionCallbackSpy) || schema.threeNumbers());
        };
        map.threeNumbers = (0, _sinon.spy)(map.threeNumbers);

        var schema = new _index2.default(map, input);
        var result = schema.parse('node');

        expect(result).toBeTruthy();
        expect(rejectionCallbackSpy.called).toBeTruthy();
        expect(map.threeNumbers.callCount).toBe(2);
    });
});

/*describe('case scenarios', () => {
    it('should pass a valid JSON structure', () => {
        const input = fs.readFileSync(`${__dirname}/example.json`, 'utf8');

        const schema = new Schema(jsonSchemaMap, input);
        const result = schema.parse('nonEmptyValue');

        expect(result).toBeTruthy();
    });
});*/