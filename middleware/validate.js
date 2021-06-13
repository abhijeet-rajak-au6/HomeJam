const { check, validationResult, query } = require("express-validator");
// const { stackTraceLimit } = require("../util/appErrorHandler");

module.exports = {
  checkValidation(method) {
    switch (method) {
      case "USER_REGISTRATION":
        return [
          check("name")
            .trim()
            .not()
            .isEmpty()
            .withMessage("please provide name")
            .isLength({ min: 3, max: 20 })
            .withMessage("Length of name should be between 3 to 20"),
          check("email")
            .trim()
            .not()
            .isEmpty()
            .withMessage("please provide email")
            .isEmail()
            .withMessage("please provide correct email"),
          check("password")
            .not()
            .isEmpty()
            .withMessage("please provide password")
            .isLength({ min: 8, max: 20 })
            .withMessage("Length of password should be between 8 to 20"),

          check("roles")
            .trim()
            .toLowerCase()
            .isIn(["instructor", "student", "teacher"])
            .withMessage("role should be either : instructor || student || teacher"),
        ];
      case "USER_LOGIN":
        return [
          check("email")
            .trim()
            .not()
            .isEmpty()
            .withMessage("please provide email")
            .isEmail()
            .withMessage("please provide correct email"),
          check("password")
            .not()
            .isEmpty()
            .withMessage("please provide password")
            .isLength({ min: 8, max: 20 })
            .withMessage("Length of password should be between 8 to 20"),
        ];

        case "CREATE_CLASS":
          return [
            check("title")
              .trim()
              .not()
              .isEmpty()
              .withMessage("please class title"),
          ];
      default:
        return "Invalid Method";
    }
  },
};