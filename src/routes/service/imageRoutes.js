const { imageController } = require("../../controllers/services/imageController");
const passport = require('passport');

const multer = require('multer');
const router = require("express").Router();

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images/') // Make sure this directory exists
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({ storage: storage });

router.post('/images', upload.single('image'), imageController.addImage);
router.get('/images', imageController.getAllImages);
router.get('/images/:id', imageController.getImage);
router.put('/images/:id', upload.single('image'), imageController.updateImage);
router.delete('/images/:id', imageController.deleteImage);

module.exports = router;
