const bcrypt = require("bcryptjs");
const express = require("express");
const morgan = require("morgan");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session');
const { getUserByEmail, isUserHasUrl, isLogin, generateRandomString } = require("./helpers");

app.set("view engine", "ejs");
//Middleware
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cookieSession({
  name: 'session',
  keys: ["some value", "some other thing"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

//function
const urlsForUser = (id) => {
  const userURLs = {};
  for (let urlID in urlDatabase) {
    if (urlDatabase[urlID].userID === id) {
      userURLs[urlID] = urlDatabase[urlID];
    }
  }
  return userURLs;
};

// found in the req.body object
//password: "pxykn1",
const users = {
  b6UTxQ: {
    id: "b6UTxQ",
    email: "user@example.com",
    password: "$2a$10$op7EYUnzkH.UfHeOFBCr2uCzMHl0ru.f9QBOqn1UE0irbKkz5rCt6",
  },
  //password: "dishwasher-funk"
  aJ48lW: {
    id: "aJ48lW",
    email: "user2@example.com",
    password: "$2a$10$VuwDWYJq0Yh0ylDqpXbsPuvBjBSxNbuEzNN5Ps9LNzc07YRpd8oGm",
  },
};

const urlDatabase = {
  c5htxQ: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "b6UTxQ",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
  // "b2xVn2": "http://www.lighthouselabs.ca",
  // "9sm5xK": "http://www.google.com"
};


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  if (!isLogin(req)) {
    return res.redirect("/login");
  }
  const userId = req.session.user_id;
  const userURLs = urlsForUser(userId);
  const templateVars = {
    urls: userURLs,
    user: users[req.session.user_id] || null
  };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!isLogin(req)) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: users[req.session.user_id] || null
  };

  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  if (!isLogin(req)) {
    return res.status(401).send("Error: Please log in");
  }

  const currentUserIs = users[req.session.user_id];
  const userURL = urlsForUser(currentUserIs.id);
  const urlID = req.params.id;
  const belongToUser = isUserHasUrl(urlID, userURL);
  if (!urlDatabase[urlID] || !belongToUser) {
    return res.status(404).send("Error: URL does not exist, you do not own url");
  }

  const longURL = userURL[urlID].longURL;
  const templateVars = {
    longURL,
    user: currentUserIs,
    urlID
  };

  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  if (!longURL) {
    return res.send("error, id not exist");
  }
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  if (!isLogin(req)) {
    return res.status(401).send("Error: Please log in");
  }
  const urlID = generateRandomString(6);
  const longURL = req.body.longURL;
  const userID = req.session.user_id;

  // Create a new URL entry in the database
  urlDatabase[urlID] = {
    longURL,
    userID
  };
  res.redirect(`/urls`); //change to redirect by id// Respond with 'Ok' (we will replace this)
});


//remove the url when delete button click
app.post("/urls/:id/delete", (req, res) => {
  //check if the user login
  if (!isLogin(req)) {
    return res.status(401).send("Error: Please log in");
  }

  const currentUserIs = users[req.session.user_id];
  const userURL = urlsForUser(currentUserIs.id);
  const urlID = req.params.id;
  const belongToUser = isUserHasUrl(urlID, userURL);

  // Check if the URL ID exists in the database
  if (!urlDatabase[urlID] || !belongToUser) {
    return res.status(404).send("Error: URL does not exist, you do not own url");
  }

  delete urlDatabase[urlID].userID;

  res.redirect("/urls");
});

//upload the url the user tpye
app.post("/urls/:id", (req, res) => {
  if (!isLogin) {
    return res.status(401).send("Error: Please log in");
  }

  const currentUserIs = users[req.session.user_id];
  const userURL = urlsForUser(currentUserIs.id);
  const urlID = req.params.id;
  const belongToUser = isUserHasUrl(urlID, userURL);
  if (!urlDatabase[urlID] || !belongToUser) {
    return res.status(404).send("Error: URL does not exist, you do not own url");
  }

  const longURL = req.body.longURL;
  urlDatabase[urlID].longURL = longURL;

  res.redirect(`/urls`);
});

app.get("/login", (req, res) => {
  if (isLogin(req)) {
    return res.redirect("/urls");
  }
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id] || null
  };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const finduser = getUserByEmail(email, users);
  const hashedPassword = finduser.password;
  const isPasswordCorrect = bcrypt.compareSync(password, hashedPassword);
  if (!finduser) {
    return res.status(403).send("There no user with that email");

  }
  if (!isPasswordCorrect) {
    return res.status(403).send("password is incorrect");
  }

  req.session.user_id = finduser.id;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  // res.clearCookie("user_id");
  req.session = null;
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  if (isLogin(req)) {
    return res.redirect("/urls");
  }
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id] || null
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const urlID = generateRandomString(6);
  let password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newuser = {
    id: urlID,
    email: req.body.email,
    password: hashedPassword
  };
  for (let userID in users) {
    if (newuser.email === users[userID].email) {
      return res.status(400).send("The email have already taken");
    }
    if (!newuser.email) {
      return res.status(400);
    }
    if (!newuser.password) {
      return res.status(400);
    }
  }
  users[urlID] = newuser;
  console.log(users);
  res.redirect("/urls");
});

// console.log(users);

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});