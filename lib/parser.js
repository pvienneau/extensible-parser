class JSONParser{
    constructor(schema){
        this.register(schema);

        this.rebuiltString = '';
    }

    clean(){
        return this.eat('');
    }

    regExp(expression){
        return new RegExp(`^\\s*${expression}`, 'i');
    }

    eat(exp){
        const string = this.edibleString;
        const regExp = this.regExp(exp);

        let matchedString = false;

        if(typeof string !== 'string') return false;

        if (! (matchedString = string.match(regExp))) return false;

        matchedString = matchedString[0];

        this.edibleString = string.replace(regExp, '');

        return matchedString;
    }

    register(s){
        const ss = s();
        this.schema = {};

        Object.keys(ss).map(rule_name => {
            const execute = (rule, rule_name, callback) => {
            let result = rule();
            let regExpression;

            if(typeof result == 'string') {
                regExpression = result;
                result = this.eat(regExpression);
            }

            if(!!callback && !!result) {

                let parameters = [result];
                if (regExpression) {
                    const matches = this.regExp(regExpression).exec(result);
                    const params = Object.keys(matches).filter(key => !isNaN(key) && parseInt(key)).map(key => matches[key]);
                    parameters = parameters.concat(params);
                }


                const callbackResult = callback.apply(null, parameters);

                if (typeof callbackResult === 'string') result = callbackResult;
            }

            if(typeof result === 'string') this.rebuiltString += result;

            return !!result;
          };

          this.schema[rule_name] = execute.bind(this, ss[rule_name].bind(this, this.schema), rule_name);
        });

    }

    parse(str, startFn = 'nonEmptyValue'){
       this.edibleString = `${str}`;
       const result = this.schema[startFn].call(this);

       this.clean();

       return result && !this.edibleString.length;
    }
}

export default JSONParser;
