const express = require("express")
const router = express.Router()
const path = require("path")

router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../user.html"))
})

router.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "../loginuser.html"))
})

module.exports = router;