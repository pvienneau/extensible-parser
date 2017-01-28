import fs from 'fs';

import Schema from '../dist/index.js';
import jsonSchemaMap from '../examples/json';

import { spy, stub, mock } from 'sinon';

describe('Schema', () => {
    it('should instantiate', () => {
        const schema = new Schema();
    });

    it('should generate a method for each node passed through the schema map', () => {
        const map = {
            node: () => {},
            word: () => {},
        };
        const schema = new Schema(map);

        Object.keys(map).map(name => {
            expect(schema[name]).not.toBeUndefined();
        });
    });

    it('should provide a Schema class instance to each node function when executed', () => {
        const map = {
            node: spy(() => true)
        };
        const schema = new Schema(map);

        schema.node();

        expect(map.node.calledOnce).toBeTruthy();
        expect(map.node.args[0][0] instanceof Schema).toBeTruthy();
        expect(map.node.args[0][0]).not.toEqual(schema);
    });

    it('should provide a new Schema instance for every new node function called', () => {
        const map = {
            level_1: spy(schema => schema.level_2_1() && schema.level_2_2()),
            level_2_1: spy(schema => schema.level_3_1() && schema.level_3_2()),
            level_2_2: spy(schema => schema.level_4_1() && schema.level_4_2()),
            level_3_1: spy(() => true),
            level_3_2: spy(() => true),
            level_4_1: spy(() => true),
            level_4_2: spy(() => true),
        };
        const schema = new Schema(map);

        const nodeSchema = schema.level_1();

        Object.keys(map).map(node => {
            Object.keys(map)
                .filter(n => node !== n)
                .map(n => {
                    expect(map[node].args[0][0]).not.toEqual(map[n].args[0][0]);
                });
        });
    });

    it('should register an input value', () => {
        const input = 'Hello World.';
        const map = {
            node: schema => schema.word(),
            word: () => true,
        }
        const schema = new Schema(map, input);

        expect(schema.input).toEqual(input);
    });

    it('should reduce the provided input by the matched string', () => {
        const input = 'abc123';
        const map = {
            threeLetters: () => '[a-z]{3}'
        };
        const schema = new Schema(map, input);

        schema.threeLetters();

        expect(schema.input).toBe(input.substring(3));
        expect(schema.eatenInput).toBe(input.substr(0, 3));
    });

    it('should reduce the provided input in sibling node functions', () => {
        const input = 'abc123';
        const map = {
            node: spy(schema => schema.threeLetters() && schema.threeNumbers()),
            threeLetters: () => '[a-z]{3}',
            threeNumbers: () => '[0-9]{3}',
        };

        const schema = new Schema(map, input);
        schema.node();

        const nodeSchema = map.node.args[0][0];

        expect(nodeSchema.input.length).toBe(0);
        expect(nodeSchema.eatenInput).toBe(input);
    });

    it('should push up the new input value once a schema has successfully run', () => {
        const input = 'abc123...';
        const map = {
            node: schema => schema.threeLetters() && schema.threeNumbers(),
            threeLetters: () => '[a-z]{3}',
            threeNumbers: () => '[0-9]{3}',
        };

        const schema = new Schema(map, input);
        schema.node();

        expect(schema.input).toBe(input.substr(6));
        expect(schema.eatenInput).toBe(input.substr(0, 6));
    });

    it('should respect boolean operators when executing sibling node functions', () => {
        const input = '123abc';
        const map = {
            node: schema => schema.threeLetters() && schema.threeNumbers(),
            threeLetters: spy(() => '[a-z]{3}'),
            threeNumbers: spy(() => '[0-9]{3}'),
        };

        const schema = new Schema(map, input);
        schema.node();

        expect(map.threeLetters.calledOnce).toBeTruthy();
        expect(map.threeNumbers.called).toBeFalsy();
    });

    it('should store schema information after node function execution', () => {
        const input = 'abc';
        const map = {
            threeLetters: () => '[a-z]{3}',
        };

        const schema = new Schema(map, input);
        schema.threeLetters();

        expect(schema.tree).toEqual([
            {
                input: '',
                eatenInput: 'abc',
                tree: [],
            }
        ]);
    });

    it('should store schema instances pushed up to its parent node', () => {
        const input = 'abc123';
        const map = {
            node: schema => schema.threeLetters() && schema.threeNumbers(),
            threeLetters: () => '[a-z]{3}',
            threeNumbers: () => '[0-9]{3}',
        };

        const schema = new Schema(map, input);
        schema.node();

        expect(schema.tree).toEqual([
            {
                input: '',
                eatenInput: 'abc123',
                tree: [
                    {
                        eatenInput: 'abc',
                        input: '123',
                        tree: [],
                    },
                    {
                        eatenInput: '123',
                        input: '',
                        tree: [],
                    },
                ],
            }
        ]);
    });

    it('should return true if the schema was able to match the start of an input', () => {
        const input = 'abc123';
        const map = {
            node: schema => schema.threeLetters() && schema.threeNumbers(),
            threeLetters: () => '[a-z]{3}',
            threeNumbers: () => '[0-9]{3}',
        };

        const schema = new Schema(map, input);
        const result = schema.node();

        expect(result).toBeTruthy();
    });

    it('should return false if the schema was not able to match the start of an input', () => {
        const input = '123abc';
        const map = {
            node: schema => schema.threeLetters() && schema.threeNumbers(),
            threeLetters: () => '[a-z]{3}',
            threeNumbers: () => '[0-9]{3}',
        };

        const schema = new Schema(map, input);
        const result = schema.node();

        expect(result).toBeFalsy();
    });

    it('should rebuild the correct string as it parses the input even if it dives into the wrong node branch', () => {
        const input = '1312';
        const map = {
            node: schema => schema.oneAndTwo() || schema.oneAndThree(),
            oneAndTwo: schema => schema.one() && schema.two(),
            oneAndThree: schema => schema.one() && schema.three(),
            one: () => '1',
            two: () => '2',
            three: () => '3',
        };

        const schema = new Schema(map, input);
        const result = schema.parse('node');

        expect(result).toBeTruthy();
    });
});

