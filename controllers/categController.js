const db = require("../config/db");
const { validationResult } = require("express-validator");

const validation = (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(400).json({ errors: error.array() });
  }
};

//get category
const getCategory = async (req, res) => {
  // get category table
  const query = "SELECT * FROM categories WHERE is_active = '1'";
  db.query(query, (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(200).json({
      status: 200,
      message: "Category listed successfully",
      data: result,
    });
  });
};

//get category
const getAdminCategory = async (req, res) => {
  // get category table
  const query = "SELECT * FROM categories";
  db.query(query, (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(200).json({
      status: 500,
      message: "Category listed successfully",
      data: result,
    });
  });
};

//get single category
const getSingleCategory = async (req, res) => {
  const {categoryId} = req.params;
  // get category table
  const query = "SELECT * FROM categories WHERE cate_id = ?";
  db.query(query,[categoryId] ,(err, result) => {
    if (err) return res.status(500).send(err);
    res.status(200).json({
      status: 500,
      message: "Single Category listed successfully",
      data: result,
    });
  });
};

// sort category
const categorySort = async (req, res) => {
  const { sortBy, order } = req.query;
  // console.log(req.query);

  const SortColumns = ["cate_name", "cate_description"];
  if (!SortColumns.includes(sortBy)) {
    return res
      .status(400)
      .json({ status: 400, message: "Invalid sort column" });
  }

  // const allowedOrder = ["ASC", "DESC"];
  // if (!allowedOrder.includes(order)) {
  //   return res.status(400).json({ message: "Invalid order direction" });
  // }

  const query = `SELECT cate_name, cate_description FROM categories WHERE is_active = 'yes' ORDER BY ${sortBy} ${order}`;

  db.query(query, (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ status: 500, message: "Error fetching products" });
    }
    res.status(200).json({
      status: 200,
      messge: "Sorting Fetched Successfully",
      data: result,
    });
  });
};

// join filter
const filterAll = async (req, res) => {
  const { name, min_price, max_price, color, size, category } = req.query;

  let query =
    "SELECT product.pro_name,product.pro_description,variations.vari_color,variations.vari_size,variations.vari_price, categories.cate_name FROM product JOIN variations ON product.pro_id = variations.pro_id JOIN categories ON product.cate_id = categories.cate_id WHERE product.is_active = 'yes'";

  let params = [];
  // console.log("first",params);
  if (name) {
    query += " AND product.pro_name LIKE ?";
    params.push(`%${name}%`);
  }
  // console.log("seacond",params);

  if (min_price) {
    query += " AND variations.vari_price >= ?";
    params.push(min_price);
  }

  if (max_price) {
    query += " AND variations.vari_price <= ?";
    params.push(max_price);
  }

  if (color) {
    query += " AND variations.vari_color LIKE ?";
    params.push(`%${color}%`);
  }

  if (size) {
    query += " AND variations.vari_size LIKE ?";
    params.push(`%${size}%`);
  }

  if (category) {
    query += " AND categories.cate_name LIKE ?";
    params.push(`%${category}%`);
  }

  db.query(query, params, (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ status: 500, message: "Error filtering products", error: err });
    }
    res
      .status(200)
      .json({ status: 200, messge: "Fetched Successfully", data: result });
  });
};

// insert category
const insertCategory = async (req, res) => {
  const validationError = validation(req, res);
  if (validationError) {
    return validationError;
  }

  const { name, description } = req.body;
  

  //extract the user_id from the jwt token
  const userId = req.user.user_id;
  console.log(userId);

  const roleQuery = "SELECT role FROM users WHERE user_id = ?";
  db.query(roleQuery, [userId], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ status: 500, message: "Error checking user role" });
    }

    const userRole = result[0].role;
    // console.log(userRole);
    if (userRole !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admin can insert products" });
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

    // insert into category table
    const query =
      "INSERT INTO categories (cate_name,cate_description,cate_image) VALUES (?,?,?)";
    db.query(query, [name, description, imagePath], (err, result) => {
      if (err) return res.status(500).send(err);
      res
        .status(200)
        .json({ status: 200, message: "Category Created Successfully" });
    });
  });
};

// update category
const updateCategory = async (req, res) => {


  const { name, description } = req.body;
  const { categoryId } = req.params;
  // console.log(categoryId);
  // console.log(name);
  // console.log(description);

  // Extract the user_id from the JWT token
  const userId = req.user.user_id;

  // Check user role for permissions
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
        .json({ status: 403, message: "Only admin can update categories" });
    }

    // updating the category
    const updateCategoryQuery =
      "UPDATE categories SET cate_name = ?, cate_description = ? WHERE cate_id = ?";
    db.query(
      updateCategoryQuery,
      [name, description, categoryId],
      (err, result) => {
        // console.log(result)
        if (err) {
          return res
            .status(500)
            .json({ status: 500, message: "Error updating category", err });
        }

        if (result.affectedRows === 0) {
          return res
            .status(404)
            .json({ status: 404, message: "Category not found" });
        }

        res
          .status(200)
          .json({ status: 200, message: "Category updated successfully" });
      }
    );
  });
};

// delete category
const deleteCategory = async (req, res) => {
  const { categoryId } = req.params;
  const { activate } = req.body;
  // console.log(categoryId);
  // console.log(activate);

  // Extract the user_id from the JWT token
  const userId = req.user.user_id;

  const query = "SELECT role FROM users WHERE user_id = ?";
  db.query(query, [userId], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ status: 500, message: "Error checking user role" });
    }

    const userRole = result[0].role;
    if (userRole !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admin can delete categories" });
    }

    // check active product
    const activeQuery = `
      SELECT COUNT(*) AS productCount
      FROM product
      WHERE cate_id = ? AND is_active = '1'
    `;
    db.query(activeQuery, [categoryId], (err, result) => {
      // console.log(result)
      if (err) {
        return res
          .status(500)
          .json({ status: 500, message: "Error checking products" });
      }

      const productCount = result[0].productCount;
      // console.log(productCount);

      if (productCount > 0 && activate === "0") {
        return res.status(400).json({
          status: 400,
          message: `cannot deactivate category.beacuse You have active ${productCount} products`,
        });
      }

      // updating the category
      const updateCategoryQuery =
        "UPDATE categories SET  is_active = ? WHERE cate_id = ?";
      db.query(updateCategoryQuery, [activate, categoryId], (err, result) => {
        // console.log(result)
        if (err) {
          return res
            .status(500)
            .json({ status: 500, message: "Error updating category", err });
        }

        if (result.affectedRows === 0) {
          return res
            .status(404)
            .json({ status: 404, message: "Category not found" });
        }

        res
          .status(200)
          .json({ status: 200, message: "Category updated successfully" });
      });
    });
  });
};

module.exports = {
  insertCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  categorySort,
  filterAll,
  getSingleCategory,
  getAdminCategory
};
