import mongoose from "mongoose"
import itemsModel from "../items/model.js"
import usersModel from "../users/model.js"
import brandsModel from "../brands/model.js"
import categoriesModel from "../categories/model.js"
import mainCategoriesModel from "../mainCategories/model.js"

const stringToDate = (dateString) => {
  const [day, month, year] = dateString.split("/")
  return new Date(year, month - 1, day)
}

let cutoffDate = stringToDate("08/12/2023")
let lastAdminChangeTime = null
let resetScheduled = false

export const onAdminChange = () => {
  const currentTime = new Date()
  lastAdminChangeTime = currentTime
  scheduleResetIfNeeded()
}

const scheduleResetIfNeeded = () => {
  if (!resetScheduled) {
    resetScheduled = true
    setTimeout(async () => {
      try {
        await resetDatabase()
        resetScheduled = false
      } catch (err) {
        console.error("Database reset failed:", err)
        // send me a notification email
      }
    }, 30 * 60 * 1000) // 30 minutes
  }
}

mongoose.connect(process.env.MONGO_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true })

const resetDatabase = async () => {
  try {
    await itemsModel.deleteMany({ createdAt: { $gt: cutoffDate } })
    await brandsModel.deleteMany({ createdAt: { $gt: cutoffDate } })
    await categoriesModel.deleteMany({ createdAt: { $gt: cutoffDate } })
    await mainCategoriesModel.deleteMany({ createdAt: { $gt: cutoffDate } })
    await usersModel.deleteMany({ createdAt: { $gt: cutoffDate } })

    console.log("Database reset for records after 08/12/2023 completed successfully")
  } catch (error) {
    console.error("Database reset failed:", err)
    // send me a notification email
  }
}
