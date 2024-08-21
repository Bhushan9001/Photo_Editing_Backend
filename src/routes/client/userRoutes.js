const router = require('express').Router();
const {authController} = require('../../controllers/client/userController')


router.post("/signup",authController.signup);
router.post("/signin",authController.signin);
router.post("/verify-email",authController.verifyEmail);


module.exports = router