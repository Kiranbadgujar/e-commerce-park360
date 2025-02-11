const express = require("express");
const { registerUser, loginUser,getDashboard ,updateUser,getUser} = require("../controllers/authController");
const { loginValidator,  registrationValidator} = require("../helpers/validation");
const Middleware = require("../middlewares/authMiddleware")
const router = express.Router();

router.post("/register", registrationValidator, registerUser);
router.post("/login", loginValidator, loginUser);
router.get("/dashboard",getDashboard);
router.get("/get-user",getUser);
router.post("/update-user/:userId",Middleware,updateUser);

module.exports = router;
