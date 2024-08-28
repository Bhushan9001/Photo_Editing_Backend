const { jobController } = require("../../controllers/services/jobController");
const passport = require('passport');
const router = require("express").Router();

router.post("/",passport.authenticate('jwt',{session:false}), jobController.createJob);
router.get("/", jobController.getAllJobs);
router.get("/:id", jobController.getJob);
router.put("/update-job/:id",passport.authenticate('jwt',{session:false}),jobController.changeJobStatus)
router.put("/assign-job",jobController.assignJob);
router.put("/:id", jobController.updateJob);
router.delete("/:id", jobController.deleteJob);

module.exports = router;