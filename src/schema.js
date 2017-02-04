export default class Schema {
    constructor(map = {}, input = '', nodeName = null){
        this.input = input;
        this.rawInput = input;
        this.eatenInput = '';
        this.nodeName = nodeName;
        this.arguments = [];

        if (!this.nodeName) this.nodeName = Object.keys(map)[0];

        Object.keys(map).map(name => {
            this[name] = (callback = false) => {
                const schema = new Schema(map, this.input, name);
                let callbackArguments = [schema];

                let result = map[name](schema);

                if (typeof result === 'string'){
                    result = schema.eat(result, schema.input);
                    callbackArguments = callbackArguments.concat(schema.arguments);
                }

                if (!result) return false;

                if (callback){
                    if (this.isExplicitlyFalse(callback.apply(null, callbackArguments))) return false;
                }

                this.input = schema.input;
                this.eatenInput += schema.eatenInput;

                return true;
            }
        });

        this.regExp = this.regExp.bind(this);
        this.eat = this.eat.bind(this);
    }

    cleanString(str) {
        if(!str) return false;

        return str.replace(/^\s*/i, '').replace(/\s*$/i, '');
    }

    regExp(expression) {
        return new RegExp(`^\\s*${expression}`, 'ig');
    }

    eat(expression = '', string = '') {
        if (!expression || !string) return false;

        let matchedString

        const result = this.regExp(expression).exec(string);

        if (!result) return false;

        this.eatenInput += result[0];

        this.input = this.input.substr(result[0].length);

        // arguments formulated by capturing regexp groups not saving to this.args
        result.splice(0, 1);
        this.arguments = result;

        return true;
    }

    isExplicitlyFalse(val){
        return (!val && val !== undefined);
    }

    parse(nodeName = null){
        if (!nodeName) nodeName = this.nodeName;

        if (!nodeName) {
            console.error('[JSON-Parser]: You must specify the starting node to parse your input.');
            return false;
        };

        const result = this[nodeName]?this[nodeName]():false;

        return result && !this.cleanString(this.input).length;
    }
}
