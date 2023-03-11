import fs from 'fs';

export default {
  async saveData(ctx) {
    let data = ctx.request.query.data;
    console.log(data);
    ctx.body = {
      data: 'hello world',
    };
  },

  async getTestData(ctx) {
    let data = ctx.request.query;
    // console.log('get headers:', ctx.request.headers);
    console.log('get cookies:', ctx.cookies.get('name'));
    console.log('get query:', data);
    console.log('get body:', data);
    ctx.cookies.set('name', 'serverSetCookie', {
      // secure: true,
      // sameSite: 'none'
    });
    ctx.body = {
      code: 1,
      type: 'get',
      query: ctx.request.query,
      body: data,
    };
    // ctx.response.redirect('https://www.baidu.com');
  },
  async postTestData(ctx) {
    let data = ctx.request.body; // 请求头必须要 Content-Type: application/json
    // console.log('get headers:', ctx.request.headers);
    console.log('post query:', ctx.request.query);
    console.log('post body:', data);
    ctx.body = {
      code: 1,
      type: 'post',
      query: ctx.request.query,
      body: data,
    };
    // ctx.status = 500;
  },
  async putTestData(ctx) {
    let data = ctx.request.body;
    console.log('put query:', ctx.request.query);
    console.log('put body:', data);
    ctx.body = {
      type: 'put',
      query: ctx.request.query,
      body: data,
    };
  },
  async delTestData(ctx) {
    let data = ctx.request.body;
    console.log('delete query:', ctx.request.query);
    console.log('delete body:', data);
    ctx.body = {
      type: 'delete',
      query: ctx.request.query,
      body: data,
    };
  },

  /** 延时 */
  async timeoutTestData(ctx) {
    console.log('get query:', ctx.request.query);
    const query = ctx.request.query;
    let timeout = +query.timeout || 2000;
    await new Promise(resolve => {
      setTimeout(resolve, timeout);
    });
    ctx.body = {
      timeout,
    };
  },

  /** 获取大量数据 */
  async getHugeData(ctx) {
    const dataLen = ctx.request.query.dataLength || 5000;
    let data = new Array(+dataLen).fill({
      prop1: '2.9315',
      prop2: '--',
      prop3: '1.4499',
      prop4: '--',
      prop5: '100.0040',
      prop6: '3.0200',
      prop7: 'AA+',
      prop8: '21汉口银行CD065',
      prop9: '--',
      prop10: '112180245.IB',
    });
    ctx.body = {
      data,
      option:
        "{legend:{show:false,data:['现价','成交量','持仓量'],},tooltip:{borderColor:'#484850',borderWidth:1,backgroundColor:'rgba(57,57,65,0.95)',padding:10,textStyle:{color:'#D0D1D2',fontSize:14,},extraCssText:'box-shadow:04px12px0rgba(0,0,0,0.30)',formatter(params){lethtml=`<divstyle='display:flex;'>`;letname=`<divstyle='margin-right:12px;'><div>时间</div>`;constdate=params[0].data[0].split('')[1].substring(0,5);letvalue=`<div><div>${date}</div>`;params.forEach(param=>{name+=`<div>${param.seriesName}</div>`;value+=`<div>${param.data[1]}</div>`;});name+='</div>';value+='</divstyle=>';html=html+name+value+'</div>';returnhtml;},},grid:[{left:0,top:8,right:0,},],xAxis:[{type:'time',min:'09:30',max:'15:15',axisLine:{show:true,onZero:false,lineStyle:{color:'#393941',width:1,},},axisLabel:{color:'#d0d1d2',},},],yAxis:[{name:'现价',nameTextStyle:{fontSize:0,},type:'value',splitNumber:5,splitLine:{show:false,},axisLabel:{show:false,},},{name:'成交量',nameTextStyle:{fontSize:0,},type:'value',splitLine:{show:false,},axisLabel:{show:false,},},{name:'持仓量',scale:true,nameTextStyle:{fontSize:0,},type:'value',splitLine:{show:false,},axisLabel:{show:false,},},{type:'value',min:0,max:7,splitNumber:7,splitLine:{lineStyle:{color:'#2B2B31',},},axisLabel:{show:false,},},],series:[{type:'line',name:'现价',yAxisIndex:0,symbol:'none',connectNulls:true,lineStyle:{color:'#E6AF18',width:1,emphsis:{width:1,},},},{type:'bar',name:'成交量',connectNulls:true,yAxisIndex:1,barMaxWidth:1,barMinWidth:0,itemStyle:{borderWidth:0,normal:{color:'#3A61B7',},},},{type:'line',name:'持仓量',connectNulls:true,symbol:'none',yAxisIndex:2,lineStyle:{color:'#F1F1F1',width:1,emphsis:{width:1,},},},],}",
    };
  },

  /** 返回状态码 */
  async setStatusCode(ctx) {
    let code = ctx.request.query.code;
    // ctx.throw(code);
    ctx.response.status = +code;
    ctx.body = {
      query: ctx.request.query,
    };
  },

  /** 接收客户端推送文件 */
  async uploadFile(ctx) {
    const file = ctx.request.files.file;
    console.log('uploadFile request.files', ctx.request.files);
    console.log('uploadFile request.body', ctx.request.body);
    let fileContent = fs.readFileSync(file.path);

    ctx.body = {
      query: ctx.request.query,
      code: 1,
      fileContent: fileContent.toString(),
      path: file.path,
    };
  },
};
