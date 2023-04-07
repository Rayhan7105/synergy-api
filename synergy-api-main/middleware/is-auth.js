const jwt = require("jsonwebtoken");
module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");
  // console.log("Authorization: " + authHeader);
  if (!authHeader) {
    // console.log("AuthHeader: Reached");
    req.isAuth = false;
    return next();
  }
  const token = authHeader.split(" ")[1]; // Extract token header
  if (!token || token === "") {
    // console.log("SplitToken: Reached");
    req.isAuth = false;
    return next();
  }
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, "absolutelysupersecretkey");
    // console.log(decodedToken);
  } catch (err) {
    req.isAuth = false;
    return next();
  }
  if (!decodedToken) {
    req.isAuth = false;
    return next();
  }
  req.isAuth = true;
  req.userId = decodedToken.userId;
  next();
};
