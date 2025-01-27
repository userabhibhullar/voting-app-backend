const Joi = require("joi");
const router = require("express").Router();
const { Poll } = require("../models/poll");
const auth = require("../middleware/auth");

// Fetching polls for view
router.get("/", auth, async (req, res) => {
  try {
    const todos = await Poll.find().sort({ date: -1 });
    res.send(todos);
  } catch (error) {
    console.log(error.message);
    res.status(500).send(error.message);
  }
});

// Creating new polls
router.post("/", auth, async (req, res) => {
  if (!req.auth) return res.status(401).send("Not Authorized");

  const schema = Joi.object({
    date: Joi.date(),
    uid: Joi.string(),
    title: Joi.string().min(3).max(64).required(),
    body: Joi.string().max(1024).allow(null),
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
router.put("/:id", auth, async (req, res) => {
  if (!req.auth) return res.status(400).send("Not Authenticated");
  const schema = Joi.object({
    title: Joi.string().min(3).max(64).required(),
    body: Joi.string().max(1024).allow(null),
    options: Joi.array().min(2).max(5).required(),
  });

  const { error } = schema.validate(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).send("Todo not found...");

    if (poll.uid !== req.user._id)
      return res.status(400).send("Not Authorized for this action");

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
      (selectionData) => selectionData.uid === uid
    );
    if (existingSelection) {
      // Update existing selection
      if (existingSelection.selection === selection) {
        poll.usersSelection.pull({ uid, selection });
      } else {
        existingSelection.selection = selection;
      }
    } else {
      // Add new selection
      poll.usersSelection.push({ uid, selection });
    }

    const updatedPoll = await poll.save();
    res.send(updatedPoll);
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
