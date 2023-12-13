import mongoose from "mongoose"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import itemsModel from "../items/model.js"
import usersModel from "../users/model.js"
import brandsModel from "../brands/model.js"
import categoriesModel from "../categories/model.js"
import mainCategoriesModel from "../mainCategories/model.js"

import { exec } from "child_process"

const currentFilePath = fileURLToPath(import.meta.url)
const parentFolderPath = dirname(dirname(currentFilePath))

const backupPath = `${parentFolderPath}/data`

const mongodump = `mongodump --uri="${process.env.MONGO_CONNECTION}"  --out="${backupPath}"`
const mongorestore = `mongorestore --uri="${process.env.MONGO_CONNECTION}" --drop ${backupPath}/Capstone`

// Función para ejecutar un comando
const executeCommand = (command) => {
  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error(`Error: ${err}`)
      return
    }
    console.log(`STDOUT: ${stdout}`)
    console.error(`STDERR: ${stderr}`)
  })
}

// Ejecutar mongodump
// executeCommand(mongodump)

// Ejecutar mongorestore
// Descomenta la siguiente línea para ejecutar mongorestore
executeCommand(mongorestore)

//////////////////////////////////////////////////////////////

// const stringToDate = (dateString) => {
//   const [day, month, year] = dateString.split("/")
//   return new Date(year, month - 1, day)
// }
// const currentFilePath = fileURLToPath(import.meta.url)
// const parentFolderPath = dirname(dirname(currentFilePath))
// const itemsJSONPath = join(parentFolderPath, "data", "items.json")
// const usersJSONPath = join(parentFolderPath, "data", "users.json")
// const brandsJSONPath = join(parentFolderPath, "data", "brands.json")
// const categoriesJSONPath = join(parentFolderPath, "data", "categories.json")
// const maincategoriesJSONPath = join(parentFolderPath, "data", "maincategories.json")

// let lastAdminChangeTime = null
// let rollbackScheduled = false

export const onAdminChange = () => {
  const currentTime = new Date()
  lastAdminChangeTime = currentTime
  // scheduleRollbackIfNeeded()
}

// const scheduleRollbackIfNeeded = () => {
//   if (!rollbackScheduled) {
//     rollbackScheduled = true
//     setTimeout(async () => {
//       try {
//         await rollbackChanges()
//         rollbackScheduled = false
//       } catch (err) {
//         console.error("Rollback failed:", err)
//         // send me a notification email
//       }
//     }, 0.1 * 60 * 1000) // 30 minutes, 0.1 to test
//   }
// }

// mongoose.connect(process.env.MONGO_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true })

// const rollbackChanges = async () => {
//   try {
//     console.log("Starting database rollback...")
// Clear existing data
// await brandsModel.deleteMany({})
// await categoriesModel.deleteMany({})
// await itemsModel.deleteMany({})
// await mainCategoriesModel.deleteMany({})
// await usersModel.deleteMany({})

// Read default data
// const defaultUsers = JSON.parse(fs.readFileSync(usersJSONPath, "utf8"))
// const defaultBrands = JSON.parse(fs.readFileSync(brandsJSONPath, "utf8"))
// const defaultCategories = JSON.parse(fs.readFileSync(categoriesJSONPath, "utf8"))
// const defaultItems = JSON.parse(fs.readFileSync(itemsJSONPath, "utf8"))
// const defaultMainCategories = JSON.parse(fs.readFileSync(maincategoriesJSONPath, "utf8"))

//Insert default data
// await brandsModel.insertMany(defaultBrands)
// await categoriesModel.insertMany(defaultCategories)
// await itemsModel.insertMany(defaultItems)
// await mainCategoriesModel.insertMany(defaultMainCategories)
// await usersModel.insertMany(defaultUsers)

//   console.log("Database rollback completed successfully")
// } catch (error) {
//   console.error("Database rollback failed:", error)
// send me a notification email
// }
// }
