// Only for signup/login
function isEmail(str) {
  // Simple, effective email regex for basic validation
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

function isStrongPassword(str) {
  return typeof str === "string" && str.length >= 6;
}

module.exports = { isEmail, isStrongPassword };
