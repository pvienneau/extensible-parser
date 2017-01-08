'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var JSONParser = function () {
    function JSONParser(str) {
        var strictMode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        _classCallCheck(this, JSONParser);

        this.input = str;
        this.strictMode = strictMode;
    }

    _createClass(JSONParser, [{
        key: 'clean',
        value: function clean(str) {
            return this.eat(str, '');
        }
    }, {
        key: 'eat',
        value: function eat(str, exp) {
            var regExp = new RegExp('^\\s*' + exp, 'i');

            if (typeof str != 'string') return false;

            if (!str.match(regExp)) return false;

            return str.replace(regExp, '');
        }
    }, {
        key: 'value',
        value: function value(str) {
            var isEmptyAllowed = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

            /* value can be either:
                1. object
                2. array
                3. litteral
            */
            var r = void 0;
            var result = void 0;

            if ((r = this.array(str)) !== false) {
                result = r;
            } else if ((r = this.object(str)) !== false) {
                result = r;
            } else if ((r = this.litteral(str)) !== false) {
                result = r;
            } else if (isEmptyAllowed) {
                // empty
                result = str;
            }

            return result;
        }
    }, {
        key: 'object',
        value: function object(str) {
            var r = void 0;

            var result = this.eat(str, '{');

            if (result === false) return false;

            if ((r = this.objectValue(result)) !== false) {
                result = r;
            }

            result = this.eat(result, '}');

            return result;
        }
    }, {
        key: 'objectValue',
        value: function objectValue(str) {
            var result = void 0;
            var r = void 0;

            result = this.string(str);

            result = this.eat(result, ':');

            result = this.value(result);

            if ((r = this.eat(result, ',')) !== false) {
                result = this.objectValue(r);
            }

            return result;
        }
    }, {
        key: 'array',
        value: function array(str) {
            var result = this.eat(str, '\\[');

            if (result === false) return false;

            result = this.arrayValue(result, true);

            return this.eat(result, ']');
        }
    }, {
        key: 'arrayValue',
        value: function arrayValue(str) {
            var isEmptyAllowed = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            var result = void 0;
            var r = void 0;

            result = this.value(str, isEmptyAllowed);

            if (r = this.eat(result, ',')) {
                result = this.arrayValue(r);
            }

            return result;
        }
    }, {
        key: 'litteral',
        value: function litteral(str) {
            var r = void 0;
            var result = void 0;

            if ((r = this.integer(str)) !== false) {
                result = r;
            } else if ((r = this.string(str)) !== false) {
                result = r;
            } else if ((r = this.boolean(str)) !== false) {
                result = r;
            } else if ((r = this.null(str)) !== false) {
                result = r;
            } else {
                return false;
            }

            return result;
        }
    }, {
        key: 'integer',
        value: function integer(str) {
            return this.eat(str, '-?[0-9]+(\\.[0-9]*)?(e[0-9]+)?');
        }
    }, {
        key: '_isStrictMode',
        value: function _isStrictMode() {
            return !!this.strictMode;
        }
    }, {
        key: '_getStringExpression',
        value: function _getStringExpression() {
            var strictExpression = '"(\\\\(?:[bfnrt\\\\\/"]|u[0-9a-f])|[^"\\\\])*"';
            var nonStrictExpression = '"(\\\\"|[^"])*"';

            return this._isStrictMode() ? strictExpression : nonStrictExpression;
        }
    }, {
        key: 'string',
        value: function string(str) {
            return this.eat(str, this._getStringExpression());
        }
    }, {
        key: 'boolean',
        value: function boolean(str) {
            return this.eat(str, 'true|false');
        }
    }, {
        key: 'null',
        value: function _null(str) {
            return this.eat(str, 'null');
        }
    }, {
        key: 'empty',
        value: function empty(str) {
            /*if(!str.length) return str;
             return str;*/

            return str;
        }
    }, {
        key: 'parse',
        value: function parse() {
            var str = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.input;

            return this.clean(this.value(str, false)) === '';
        }
    }]);

    return JSONParser;
}();

exports.default = JSONParser;