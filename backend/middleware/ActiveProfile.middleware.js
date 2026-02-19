export const ActiveProfileMiddleware = () => {
  return (req, res, next) => {
    console.log(
      "ActiveProfileMiddleware req.user.is_active",
      req.user.is_active,
    );
    if (!req.user || !req.user.is_active) {
      return res
        .status(403)
        .json({ message: "Forbidden: Profile is inactive" });
    }
    next();
  };
};
