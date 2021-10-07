const express = require("express");
const app = express();

//xss sanitizer
const { xss } = require('express-xss-sanitizer');

app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//xss sanitizer
app.use(xss());

const postsRouter = require("./routes/posts");
app.use("/api", [postsRouter]);

const repliesRouter = require("./routes/replies");
app.use("/api", [repliesRouter]);

const usersRouter = require("./routes/users");
app.use("/api", [usersRouter]);

const connect = require("./schemas");
connect();

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/posting", (req, res) => {
  res.render("posting");
});

app.get("/post_detail", (req, res) => {
  res.render("post_detail");
});

app.get("/post_edit", (req, res) => {
  res.render("post_edit");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

// app.listen(port, () => {
//   console.log(`listening at http://localhost:${port}`);
// });

module.exports = app;
