const { subServicesController } = require("../../controllers/services/subServicesController");

const router = require("express").Router();

router.post("/",subServicesController.createSubService);
router.post("/many",subServicesController.createManySubServices);
router.post("/withPrices",subServicesController.createSubServiceWithPrices);
router.get("/",subServicesController.getAllSubServices);
router.get("/:id",subServicesController.getSubService);
router.put("/:id",subServicesController.updateSubService);
router.delete("/:id",subServicesController.deleteSubService);

module.exports = router;