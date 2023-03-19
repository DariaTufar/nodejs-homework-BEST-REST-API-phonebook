const nodemailer = require("nodemailer");
require("dotenv").config();

const { META_PASSWORD, META_PORT, META_HOST } = process.env;
 
const nodemailerConfig = {
  host: META_HOST,
  port: META_PORT,
  secure: true,
  auth: {
    user: "daria.email-tufar@meta.ua",
    pass: META_PASSWORD,
  },
};

const transport = nodemailer.createTransport(nodemailerConfig);

const sendEmail = async (data) => {
  const email = { ...data, from: "daria.email-tufar@meta.ua" };
  await transport.sendMail(email);
  return true;
};

module.exports = sendEmail;