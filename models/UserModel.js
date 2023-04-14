const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userModel = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    public_id: {
      type: String,
    },
    url: {
      type: String,
    },
  },
  craetedAt: {
    type: Date,
    default: Date.now,
  },
  tasks: [
    {
      title: String,
      description: String,
      completed: Boolean,
      createdAt: Date,
    },
  ],
  verified: {
    type: Boolean,
    default: false,
  },
  otp: Number,
  otp_expire: Date,
});

//  hashing password before saving

userModel.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// jsonwebtoken for generating token

userModel.methods.generateToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  });
};

// compare passowrd

userModel.methods.comparePassword = async function (EnteredPassowrd) {
  return await bcrypt.compare(EnteredPassowrd, this.password);
};
//  for deleting object if otp expire

userModel.index({ otp_expire : 1 }, { expireAfterSeconds: 0 });

const User = mongoose.model("User", userModel);
module.exports = User;
