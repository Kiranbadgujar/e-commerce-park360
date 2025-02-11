const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const db = require("../config/db");

const validation = (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(400).json({ errors: error.array() });
  }
};

// register
const registerUser = async (req, res) => {
  const validationError = validation(req, res);
  if (validationError) {
    return validationError;
  }

  const {first_name,last_name,email,password,confirm_password,contact_number,address} = req.body;

  if (password !== confirm_password) {
    return res.status(400).json({
      status: "error",
      message: "Password and confirm password must be the same",
      code: 400,
    });
  }

  try {
    // Check if the email already exists
    const emailCheckQuery = "SELECT * FROM users WHERE email = ?";
    const [existingUser] = await db.promise().query(emailCheckQuery, [email]);

    if (existingUser.length > 0) {
      return res
        .status(400)
        .json({ status: 400, message: "Email already exists" });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {first_name,last_name,email,password: hashedPassword,contact_number,address};

    // Insert new user into the database
    const insertQuery = `
      INSERT INTO users (first_name, last_name, email, password, contact_number, address )
      VALUES (?, ?, ?, ?, ?, ? )
    `;
    const result = await db.promise().query(insertQuery, [
        userData.first_name,
        userData.last_name,
        userData.email,
        userData.password,
        userData.contact_number,
        userData.address,
      ]);

    return res.status(201).json({ status: 201, message: "User registered successfully" });
  } catch (err) {
    return res.status(500).json({ status: 500, message: "Error registering user",err });
  }
};

// login
const loginUser = async (req, res) => {
  const validationError = validation(req, res);
  if (validationError) {
    return validationError;
  }

  try {
    const { email, password } = req.body;

    const emailCheckQuery = "SELECT * FROM users WHERE email = ?";
    const [result] = await db.promise().query(emailCheckQuery, [email]);

    if (result.length === 0) {
      return res.status(400).json({ status: 400, message: "Invalid email" });
    }

    const user = result[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ status: 400, message: "Invalid password" });
    }

    const payload = {
      user_id: user.user_id,
      email: user.email,
      first_name: user.first_name,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "5h",
    });

    return res.status(200).json({
      message: "Login successful",
      token,
      first_name: user.first_name,
      result,
    });
  } catch (err) {
    return res.status(500).json({ status: 500, message: "Error logging in", err });
  }
};

// Dashboard
const getDashboard = async (req, res) => {
  try {
    // Count the number of users
    const query = "SELECT COUNT(*) AS total_users FROM users WHERE is_active = '1'";
    const [userCount] = await db.promise().query(query);

    // Query to count the number of products
    const query1 = "SELECT COUNT(*) AS total_products FROM product";
    const [productCount] = await db.promise().query(query1);

    // Query to count the number of categories
    const query2 = "SELECT COUNT(*) AS total_categories FROM categories";
    const [categoryCount] = await db.promise().query(query2);

    // Query to count the number of variations
    const query3 = "SELECT COUNT(*) AS total_variation_product FROM variations";
    const [variationsCount] = await db.promise().query(query3);

    const data = {
      users: userCount[0].total_users,
      products: productCount[0].total_products,
      categories: categoryCount[0].total_categories,
      variations: variationsCount[0].total_variation_product,
    };

    // Send the response
    return res.status(200).json({status:200,message: "Dashboard fetched successfully",data: data});
  } catch (err) {
    return res.status(500).json({ message: "Error fetching dashboard data",err });
  }
};

//update user
const updateUser = async (req, res) => {
  const validationError = validation(req, res);
  if (validationError) {
    return res.status(400).json({ status: 400, message: validationError });
  }

  const { first_name, last_name, email, number, address, activate } = req.body;
  const { userId } = req.params;

  // Extract the user_id from the JWT token
  const adminId = req.user.user_id;
  // console.log(adminId);

  try {
    // Check user role for permissions (using await)
    const [roleResult] = await db.promise().query("SELECT role FROM users WHERE user_id = ?", [adminId]);

    if (roleResult.length === 0) {
      return res.status(404).json({ status: 404, message: "Admin not found" });
    }

    const userRole = roleResult[0].role;
    if (userRole !== "admin") {
      return res
        .status(403)
        .json({ status: 403, message: "Only admin can update users" });
    }

    //update query
    const updateQuery = `
      UPDATE users 
      SET first_name = ?, last_name = ?, email = ?, contact_number = ?, address = ?, is_active = ?
      WHERE user_id = ?
    `;

    // Update user data
    await db.promise().query(updateQuery, [first_name,last_name,email,number,address,activate,userId]);

    return res
      .status(200)
      .json({ status: 200, message: "User updated successfully" });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: 500, message: "Error updating user" });
  }
};

//get user
const getUser = (async = (req, res) => {
  const query = "SELECT * FROM users where is_active = '1'";
  db.query(query, (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(200).json({
      status: 200,
      message: "users listed successfully",
      data: result,
    });
  });
});

module.exports = { loginUser, registerUser, getDashboard, updateUser ,getUser };
