const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authorizationHeader = req.headers['authorization'];

  if (!authorizationHeader) {
    return res.status(403).json({ message: "Please provide token." });
  }

  // The token is in the form of "Bearer <token>", so we split it to get the actual token.
  const token = authorizationHeader.split(' ')[1];  // [1] will get the actual token part

  if (!token) {
    return res.status(403).json({ message: "Invalid token format." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token." });
    }
    req.user = user;
    next();
  });
};

module.exports = authenticate;












// Great question! Let me break down the difference between passing a token in the **header** and using **authorization** for passing the token, as these terms are closely related, but there's a subtle distinction.

// ### 1. **Authorization Header**
// The **Authorization header** is a standard HTTP header used to pass credentials (like a token) when making requests to a server. In most cases, this is where tokens like **JWT** (JSON Web Token) are passed for **authentication**.

// When you send a request to an API or web server and you need to pass an authentication token (like a JWT), it's common to include it in the **Authorization header**.

// Here’s an example:

// ```http
// Authorization: Bearer <token>
// ```

// In this case, the string **Bearer** is the type of token you're passing, and `<token>` is the actual token.

// #### Why use the **Authorization** header?
// - The Authorization header provides a secure, standardized way to send authentication credentials.
// - It’s part of the HTTP protocol and is designed for authentication.
// - It’s often used with **Bearer tokens** (like JWTs).

// ### 2. **Passing Token in Header (General Header)**
// When people talk about "passing a token in the header," it usually means you're passing the token as part of the **HTTP request headers**. The **Authorization** header is a specific type of header used for this purpose. So, technically, "passing a token in the header" refers to putting the token anywhere within the headers, but the most common and secure place to put it is the **Authorization header**.

// Other headers are also used for various purposes, but **Authorization** is the one specifically designated for passing authentication information.

// ### Example of the Authorization header:
// ```javascript
// const headers = {
//   'Authorization': 'Bearer <token>'
// };
// ```

// When using this header, the server will typically read the `Authorization` header and extract the token to verify the user's identity.

// ### 3. **Authorization vs. Other Headers**
// You might also encounter other ways of passing tokens or data in headers (like `X-Auth-Token`, or custom headers), but **Authorization** is the recommended and standardized one when using token-based authentication systems like JWT.

// ### In summary:
// - **Authorization header** is a specific HTTP header used for passing authentication tokens (like JWTs) and is a standardized way of handling security credentials.
// - **Passing tokens in headers** usually refers to putting tokens in any HTTP header (but the `Authorization` header is most commonly used for this purpose).
  
// Let me know if this helps clear things up!
