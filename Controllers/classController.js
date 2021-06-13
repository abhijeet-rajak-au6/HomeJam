const ClassModel = require("../Models/Class");
const UserModel = require("../Models/User");
const { Schema } = require("mongoose");
const mongoose = require("mongoose");
const AppError = require("../util/appErrorHandler");
const Response = require("../util/responseHandler");
const moment = require("moment");


module.exports = {

    async createClass(req, res, next) {
        // console.log(req.body);
        const session = await mongoose.startSession();
        session.startTransaction();
        try {

            const teacherDetails = await UserModel.findOne({ _id: req.user.id }, { name: 1, email: 1 });
            const { title, classDate, endTime, startTime, studentLimit } = req.body;
            console.log(moment(new Date(endTime)).format("DD-MM-YYYY hh mm ss"));
            let payload = [{
                title,
                classDate: new Date(classDate),
                endTime: new Date(endTime),
                startTime: new Date(startTime),
                studentLimit,
                teacher: {
                    name: teacherDetails.name,
                    emailId: teacherDetails.email
                }

            }]
            // console.log("pyload", payload);
            const createdClass = await ClassModel.CreateClass(payload, session);
            // console.log(req.user.id)
            // console.log(createdClass);

            const assignedClass = await UserModel.AsssignClass(req.user.id, createdClass[0]._id, session);

            // console.log(assignedClass);
            session.commitTransaction();
            req.locals = new Response("class created sucessfully", 201,{class:createdClass});

            // generate response
            next();
        } catch (err) {
            console.log(err);
            await session.abortTransaction();
            next(new AppError(err.message, err.statusCode || 500));
        }
    },

    async listAllClass(req, res, next) {
        // console.log(req.user);
        try {
            const classesCreated = await UserModel.aggregate([
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
                        as: "CreatedClasses"
                    }
                },
                {
                    $project: { "CreatedClasses": 1, "classes[0].classes": 1 }
                }
            ]);
            // console.log("classesCreated", classesCreated);
            req.locals = new Response("All Classes", 200, { classes: classesCreated[0].CreatedClasses });
            next();

        } catch (err) {
            console.log(err);
            next(new AppError(err.message, err.statusCode || 500));
        }
    },

    async listAllStudentInClass(req, res, next) {
        try {
            const students = await ClassModel.aggregate([
                {
                    $match: {
                        _id: mongoose.Types.ObjectId(req.params.classId)
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "AllStudent"
                    }
                },
                {
                    $project: { "AllStudent.name": 1, "AllStudent.email": 1, "AllStudent._id":1 }
                }
            ]);
            // console.log("classesCreated", classesCreated);
            req.locals = new Response("All Student", 200, { students: students[0].AllStudent });
            next();
        } catch (err) {
            console.log(err);
            next(new AppError(err.message, err.statusCode || 500));
        }
    },

    async updateClass(req, res, next) {
        try {
            const { classId } = req.params;
            const { title, classDate, endTime, startTime, studentLimit } = req.body;
            if (!mongoose.Types.ObjectId.isValid(classId))
                throw new AppError("Invalid Class Id", 400);


            const allow = await UserModel.findOne({_id:req.user.id, classId:{$in:[classId]}});

            if(!allow)
                throw new AppError("Access denied", 403);

            // static in nature but can be made dynamic
            let keys = ["title", "classDate", "endTime", "startTime", "studentLimit"];
            let payload = {};

            keys.forEach(key => (key == keys[1] || key == keys[2] || key == keys[3]) ? payload[key] = new Date(req.body[key]) : req.body[key] ? payload[key] = req.body[key] : console.log(key));

            console.log("payload", payload);

            const updatedClass = await ClassModel.updateOne({ _id: classId }, { ...payload}, { new: true });

            console.log(updatedClass);
            if (updatedClass.n && updatedClass.nModified)
                req.locals = new Response("Sucessfully Updated", 200);
            else if (updatedClass.n)
                req.locals = new Response("Already Updated", 200);
            else
                req.locals = new Response("Class not Found", 404);

            next()
        } catch (err) {
            console.log(err);
            next(new AppError(err.message, err.statusCode || 500));
        }
    },
    async deleteClass(req, res, next) {
        try {
            const { classId } = req.params;
            if (!mongoose.Types.ObjectId.isValid(classId))
                throw new AppError("Invalid class id", 400);
            
            console.log(classId);
            const allow = await UserModel.findOne({_id:req.user.id, classId:{$in:[classId]}});

            // console.log(allow);
            if(!allow)
                throw new AppError("Access denied", 403);

            const deletedClassResponse = await ClassModel.findOneAndRemove({ _id: classId });

            console.log(deletedClassResponse);

            req.locals = new Response("Class deleted sucessfully", 200);
            next();
        } catch (err) {
            console.log(err);
            next(new AppError(err.message, err.statusCode || 500));
        }
    },

    async listAllClasses(req,res, next){
        try{
            const allClasses = await ClassModel.find();
            req.locals = new Response("All Classes", 200, {AllClasses:allClasses});
            next();
        }catch(err){
            console.log(err);
            next(new AppError(err.message, err.statusCode || 500));
        }
    }
}