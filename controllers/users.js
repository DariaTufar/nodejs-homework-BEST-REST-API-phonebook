const { HttpError } = require("../helpers");

const { ctrlWrapper } = require("../helpers/ctrlWrapper.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

require("dotenv").config();
const { SECRET_KEY } = process.env;

const { User } = require("../models/user");

// ======= Sign-Up =====================

async function signup(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    throw HttpError(409, "Email already in use");
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  //   const compareResult1 = await bcrypt.compare(password, result);
  const newUser = await User.create({
    ...req.body,
    password: hashedPassword,
  });
  res.status(201).json({
    email: newUser.email,
    password: newUser.password,
  });
}
// =======Log in  =====================
async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw HttpError(401, "Email or password is wrong");
  }
  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw HttpError(401, "Email or password wrong");
  }
  const payload = {
    id: user._id,
  };

  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
  await User.findByIdAndUpdate(user._id, { token });
  res.status(200).json({
    data: {
      token,
      user: { email: user.email, subscription: user.subscription },
    },
  });
}

//  ========== Show current user ========show  email details
const getCurrent = async (req, res) => {
  const { email, subscription } = req.user;

  res.json({
    email,
    subscription,
  });
};

// =========  Log Out ============================
const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: "" });

  res.json({
    message: "No Content",
  });
};

module.exports = {
  signup: ctrlWrapper(signup),
  login: ctrlWrapper(login),
  getCurrent: ctrlWrapper(getCurrent),
  logout: ctrlWrapper(logout),
};
