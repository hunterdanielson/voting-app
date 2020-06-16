const User = require('../models/User');

module.exports = (req, res, next) => {
  // read cookie
  const token = req.cookies.session;
  // verify cookie
  const user = User.verifyToken(token);
  // set req.user to owner of cookie
  req.user = user;
  next();
};
