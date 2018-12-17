
# CherryRest
一种非常优雅Rest接口调用方式
## Features

- 基于Restful风格接口设计的模块化接口url生成器
- 集中管理接口url
- 默认使用fetch作为接口加载器
- 可以给模块单独设置baseUrl 
- 支持response formatter配置、支持单个module formatter
- 内置默认filter，当前只有一个over，重载response data filed


## Install

```bash
npm install cherry-rest --save
```

## Usage

```jsx
import Cherry,{module as CherryModule,config as CherryConfig} from 'cherry-rest'
```

基于业务Rest接口定义模块

```jsx
//方式一
CherryModule('name');

//方式二、定义多个模块、模块设置别名
CherryModule('module2|home,moudle3|user');

//方式三、复合继承模式
CherryModule([{
    name:'module3',
    alias:'about',
    children:[{
        name:'info',
    },{
        name:'concat'
    }]
}]);
```

调用

```jsx
Cherry.module3.info.query({query:{id:1}}).then(res=>res)
//fetch get /about/info?id=1;
Cherry.module3.info.create({body:{name:1}}).then(res=>res)
//fetch post /about/info {name:1};
Cherry.module3.info.update({query:{id:1}}).then(res=>res)
//fetch put /about/info?id=1;
Cherry.module3.info.remove({path:'1,2'}).then(res=>res)
//fetch delete /about/info/1/2;
```

Demo

```js
import Cherry,{module as CherryModule,config as CherryConfig} from '../dist/index.js'
//http://ip.taobao.com/service/getIpInfo.php?ip=114.114.114.114
jest.setTimeout(1200000);

CherryConfig({
    credentials:'include'
},{
    baseUrl:'http://ip.taobao.com',
    formatter:function(res){
        return res.json()
    }
})

CherryModule('ip|service',{
    formatter:[function(data){
        return data.data;
    }],
    filters:[{
        name:'over',
        options:['city_id|id']
    }]
});

it('async & filters test', () => {
    expect.assertions(1);
    return Cherry.ip.query({path:'getIpInfo.php',query:{ip:'114.114.114.114'}}).then(data => {
        expect(JSON.stringify(data)).toEqual(JSON.stringify({"id":"320100"}))
    });
});
```

