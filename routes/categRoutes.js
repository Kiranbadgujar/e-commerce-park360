const express = require("express");
const {
  getCategory,
  insertCategory,
  updateCategory,
  deleteCategory,
  categorySort,
  filterAll,
  getSingleCategory,
  getAdminCategory,
} = require("../controllers/categController");
const { insertCategoryValidator } = require("../helpers/validation");
const Middleware = require("../middlewares/authMiddleware");
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

router.get("/get-category/", getCategory);
router.get("/get-admin-category/", getAdminCategory);
router.get("/get-single-category/:categoryId", getSingleCategory);
router.get("/sort-category", categorySort);
router.get("/filterAll", filterAll);
router.post("/insert-category",upload.single("file"),insertCategoryValidator,Middleware,insertCategory);
router.post("/update-category/:categoryId", Middleware, updateCategory);
router.delete("/delete-category/:categoryId", Middleware, deleteCategory);

module.exports = router;
