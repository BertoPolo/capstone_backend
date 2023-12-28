import { fileURLToPath } from "url"
import { dirname } from "path"
import { exec } from "child_process"
import nodemailer from "nodemailer"

import itemsModel from "../items/model.js"
import usersModel from "../users/model.js"
import brandsModel from "../brands/model.js"
import categoriesModel from "../categories/model.js"
import mainCategoriesModel from "../mainCategories/model.js"

const currentFilePath = fileURLToPath(import.meta.url)
const parentFolderPath = dirname(dirname(currentFilePath))

const backupPath = `${parentFolderPath}/data`

const mongodump = `mongodump --uri="${process.env.MONGO_CONNECTION}"  --out="${backupPath}"`
const mongorestore = `mongorestore --uri="${process.env.MONGO_CONNECTION}" --drop "${backupPath}/Capstone"`

let lastAdminChangeTime = null
let rollbackScheduled = false

export const onAdminChange = () => {
  const currentTime = new Date()
  lastAdminChangeTime = currentTime
  // scheduleRollbackIfNeeded()
}

const scheduleRollbackIfNeeded = () => {
  if (!rollbackScheduled) {
    rollbackScheduled = true
    setTimeout(async () => {
      try {
        await rollback()
        rollbackScheduled = false
      } catch (err) {
        console.error("Schedule rollback failed:", err)
        // add - send me a notification email " somebody touched the DB"
        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          auth: {
            user: process.env.USER,
            pass: process.env.PASS,
          },
        })

        const info = await transporter.sendMail({
          from: `"Stuff To Route" <${process.env.USER}>`,
          to: process.env.MYMAIL,
          subject: "Capstone DB",
          text: "Tu DB ha sido manipulada",
          html: "<b>Tu DB ha sido manipulada</b>",
        })
      }
    }, 45 * 60 * 1000) // 45 minutes
  }
}

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

// Create a recovery point with mongodump
// executeCommand(mongodump)

export const rollback = async () => {
  try {
    console.log("Starting database rollback...")
    // Clear existing data
    await brandsModel.deleteMany({})
    await categoriesModel.deleteMany({})
    await itemsModel.deleteMany({})
    await mainCategoriesModel.deleteMany({})
    await usersModel.deleteMany({})

    // Restore DB with mongorestore
    executeCommand(mongorestore)
    console.log("Database rollback finished")
  } catch (error) {
    console.error("Database rollback failed:", error)
  }
}
