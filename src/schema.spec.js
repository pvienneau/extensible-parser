import Schema from './schema';
import jsonSchemaMap from './templates/json';

import jsonExample from './examples/json.js';

const { spy, stub, mock } = sinon;

describe('unit tests', () => {
    beforeEach(() => {
        jasmine.addMatchers({
            toHaveSubset: function(util, customEqualityTesters) {
                return {
                    compare: function toHaveSubset(expected, actual){
                        var compare = function(expected, actual){
                            if (typeof expected === 'object') {
                                if(typeof actual !== 'object') return {pass: false};
                                if(Array.isArray(expected) !== Array.isArray(actual)) return {pass: false};

                                const keys = Object.keys(expected);

                                for (var ii = 0; ii < keys.length; ii++) {
                                    var key = keys[ii];

                                    if (!(key in actual)) return {pass: false};

                                    var result = {};
                                    if(Array.isArray(expected) && (typeof expected[key] === 'string')){
                                        result = {
                                            pass: actual.indexOf(expected[key]) >= 0
                                        };
                                    }else{
                                        result = compare(expected[key], actual[key]);
                                    }

                                    if (!result.pass) return {pass: false};
                                }
                            } else {
                                if (actual !== expected) return {pass: false};
                            }

                            return {pass: true};
                        }

                        return compare(actual, expected);
                    }
                }
            }
        });
    });

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
                node: spy(() => true),
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

        it('should use first available node as start of parsing, if no other value is specified', () => {
            const input = 'hello world.';
            const map = {
                main: spy(),
                secondary: spy(),
                tiertiary: spy(),
            };

            const schema = new Schema(map, input);
            schema.parse();

            expect(map.main.called).toBeTruthy();
        });

        it('should allow to specify the starting node as part of the instance creation', () => {
            const input = 'hello world.';
            const map = {
                main: spy(),
                secondary: spy(),
                tiertiary: spy(),
            };

            const schema = new Schema(map, input, 'tiertiary');
            schema.parse();

            expect(map.tiertiary.called).toBeTruthy();
        });

        it('should reduce the provided input by the matched string', () => {
            const input = 'abc123';
            const map = {
                threeLetters: () => '[a-z]{3}',
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

        it('should be allowed to continue to subsequent functions if first functions was non-matching without affecting input value', () => {
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

            expect(result).toBeFalsy();
            expect(schema.input).toBe('12');
            expect(schema.eatenInput).toBe('13');
        });

        it('should fail on incomplete consumption of string', () => {
            const input = 'aabababas';
            const map = {
                node: schema => (schema.a() || schema.b()) && (schema.node() || schema.empty()),
                a: () => 'a',
                b: () => 'b',
                empty: () => true,
            };

            const schema = new Schema(map, input);
            const result = schema.parse('node');

            expect(result).toBeFalsy();
        })
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

        it('should return false if either parameters are undefined', () => {
            const schema = new Schema();

            expect(schema.eat(undefined, 'someString')).toBeFalsy();
            expect(schema.eat('someRegExp', undefined)).toBeFalsy();
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

        it('should fire callbacks once and only once the node functions, the subsequent node functions and their respective callbacks have all been fired', () => {
            const completorCallback = spy();
            const letterCallback = spy();
            const numberCallback = spy();

            const input = 'ab2s02';
            const map = {
                node: schema => schema.completor(completorCallback),
                completor: schema => (schema.letter(letterCallback) || schema.number(numberCallback)) && (schema.completor(completorCallback) || schema.empty()),
                letter: schema => '[a-z]',
                number: schema => '[0-9]',
                empty: () => true,
            };

            const schema = new Schema(map, input);
            schema.parse('node');

            expect(schema).toBeTruthy();
            expect(completorCallback.calledAfter(letterCallback));
            expect(completorCallback.calledAfter(numberCallback));
        });

        it('should be allowed to affect the current schema instance eaten value', () => {
            const transformCallback = schema => schema.eatenInput = 'x';
            const input = '1.3..6.8';
            const map = {
                sequence: schema => schema.character() && (schema.sequence() || schema.empty()),
                character: schema => schema.number() || schema.dot(transformCallback),
                dot: () => '\\.',
                number: () => '[0-9]',
                empty: () => true,
            }

            const schema = new Schema(map, input);
            const result = schema.parse('sequence');

            expect(result).toBeTruthy();
            expect(schema.eatenInput).toBe('1x3xx6x8');
        });

        it('should be allowed to affect the current schema instance tree', () => {
            const repeatSequence = schema => {
                schema.eatenInput = schema.eatenInput.substring(1, schema.eatenInput.length-1);
            };
            const repeat2Callback = schema => {
                const { eatenInput, input } = schema;

                for(let ii = 1; ii < 2; ii++){
                    schema.input = eatenInput;
                    schema.number();
                }

                schema.input = input;
            };
            const input = '1{36}8';
            const map = {
                sequence: schema => (schema.digit() || schema.repeatSequence(repeatSequence)) && (schema.sequence() || schema.empty()),
                repeatSequence: schema => schema.curlyLeft() && schema.number(repeat2Callback) && schema.curlyRight(),
                number: schema => schema.digit() && (schema.number() || schema.empty()),
                curlyLeft: () => '{',
                curlyRight: () => '}',
                digit: () => '[0-9]',
                empty: () => true,
            }

            const schema = new Schema(map, input);
            const result = schema.parse('sequence');

            expect(result).toBeTruthy();
            expect(schema.eatenInput).toBe('136368');
        });

        it('should accept capture groups and pass them as parameters to their respective callback', () => {
            const callback = spy();
            const expectedFunctionName = `function_call`;
            const input = `{{${expectedFunctionName}()}}`;

            const map = {
                node: schema => schema.breaker(),
                breaker: schema => schema.curlyLeft() && schema.curlyLeft() && schema.function(callback) && schema.curlyRight() && schema.curlyRight(),
                curlyLeft: () => '\\{',
                curlyRight: () => '\\}',
                function: () => '([a-z][a-z0-9_]*)\\(\\)',
            };

            const schema = new Schema(map, input);
            const result = schema.parse('node');

            expect(result).toBeTruthy();
            expect(callback.args[0].length).toBe(2);
            expect(callback.args[0][1]).toBe(expectedFunctionName);
        });

        xit('should allow for multiple capture groups to be passed as parameters to their respective callback', () => {
            const callback = spy();
            const expectedFunctionName = `function_call`;
            const args = [12, 34, 56];

            const input = `{{${expectedFunctionName}(${args.join(',')})}}`;
            const map = {
                node: schema => schema.breaker(),
                breaker: schema => schema.curlyLeft() && schema.curlyLeft() && schema.function(callback) && schema.curlyRight() && schema.curlyRight(),
                curlyLeft: () => '\\{',
                curlyRight: () => '\\}',
                function: () => '([a-z][a-z0-9_]*)\\(([0-9]*)(?:,([0-9]*))*\\)',
            };

            const schema = new Schema(map, input);
            const result = schema.parse('node');
            const actualParameters = callback.args[0];
            const expectedParameters = args;

            actualParameters.splice(0, 1);
            expectedParameters.unshift(expectedFunctionName);

            expect(result).toBeTruthy();
            expect(actualParameters).toEqual(expectedParameters);
        });
    });

    describe('cleanString()', () => {
        it('should gracefully exit if no input is specified', () => {
            const schema = new Schema();
            let exceptionsCaught = 0;

            try{
                schema.cleanString();
            }catch(e) {
                exceptionsCaught++;
            }

            expect(exceptionsCaught).toBe(0);
        });

        it('should clean string of white spaces at both ends of the stirng', () => {
            const expectedString = 'some string.';
            const initialString = `
            ${expectedString}
            `;

            const schema = new Schema();
            const result = schema.cleanString(initialString);

            expect(result).toBe(expectedString);
        });

        it('should not clean white spaces that are not found at either end of a string', () => {
            const expectedString = `some
            string.`;
            const initialString = `
            ${expectedString}
            `;

            const schema = new Schema();
            const result = schema.cleanString(initialString);

            expect(result).toBe(expectedString);
        });
    });

    describe('isExplicitlyFalse()', () => {
        it('should properly handle the following values', () => {
            const schema = new Schema();

            expect(schema.isExplicitlyFalse(false)).toBeTruthy();
            expect(schema.isExplicitlyFalse(true)).toBeFalsy();
            expect(schema.isExplicitlyFalse([])).toBeFalsy();
            expect(schema.isExplicitlyFalse(['one', 'two'])).toBeFalsy();
        });
    });

    describe('case scenarios', () => {
        it('should pass a valid JSON structure', () => {
            const schema = new Schema(jsonSchemaMap, jsonExample);
            const result = schema.parse('nonEmptyValue');

            expect(result).toBeTruthy();
        });
    });
});
