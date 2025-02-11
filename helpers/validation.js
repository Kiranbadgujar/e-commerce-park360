const { body } = require("express-validator");

exports.registrationValidator = [
  body("first_name").trim().notEmpty().withMessage("First name is required"),
  body("last_name").trim().notEmpty().withMessage("Last name is required"),
  body("email").trim().isEmail().withMessage("Invalid email address"),
  body("password").trim().notEmpty().withMessage("Password is required").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  body("contact_number").trim().isLength({ min: 10, max: 10 }).withMessage("Invalid mobile number"),
  // body("address").trim().isLength({ max: 8 }).withMessage("Invalid address"),
];

exports.loginValidator = [
  body("email").trim().isEmail().withMessage("Invalid email address"),
  body("password").trim().notEmpty().withMessage("Password is required").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
];


// Product Validation
exports.insertProductValidator = [
  body("name").trim().notEmpty().withMessage("Product name is required"),
  body("description").trim().notEmpty().withMessage("Product description is required"),
  body("category_id").trim().notEmpty().withMessage("Category ID is required")
 ];

exports.insertCategoryValidator = [
 body("name").trim().notEmpty().withMessage("category name is required"),
 body("description").trim().notEmpty().withMessage("category description is required"),
];

exports.insertVariationValidator = [
 body("pro_id").trim().notEmpty().withMessage("product id is required"),
 body("color").trim().notEmpty().withMessage("color is required"),
 body("size").trim().notEmpty().withMessage("size is required"),
 body("stock").trim().notEmpty().withMessage("stock is required"),
];
