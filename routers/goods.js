const express = require("express");
const Goods = require("../schemas/Goods");

const router = express.Router();

router.get("/goods", async (req, res, next) => {
  try {
    const { category } = req.query;
    console.log(req);
    const goods = await Goods.find({ category }).sort("-goodsId");
    res.json({ goods: goods });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get("/goods/:goodsId", async (req, res) => {
  const { goodsId } = req.params;
  goods = await Goods.findOne({ goodsId: goodsId });
  res.json({ detail: goods });
});

module.exports = router;