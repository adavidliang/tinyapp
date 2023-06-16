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

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/url.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]] || null
  };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]] || null
  };

  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[req.cookies["user_id"]] || null
  };

  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const urlID = generateRandomString(6);
  urlDatabase[urlID] = req.body.longURL;
  console.log(req.body); // Log the POST request body to the console
  res.redirect(`/urls/${urlID}`); //change to redirect by id// Respond with 'Ok' (we will replace this)
});
//remove the url when delete button click
app.post("/urls/:id/delete", (req, res) => {
  const urlID = req.params.id;
  delete urlDatabase[urlID];
  res.redirect("/urls");
});

//upload the url the user tpye
app.post("/urls/:id", (req, res) => {
  const urlID = req.params.id;
  const newLongURL = req.body.longURL;
  urlDatabase[urlID] = newLongURL;
  res.redirect(`/urls`);
});

app.get("/login", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]] || null
  };
  res.render("urls_login", templateVars);
})

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  console.log(email)
  console.log(password)
  for (let userID in users) {
    const user = users[userID];
    if (email === user.email) {
      if (password === user.password) {
        res.cookie("user_id", userID)
        return res.redirect("/urls")
      } else {
        return res.status(403).send("password is incorrect");
      }
    }
  }
  return res.status(403).send("There no user with that email");
});

app.post("/Logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
})

app.get("/register", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]] || null
  };
  res.render("urls_register", templateVars);
})

app.post("/register", (req, res) => {
  const urlID = generateRandomString(6);
  const newuser = {
    id: urlID,
    email: req.body.email,
    password: req.body.password
  };
  for (let userID in users) {

    if (newuser.email === users[userID].email) {
      console.log("The email have already taken");
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
  res.cookie("user_id", urlID);
  res.redirect("/urls");
})

console.log(users);

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});