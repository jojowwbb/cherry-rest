
# CherryRest

## Features

- 基于Restful风格接口设计的模块化接口url生成器
- 集中管理接口url
- 默认使用fetch作为接口加载器
- 可以给模块单独设置baseUrl


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

