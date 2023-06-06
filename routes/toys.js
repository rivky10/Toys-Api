const express = require("express");
const { auth} = require("../middlewares/auth")
const { ToyModel, validateToy } = require("../models/toyModel")
const router = express.Router();

router.get("/", async (req, res) => {
    let perPage = req.query.perPage || 10;
    let page = req.query.page || 1;
    let sort = req.query.sort || "_id";
    let reverse = req.query.reverse == "yes" ? -1 : 1;

    try {
        let data = await ToyModel
            .find({})
            .limit(perPage)
            .skip((page - 1) * perPage)
            .sort({ [sort]: reverse })
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ msg: "There is error try again later" })
    }
})

router.get("/search", async (req, res) => {
    try {
        let queryS = req.query.s;
        let searchReg = new RegExp(queryS,"i")
        let data = await ToyModel.find({$or: [
            { name: searchReg },
            { info: { $regex: searchReg} }
          ]})
        .limit(10)
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ msg: "There is error try again later" }, err)
    }
})

router.get("/category/:catName", async (req, res) => {
    try {
        let catName = req.params.catName;
        let searchReg = new RegExp(catName,"i")
        let data = await ToyModel.find({category:searchReg})
            .limit(10);
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ msg: "There is error try again later" }, err)
    }
})

router.get("/single/:id", async (req, res) => {
    try {
        let toyId = req.params.id;
        let data = await ToyModel.find({_id:toyId})
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ msg: "There is error try again later" }, err)
    }
})

router.get("/prices", async (req, res) => {
    let min = req.query.min || 0;
    let max = req.query.max || Infinity;
    let data = await ToyModel.find({ price: {
        $gte: Number(min),
        $lte: Number(max)
      }})
    res.json(data);
})

router.post("/", auth, async (req, res) => {
    let validBody = validateToy(req.body);
    if (validBody.error) {
        return res.status(400).json(validBody.error.details);
    }
    try {
        let toy = new ToyModel(req.body);
        toy.user_id = req.tokenData._id;
        await toy.save();
        res.status(201).json(toy);
    }
    catch (err) {
        res.status(500).json({ msg: "There is error try again later" }, err)
    }
})

router.put("/:editId", auth, async (req, res) => {
    let validBody = validateToy(req.body);
    if (validBody.error) {
        return res.status(400).json(validBody.error.details);
    }
    try {
        let editId = req.params.editId;
        let data;
        if (req.tokenData.role == "admin") {
            data = await ToyModel.updateOne({ _id: editId }, req.body)
        }
        else {
            data = await ToyModel.updateOne({ _id: editId, user_id: req.tokenData._id }, req.body)
        }
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "there error try again later", err })
    }
})

router.delete("/:delId", auth, async (req, res) => {
    try {
        let delId = req.params.delId;
        let data;
        if (req.tokenData.role == "admin") {
            data = await ToyModel.deleteOne({ _id: delId })
        }
        else {
            data = await ToyModel.deleteOne({ _id: delId, user_id: req.tokenData._id })
        }
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "there error try again later", err })
    }
})

module.exports = router;