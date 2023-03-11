import Koa from 'koa';
import koaBody from 'koa-body';
import cors from 'koa-cors';
import staticMid from 'koa-static';
import compress from 'koa-compress';
import chalk from 'chalk';
import logger from './logger.js';

import serverRouter from './router/serverRouter.js';

const app = new Koa();

app.use(
  cors({
    // origin: '127.0.0.1',
    // credentials: true // 支持跨域cookie
  }),
);

app.use(
  koaBody({
    multipart: true, // 支持formData
    formidable: {
      // 上传目录 不配置就会暂存在 \AppData\\Local\\Temp\\
      // uploadDir: path.join(__dirname, '../uploadFiles'),
      // 保留文件扩展名
      keepExtensions: true,
    },
  }),
);

app.use(async (ctx, next) => {
  // 收到请求的时间
  logger.info(chalk.bgGreen(ctx.method), ctx.url, ctx.header.referer || ctx.header.host);
  await next(); // 必须await
});
// 配置静态资源目录，放在后端路由前，优先获取静态自选
// app.use(
//   staticMid(__dirname + '/statics', {
//     maxAge: 1000,
//   }),
// );
app.use(compress()); // gzip br 压缩
app.use(serverRouter.routes());

app.listen(8080, () => {
  logger.info('服务已启动，访问地址：http://localhost:8080');
});
