const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { isEmail, isStrongPassword } = require("../utils/validators");
const { success, fail } = require("../utils/responses");

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

async function signup(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (!isEmail(email)) return fail(res, "Invalid email");
    if (!isStrongPassword(password))
      return fail(res, "Password must be at least 6 characters");

    const exists = await User.findOne({ email });
    if (exists) return fail(res, "Email already in use");

    const user = new User({ email, password });
    await user.save();

    const token = signToken(user._id);
    return success(res, { token, email: user.email }, 201);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (!isEmail(email)) return fail(res, "Invalid email");
    if (!isStrongPassword(password))
      return fail(res, "Password must be at least 6 characters");

    const user = await User.findOne({ email });
    if (!user) return fail(res, "Invalid credentials", 401);

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return fail(res, "Invalid credentials", 401);

    const token = signToken(user._id);
    return success(res, { token, email: user.email });
  } catch (err) {
    next(err);
  }
}

module.exports = { signup, login };
