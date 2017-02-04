'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Schema = function () {
    function Schema() {
        var map = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        var _this = this;

        var input = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
        var nodeName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

        _classCallCheck(this, Schema);

        this.input = input;
        this.rawInput = input;
        this.eatenInput = '';
        this.nodeName = nodeName;
        this.arguments = [];

        if (!this.nodeName) this.nodeName = Object.keys(map)[0];

        Object.keys(map).map(function (name) {
            _this[name] = function () {
                var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

                var schema = new Schema(map, _this.input, name);
                var callbackArguments = [schema];

                var result = map[name](schema);

                if (typeof result === 'string') {
                    result = schema.eat(result, schema.input);
                    callbackArguments = callbackArguments.concat(schema.arguments);
                }

                if (!result) return false;

                if (callback) {
                    if (_this.isExplicitlyFalse(callback.apply(null, callbackArguments))) return false;
                }

                _this.input = schema.input;
                _this.eatenInput += schema.eatenInput;

                return true;
            };
        });

        this.regExp = this.regExp.bind(this);
        this.eat = this.eat.bind(this);
    }

    _createClass(Schema, [{
        key: 'cleanString',
        value: function cleanString(str) {
            if (!str) return false;

            return str.replace(/^\s*/i, '').replace(/\s*$/i, '');
        }
    }, {
        key: 'regExp',
        value: function regExp(expression) {
            return new RegExp('^\\s*' + expression, 'ig');
        }
    }, {
        key: 'eat',
        value: function eat() {
            var expression = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
            var string = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

            if (!expression || !string) return false;

            var matchedString = void 0;

            var result = this.regExp(expression).exec(string);

            if (!result) return false;

            this.eatenInput += result[0];

            this.input = this.input.substr(result[0].length);

            // arguments formulated by capturing regexp groups not saving to this.args
            result.splice(0, 1);
            this.arguments = result;

            return true;
        }
    }, {
        key: 'isExplicitlyFalse',
        value: function isExplicitlyFalse(val) {
            return !val && val !== undefined;
        }
    }, {
        key: 'parse',
        value: function parse() {
            var nodeName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

            if (!nodeName) nodeName = this.nodeName;

            if (!nodeName) {
                console.error('[JSON-Parser]: You must specify the starting node to parse your input.');
                return false;
            };

            var result = this[nodeName] ? this[nodeName]() : false;

            return result && !this.cleanString(this.input).length;
        }
    }]);

    return Schema;
}();

exports.default = Schema;