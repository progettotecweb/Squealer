const fs = require("fs");
const mongoose = require("mongoose");
const path = require("path");

const { server_log } = require("../utils/utils.js");

const keywordsSchema = new mongoose.Schema({
    name: {type:String, unique: true },
    squeals: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Squeals",
        },
    ],
});

const Keywords = mongoose.model("Keywords", keywordsSchema);

exports.getAllSquealsByKeyword = async function (keyword) {
    const res = await Keywords.find({ name: keyword }).populate("squeals");
    return res;
}

exports.searchKeyword = async function (property, query) {
    const user = await Keywords.where(property)
        .equals(new RegExp(query, "i"))
        .exec();
    return user;
};

exports.addSquealToKeyword = async function (keyword, squeal) {
    const keywordObj = await Keywords.findOne({ name: keyword });
    if(!keywordObj) {
        const newKeyword = new Keywords({name: keyword});
        newKeyword.squeals.push(squeal);
        newKeyword.save();
        return newKeyword._id;
    }
    keywordObj.squeals.push(squeal);
    keywordObj.save();
    return keywordObj._id;
}

exports.searchKeywordByID = async function (id) {
    const keyword = await Keywords.findById(id);
    return keyword;
}