const { imageController , sliderImageController} = require("../../controllers/services/imageController");
const passport = require('passport');

const multer = require('multer');
const { sliderimage } = require("../../prisma");
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
//Slider Images Routes
router.post('/slider-images', upload.array('images',10), sliderImageController.addImages);
router.get('/slider-images', sliderImageController.getAllImages);
router.get('/slider-images/:id', sliderImageController.getImage);
router.put('/slider-images/:id', upload.single('image'), sliderImageController.updateImage);
router.delete('/imslider-imagesages/:id', sliderImageController.deleteImage);

module.exports = router;
