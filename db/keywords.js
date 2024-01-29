const mongoose = require("mongoose");

const KeywordSchema = new mongoose.Schema({
    name: { type: String, unique: true },
    squeals: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Squeals",
        },
    ],
});

const Keyword = mongoose.model("Keyword", KeywordSchema);

exports.getAllSquealsByKeyword = async function (keyword) {
    const res = await Keyword.find({ name: keyword }).populate("squeals");
    return res;
};

exports.searchKeyword = async function (property, query) {
    const user = await Keyword.where(property)
        .equals(new RegExp(query, "i"))
        .exec();
    return user;
};

exports.addOrGet = async function (keyword) {
    const k = await Keyword.findOne({ name: keyword });
    if (!k) {
        const newKeyword = new Keyword({ name: keyword });
        await newKeyword.save();
        return newKeyword._id;
    }
    return k._id;
};

exports.addSquealToKeyword = async function (keyword, squeal) {
    const keywordObj = await Keyword.findOne({ name: keyword });
    if (!keywordObj) {
        const newKeyword = new Keyword({ name: keyword });
        newKeyword.squeals.push(squeal);
        newKeyword.save();
        return newKeyword._id;
    }
    keywordObj.squeals.push(squeal);
    keywordObj.save();
    return keywordObj._id;
};

exports.searchKeywordByID = async function (id) {
    const keyword = await Keyword.findById(id);
    return keyword;
};
