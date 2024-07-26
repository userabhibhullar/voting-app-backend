const router = require("express").Router();
const Joi = require("joi");
const bcrpyt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models/user");

router.post("/", async (req, res) => {
  const schema = Joi.object({
    email: Joi.string().min(3).max(320).required(),
    password: Joi.string().min(8).required(),
  });

  const { error } = schema.validate(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  try {
    let user = await User.findOne({ email: req.body.email });

    if (!user)
      return res
        .status(400)
        .send("User with that email already does not exists...");

    const validPassword = await bcrpyt.compare(
      req.body.password,
      user.password
    );

    if (!validPassword)
      return res.status(401).send("Invalid email or password...");

    const secret = process.env.JWT_SECRET;

    const token = jwt.sign(
      {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      secret
    );

    res.send(token);
  } catch (error) {
    console.log(error.message);
    res.send(500).send(error.message);
  }
});

module.exports = router;
