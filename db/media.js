const mongoose = require("mongoose");

const MediaSchema = new mongoose.Schema({
    mimetype: String,
    data: String,
    name: String,
});

const Media = mongoose.model("Media", MediaSchema)

exports.getDefaultProfilePicture = async function () {
    const pic = await Media.findOne({ name: "default_img" }, "_id")

    return pic._id
}

exports.addNewMedia = async function (mimetype, data) {
    const media = new Media({
        mimetype,
        data
    })

    await media.save()

    return media._id
}

exports.getMediaByID = async function (id) {
    return await Media.findById(id)
}

exports.deleteMediaByID = async function (id) {
    return await Media.findByIdAndDelete(id)
}


