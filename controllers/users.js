const path = require("path");
const fs = require("fs/promises");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const Jimp = require("jimp");
const { v4: uuidv4 } = require("uuid");

const { HttpError, sendEmail } = require("../helpers");
const { ctrlWrapper } = require("../helpers/ctrlWrapper.js");

require("dotenv").config();

const { SECRET_KEY, BASE_URL } = process.env;

const { User } = require("../models/user");

// ======= Sign-Up =====================

async function signup(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    throw HttpError(409, "Email already in use");
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);
  const verificationToken = uuidv4();

  const newUser = await User.create({
    ...req.body,
    password: hashedPassword,
    avatarURL,
    verificationToken,
  });
  
  const verificationEmail = {
    to: email,
    subject: "Please Confirm Your email",
    html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${verificationToken}">Click To Confirm Your email</a>`,
  };

  await sendEmail(verificationEmail);
  
  // console.log("sendEmail function worked")
  
  res.status(201).json({
    email: newUser.email,
    password: newUser.password,
  });
} 
  // ========= Verify Email when registering ==========

  const verifyUserEmail = async (req, res) => {
  const { verificationToken } = req.params;
  const user = await User.findOne({ verificationToken });
  if (!user) {
    throw HttpError(404, "User not found");
  }
  await User.findByIdAndUpdate(user._id, { verificationToken: null, verify: true }, { new: true });
  res.status(200).json({ message: "Verification successful" });
  };
  
  const resendVerifyEmail = async (req, res) => {
    const { email } = req.body;
    if (!email) throw HttpError(400, "missing required field email");
    const user = await User.findOne({ email });
    if (!user) throw HttpError(404, "User not found");
    if (user.verify)
      throw HttpError(400, "Verification has already been passed");

    const verifyEmail = {
      to: email,
      subject: "Verify email",
      html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${user.verificationToken}">Click to confirm  email</a>`,
    };

    await sendEmail(verifyEmail);

    res.json({ message: "Verification email sent successfully" });
  };



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
    else if (!user.verify) {
    throw new HttpError(401, "User is not verified");
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

// ========= Update Avatar =======================
const avatarsDir = path.join(__dirname, "../", "public", "avatars");

const updateAvatar = async (req, res) => {
  const { _id: userId } = req.user;
  const { path: tempUpload, originalname } = req.file;
  const filename = `${userId}_${originalname}`;
  const resultUpload = path.resolve(avatarsDir, filename);
  try {
    const avatar = await Jimp.read(tempUpload);
    await avatar.resize(250, 250).writeAsync(tempUpload);

    await fs.rename(tempUpload, resultUpload);
    const avatarURL = path.join("avatars", filename);

    const user = await User.findByIdAndUpdate(
      userId,
      { avatarURL },
      { new: true }
    );
    res.status(200).json({ avatarURL: user.avatarURL });

    res.status(200).json({
      avatarURL,
    });
  } catch (error) {
    await fs.unlink(tempUpload);
    throw HttpError(401, "Not authorized");
  }
};

  module.exports = {
    signup: ctrlWrapper(signup),
    login: ctrlWrapper(login),
    getCurrent: ctrlWrapper(getCurrent),
    logout: ctrlWrapper(logout),
    updateAvatar: ctrlWrapper(updateAvatar),
    verifyUserEmail: ctrlWrapper(verifyUserEmail),
    resendVerifyEmail: ctrlWrapper(resendVerifyEmail)
  };