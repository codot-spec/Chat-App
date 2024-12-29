const express = require('express');
const userController = require('../controllers/users');


const router = express.Router();

router.post('/sign-up', userController.signup);
router.post('/sign-in',userController.login)


module.exports = router;
