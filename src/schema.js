export default class Schema {
    constructor(map = {}, input = '', node = ''){
        this.input = input;
        this.eatenInput = '';
        this.tree = [];
        this.node = node;

        Object.keys(map).map(name => {
            this[name] = (callback = false) => {
                const schema = new Schema(map, this.input, name);

                let result = map[name](schema);

                if (typeof result === 'string') result = schema.eat(result, schema.input);

                if (!result) return false;

                if (callback){
                    if (this.isExplicitlyFalse(callback(schema))) return false;
                }

                //end of execution of node
                this.saveNodeImage(schema);

                this.input = schema.input;
                this.eatenInput += schema.eatenInput;

                return true;
            }
        });

        this.regExp = this.regExp.bind(this);
        this.eat = this.eat.bind(this);
    }

    regExp(expression) {
        return new RegExp(`^\\s*${expression}`, 'i');
    }

    eat(expression = '', string = '') {
        if (!expression || !string) return false;

        let matchedString

        const result = this.regExp(expression).exec(string);

        if (!result) return false;

        this.eatenInput += result[0];
        this.input = this.input.substr(result[0].length);

        return true;
    }

    isExplicitlyFalse(val){
        return (!val && val !== undefined);
    }

    saveNodeImage(schema = false) {
        if(!schema) return false;

        const nodeImage = {
            input: schema.input,
            eatenInput: schema.eatenInput,
            node: schema.node,
            tree: schema.tree,
        };

        this.tree.push(nodeImage);

        return nodeImage;
    }

    parse(nodeFn = false){
        if (!nodeFn) {
            console.error('You need to specify what node to call first.');
            return false;
        }

        return this[nodeFn]?this[nodeFn]():false;
    }
}
