function want(source,callback){
    const NULL_PATTERN = /^null | null$|^[^(]* null /i;
    const UNDEFINED_PATTERN = /^undefined | undefined$|^[^(]* undefined /i;
    let result="";
    let format=function(){};
    format.prototype.or=function(value){
        if(result instanceof Error){
            return value;
        }else{
            return result;
        }
    }
    format.prototype.valueOf=function(){
        return result;
    }

    try {
        result=callback(props);
    } catch (error) {
        if (NULL_PATTERN.test(error)) {
            result=null;
        } else if (UNDEFINED_PATTERN.test(error)) {
            result=undefined;
        }
    }
    return format;
}

console.log(want({name:123},_=>_.name).or('12'))