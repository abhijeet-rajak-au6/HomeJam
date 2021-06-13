const ClassModel = require("../Models/Class");
const UserModel = require("../Models/User");
const { Schema } = require("mongoose");
const mongoose = require("mongoose");
const AppError = require("../util/appErrorHandler");
const Response = require("../util/responseHandler");
const moment = require("moment");


module.exports = {
    async applyForTheClass(req, res, next) {
        try {
            const { classId } = req.params;
            if (!mongoose.Types.ObjectId.isValid(classId))
                throw new AppError("Invalid Class Id", 400);
            // check already applied
            const alreadyApplied = await UserModel.CheckAlreayApplied(classId, req.user.id);
            // console.log("already applied", alreadyApplied);
            if (alreadyApplied) {
                throw new AppError("already applied || enrolled in the course", 403);
            }
            const studentAppliedForClass = await UserModel.AppliedForClass(req.user.id, classId);
            // console.log(studentAppliedForClass);
            req.locals = new Response("Sucessfully applied for the class", 200);
            next();
        } catch (err) {
            console.log(err);
            next(new AppError(err.message, err.statusCode || 500));
        }
    },
    async removeStudentFromClass(req, res, next) {
        try {
            const { classId, userId } = req.params;
            if (!mongoose.Types.ObjectId.isValid(classId))
                throw new AppError("Invalid Class Id", 400);
            
            if (!mongoose.Types.ObjectId.isValid(userId))
                throw new AppError("Invalid User Id", 400);

            // check whether created instructor removing the student
            const allow = await UserModel.findOne({_id:req.user.id, classId:{$in:[classId]}});

            if(!allow)
                throw new AppError("Access denied", 403);

            // remove from the class
            await ClassModel.RemoveFromTheClass(userId, classId);
            req.locals = new Response("user is sucessfully removed", 200);
            next();
            //await UserModel.RemoveFromTheAppliedCourse(userId, classId);
        } catch (err) {
            console.log(err);
            next(new AppError(err.message, err.statusCode || 500));
        }
    },
    async getListOfClasses(req, res, next) {
        try {

            const userClasses = await UserModel.aggregate([
                {
                    $match: {
                        _id: mongoose.Types.ObjectId(req.user.id)
                    }
                },
                {
                    $lookup: {
                        from: "classes",
                        localField: "classId",
                        foreignField: "_id",
                        as: "StudentEnrolledClasses"
                    }
                },
                {
                    $project: { "StudentEnrolledClasses": 1 }
                },
                {
                    $project: { "StudentEnrolledClasses.userId": 0 }
                }
            ]);

            req.locals = new Response("All Classes", 200, { classesEnrolles: userClasses[0].StudentEnrolledClasses });
            next();

        } catch (err) {
            console.log(err);
            next(new AppError(err.message, err.statusCode || 500));
        }
    },
    async getAllAppliedStudent(req, res, next) {
        try {

            const { classId } = req.params;
            if (!mongoose.Types.ObjectId.isValid(classId))
                throw new AppError("Invalid Class Id", 400);
            const appliedStudent = await UserModel.find(
                {
                    appliedClassId: {
                        $in: [classId]
                    }

                }, {name:1, email:1, roles:1});

            req.locals = new Response("All Applied Students", 200, { appliedStudent });
            next();

        } catch (err) {
            console.log(err);
            next(new AppError(err.message, err.statusCode || 500));
        }
    }
}