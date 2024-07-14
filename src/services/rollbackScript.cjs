// import { dirname } from "path"
// import { exec } from "child_process"
// import nodemailer from "nodemailer"

// import itemsModel from "../items/model.js"
// import usersModel from "../users/model.js"
// import brandsModel from "../brands/model.js"
// import categoriesModel from "../categories/model.js"
// import mainCategoriesModel from "../mainCategories/model.js"
const { dirname } = require("path")
const { exec } = require("child_process")
const nodemailer = require("nodemailer")

const currentFilePath = __filename
const parentFolderPath = dirname(dirname(currentFilePath))

const backupPath = `${parentFolderPath}/data`

const mongodump = `mongodump --uri="${process.env.MONGO_CONNECTION}"  --out="${backupPath}"`
const mongorestore = `mongorestore --uri="${process.env.MONGO_CONNECTION}" --drop "${backupPath}/Capstone"`

let lastAdminChangeTime = null
let rollbackScheduled = false

const onAdminChange = () => {
  const currentTime = new Date()
  lastAdminChangeTime = currentTime
  scheduleRollbackIfNeeded()
}

const scheduleRollbackIfNeeded = () => {
  if (!rollbackScheduled) {
    rollbackScheduled = true
    setTimeout(async () => {
      try {
        await rollback()
        rollbackScheduled = false
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
      } catch (err) {
        console.error("Schedule rollback failed:", err)
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
          text: "Error al restaurar la DB",
          html: "<b>Error al restaurar la DB</b>",
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
// executeCommand(mongodump);

const rollback = async () => {
  try {
    console.log("Starting database rollback...")

    const itemsModel = await import("../items/model.js")
    const usersModel = await import("../users/model.js")
    const brandsModel = await import("../brands/model.js")
    const categoriesModel = await import("../categories/model.js")
    const mainCategoriesModel = await import("../mainCategories/model.js")

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

module.exports = { onAdminChange, rollback }
