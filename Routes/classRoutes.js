const { Router } = require("express");
const { checkValidation } = require("../middleware/validate");
const { Send } = require("../middleware/Send");
const { executeValidation } = require("../middleware/executeValidation");
const { authenticate } = require("../middleware/authentication");
const { authorized } = require("../middleware/authorization");

const router = Router();
const { createClass } = require("../Controllers/classController");

// router.get("/", async(req, res)=>{
//     const Class = require("../Models/Class");
//     const moment = require("moment");
//     let classes = await Class.find({});
//     console.log(new Date(classes[0].startTime));
//     console.log(moment(new Date(classes[0].startTime)).format("DD MM YYYY hh mm ss"));
// })

router.post("/api/v1/class/create", [
    authenticate,
    authorized("instructor"),
    checkValidation("CREATE_CLASS"),
    executeValidation,
    createClass,
    Send,
]);

// enroll student
// router.put("/api/v1/class/student/:userId", [
//     authenticate,
//     authorized("instructor"),
//     checkValidation("CREATE_CLASS"),
//     executeValidation,
//     createClass,
//     Send
// ]);

module.exports = router;
