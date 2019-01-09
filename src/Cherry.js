/**
 * CherryRest
 * 一个优雅的Rest接口访问器
 * @version 0.0.1
 * @author daoxiaozhang
 */

import "@babel/polyfill";

const NULL_PATTERN = /^null | null$|^[^(]* null /i;
const UNDEFINED_PATTERN = /^undefined | undefined$|^[^(]* undefined /i;

//rest对象
let Cherry = {};

//fetch基础配置
let fetchOption = {};

//全局配置
let commonOption = {
    noFetch: false,
    baseUrl: '/',
    //数据加载、默认使用fetch
    loader: function (options) {
        let {
            url,
            ...rest
        } = Object.assign({}, fetchOption, options);
        return fetch(url, rest).then(res=>res.json());
    },
    //全局response数据转换器
    formatter: function (result) {
        return result
    }
}
/**
 * 默认模块配置
 * @type {Object}
 */
let defaultModuleOptions = {
    formatter: [],
    baseUrl: undefined
}


function toBe(data, type) {
    return Object.prototype.toString.call(data) === '[object ' + type + ']'
}

const filterOptions = {
    over: function (source, opts = []) {
        let result = {};
        let type = Object.prototype.toString.call(source);
        let format = function (data) {
            let _temp = {};
            opts.map(item => {
                let [key, alias] = item.split('|');
                let _key = alias || key;
                _temp[_key] = data[key];
            })
            return _temp;
        }
        if (type === '[object Object]') {
            result = format(source);
        } else if (type === '[object Array]') {
            result = source.map(data => {
                return format(data);
            })
        }
        return result;
    }
}


function log() {
    console.log(arguments)
}

/**
 * debounce创建方法
 * @param  {Function} fun   需要执行的function
 * @param  {Long} delay 延迟时间，单位：毫秒
 * @return {Function}
 */
function debounceCreator(fun, delay) {
    return function (args) {
        //获取函数的作用域和变量
        let that = this
        let _args = args
        //每次事件被触发，都会清除当前的timeer，然后重写设置超时调用
        clearTimeout(fun.id)
        fun.id = setTimeout(function () {
            fun.call(that, _args)
        }, delay)
    }
}

/**
 * 根据参数、格式化为URL字符串
 * @param  {Array}  [path=[]] url path 默认类型为数组、可以是字符串、以逗号分割
 * @param  {Object} [query={} }]            url query参数
 * @return {String}           url
 */
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
/**
 * 模块  Class
 */
class Module {
    constructor(props, options) {
        this.$name = props.name;
        this.$parent = props.parent;
        this.$alias = props.alias;
        if (props.parent) {
            //只继承父模块的baseUrl配置
            let _opts = Object.assign({}, defaultModuleOptions, {
                baseUrl: props.parent.$options.baseUrl
            });
            this.$options = Object.assign({}, _opts, props.options);
        } else {
            this.$options = Object.assign({}, defaultModuleOptions, props.options);
        }
        if (this.$options.debounce) {
            this.$debouncer = debounceCreator(commonOption.loader, this.$options.debounce)
        }
    }
    getUrl(fetchParams) {
        let result = [];
        let _url = '';
        const loop = (module) => {
            result.push(module.$alias || module.$name);
            if (module.$parent) {
                loop(module.$parent)
            }
        }
        loop(this);
        result.push('');
        _url = result.reverse().join('/') + format(fetchParams);
        return (this.$options.baseUrl || commonOption.baseUrl) + _url;
    }
    convertFetchOption(fetchParams = {}, method) {
        return {
            url: this.getUrl(fetchParams),
            body: fetchParams.body,
            method: method
        }
    }
    _load(fetchOption,fetchParams={}) {
        if (commonOption.noFetch) {
            return fetchOption;
        } else {
            let _prms = this.$debouncer ? his.$debouncer(fetchOption) : commonOption.loader(fetchOption);
            return _prms.then(commonOption.formatter).then(res => {
                let formatterArrays = this.$options.formatter;
                let filters = this.$options.filters;
                let result = res;
                formatterArrays.map(formatter => {
                    result = formatter(result);
                })
                if (toBe(filters, 'Array')) {
                    filters.map(filter => {
                        result = filterOptions[filter.name](result, filter.options)
                    })
                }
                return result;
            });
        }
    }
    create(fetchParams) {
        let fetchOption = this.convertFetchOption(fetchParams, 'POST');
        return this._load(fetchOption,fetchParams);
    }
    update(fetchParams) {
        let fetchOption = this.convertFetchOption(fetchParams, 'PUT');
        return this._load(fetchOption,fetchParams);

    }
    remove(fetchParams) {
        let fetchOption = this.convertFetchOption(fetchParams, 'DELETE');
        return this._load(fetchOption,fetchParams);
    }
    query(fetchParams) {
        let fetchOption = this.convertFetchOption(fetchParams, 'GET');
        return this._load(fetchOption,fetchParams);
    }
}

/**
 * 通过字符串的形式实例化module对象
 * @param  {[type]} name    字符串配置形式
 * @param  {[type]} options 模块的配置
 * @return {[type]}         [description]
 */
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


/**
 * 一个优雅的取值形式
 * @param  {Object}   props        需要取值的数据源
 * @param  {Function} callback
 * @param  {Object}   defaultValue 当取值异常、或者值为false时返回的默认值
 * @return {Object}                返回值
 */
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

/**
 * 基础配置
 */
export function config() {
    if(arguments.length==2){
        fetchOption = arguments[0];
        commonOption = Object.assign({}, commonOption, arguments[1]);
    }else if(arguments.length==1){
        let {fetch,common}=arguments[0];
        fetchOption = fetch;
        commonOption = Object.assign({}, commonOption, common);
    }

}

export function module(modules, options) {
    if (typeof modules === 'string') {
        createModuleByString(modules, options)
    } else if (toBe(modules,'Array')) {
        createModule(modules);
    }
}

export default Cherry;
