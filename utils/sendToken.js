exports.sendToken = (user, res, statuCode, message) => {
  const token = user.generateToken();
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  const userData = {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    tasks: user.tasks,
    verified: user.verified,
  };
  res.status(statuCode).cookie("token", token, options).json({
    success: true,
    message,
    user: userData,
  });
};
