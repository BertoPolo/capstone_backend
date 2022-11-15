import jwt from "jsonwebtoken"

export const generateAccessToken = (payload) =>
  new Promise((resolve, reject) =>
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1 day" }, (err, token) => {
      if (err) reject(err)
      else resolve(token)
    })
  )

export const verifyAccessToken = (token) =>
  new Promise((resolve, reject) =>
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) reject(err)
      else resolve(decoded)
    })
  )
