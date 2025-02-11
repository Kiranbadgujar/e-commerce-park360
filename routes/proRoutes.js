const express = require("express");
const { insertProduct , getProduct ,updateProduct ,deleteProduct, productSort,filterProductsVariation,showProduct,getSingleProduct} = require("../controllers/proController");
const { insertProductValidator} = require("../helpers/validation");
const Middleware = require("../middlewares/authMiddleware")

const router = express.Router();


router.get("/get-product",getProduct)
router.get("/get-single-product/:productId",getSingleProduct)
router.get("/sort-products", productSort);
router.get("/show-products/:categoryId", showProduct);
router.get("/filterAll", filterProductsVariation);
router.post("/insert-product",Middleware,insertProduct)
router.post("/update-product/:productId",Middleware,updateProduct)
router.delete("/delete-product/:productId",Middleware,deleteProduct)

module.exports = router;
