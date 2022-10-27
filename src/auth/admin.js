import createError from "http-errors"

export const adminOnlyMiddleware = (req, res, next) => {
  // If adminOnlyMiddleware is used AFTER basicAuthMiddleware, here we gonna have the possibility to access to req.user --> we can perform a check on the user's Role

  if (req.user.isAdmin === true) {
    next()
  } else {
    next(createError(403, "Admin only endpoint!"))
  }
}
