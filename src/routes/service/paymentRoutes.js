const { paymentController } = require("../../controllers/services/paymentController");
const passport = require('passport');
const router = require("express").Router();

router.post("/", passport.authenticate('jwt', { session: false }), paymentController.createPayment);
router.get("/", paymentController.getAllPayments);
router.get("/:id", paymentController.getPayment);
router.put("/:id", paymentController.updatePayment);
router.delete("/:id", paymentController.deletePayment);

module.exports = router;