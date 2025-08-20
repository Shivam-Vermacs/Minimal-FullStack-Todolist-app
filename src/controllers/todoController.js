const Todo = require("../models/Todo");
const { success, fail } = require("../utils/responses");

async function list(req, res, next) {
  try {
    const todos = await Todo.find({ user: req.userId }).sort({ createdAt: -1 });
    return success(res, todos);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const text = ((req.body && req.body.text) || "").trim();
    if (!text) return fail(res, "Text is required");

    const todo = await Todo.create({ user: req.userId, text });
    return success(res, todo, 201);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const payload = {};
    if ("text" in req.body) {
      const t = (req.body.text || "").trim();
      if (!t) return fail(res, "Text cannot be empty");
      payload.text = t;
    }
    if ("completed" in req.body) {
      payload.completed = !!req.body.completed;
    }

    if (!Object.keys(payload).length) {
      return fail(res, "Nothing to update");
    }

    const updated = await Todo.findOneAndUpdate(
      { _id: id, user: req.userId },
      { $set: payload },
      { new: true }
    );

    if (!updated) return fail(res, "Todo not found", 404);
    return success(res, updated);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await Todo.findOneAndDelete({ _id: id, user: req.userId });
    if (!deleted) return fail(res, "Todo not found", 404);
    return success(res, { id: deleted._id });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, update, remove };
