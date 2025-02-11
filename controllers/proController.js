const db = require("../config/db");
const { validationResult } = require("express-validator");

const validation = (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(400).json({ errors: error.array() });
  }
};

// get product
const getProduct = (async = (req, res) => {
  //  const {categoryid} = req.params

  // get product table
  const query = "SELECT * FROM product";
  db.query(query, (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(200).json({
      status: 200,
      message: "Product listed successfully",
      data: result,
    });
  });
});

// get single product
const getSingleProduct = (async = (req, res) => {
   const {productId} = req.params

  // get product table
  const query = "SELECT * FROM product WHERE  pro_id = ?";
  db.query(query,[productId], (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(200).json({
      status: 200,
      message: "Product listed successfully",
      data: result,
    });
  });
});

// show product
const showProduct = async (req, res) => {
  const { categoryId } = req.params;
  const { color, size, sort, page = 1, limit = 8 } = req.query;

  // Base query to retrieve products
  let query = `
    SELECT product.pro_name, variations.vari_color, variations.vari_size,
    variations.vari_price, variations.vari_quantity, variations.vari_image
    FROM product
    JOIN variations ON product.pro_id = variations.pro_id
    WHERE product.cate_id = ? AND variations.is_active = '1'
  `;

  const queryParams = [categoryId];

  // Add filtering conditions
  if (color) {
    query += ` AND variations.vari_color = ?`;
    queryParams.push(color);
  }
  if (size) {
    query += ` AND variations.vari_size = ?`;
    queryParams.push(size);
  }

  // Add sorting options if 'sort' is selected
  if (sort) {
    if (sort === "price_asc") {
      query += ` ORDER BY variations.vari_price ASC`;
    } else if (sort === "price_desc") {
      query += ` ORDER BY variations.vari_price DESC`;
    }
  }

  // Calculate pagination values
  const offset = (parseInt(page) - 1) * parseInt(limit);
  // console.log(offset);
  query += ` LIMIT ? OFFSET ?`; // Add LIMIT and OFFSET to the query
  queryParams.push(parseInt(limit), offset);

  // Query to get the total number of products (for pagination calculation)
  const countQuery = `
    SELECT COUNT(*) AS totalCount
    FROM product
    JOIN variations ON product.pro_id = variations.pro_id
    WHERE product.cate_id = ?
  `;

  // Execute both queries
  try {
    const productsResult = await db.promise().query(query, queryParams); // Query for the paginated products
    const countResult = await db.promise().query(countQuery, [categoryId]); // Query for the total product count

    const totalProducts = countResult[0][0].totalCount;
    const totalPages = Math.ceil(totalProducts / limit); // Calculate the total number of pages

    res.status(200).json({
      status: 200,
      message: "Products and variations listed successfully",
      data: productsResult[0],
      totalProducts,
      totalPages,
      currentPage: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    res.status(500).send(err);
  }
};

// sort product
const productSort = async (req, res) => {
  const { sortBy, order } = req.query;

  // console.log(req.query);

  // const SortColumns = ["pro_name", "pro_description", "cate_id"];
  // if (!SortColumns.includes(sortBy)) {
  //   return res.status(400).json({ message: "Invalid sort column" });
  // }

  // const allowedOrder = ["ASC", "DESC"];
  // if (!allowedOrder.includes(order)) {
  //   return res.status(400).json({ message: "Invalid order direction" });
  // }

  const query = `SELECT pro_name, pro_description, pro_image FROM product WHERE is_active = 'yes' ORDER BY ${sortBy} ${order}`;

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
const filterProductsVariation = async (req, res) => {
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
    res.status(200).json({
      status: 200,
      messge: "Filter Fetched Successfully",
      data: result,
    });
  });
};

// insert product
const insertProduct = async (req, res) => {
  // const validationError = validation(req, res);
  // if (validationError) {
  //   return validationError;
  // }

  const { name, description ,cate_id } = req.body;
  console.log(name);
  console.log(description);
  console.log(cate_id);

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
        .json({ message: "Only admin can insert products" });
    }

    // Insert  into product table
    const query =
      "INSERT INTO product (pro_name, pro_description,cate_id) VALUES ( ?, ?, ? )";
    db.query(
      query,
      [name, description, cate_id],
      (err, result) => {
        if (err) return res.status(500).send(err);
        res
          .status(200)
          .json({ status: 500, message: "Product Created Successfully" });
      }
    );
  });
};

// update product
const updateProduct = async (req, res) => {
  const validationError = validation(req, res);
  if (validationError) {
    return validationError;
  }
  const { name, description} = req.body;
  const { productId } = req.params;
  console.log(productId);
  
  

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
      "UPDATE product SET pro_name = ? ,pro_description = ? WHERE pro_id = ?";
    db.query(
      query,
      [name, description, productId],
      (err, result) => {
        if (err) {
          return res
            .status(500)
            .json({ status: 500, meassge: "error updating product", err });
        }
        // console.log(result);
        if (result.affectedRows === 0) {
          return res
            .status(404)
            .json({ status: 404, message: "Product not found" });
        }

        res
          .status(200)
          .json({ status: 200, message: "product updated successfully" });
      }
    );
  });
};

// delete product
const deleteProduct = async (req, res) => {
  const { productId } = req.params;
  const { activate } = req.body;
  console.log(productId);
  console.log(activate);

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
        .json({ message: "Only admin can delete products" });
    }

      // Delete product from the product table
      const query = "UPDATE product SET  is_active = ? WHERE pro_id = ?";
      db.query(query, [activate,productId], (err, result) => {
        if (err) {
          return res
            .status(500)
            .json({ status: 500, message: "Error deleting product" });
        }
        res.status(200).json({ message: "Product updated successfully" });
      });
    });
};

module.exports = {
  insertProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  productSort,
  filterProductsVariation,
  showProduct,
  getSingleProduct
};
