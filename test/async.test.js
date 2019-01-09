global.fetch = require('node-fetch')
import Cherry,{module as CherryModule,config as CherryConfig} from '../dist/index.js'
//http://ip.taobao.com/service/getIpInfo.php?ip=114.114.114.114
jest.setTimeout(1200000);

CherryConfig({
    credentials:'include'
},{
    baseUrl:'http://ip.taobao.com'
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
