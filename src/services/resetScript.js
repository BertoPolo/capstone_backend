import mongoose from "mongoose"
import cron from "node-cron"
import itemsModel from "../items/model.js"
import usersModel from "../users/model.js"
import brandsModel from "../brands/model.js"
import categoriesModel from "../categories/model.js"
import mainCategoriesModel from "../mainCategories/model.js"

let lastAdminChangeTime = null
let resetScheduled = false
let cutoffDate = stringToDate("08/12/2023")

export const onAdminChange = () => {
  const currentTime = new Date()
  lastAdminChangeTime = currentTime
  scheduleResetIfNeeded()
}

const scheduleResetIfNeeded = () => {
  if (!resetScheduled) {
    resetScheduled = true
    setTimeout(async () => {
      await resetDatabase()
      resetScheduled = false
    }, 30 * 60 * 1000) // 30 minutes
  }
}

mongoose.connect("your-mongodb-connection-string", { useNewUrlParser: true, useUnifiedTopology: true })

// Function to convert date string to Date object
const stringToDate = (dateString) => {
  const [day, month, year] = dateString.split("/")
  return new Date(year, month - 1, day)
}

const resetDatabase = async () => {
  await itemsModel.deleteMany({ createdAt: { $gt: cutoffDate } })
  await brandsModel.deleteMany({ createdAt: { $gt: cutoffDate } })
  await categoriesModel.deleteMany({ createdAt: { $gt: cutoffDate } })
  await mainCategoriesModel.deleteMany({ createdAt: { $gt: cutoffDate } })

  console.log("Database reset triggered successfully")
}

resetDatabase()
  .then(() => {
    console.log("Database reset for records after 08/12/2023 completed successfully")
    mongoose.connection.close()
  })
  .catch((err) => {
    console.error("Database reset failed:", err)
  })
