import jwt from "jsonwebtoken"

const token = jwt.sign({ _id: "ioj123okj132oj321o", role: "User" }, "mysup3rs3cr3tpw", { expiresIn: "1 week" })

console.log(token)

const payload = jwt.verify(token, "mysup3rs3cr3t")

console.log(payload)

const generateAccessToken = (payload) =>
  new Promise((resolve, reject) =>
    jwt.sign(payload, "mysup3rs3cr3tpw", { expiresIn: "1 week" }, (err, token) => {
      if (err) reject(err)
      else resolve(token)
    })
  )

try {
  const newToken = await generateAccessToken({ _id: "ioj123okj132oj321o", role: "User" })
  console.log(newToken)
} catch (error) {
  console.log(error)
}

/* USAGE 
generateAccessToken({})
  .then(token => {})
  .catch(err => {})
  jwt.sign(payload, "mysup3rs3cr3tpw", { expiresIn: "1 week" }, (err, token) => {
    if (err) reject(err)
    else resolve(token)
  })
*/

const verifyAccessToken = (token) =>
  new Promise((resolve, reject) =>
    jwt.verify(token, "mysup3rs3cr3t", (err, decoded) => {
      if (err) reject(err)
      else resolve(decoded)
    })
  )

// USAGE
// try {
//   const payload = await verifyAccessToken(token)
// } catch (error) {

// }
