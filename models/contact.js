const { Schema, model } = require("mongoose");
const { handleMongooseError } = require("../helpers");

const Joi = require("joi");

const contactSchema = new Schema({
  name: {
    type: String,
    required: [true, "Set name for contact"],
  },
  email: {
    type: String,
    default: "",
  },
  phone: {
    type: String,
    required: [true, "Set phone number for contact"],
  },
  favorite: {
    type: Boolean,
    default: false,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
});

contactSchema.post("save", handleMongooseError);
//  ======Joi Schema for Body when Adding New Contact =====
const schemaPost = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  phone: Joi.string().required(),
  favorite: Joi.boolean(),
});
//  ======Joi Schema for Body when Updating Contact =====
const schemaPut = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().optional(),
  phone: Joi.string().optional(),
  favorite: Joi.boolean(), 

});

const schemaPatch = Joi.object({
  favorite: Joi.boolean(),
});

const Contact = model("contact", contactSchema);

const schemas = {
  schemaPost,
  schemaPut,
  schemaPatch,
};

module.exports = {
  Contact,
  schemas,
};
