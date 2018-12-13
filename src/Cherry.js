import "@babel/polyfill";

const NULL_PATTERN = /^null | null$|^[^(]* null /i;
const UNDEFINED_PATTERN = /^undefined | undefined$|^[^(]* undefined /i;
//fetch基础配置
let fetchOption = {};

let commonOption={
    noFetch:false,
    baseUrl:'/',
    loader:function(options) {
        let { url, ...rest } = Object.assign({}, fetchOption, options);
        return fetch(url, rest);
    },
    formatter:function(response){
        return response
    }
}
//rest对象
let Cherry = {};

//优雅的取值
export function need(props, callback, defaultValue) {
    try {
        return callback(props);
    } catch (error) {
        if (error instanceof TypeError) {
            if (NULL_PATTERN.test(error)) {
                return defaultValue || null;
            } else if (UNDEFINED_PATTERN.test(error)) {
                return defaultValue || undefined;
            }
        }
        throw error;
    }
}

//将path、qeuery参数转成url
function format({
    path = [],
    query = {}
}) {
    let url = '';
    let params = [];
    if (typeof path === 'string') {
        path = path.split(',');
    }
    path.map(item => {
        if (item) {
            url += '/' + item;
        }
    })
    for (let p in query) {
        if (typeof query[p] != 'undefined') {
            params.push(p + '=' + query[p])
        }
    }
    if (params && params.length) {
        return url + "?" + params.join('&');
    }
    return url;
}

class Module {

    constructor(props, options) {
        this.$name = props.name;
        this.$parent = props.parent;
        this.$alias = props.alias;
        if (props.parent) {
            this.$options = Object.assign({}, props.parent.$options, props.options);
        } else {
            this.$options = Object.assign({}, options, props.options);
        }
    }
    getUrl(fetchParams){
        let result = [];
        let _url='';
        const loop = (module) => {
            result.push(module.$alias || module.$name);
            if (module.$parent) {
                loop(module.$parent)
            }
        }
        loop(this);
        result.push('');
        _url=result.reverse().join('/') + format(fetchParams);
        return (this.$options.baseUrl||commonOption.baseUrl)+_url;
    }
    convertFetchOption(fetchParams = {}, method) {
        return {
            url: this.getUrl(fetchParams),
            body: fetchParams.body,
            method: method
        }
    }
    _load(fetchOption){
        if(commonOption.noFetch){
            return fetchOption;
        }else{
            return commonOption.loader(fetchOption)
                        .then(res=>{
                            let formatter=this.$options.formatter||commonOption.formatter;
                            return formatter(res);
                        });
        }

    }
    create(fetchParams) {
        let fetchOption = this.convertFetchOption(fetchParams, 'POST');
        return this._load(fetchOption);
    }
    update(fetchParams) {
        let fetchOption = this.convertFetchOption(fetchParams, 'PUT');
        return this._load(fetchOption);

    }
    remove(fetchParams) {
        let fetchOption = this.convertFetchOption(fetchParams, 'DELETE');
        return this._load(fetchOption);
    }
    query(fetchParams) {
        let fetchOption = this.convertFetchOption(fetchParams, 'GET');
        return this._load(fetchOption);
    }
}

function createModuleByString(name, options) {
    let moduleNames = name.split(',');
    let moduleObj = [];
    moduleNames.map(item => {
        let [name, alias] = item.split('|');
        moduleObj.push({
            name: name,
            alias: alias,
            options: options
        })
    })
    createModule(moduleObj, null);
}

function createModule(modules, parentModule) {
    modules.map(item => {
        let module = new Module({
            name: item.name,
            alias: item.alias,
            parent: parentModule,
            options: item.options
        });
        let key = item.name;
        if (!parentModule) {
            Cherry[key] = module;
        } else {
            parentModule[key] = module;
        }
        if (item.children) {
            createModule(item.children, module);
        }
    })
}

export function config(fetch,common) {
    fetchOption = fetch;
    commonOption=Object.assign({},commonOption,common);
}
export function module(modules, options) {
    if (typeof modules === 'string') {
        createModuleByString(modules, options)
    } else if (Object.prototype.toString.call(modules) === '[object Array]') {
        createModule(modules);
    }
}
export default Cherry;
