const router = require('express').Router();
const {authController} = require('../../controllers/admin/adminController')


router.post("/signup",authController.signup);
router.post("/signin",authController.signin);

module.exports = router