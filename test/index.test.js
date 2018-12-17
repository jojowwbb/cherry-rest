global.fetch = require('jest-fetch-mock')
import Cherry,{module as CherryModule,config as CherryConfig} from '../dist/index.js'

CherryConfig({},{noFetch:true,baseUrl:'http://www.baidu.com'})
CherryModule('name',{
    baseUrl:'http://www.google.com'
});

CherryModule('goods',{
    debounce:1000
});

CherryModule('module2|home,moudle3|user');
CherryModule([{
    name:'module3',
    alias:'about',
    children:[{
        name:'info',
    },{
        name:'concat'
    }]
}]);

test('name', () => {
  expect(Cherry.name.create({path:['update1'],query:{}}).method).toBe('POST');
  expect(Cherry.name.create({path:['update1'],query:{}}).body).toBe(undefined);
});
test('alias2', () => {
  expect(Cherry.module2.create({path:['update2'],query:{}}).url).toBe('http://www.baidu.com/home/update2');
});
test('children', () => {
  expect(Cherry.module3.info.create({path:['path1']}).url).toBe('http://www.baidu.com/about/info/path1');
});
test('module has owner baseUrl', () => {
  expect(Cherry.name.create({path:['path1']}).url).toBe('http://www.google.com/name/path1');
});
