
const { Schema, model } = require("mongoose");
const { sign, verify } = require("jsonwebtoken");
const { compare, hash } = require("bcryptjs");
const AppError = require("../util/appErrorHandler");
// const { getOne } = require("../Controller/handleFactory");

const userSchema = Schema({
  name: {
    type: String,
    required: [true, "Please provide your name"],
  },
  email: {
    type: String,
    unique: [true, "email must be unique"],
    required: [true, "Please enter your email"],
  },
  password: {
    type: String,
    required: [true, "Please provide password"],
  },
  token: {
    type: String,
    default: null,
  },
  roles: {
    type: String,
    required: [true, "please select the role"],
    validate: {
      validator: function (value) {
        const roles = ["student", "teacher", "instructor"];
        if (roles.includes(value.toLowerCase())) return true;
        return false;
      },
      message: "roles can be either teacher || student || instructor",
    },
  },
  appliedClassId: [{
    type: Schema.Types.ObjectId,
    ref: "class"
  }],
  classId: [{
    type: Schema.Types.ObjectId,
    ref: "class"
  }]

});


userSchema.methods.generateToken = async function () {
  this.token = await sign({ id: this._id }, process.env.PRIVATE_KEY, {
    expiresIn: 60 * 10 * 60,
  });
};

userSchema.statics.findByEmailAndPassword = async function (email, password) {
  let userObj = null;
  try {
    return new Promise(async function (resolve, reject) {
      const user = await userModel.findOne({ email: email });

      if (!user) return reject(new AppError("Incorrect credentials", 404));
      userObj = user;
      const isMatched = await compare(password, user.password);

      if (!isMatched) return reject(new AppError("Incorrect credentials", 404));
      resolve(userObj);
    });
  } catch (err) {
    reject(err);
  }
};

userSchema.pre("save", async function (next) {
  var user = this;
  // Check whether password field is modified

  try {
    if (user.isModified("password")) {
      const hashPwd = await hash(this.password, 10);
      this.password = hashPwd;
      next();
    }
  } catch (err) {
    // return res.send({msg:err.message});
    next(err);
  }
});

userSchema.statics.CreateUser = async (payload) => await userModel.create(payload);

userSchema.statics.AsssignClass = async (userId, classId, session) => await userModel.findOneAndUpdate({ _id: userId }, { $push: { classId: classId } }, { session, new: true });

userSchema.statics.AppliedForClass = async (userId, classId) => await userModel.findOneAndUpdate({ _id: userId }, { $push: { appliedClassId: classId } }, { new: true });

userSchema.statics.CheckPermission = async (condition) => await userModel.findOne(condition);

userSchema.statics.CheckApplication = async (classId, userId) => await userModel.findOne({$and:[{ appliedClassId: { $in: [`${classId}`] } }, { _id:userId}]});

userSchema.statics.CheckAlreayApplied = async (classId, userId) => await userModel.findOne(
  {$and:[
    {
      $or: [
        { appliedClassId: { $in: [classId] } }, 
        {classId: { $in: [classId] } }
      ] 
    },
    {
      _id:userId
    }
  ]
});

userSchema.statics.GrantUserAccessForClass = async(userId, classId)=>{
  let pulled = await userModel.findOneAndUpdate({_id:userId},{$pull:{appliedClassId:{$in:[classId]}}},{new:true});
  console.log("pulled", pulled);
  await userModel.findOneAndUpdate({_id:userId}, {$push:{classId:classId}});
}

userSchema.pre('deleteOne', { document: true}, function(next) {
  console.log("deleteOne", this);
  next();
})





const userModel = model("user", userSchema);

module.exports = userModel;