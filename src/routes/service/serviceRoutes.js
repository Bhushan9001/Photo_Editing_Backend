const { serviceController } = require('../../controllers/services/serviceController');
const passport = require('passport');
const upload = require('../../middleware/multer');
const router = require('express').Router();

router.post("/",passport.authenticate('jwt',{session:false}),upload.fields([{ name: 'beforeImage', maxCount: 1 },{ name: 'afterImage', maxCount: 1 }]),serviceController.creatService);
router.get("/",serviceController.getAllServices);
router.get("/:id",serviceController.getService);
router.put("/:id",serviceController.updateService);
router.delete("/:id",serviceController.deleteService);
router.post("/test",upload.fields([{ name: 'beforeImage', maxCount: 1 },{ name: 'afterImage', maxCount: 1 }]),serviceController.testService)
module.exports = router

