import Parser from '../dist/parser.js';
// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe('Parser', () => {
    let parser;

    beforeEach(() => {
        parser = new Parser();
    });

    it('should eat the provided regular expression', () => {
        const value = 'abc123';

        expect(parser.eat(value, 'abc')).toBe('123');
    });

    it('should return an empty string if the whole string has been eatedn', () => {
        const value = 'abc';

        expect(parser.eat(value, 'abc')).toBe('');
    });

    it('should eat the provided regular expression', () => {
        const value = '{}';

        expect(parser.eat(value, '{')).toBe('}');
    });

    it('should return false if regular expression is not matched', () => {
        const value = 'abc123';

        expect(parser.eat(value, '123')).toBeFalsy();
    });

    it('should return false if the input is not a string', () => {
        expect(parser.eat(false, '123')).toBeFalsy();
    });

    it('should return false if the input is an empty string', () => {
        expect(parser.eat('', '123')).toBeFalsy();
    });

    it('should correctly eat even if whitespaces are present at the start of the string', () => {
        expect(parser.eat(' abc123', 'abc')).toBe('123')
    });

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

    it('should pass for an array of multiple integers and strings', () => {
        const value = '[1,"one",2,"two"]';
        const result = parser.parse(value);

        expect(result).toBeTruthy();
    });

    it('should allow for an array with whitespaces to pass', () => {
        const value = '[1, 2, 3, 4]';
        const result = parser.parse(value);

        expect(result).toBeTruthy();
    })
});
