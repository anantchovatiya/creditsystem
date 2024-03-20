const express = require('express')
const router = express.Router()
const path = require('path')

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "../nri.html"))
})

router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, "../loginnri.html"))
})

module.exports = router