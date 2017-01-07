class JSONParser{
    constructor(str){
        this.input = str;
        this.cc = 0;
    }

    eat(str, exp){
        const regExp = new RegExp(`^\\W*${exp}`, 'i');

        if(typeof str != 'string') return false;

        if (!str.match(regExp)) return false;

        return str
            .replace(regExp, '');
    }

    value(str, isEmptyAllowed = true){
        /* value can be either:
            1. object
            2. array
            3. litteral
        */
        let r;
        let result;

        if((r = this.array(str)) !== false){
            result = r;
        }else if((r = this.object(str)) !== false){
            result = r;
        }else if((r = this.litteral(str)) != false){
            result = r;
        }else if(isEmptyAllowed){
            // empty
            result = str;
        }

        return result;

        //return this.object(str) || this.array(str) || this.litteral(str);
    }

    object(str){
        let result = this.eat(str, '{');

        if(result === false) return false;

        return this.eat(result, '}');
    }

    objectValue(str){

    }

    array(str){
        let result = this.eat(str, '\\[');

        if(result === false) return false;

        result = this.arrayValue(result, true);

        return this.eat(result, ']');
    }

    arrayValue(str, isEmptyAllowed = false){
        if(this.cc++ > 10) return false;

        let result;
        let r;

        result = this.value(str, isEmptyAllowed);

        if(r = this.eat(result, ',')){
            result = this.arrayValue(r);
        }

        return result;


        /*let result;
        let r;

        result = this.value(str);

        if(isCommaExpected) result = this.eat(result, ',');

        if((r = this.arrayValue(result)) !== false) result = r;

        return result;*/
    }

    litteral(str){
        let r;
        let result;

        if(r = this.integer(str)){
            result = r;
        }else if(r = this.string(str)){
            result = r;
        }else{
            return false;
        }

        return result;
    }

    integer(str){
        return this.eat(str, '[0-9]+');
    }

    string(str){
        return this.eat(str, '"[^"]*"');
    }

    empty(str){
        /*if(!str.length) return str;

        return str;*/

        return str;
    }

    parse(str = this.input){
        return this.value(str, false) === '';
    }
}

export default JSONParser;
