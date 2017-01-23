import fs from 'fs';

import Parser from '../dist/index.js';
import schema from '../dist/schema.js';
import { spy } from 'sinon';

const JSONNodes = schema();

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe('Parser', () => {
    let parser;

    beforeEach(() => {
        parser = new Parser(schema);
    });

    describe('eat()', () => {
        it('should eat the provided regular expression', () => {
            const value = 'abc123';
            parser.edibleString = value;

            parser.eat('abc');

            expect(parser.edibleString).toBe('123');
        });

        it('should return an empty string if the whole string has been eatedn', () => {
            const value = 'abc';
            parser.edibleString = value;

            parser.eat('abc');

            expect(parser.edibleString).toBe('');
        });

        it('should eat the provided regular expression', () => {
            const value = '{}';
            parser.edibleString = value;

            parser.eat('{');

            expect(parser.edibleString).toBe('}');
        });

        it('should return false if regular expression is not matched', () => {
            const value = 'abc123';
            parser.edibleString = value;

            expect(parser.eat(123)).toBeFalsy();
        });

        it('should return false if the input is not a string', () => {
            parser.edibleString = false;

            expect(parser.eat('123')).toBeFalsy();
        });

        it('should return false if the input is an empty string', () => {
            parser.edibleString = '';

            expect(parser.eat('123')).toBeFalsy();
        });

        it('should correctly eat even if whitespaces are present at the start of the string', () => {
            parser.edibleString = ' abc123';

            parser.eat('abc');

            expect(parser.edibleString).toBe('123');
        });
    });

    /*describe('integer()', () => {
        it('should correctly handle negative numbers', () => {
            expect(parser.integer('-123ok')).toBe('ok');
        });

        it('should correctly handle decimals', () => {
            expect(parser.integer('1.123ok')).toBe('ok');
        });

        it('should correctly handle scientific notation numbers', () => {
            expect(parser.integer('1e12ok')).toBe('ok');
        });
    });

    describe('string()', () => {
        it('should correectly handle a double quoted string', () => {
            expect(parser.string('"This is a string"ok')).toBe('ok');
        });

        it('should allow for escaped double quotes', () => {
            expect(parser.string('"The quote says: \\"This is my life\\""ok')).toBe('ok');
        });
    });*/

    describe('parse()', () => {
        it('should not pass for an empty value', () => {
            const value = '';
            const result = parser.parse(value);

            expect(result).toBeFalsy();
        });

        it('should pass for an empty object', () => {
            const value = '{}';
            const result = parser.parse(value);

            expect(result).toBeTruthy();
        });

        it('should pass for an empty array', () => {
            const value = '[]';
            const result = parser.parse(value);

            expect(result).toBeTruthy();
        });

        it('should pass for an array of one integer', () => {
            const value = '[1]';
            const result = parser.parse(value);

            expect(result).toBeTruthy();
        });

        it('should pass for an array of multiple integers', () => {
            const value = '[1,2]';
            const result = parser.parse(value);

            expect(result).toBeTruthy();
        });

        it('should pass for an array of multiple integers and strings and booleans', () => {
            const value = '[1,true,"one",2,"two",false]';
            const result = parser.parse(value);

            expect(result).toBeTruthy();
        });

        it('should allow for an JSON with whitespaces to pass', () => {
            const value = '[1, 2, 3, 4]';
            const result = parser.parse(value);

            expect(result).toBeTruthy();
        });

        it('should pass for an array of arrays', () => {
            const value = '[[], [[], []]]';
            const result = parser.parse(value);

            expect(result).toBeTruthy();
        });

        it('should pass for an object with one key/value pair', () => {
            const value = '{"apple":"yes"}';
            const result = parser.parse(value);

            expect(result).toBeTruthy();
        });

        it('should pass for an object with multiple key/value pairs', () => {
            const value = '{"apple":"yes", "pears": false}';
            const result = parser.parse(value);

            expect(result).toBeTruthy();
        });

        it('should pass for an object with nested objects as key/value pairs', () => {
            const value = '{"apple":{"answer": false}, "pears": {"answer": "yes"}}';
            const result = parser.parse(value);

            expect(result).toBeTruthy();
        });

        it('should pass a full JSON complex structure', () => {
            const value = fs.readFileSync(`${__dirname}/example.json`, 'utf8');
            const result = parser.parse(value);

            expect(result).toBeTruthy();
        });
    });

    describe('lookahead callback', () => {
        const literal = 'hello world';
        let schema = {};

        beforeEach(() => {
            schema = {
                node: schema => schema.literal(),
                literal: schema => literal,
            };

            parser = new Parser(() => schema);
        });

        it('should allow to define a callback to a node lookup', () => {
            const callback = spy();

            schema.node = schema => schema.literal(callback);
            parser = new Parser(() => schema);
            parser.parse(literal, 'node');

            expect(callback.called).toBeTruthy();
        });

        it('should provide the callback the resulting string found for the given node lookup', () => {
            let resultingNextNode = null;
            let expectedNextNode = 'hello world';
            let result;

            schema.node = schema => schema.literal(node => {
                resultingNextNode = node;
            });
            parser = new Parser(() => schema);
            result = parser.parse(expectedNextNode, 'node');

            expect(result).toBeTruthy();
            expect(resultingNextNode).toEqual(expectedNextNode);
        });

        it('should call the correct callbacks in a complex set of parsing rules (compound rules)', () => {
            let callback = spy();
            let result;

            schema = () => ({
                twoWordSentence: schema => schema.word(callback) && schema.word(callback),
                word: schema => '[a-z]+',
            });

            parser = new Parser(schema);
            result = parser.parse(literal, 'twoWordSentence');

            expect(result).toBeTruthy();
            expect(callback.callCount).toBe(2);
        });

        it('should call the correct callbacks in a complex set of parsing rules (alternative rules)', () => {
            let callback = spy();
            let shouldNotBeExecutedCallback = spy();
            let result;

            schema = () => ({
                twoElementSentence: schema => schema.element() && schema.element(),
                element: schema => schema.number(shouldNotBeExecutedCallback) || schema.word(callback),
                word: () => '[a-z]+',
                number: () => '[0-9]+',
            });

            parser = new Parser(schema);
            result = parser.parse(literal, 'twoElementSentence');

            expect(result).toBeTruthy();
            expect(callback.callCount).toBe(2);
            expect(shouldNotBeExecutedCallback.called).toBeFalsy();
        });
    });
});
