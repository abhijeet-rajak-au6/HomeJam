const { Router } = require("express");
const { checkValidation } = require("../middleware/validate");
const { Send } = require("../middleware/Send");
const { executeValidation } = require("../middleware/executeValidation");
const { authenticate } = require("../middleware/authentication");
const { authorized } = require("../middleware/authorization");

const router = Router();
const { applyForTheClass } = require("../Controllers/studentController");


// enroll student
router.put("/api/v1/student/apply/:classId", [
    authenticate,
    authorized("student"),
    applyForTheClass,
    Send
]);

module.exports = router;
