const bcrypt = require("bcryptjs");
const express = require("express");
const morgan = require("morgan");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');

app.set("view engine", "ejs");
//Middleware
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cookieParser());


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
//good function
const isLogin = function(obj) {
  // console.log(obj.cookies)//{ user_id: 'aJ48lW' }
  // console.log(Object.keys(obj.cookies).includes("user_id"))
  if(!Object.keys(obj.cookies).includes("user_id")) {
    return false;
  }
  return true;
}
//password: "dishwasher-funk"; // found in the req.body object


const users = {
  b6UTxQ: {
    id: "b6UTxQ",
    email: "user@example.com",
    password: "$2a$10$B5O7KVxgbDMq1JH6be6r0Oau580ceU6JGNPurJOBoWiXykmbX5EEa",
  },
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

//function
const urlsForUser = (id) => {
  const userURLs = {};
  for(let urlID in urlDatabase){
if(urlDatabase[urlID].userID === id) {
  userURLs[urlID] = urlDatabase[urlID];
}
  }

  return userURLs;
}
const isUserHasUrl = function(urlID, userURL) {
  return Object.keys(userURL).includes(urlID);
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: {},
    user: users[req.cookies["user_id"]] || null
  };

  for (const urlID in urlDatabase) {
    // console.log(urlDatabase[urlID])
    // console.log(req.cookies["user_id"])
    if (urlDatabase[urlID].userID === req.cookies["user_id"]) {
      templateVars.urls[urlID] = urlDatabase[urlID];
    }
  }
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]] || null
  };
  if(!users[req.cookies["user_id"]]){
    return res.redirect("/urls");
  }

  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  if(!isLogin(req)){
    return res.status(401).send("Error: Please log in");
  }

  const currentUserIs = users[req.cookies["user_id"]];
  const userURL = urlsForUser(currentUserIs.id);
  const urlID = req.params.id;
const belongToUser = isUserHasUrl(urlID, userURL)
if(!urlDatabase[urlID] || !belongToUser){
  return res.status(404).send("Error: URL does not exist, you do not own url");
}

const longURL = userURL.longURL;
const templateVars = {
  longURL,
  user: currentUserIs,
  urlID 
};

  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  if(!longURL){
    return res.send("error, id not exist")
  }
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  if(!isLogin(req)){
    return res.status(401).send("Error: Please log in");
  }
  const urlID = generateRandomString(6);
  urlDatabase[urlID] = req.body.longURL;
  console.log(req.body); // Log the POST request body to the console
  res.redirect(`/urls/${urlID}`); //change to redirect by id// Respond with 'Ok' (we will replace this)
});


//remove the url when delete button click
app.post("/urls/:id/delete", (req, res) => {
//check if the user login
  if(!isLogin(req)){
    return res.status(401).send("Error: Please log in");
  }

  const currentUserIs = users[req.cookies["user_id"]];
  const userURL = urlsForUser(currentUserIs.id);
  const urlID = req.params.id;
const belongToUser = isUserHasUrl(urlID, userURL)

// Check if the URL ID exists in the database
if(!urlDatabase[urlID] || !belongToUser){
  return res.status(404).send("Error: URL does not exist, you do not own url");
}

  delete urlDatabase[urlID].userID;
  
  res.redirect("/urls");
});

//upload the url the user tpye
app.post("/urls/:id", (req, res) => {
  const urlID = req.params.id;
  const newLongURL = req.body.longURL;
// Check if the URL ID exists in the database
if (!urlDatabase[urlID]) {
  return res.status(404).send("Error: URL does not exist");
}

// Check if the user is logged in
if (!req.cookies["user_id"]) {
  return res.status(401).send("Error: Please log in");
}

// Check if the user owns the URL
if (urlDatabase[urlID].userID !== req.cookies["user_id"]) {
  return res.status(403).send("Error: You do not own this URL");
}
  
  urlDatabase[urlID].longURL = newLongURL;

  res.redirect(`/urls`);
});

app.get("/login", (req, res) => {

  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]] || null
  };
  if(users[req.cookies["user_id"]]){
    return res.redirect("/urls");
  }
  res.render("urls_login", templateVars);
})

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  for (let userID in users) {
    const user = users[userID];
    if (email === user.email) {
      if (bcrypt.compareSync(password, user.password)) {
        res.cookie("user_id", userID)
        return res.redirect("/urls")
      } else {
        return res.status(403).send("password is incorrect");
      }
    }
  }
  return res.status(403).send("There no user with that email");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
})

app.get("/register", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]] || null
  };
  if(users[req.cookies["user_id"]]){
    return res.redirect("/urls");
  }
  res.render("urls_register", templateVars);
})

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
  // res.cookie("user_id", urlID);
  res.redirect("/urls");
})

// console.log(users);

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});