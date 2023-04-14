const User = require("../models/UserModel");
const sendMail = require("../utils/sendMail");
const { sendToken } = require("../utils/sendToken");
const tryCatchFunction = require("../utils/tryCatchFunction");
const cloudinary = require("cloudinary");
const fs = require("fs");
// Register a new user -------------------------------

exports.registerUser = tryCatchFunction(async (req, res, next) => {
  const { name, email, password } = req.body;
  if ((!email, !password, !name)) {
    return res.status(400).json({
      success: false,
      message: "Please provide all the fields",
    });
  }
  const avatar = req.files.avatar.tempFilePath;

  const exist = await User.findOne({ email });
  if (exist) {
    return res.status(400).json({
      success: false,
      message: "User already exist",
    });
  }

  // generate otp
  const otp = Math.floor(Math.random() * 100000);

  // send opt through email
  await sendMail(
    email,
    "OTP for the signing up",
    `<h1>${otp}</h1> <p>OTP is valid for 10 minutes</p>`
  );

  // uploading avatar to cloudinary
  const myCloud = await cloudinary.v2.uploader.upload(avatar , {
    folder : "todoApp"
  });

fs.rmSync('./tmp' , { recursive: true, force: true });

  // save user in database
  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: myCloud.public_id,
      url: myCloud.url,
    },
    otp,
    otp_expire: Date.now() + process.env.OTP_EXPIRE * 60 * 1000,
  });

  sendToken(user, res, 201, "OTP sent to your email, check and verify");
});

// OTP verification --------------------------------

exports.OTPVerification = tryCatchFunction(async (req, res, next) => {
  const otp = Number(req.body.otp);
  const user = await User.findById(req.user._id);

  if (otp !== user.otp || user.otp_expire < Date.now()) {
    return res.status(401).json({
      success: false,
      message: "Invalid OTP or has been expired",
    });
  }
  user.otp = null;
  user.otp_expire = null;
  user.verified = true;
  await user.save();
  sendToken(user, res, 200, "Your Account has been verified");
});

// Login User ------------------------------

exports.login = tryCatchFunction(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please input all the fields",
    });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({
      success: false,
      message: "User does not exist",
    });
  }
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return res.status(400).json({
      success: false,
      message: "Invalid Email or password",
    });
  }
  sendToken(user, res, 200, "Login Success");
});

// logout user ------------------------------

exports.logout = tryCatchFunction(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "Logged out",
  });
});

// user Rrofile ------------------------------

exports.userProfile = tryCatchFunction(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({
    success: true,
    user,
  });
});

// adding a task ------------------------------

exports.addTask = tryCatchFunction(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const task = {
    title: req.body.title,
    description: req.body.description,
    completed: false,
    createdAt: new Date(Date.now()),
  };
  user.tasks.push(task);
  await user.save();
  res.status(201).json({
    success: true,
    message: "Task added",
    task,
  });
});

// removeTask --------------------

exports.removeTask = tryCatchFunction(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const { taskid } = req.params;
  user.tasks = user.tasks.filter((task) => task._id.toString() != taskid);
  await user.save();
  res.status(200).json({
    success: true,
    message: "Task successfully removed",
  });
});

// update task  -----------------------

exports.updateTask = tryCatchFunction(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const { taskid } = req.params;
  const task = user.tasks.find((task) => task._id.toString() == taskid);
  if (!task) {
    return res.status(404).json({
      success: false,
      message: "Task not found",
    });
  }
  task.completed = !task.completed;
  await user.save();
  res.status(200).json({
    success: true,
    message: "Task successfully Updated",
    task,
  });
});

// taskInfo -----------------------

exports.taskInfo = tryCatchFunction(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const { taskid } = req.params;
  const task = user.tasks.find((task) => task._id.toString() == taskid);
  if (!task) {
    return res.status(404).json({
      success: false,
      message: "Task not found",
    });
  }
  res.status(200).json({
    success: true,
    task,
  });
});

// All tasks -----------------------

exports.allTasks = tryCatchFunction(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const tasks = user.tasks;
  if (tasks == 0) {
    return res.status(404).json({
      success: false,
      message: " No task found",
    });
  }
  res.status(200).json({
    success: true,
    tasks,
  });
});

// update profile ---------------------------------------

exports.updateProfile = tryCatchFunction(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const { name, email } = req.body;
  const avatar = req.files.avatar.tempFilePath;

  if (name) user.name = name;
  if (avatar) {
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    const mycloud = await cloudinary.v2.uploader.upload(avatar);

    fs.rmSync("./tmp", { recursive: true });

    user.avatar = {
      public_id: mycloud.public_id,
      url: mycloud.secure_url,
    };
  }

  user.name = name;
  user.email = email;
  user.save();
  res.status(200).json({
    success: true,
    user,
  });
});

// Update password ---------------------------------------

exports.updatePassword = tryCatchFunction(async (req, res) => {
  const user = await User.findById(req.user._id).select("+password");
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res
      .status(400)
      .json({ success: false, message: "Please enter all fields" });
  }

  const isMatch = await user.comparePassword(oldPassword);

  if (!isMatch) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Old Password" });
  }

  user.password = newPassword;

  await user.save();

  res
    .status(200)
    .json({ success: true, message: "Password Updated successfully" });
});
