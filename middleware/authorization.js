const UserModel = require("../Models/User");
const { validationResult } = require("express-validator");
const AppError = require("../util/appErrorHandler");

module.exports = {
  authorized: (...roles) => async (req, res, next) => {
    console.log("in authorised")
    try {
      const condition = { _id: req.user.id, roles: { $in: roles } };
      // console.log(condition)
      const getAuthorizedUser = await UserModel.CheckPermission(condition);
      // console.log(getAuthorizedUser);
      if (!getAuthorizedUser)
        throw new AppError("You are not authorized for this action !", 403);
      return next();
    } catch (err) {
      next(new AppError(err.message, err.statusCode));
    }
  },
};