const jwt = require("jsonwebtoken");
const config = require("../config");

const verifyToken = (req, res, next) => {
  const token = req.headers['auth-token'];
  const usernameFromHeader = req.headers['x-username'];
  const imageFromHeader = req.headers['x-image'];

  if (!token || !usernameFromHeader) { // imageFromHeader might be optional
    return res.status(403).json({ message: "Authentication required: Missing token or username header." });
  }

  // Verify the token
  jwt.verify(token, config.JWT_SECRET_KEY, (err, user) => {
    if (err) {
      console.error("JWT verification error:", err);
      return res.status(403).json({ message: "Invalid or expired token." });
    }

    // Attach the decoded user payload to the request
    req.user = user;

    // Optional: Add headers to req.user for easier access in subsequent middleware/controllers
    req.user.username = usernameFromHeader;
    req.user.image = imageFromHeader;

    next();
  });
};

const verifyTokenAndAuthorization = (req, res, next) => {
  verifyToken(req, res, () => {
    // Ensure req.user exists from verifyToken
    if (!req.user) {
        console.error("verifyToken did not attach req.user");
        return res.status(500).json({ message: "Internal server error: User not authenticated." });
    }

    const isUsernameValid = (req.user.username === req.headers['x-username']);
    // Only check image if it's provided in the token (from Google auth for example) or header
    const isImageValid = (!req.user.image && !req.headers['x-image']) || (req.user.image && (req.user.image === req.headers['x-image']));

    if (isUsernameValid && isImageValid) {
      next();
    } else {
      console.error("Authorization failed:", { decodedUsername: req.user.username, headerUsername: req.headers['x-username'], decodedImage: req.user.image, headerImage: req.headers['x-image'] });
      return res.status(403).json({ message: "Access denied. Authorization failed." });
    }
  });
};

module.exports = {
  verifyTokenAndAuthorization,
  verifyToken,
};
