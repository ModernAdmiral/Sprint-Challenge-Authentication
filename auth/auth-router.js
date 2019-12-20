const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Users = require("./auth-model.js");
const secret = require("../config/secret.js");

router.post("/register", (req, res) => {
  // implement registration
  let user = req.body;
  const hash = bcrypt.hashSync(user.password, 10);
  user.password = hash;

  Users.add(user)
    .then(saved => {
      res.status(201).json(saved);
    })
    .catch(err => {
      res.status(500).json(err);
    });
});

router.post("/login", (req, res) => {
  // implement login
  let { username, password } = req.body;

  Users.findBy({ username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        // if the user exists and the password provided is a match to the hashed password in the database

        const token = signToken(user);

        res.status(200).json({
          token,
          message: `Welcome`
        });
      } else {
        res.status(401).json({ message: "invalid password" });
      }
    })
    .catch(err => {
      res.status(500).json({ err });
    });
});

const signToken = user => {
  const payload = {
    subject: user.id, //sub
    username: user.username
  };

  const options = {
    expiresIn: "8h"
  };
  return jwt.sign(payload, secret.jwtSecret, options);
};

module.exports = router;
