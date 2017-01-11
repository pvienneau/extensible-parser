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
        value: function clean(str) {
            return this.eat(str, '');
        }
    }, {
        key: 'eat',
        value: function eat(exp) {
            var string = this.edibleString;

            var regExp = new RegExp('^\\s*' + exp, 'i');

            if (typeof string !== 'string') return false;

            if (!string.match(regExp)) return false;

            this.rebuiltString += 'a';
            this.edibleString = string.replace(regExp, '');

            return true;
        }
    }, {
        key: 'register',
        value: function register(s) {
            var _this = this;

            var ss = s();
            this.schema = {};

            Object.keys(ss).map(function (rule_name) {
                var execute = function execute(rule, rule_name) {

                    var result = rule();

                    if (typeof result == 'string') {
                        result = _this.eat(result);
                    }

                    return result;
                };

                _this.schema[rule_name] = execute.bind(_this, ss[rule_name].bind(_this, _this.schema), rule_name);
            });
        }
    }, {
        key: 'parse',
        value: function parse(str) {
            this.edibleString = '' + str;
            this.schema.nonEmptyValue();

            return this.edibleString == '';
        }
    }]);

    return JSONParser;
}();

exports.default = JSONParser;