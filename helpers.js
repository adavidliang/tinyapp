const getUserByEmail = function(email, database) {
  return Object.values(database).find(user => user.email === email);
};

const isUserHasUrl = function(urlID, userURL) {
  return Object.keys(userURL).includes(urlID);
};

const isLogin = function(obj) {
  if (!Object.keys(obj.session).includes("user_id")) {
    return false;
  }
  return true;
};

module.exports = { getUserByEmail, isUserHasUrl, isLogin };