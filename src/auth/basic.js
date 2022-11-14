import createError from "http-errors"
import atob from "atob"
import UsersModel from "../users/model.js"

export const basicAuthMiddleware = async (req, res, next) => {
  if (!req.headers.authorization) {
    next(createError(401, "Please provide credentials in Authorization header!"))
  } else {
    const base64Credentials = req.headers.authorization.split(" ")[1]
    const [name, password] = atob(base64Credentials).split(":")
    // console.log(`name: ${name}, PASSWORD: ${password}`)

    const user = await UsersModel.checkCredentials(name, password)

    if (user) {
      req.user = user
      next()
    } else {
      next(createError(401, "Credentials are wrong!"))
    }
  }
}
