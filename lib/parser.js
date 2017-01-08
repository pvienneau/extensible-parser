class JSONParser{
    constructor(str, strictMode = false){
        this.input = str;
        this.strictMode = strictMode;
    }

    clean(str){
        return this.eat(str, '');
    }

    eat(str, exp){
        const regExp = new RegExp(`^\\s*${exp}`, 'i');

        if(typeof str != 'string') return false;

        if (!str.match(regExp)) return false;

        return str
            .replace(regExp, '');
    }

    value(str, isEmptyAllowed = true){
        let r;
        let result;

        if((r = this.array(str)) !== false){
            result = r;
        }else if((r = this.object(str)) !== false){
            result = r;
        }else if((r = this.litteral(str)) !== false){
            result = r;
        }else if(isEmptyAllowed){
            result = str;
        }

        return result;
    }

    object(str){
        let r;

        let result = this.eat(str, '{');

        if(result === false) return false;

        if((r = this.objectValue(result)) !== false){
            result = r;
        }

        result = this.eat(result, '}');

        return result;
    }

    objectValue(str){
        let result;
        let r;

        result = this.string(str);

        result = this.eat(result, ':');

        result = this.value(result);

        if((r = this.eat(result, ',')) !== false){
            result = this.objectValue(r);
        }


        return result;
    }

    array(str){
        let result = this.eat(str, '\\[');

        if(result === false) return false;

        result = this.arrayValue(result, true);

        return this.eat(result, ']');
    }

    arrayValue(str, isEmptyAllowed = false){
        let result;
        let r;

        result = this.value(str, isEmptyAllowed);

        if(r = this.eat(result, ',')){
            result = this.arrayValue(r);
        }

        return result;
    }

    litteral(str){
        let r;
        let result;

        if((r = this.integer(str)) !== false){
            result = r;
        }else if((r = this.string(str)) !== false){
            result = r;
        }else if((r = this.boolean(str)) !== false){
            result = r;
        }else if((r = this.null(str)) !== false){
            result = r;
        }else{
            return false;
        }

        return result;
    }

    integer(str){
        return this.eat(str, '-?[0-9]+(\\.[0-9]*)?(e[0-9]+)?');
    }

    _isStrictMode(){
        return !!this.strictMode;
    }

    _getStringExpression(){
        const strictExpression = '"(\\\\(?:[bfnrt\\\\\/"]|u[0-9a-f])|[^"\\\\])*"';
        const nonStrictExpression = '"(\\\\"|[^"])*"';

        return this._isStrictMode()?
            strictExpression:
            nonStrictExpression;
    }

    string(str){
        return this.eat(str, this._getStringExpression());
    }

    boolean(str){
        return this.eat(str, 'true|false');
    }

    null(str){
        return this.eat(str, 'null');
    }

    empty(str){
        return str;
    }

    parse(str = this.input){
        return this.clean(this.value(str, false)) === '';
    }
}

export default JSONParser;
