const { Schema, model } = require("mongoose");
const { handleMongooseError } = require("../helpers");

const Joi = require("joi");

// const emailRegExp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; 

const userSchema = new Schema({
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    // match: emailRegExp,
  },
  subscription: {
    type: String,
    enum: ["starter", "pro", "business"],
    default: "starter",
  },
  token: {
    type: String,
    default: "",
  },
  avatarURL: {
    type: String,
    required: [true, "Avatar is required"],
  },
});

userSchema.post("save", handleMongooseError);

const schemaSignUp = Joi.object({
  password: Joi.string().min(6).required(),
  email: Joi.string().required(),
  subscription: Joi.string().required(),
 
});

const schemaLogin = Joi.object({
  password: Joi.string().min(6).required(),
  email: Joi.string().required(),
 
});

const User = model("user", userSchema);

const schemas = {
    schemaSignUp,
    schemaLogin,
}
module.exports = {
  User,
  schemas,
};
