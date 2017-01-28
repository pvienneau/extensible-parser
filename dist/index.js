'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Schema = function () {
    function Schema() {
        var _this = this;

        var map = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var input = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

        _classCallCheck(this, Schema);

        this.input = input;
        this.eatenInput = '';
        this.tree = [];

        Object.keys(map).map(function (name) {
            _this[name] = function () {
                var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

                var schema = new Schema(map, _this.input);

                var result = map[name](schema);

                if (typeof result === 'string') result = schema.eat(result, schema.input);

                if (!result) return false;

                if (callback) {
                    if (_this.isExplicitFalseReturn(callback())) return false;
                }

                //end of execution of node
                _this.saveNodeImage(schema);

                _this.input = schema.input;
                _this.eatenInput += schema.eatenInput;

                return true;
            };
        });

        this.regExp = this.regExp.bind(this);
        this.eat = this.eat.bind(this);
    }

    _createClass(Schema, [{
        key: 'regExp',
        value: function regExp(expression) {
            return new RegExp('^\\s*' + expression, 'i');
        }
    }, {
        key: 'eat',
        value: function eat() {
            var expression = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
            var string = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            if (!expression || !string || typeof string !== 'string') return false;

            var matchedString = void 0;

            var result = this.regExp(expression).exec(string);

            if (!result) return false;

            this.eatenInput += result[0];
            this.input = this.input.substr(result[0].length);

            return true;
        }
    }, {
        key: 'isExplicitFalseReturn',
        value: function isExplicitFalseReturn(retrn) {
            return !retrn && retrn !== undefined;
        }
    }, {
        key: 'saveNodeImage',
        value: function saveNodeImage() {
            var schema = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            var nodeImage = {
                input: schema.input,
                eatenInput: schema.eatenInput,
                tree: schema.tree
            };

            this.tree.push(nodeImage);

            return nodeImage;
        }
    }, {
        key: 'parse',
        value: function parse() {
            var nodeFn = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

            if (!nodeFn) {
                console.error('You need to specify what node to call first');
                return false;
            }

            return this[nodeFn] ? this[nodeFn]() : false;
        }
    }]);

    return Schema;
}();

exports.default = Schema;