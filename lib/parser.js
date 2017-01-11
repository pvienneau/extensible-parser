class JSONParser{
    constructor(schema){
        this.register(schema);

        this.rebuiltString = '';
    }

    clean(str){
        return this.eat(str, '');
    }

    eat(exp){
        const string = this.edibleString;

        const regExp = new RegExp(`^\\s*${exp}`, 'i');

        if(typeof string !== 'string') return false;

        if (!string.match(regExp)) return false;

        this.rebuiltString += 'a';
        this.edibleString = string.replace(regExp, '');

        return true;
    }

    register(s){
        const ss = s();
        this.schema = {};

        Object.keys(ss).map(rule_name => {
          const execute = (rule, rule_name) => {

            let result = rule();

            if(typeof result == 'string'){
              result = this.eat(result);
            }

            return result;
          };

          this.schema[rule_name] = execute.bind(this, ss[rule_name].bind(this, this.schema), rule_name);
        });

    }

    parse(str){
       this.edibleString = `${str}`;
       this.schema.nonEmptyValue();

       return this.edibleString == '';
    }
}

export default JSONParser;