describe('eat()', () => {
    it('should return true if the regexp matches the provided string', () => {
        const schema = new Schema();

        const result = schema.eat('[a-z]{2}[0-9]{3}', 'ab0123');

        expect(result).toBeTruthy();
    });

    it('should return false if the regexp does not match the provided string', () => {
        const schema = new Schema();

        const result = schema.eat('[a-z]{2}[0-9]{3}', '01234ab0123');

        expect(result).toBeFalsy();
    });
});

describe('parse()', () => {
    it('should pass if the full input has been parsed successfully', () => {
        const input = 'abc123';
        const map = {
            node: schema => schema.threeLetters() && schema.threeNumbers(),
            threeLetters: () => '[a-z]{3}',
            threeNumbers: () => '[0-9]{3}',
        };

        const schema = new Schema(map, input);
        const result = schema.parse('node');

        expect(result).toBeTruthy();
    });

    it('should fail if the input has not been completely parsed', () => {
        const input = 'abc123';
        const map = {
            node: schema => schema.threeNumbers() && schema.threeLetters(),
            threeLetters: () => '[a-z]{3}',
            threeNumbers: () => '[0-9]{3}',
        };

        const schema = new Schema(map, input);
        const result = schema.parse('node');

        expect(result).toBeFalsy();
    });

    it('should fail if no map or input is provided', () => {
        const input = 'abc123';
        const map = {
            node: () => 'someRegExp',
        };

        expect((new Schema(map, undefined)).parse('node')).toBeFalsy();
        expect((new Schema(undefined, input)).parse('node')).toBeFalsy();
    });

    it('should log an error if the starting node function is not specified', () => {
        const cErrorSpy = stub(console, 'error');

        const schema = new Schema({}, '');
        schema.parse();

        expect(cErrorSpy.called).toBeTruthy();

        cErrorSpy.restore();
    });
});

describe('callback', () => {
    const input = 'abc123';
    const map = {
        node: schema => schema.threeLetters() && schema.threeNumbers(),
        threeLetters: () => '[a-z]{3}',
        threeNumbers: () => '[0-9]{3}',
    };

    it('should execute a callback after a node has been executed', () => {
        const callbackSpy = spy();
        map.node = schema => schema.threeLetters() && schema.threeNumbers(callbackSpy);

        const schema = new Schema(map, input);
        schema.parse('node');

        expect(callbackSpy.calledOnce).toBeTruthy();
    });

    it('should push a node match if no value is returned', () => {
        map.node = schema => schema.threeLetters() && schema.threeNumbers(() => {});

        const schema = new Schema(map, input);
        const result = schema.parse('node');

        expect(result).toBeTruthy();
    });

    it('should not push a node match if false is returned', () => {
        map.node = schema => schema.threeLetters() && schema.threeNumbers(() => false);

        const schema = new Schema(map, input);
        const result = schema.parse('node');

        expect(result).toBeFalsy();
    });

    it('should continue to the next node should a callback return false, rejecting the current node match', () => {
        const rejectionCallbackSpy = spy(() => false);

        map.node = schema => schema.threeLetters() && (schema.threeNumbers(rejectionCallbackSpy) || schema.threeNumbers());
        map.threeNumbers = spy(map.threeNumbers);

        const schema = new Schema(map, input);
        const result = schema.parse('node');

        expect(result).toBeTruthy();
        expect(rejectionCallbackSpy.called).toBeTruthy();
        expect(map.threeNumbers.callCount).toBe(2);
    });
});

describe('case scenarios', () => {
    it('should pass a valid JSON structure', () => {
        const input = fs.readFileSync(`${__dirname}/example.json`, 'utf8');

        const schema = new Schema(jsonSchemaMap, input);
        const result = schema.parse('nonEmptyValue');

        expect(result).toBeTruthy();
    });
});
