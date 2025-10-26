const validator = require("validator");

const validateSignup = (req) => {
  const { firstName, emailId, password } = req.body;

  if (!firstName || !emailId || !password) {
    throw new Error("firstName, emailID and password are mandatory fields");
  } else if (firstName.length < 3 || firstName.length > 50) {
    throw new Error("Name should be 3-50 characters long");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Email is not valid");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Password is weak");
  }
};

module.exports = validateSignup;
