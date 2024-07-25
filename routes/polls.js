const Joi = require("joi");
const router = require("express").Router();
const { Poll } = require("../models/poll");

// Fetching polls for view
router.get("/", async (req, res) => {
  try {
    const todos = await Poll.find();
    res.send(todos);
  } catch (error) {
    console.log(error.message);
    res.status(500).send(error.message);
  }
});

// Creating new polls
router.post("/", async (req, res) => {
  const schema = Joi.object({
    date: Joi.date(),
    uid: Joi.string(),
    title: Joi.string().min(3).max(64).required(),
    body: Joi.string().max(1024),
    options: Joi.array().min(2).max(5).required(),
    usersSelection: Joi.array().items(
      Joi.object({
        uid: Joi.string().required(),
        selection: Joi.string().required(),
      })
    ),
    author: Joi.string(),
  });

  const { error } = schema.validate(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  const { date, uid, title, body, options, selected, author } = req.body;

  let poll = new Poll({
    date,
    uid,
    title,
    body,
    options,
    selected,
    author,
  });

  try {
    poll = await poll.save();
    res.send(poll);
  } catch (error) {
    console.log(error.message);
    res.status(500).send(error.message);
  }
});

// Updating polls metadata
router.put("/:id", async (req, res) => {
  const schema = Joi.object({
    title: Joi.string().min(3).max(64).required(),
    body: Joi.string().max(1024),
    options: Joi.array().min(2).max(5).required(),
  });

  const { error } = schema.validate(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).send("Todo not found...");

    const { title, body, options } = req.body;

    const updatedPoll = await Poll.findByIdAndUpdate(
      req.params.id,
      {
        $set: { title: title, body: body, options: options },
      },
      { new: true }
    );
    res.send(updatedPoll);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("error creating poll", error.message);
  }
});

// When user selects a option from poll
router.patch("/:id", async (req, res) => {
  const schema = Joi.object({
    uid: Joi.string().required(),
    selection: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).send("Todo not found...");

    const { uid, selection } = req.body;

    const existingSelection = poll.usersSelection.find(
      (sel) => sel.uid === uid
    );
    if (existingSelection) {
      // Update existing selection
      existingSelection.selection = selection;
    } else {
      // Add new selection
      poll.usersSelection.push({ uid, selection });
    }

    await poll.save();
    res.send(poll);
  } catch (error) {
    console.log(error.message);
    res.status(500).send(error.message);
  }
});

// Deleting poll
router.delete("/:id", async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).send("Todo not found...");

    const deleteTodo = await Poll.findByIdAndDelete(req.params.id);
    res.send(deleteTodo);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("error creating poll", error.message);
  }
});

module.exports = router;
