const { Schema, model } = require("mongoose");
const { sign, verify } = require("jsonwebtoken");
const { compare, hash } = require("bcryptjs");
const AppError = require("../util/appErrorHandler");
const UserModel = require("../Models/User");
// const { getOne } = require("../Controller/handleFactory");

const classSchema = Schema({
  title: {
    type: String,
    required: [true, "Please provide class title"],
  },
  classDate: {
    type: String,
  },
  startTime: {
    type: String,
  },
  endTime: {
    type: String
  },
  studentLimit: {
    type: Number
  },
  totalStudentEnrolled: {
    type: Number,
    default: 0
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "user"
  },
  teacher: {
    name: {
      type: String
    },
    emailId: {
      type: String
    }
  }
});

classSchema.statics.CreateClass = async (payload, session) => classModel.create(payload, { session });
classSchema.statics.CheckSeatAvailable = async (classId) => await classModel.find({ _id: classId }, { totalStudentEnrolled: 1, studentLimit: 1 });

classSchema.statics.EnrolledStudentToClass = async (classId, userId) => {
  await classModel.findOneAndUpdate({ _id: classId }, { $inc: { totalStudentEnrolled: 1 }, $push: { userId: userId } });
};

classSchema.statics.RemoveFromTheClass = async (userId, classId) => {
  const removed = await classModel.findOneAndUpdate({ _id: classId }, { $pull: { userId: { $in: [userId] } }, $inc: { totalStudentEnrolled: -1 } }, { new: true });
  console.log(removed);
  return removed;
}

classSchema.post('findOneAndRemove', async function (doc, next) {
  const removedInUser = await UserModel.updateMany({}, { $pull: { classId: { $in: [doc._id] }, appliedClassId: { $in: [doc._id] } } });
  console.log("removedInUser", removedInUser);
  next();
})


const classModel = model("class", classSchema);

module.exports = classModel;