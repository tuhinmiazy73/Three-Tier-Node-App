const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(session({
  secret: 'super-secret-key',
  resave: false,
  saveUninitialized: true
}));

const db = new sqlite3.Database('./data.db');
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT)");
  db.run("CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, task TEXT)");
});

function checkAuth(req, res, next) {
  if (!req.session.userId) return res.redirect('/login');
  next();
}

app.get('/', (req, res) => res.redirect('/login'));

app.get('/login', (req, res) => res.render('login', { message: null }));
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    if (user && bcrypt.compareSync(password, user.password)) {
      req.session.userId = user.id;
      res.redirect('/dashboard');
    } else {
      res.render('login', { message: "Invalid credentials" });
    }
  });
});

app.get('/register', (req, res) => res.render('register', { message: null }));
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  const hashed = bcrypt.hashSync(password, 10);
  db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashed], function (err) {
    if (err) return res.render('register', { message: "User already exists" });
    req.session.userId = this.lastID;
    res.redirect('/dashboard');
  });
});

app.get('/dashboard', checkAuth, (req, res) => {
  db.all("SELECT * FROM todos WHERE user_id = ?", [req.session.userId], (err, todos) => {
    res.render('dashboard', { todos });
  });
});

app.post('/add', checkAuth, (req, res) => {
  db.run("INSERT INTO todos (user_id, task) VALUES (?, ?)", [req.session.userId, req.body.todo], () => {
    res.redirect('/dashboard');
  });
});

app.post('/delete', checkAuth, (req, res) => {
  db.run("DELETE FROM todos WHERE id = ? AND user_id = ?", [req.body.id, req.session.userId], () => {
    res.redirect('/dashboard');
  });
});

app.get('/change-password', checkAuth, (req, res) => {
  res.render('change-password', { message: null });
});

app.post('/change-password', checkAuth, (req, res) => {
  const { oldPassword, newPassword } = req.body;
  db.get("SELECT * FROM users WHERE id = ?", [req.session.userId], (err, user) => {
    if (!user || !bcrypt.compareSync(oldPassword, user.password)) {
      return res.render('change-password', { message: "Old password incorrect" });
    }
    const newHashed = bcrypt.hashSync(newPassword, 10);
    db.run("UPDATE users SET password = ? WHERE id = ?", [newHashed, req.session.userId], () => {
      res.render('change-password', { message: "Password updated successfully" });
    });
  });
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});


app.get('/forgot-password', (req, res) => {
  res.render('forgot-password', { message: null });
});

app.post('/forgot-password', (req, res) => {
  const { username, newPassword } = req.body;
  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    if (!user) {
      return res.render('forgot-password', { message: "User not found" });
    }
    const hashed = bcrypt.hashSync(newPassword, 10);
    db.run("UPDATE users SET password = ? WHERE username = ?", [hashed, username], () => {
      res.render('forgot-password', { message: "Password reset successfully. You can now log in." });
    });
  });
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
