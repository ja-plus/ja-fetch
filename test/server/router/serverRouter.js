import Router from 'koa-router';
import controller from '../controller/getData.js';
const router = new Router();

router.get('/getTestData', controller.getTestData);
router.post('/postTestData', controller.postTestData);
router.put('/putTestData', controller.putTestData);
router.del('/delTestData', controller.delTestData);
router.get('/timeoutTestData', controller.timeoutTestData);
router.post('/uploadFile', controller.uploadFile);

router.get('/getHugeData', controller.getHugeData);

router.get('/setStatusCode', controller.setStatusCode);

export default router;
