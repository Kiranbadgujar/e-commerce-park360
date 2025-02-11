const express = require("express");
const { getVariation ,insertVariation ,updateVariation ,deleteVariation,getVariationProduct,getSingleVariation} = require("../controllers/variController");
const { insertVariationValidator} = require("../helpers/validation");
const Middleware = require("../middlewares/authMiddleware")
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Multer file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/categorys");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

router.get("/get-variation",getVariation)
router.get("/get-single-variation/:variationId",getSingleVariation)
router.get("/get-variation-product/:productId",getVariationProduct)
router.post("/insert-variation",upload.single("file"),insertVariationValidator,Middleware,insertVariation)
router.post("/update-variation/:variationId",Middleware,updateVariation)
router.delete("/delete-variation/:variationId",Middleware,deleteVariation)

module.exports = router;
