const express = require("express");
const router = express.Router();
const groupController = require("../controllers/groupController");
const Authentication = require("../middleware/auth");

router.post("/createGroup", Authentication.authenticate, groupController.createGroup);

router.post("/addToGroup", Authentication.authenticate, groupController.addToGroup);

router.get("/getGroups", Authentication.authenticate, groupController.getGroups);

router.post(
  "/deleteFromGroup",
  Authentication.authenticate,
  groupController.deleteFromGroup
);

router.get(
  "/groupMembers/:groupName",
  Authentication.authenticate,
  groupController.groupMembers
);
router.get('/groupDetails/:groupName',Authentication.authenticate, groupController.groupDetails);
router.post("/deleteGroup", Authentication.authenticate, groupController.deleteGroup);

module.exports = router;
