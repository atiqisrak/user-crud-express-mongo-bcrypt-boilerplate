module.exports = (req, res, next) => {
  if (req.session) {
    const now = Date.now();
    const maxAge = parseInt(process.env.SESSION_TIMEOUT, 10);

    if (!req.session.lastAccess) {
      req.session.lastAccess = now;
    }

    if (now - req.session.lastAccess > maxAge) {
      req.session.destroy((err) => {
        if (err) {
          return next(err);
        }
        return res
          .status(401)
          .json({ message: "Session expired, please log in again" });
      });
    } else {
      req.session.lastAccess = now;
      next();
    }
  } else {
    next();
  }
};
