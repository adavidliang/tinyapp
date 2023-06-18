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

const generateRandomString = (length) => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
};

module.exports = { getUserByEmail, isUserHasUrl, isLogin, generateRandomString };