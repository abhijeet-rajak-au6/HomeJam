
const UserModel = require("../Models/User");
const ClassModel = require("../Models/Class");
const { Schema } = require("mongoose");
const mongoose = require("mongoose");
const AppError = require("../util/appErrorHandler");
const Response = require("../util/responseHandler");

module.exports = {

    async register(req, res, next) {
        try {
            //payload
            const { password, email, name, roles } = req.body;

            let payload = {password, email, name, roles};
            // console.log(payload);
            // create user
            const newUser = await UserModel.CreateUser(payload);

            // console.log("new user token",newUser.token);
            const user = await newUser.save();

            if (!user) {
                throw new AppError("user not registered please try again !", 400);
            }
            req.locals = new Response("user registered sucessfully", 201);

            // generate response
            next();
        } catch (err) {
            next(new AppError(err.message, err.statusCode || 500));
        }
    },

    async login(req, res, next) {
        try {
          //payload
          const { password, email } = req.body;
    
          // find email and password
          const user = await UserModel.findByEmailAndPassword(email, password);
          // generate token
          user.generateToken();
    
          // save the token
          await user.save({ validateBeforeSave: false });
    
          // response
          req.locals = new Response(`Welcome ${user.name}`, 200, {
            id:user._id,
            token: user.token,
            name:user.name,
            email:user.email,
          });
          next();
        } catch (err) {
          next(new AppError(err.message, err.statusCode));
        }
      },

      async grantAccessToClass(req,res,next){
        try{
          const {userId, classId} = req.params;

          if (!mongoose.Types.ObjectId.isValid(classId))
            throw new AppError("Invalid Class Id", 400);

          if (!mongoose.Types.ObjectId.isValid(userId))
            throw new AppError("Invalid User Id", 400);

          // check whether desired instructor is granting access
          const allow = await UserModel.findOne({_id:req.user.id, classId:{$in:[classId]}});

            if(!allow)
                throw new AppError("Access denied for this class", 403);

          // check user applied or not

          const user = await UserModel.CheckApplication(classId, userId);
         
          console.log("applied application", user);
          if(!user)throw new AppError("Cannot grant access apply first", 403);

          const classes = await ClassModel.CheckSeatAvailable(classId);
          console.log("classses", classes);

          if(classes[0].totalStudentEnrolled >= classes[0].studentLimit)
            throw new AppError("Seat full", 400);

          await UserModel.GrantUserAccessForClass(userId, classId);

          await ClassModel.EnrolledStudentToClass(classId, userId);
          
          req.locals = new Response(`user ${user.name } granted acces to the class`, 200);
          next();

        }catch(err){
          console.log(err);
          next(new AppError(err.message, err.statusCode));
        }
      }

}