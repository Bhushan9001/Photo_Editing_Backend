const router = require('express').Router();
const {authController} = require('../../controllers/admin/adminController')
const passport = require('passport');


router.post("/signup",authController.signup);
router.post("/signin",authController.signin);
router.post("/create",passport.authenticate('jwt',{session:false}),authController.create);
module.exports = router