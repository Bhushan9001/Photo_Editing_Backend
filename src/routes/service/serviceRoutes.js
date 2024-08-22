const { serviceController } = require('../../controllers/services/serviceController');

const router = require('express').Router();

router.post("/",serviceController.creatService);
router.get("/",serviceController.getAllServices);
router.get("/:id",serviceController.getService);
router.put("/:id",serviceController.updateService);
router.delete("/:id",serviceController.deleteService);

module.exports = router