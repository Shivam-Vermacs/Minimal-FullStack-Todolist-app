const express = require("express");
const auth = require("../middleware/auth");
const {
  list,
  create,
  update,
  remove,
} = require("../controllers/todoController");

const router = express.Router();

router.use(auth);

router.get("/", list);
router.post("/", create);
router.patch("/:id", update);
router.delete("/:id", remove);

module.exports = router;
