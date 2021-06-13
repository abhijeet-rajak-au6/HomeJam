const { Router } = require("express");
const { checkValidation } = require("../middleware/validate");
const { Send } = require("../middleware/Send");
const { executeValidation } = require("../middleware/executeValidation");
const { authenticate } = require("../middleware/authentication");
const { authorized } = require("../middleware/authorization");

const router = Router();
const { grantAccessToClass } = require("../Controllers/userController");


router.get("/api/v1/instructor", (req,res)=>{
    console.log("userRoutes");
})

// enroll student
router.put("/api/v1/instructor/:userId", [
    authenticate,
    authorized("instructor"),
    grantAccessToClass,
    Send
]);

module.exports = router;
