'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var JSONParser = function () {
    function JSONParser(schema) {
        _classCallCheck(this, JSONParser);

        this.register(schema);

        this.rebuiltString = '';
    }

    _createClass(JSONParser, [{
        key: 'clean',
        value: function clean() {
            return this.eat('');
        }
    }, {
        key: 'regExp',
        value: function regExp(expression) {
            return new RegExp('^\\s*' + expression, 'i');
        }
    }, {
        key: 'eat',
        value: function eat(exp) {
            var string = this.edibleString;
            var regExp = this.regExp(exp);

            var matchedString = false;

            if (typeof string !== 'string') return false;

            if (!(matchedString = string.match(regExp))) return false;

            matchedString = matchedString[0];

            this.edibleString = string.replace(regExp, '');

            return matchedString;
        }
    }, {
        key: 'register',
        value: function register(s) {
            var _this = this;

            var ss = s();
            this.schema = {};

            Object.keys(ss).map(function (rule_name) {
                var execute = function execute(rule, rule_name, callback) {
                    var result = rule();
                    var regExpression = void 0;

                    if (typeof result == 'string') {
                        regExpression = result;
                        result = _this.eat(regExpression);
                    }

                    if (!!callback && !!result) {

                        var parameters = [result];
                        if (regExpression) {
                            (function () {
                                var matches = _this.regExp(regExpression).exec(result);
                                var params = Object.keys(matches).filter(function (key) {
                                    return !isNaN(key) && parseInt(key);
                                }).map(function (key) {
                                    return matches[key];
                                });
                                parameters = parameters.concat(params);
                            })();
                        }

                        var callbackResult = callback.apply(null, parameters);

                        if (typeof callbackResult === 'string') result = callbackResult;
                    }

                    if (typeof result === 'string') _this.rebuiltString += result;

                    return !!result;
                };

                _this.schema[rule_name] = execute.bind(_this, ss[rule_name].bind(_this, _this.schema), rule_name);
            });
        }
    }, {
        key: 'parse',
        value: function parse(str) {
            var startFn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'nonEmptyValue';

            this.edibleString = '' + str;
            var result = this.schema[startFn].call(this);

            this.clean();

            return result && !this.edibleString.length;
        }
    }]);

    return JSONParser;
}();

exports.default = JSONParser;