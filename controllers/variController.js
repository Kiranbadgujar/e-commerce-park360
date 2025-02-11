const db = require("../config/db");
const { validationResult } = require("express-validator");

const validation = (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(400).json({ errors: error.array() });
  }
};

// get variation
const getVariation = async (req, res) => {
  // const {variationId} = req.params;

  //get variation table
  const query = `SELECT product.pro_name, variations.vari_color,variations.vari_id, variations.vari_size,
    variations.vari_price, variations.vari_quantity, variations.vari_image
    FROM product
    JOIN variations ON product.pro_id = variations.pro_id
    WHERE variations.is_active = '1'`;
  db.query(query, (err, result) => {
    if (err) return res.status(500).send(err);
    res
      .status(200)
      .json({ message: "variation listed successfully", data: result });
  });
};

//get variation single
const getSingleVariation = async (req, res) => {
  const { variationId } = req.params;
  console.log(variationId);

  //get variation table
  const query = `SELECT product.pro_name, variations.vari_color, variations.vari_size,
    variations.vari_price,product.pro_id, variations.is_active,variations.vari_quantity, variations.vari_image
    FROM product
    JOIN variations ON product.pro_id = variations.pro_id
    WHERE variations.vari_id = ?`;
  db.query(query, [variationId], (err, result) => {
    if (err) return res.status(500).send(err);
    res
      .status(200)
      .json({ message: "variation listed successfully", data: result });
  });
};

//show variation of prouct
const getVariationProduct = async (req, res) => {
  const { productId } = req.params;
  console.log(productId);

  //get variation table
  const query = `SELECT product.pro_name,variations.vari_id, product.pro_id,variations.vari_color, variations.vari_size,
    variations.vari_price, variations.vari_quantity, variations.vari_image
    FROM product
    JOIN variations ON product.pro_id = variations.pro_id
    WHERE product.pro_id = ?`;
  db.query(query, [productId], (err, result) => {
    if (err) return res.status(500).send(err);
    res
      .status(200)
      .json({ message: "variation listed successfully", data: result });
  });
};

// insert variation
const insertVariation = async (req, res) => {
  const validationError = validation(req, res);
  if (validationError) {
    return validationError;
  }

  const { pro_id, color, size, stock, price} = req.body;

  // extract the user_id from the jwt token
  const userId = req.user.user_id;
  // console.log(userId)

  const roleQuery = "SELECT role FROM users WHERE user_id = ?";
  db.query(roleQuery, [userId], async (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ status: 500, message: "Error checking user role" });
    }

    const userRole = result[0].role;
    if (userRole !== "admin") {
      return res
        .status(403)
        .json({ status: 403, message: "Only admin can insert products" });
    }

     // Check if an image file was uploaded
    // console.log(file);
    if (!req.file) {
      return res
        .status(400)
        .json({ status: 400, message: "No image file uploaded" });
    }
    // console.log(req.file);
    const imagePath = req.file.path;
    console.log(req.file.path);

    // Insert  into product table
    const query =
      "INSERT INTO variations (pro_id, vari_color, vari_size, vari_quantity,vari_price,vari_image) VALUES (?, ?, ?, ?,?,?)";
    db.query(query, [pro_id, color, size, stock, price,imagePath], (err, result) => {
      if (err) return res.status(500).send(err);
      res
        .status(200)
        .json({ status: 200, message: "Variation Created Successfully" });
    });
  });
};

// update variation
const updateVariation = async (req, res) => {
  const validationError = validation(req, res);
  if (validationError) {
    return validationError;
  }
  const { color, size, stock, price } = req.body;
  const { variationId } = req.params;
  console.log(variationId);

  const userId = req.user.user_id;

  const roleQuery = "SELECT role FROM users WHERE user_id = ?";
  db.query(roleQuery, [userId], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ status: 500, message: "Error checking user role" });
    }

    const userRole = result[0].role;
    if (userRole !== "admin") {
      return res
        .status(403)
        .json({ status: 403, message: "Only admin can update product" });
    }

    // update product table
    const query =
      "UPDATE variations SET vari_color = ? ,vari_size = ? , vari_quantity = ? ,vari_price=? WHERE vari_id = ?";
    db.query(query, [color, size, stock, price, variationId], (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ status: 500, meassge: "error updating product", err });
      }

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ status: 404, message: "Variation not found" });
      }

      res
        .status(200)
        .json({ status: 200, message: "Variation updated successfully" });
    });
  });
};

// delete variation
const deleteVariation = async (req, res) => {
  const {activate} = req.body
  const { variationId } = req.params;

  const userId = req.user.user_id;

  // Check if the user is an admin
  const roleQuery = "SELECT role FROM users WHERE user_id = ?";
  db.query(roleQuery, [userId], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ status: 500, message: "Error checking user role" });
    }

    const userRole = result[0].role;
    if (userRole !== "admin") {
      return res
        .status(403)
        .json({ status: 403, message: "Only admin can delete Variation" });
    }

    // updating the category
    const updateCategoryQuery =
      "UPDATE variations SET  is_active = ? WHERE vari_id = ?";
    db.query(updateCategoryQuery, [activate, variationId], (err, result) => {
      // console.log(result)
      if (err) {
        return res
          .status(500)
          .json({ status: 500, message: "Error updating category", err });
      }

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ status: 404, message: "Variation not found" });
      }

      res
        .status(200)
        .json({ status: 200, message: "Variation updated successfully" });
    });
  });
};

module.exports = {
  getVariation,
  insertVariation,
  updateVariation,
  deleteVariation,
  getVariationProduct,
  getSingleVariation,
};
