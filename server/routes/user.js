const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')
const cors = require('cors');
/*router.use(cors({
    origin: 'http://localhost:3000',
}))*/


router.post('/term', userController.searchForTermAndDate)

module.exports = router;