
const jwt = require("jsonwebtoken");

const requireAuth = (req, res, next) => {
  try {
    // Prefer the HttpOnly cookie; retain Bearer support for existing API clients.
    const authHeader = req.headers.authorization;
    let token = req.cookies?.ems_token;

    if (!token && authHeader) {
      const [scheme, value] = authHeader.split(" ");

      if (scheme === "Bearer" && value) {
        token = value;
      } else {
        return res.status(401).json({
          success: false,
          message: "Invalid authorization format",
        });
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    if (
      typeof payload.sub !== "string" ||
      !["admin", "viewer"].includes(payload.role)
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid access token",
      });
    }

    req.user = {
      id: payload.sub,
      role: payload.role,
    };

    next();
  } catch (error) {
    if (
      ["JsonWebTokenError", "TokenExpiredError", "NotBeforeError"].includes(
        error.name,
      )
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired access token",
      });
    }

    next(error);
  }
};

module.exports = requireAuth;
