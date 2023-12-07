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
let rollbackScheduled = false

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
//     }, 30 * 60 * 1000) // 30 minutes
//   }
// }

// mongoose.connect(process.env.MONGO_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true })

// const rollbackChanges = async () => {
//   try {
//     await itemsModel.deleteMany({ createdAt: { $gt: cutoffDate } })
//     const changesOnItems = await itemsChangeHistoryModel.find({}).sort({ changedAt: -1 })
//     for (const change of changesOnItems) {
//       await itemsModel.findByIdAndUpdate(change.itemId, { $set: change.previousState })
//     }

//     await brandsModel.deleteMany({ createdAt: { $gt: cutoffDate } })
//     const changesOnBrands = await itemsChangeHistoryModel.find({}).sort({ changedAt: -1 })
//     for (const change of changesOnBrands) {
//       await itemsModel.findByIdAndUpdate(change.itemId, { $set: change.previousState })
//     }

//     await categoriesModel.deleteMany({ createdAt: { $gt: cutoffDate } })
//     const changesOnCategories = await itemsChangeHistoryModel.find({}).sort({ changedAt: -1 })
//     for (const change of changesOnCategories) {
//       await itemsModel.findByIdAndUpdate(change.itemId, { $set: change.previousState })
//     }

//     await mainCategoriesModel.deleteMany({ createdAt: { $gt: cutoffDate } })
//     const changesOnMainCategories = await itemsChangeHistoryModel.find({}).sort({ changedAt: -1 })
//     for (const change of changesOnMainCategories) {
//       await itemsModel.findByIdAndUpdate(change.itemId, { $set: change.previousState })
//     }

//     await usersModel.deleteMany({ createdAt: { $gt: cutoffDate } })
//     const changesOnUsers = await itemsChangeHistoryModel.find({}).sort({ changedAt: -1 })
//     for (const change of changesOnUsers) {
//       await itemsModel.findByIdAndUpdate(change.itemId, { $set: change.previousState })
//     }

//     console.log("Database reset for records after 08/12/2023 completed successfully")
//   } catch (error) {
//     console.error("Database reset failed:", err)
//     // send me a notification email
//   }
// }
