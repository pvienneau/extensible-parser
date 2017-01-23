class JSONParser{
    constructor(schema){
        this.register(schema);

        this.rebuiltString = '';
    }

    clean(){
        return this.eat('');
    }

    eat(exp){
        const string = this.edibleString;
        const regExp = new RegExp(`^\\s*${exp}`, 'i');

        let matchedString = false;

        if(typeof string !== 'string') return false;

        if (! (matchedString = string.match(regExp))) return false;

        matchedString = matchedString[0];

        this.rebuiltString += 'a';
        this.edibleString = string.replace(regExp, '');

        return matchedString;
    }

    register(s){
        const ss = s();
        this.schema = {};

        Object.keys(ss).map(rule_name => {
          const execute = (rule, rule_name, callback) => {

            let result = rule();

            if(typeof result == 'string'){
              result = this.eat(result);
            }

            if(!!callback && !!result) callback(result);

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
