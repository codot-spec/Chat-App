const express = require('express');
const userController = require('../controllers/users');
const Authentication = require("../middleware/auth");

const router = express.Router();

router.post('/sign-up', userController.signup);
router.post('/sign-in',userController.login)
router.get('/getAllUsers',Authentication.authenticate,userController.getAllUsers)
 router.get('/:userId',Authentication.authenticate,userController.fetchUserProfile)
 router.put('/:userId',Authentication.authenticate,userController.editUser)
 router.delete('/:userId',Authentication.authenticate,userController.deleteUser)

module.exports = router;
