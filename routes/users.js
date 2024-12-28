const express = require('express');
const userController = require('../controllers/users');


const router = express.Router();

router.post('/sign-up', userController.signup);


module.exports = router;
