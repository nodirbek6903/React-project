const mongoose = require("mongoose")

const socialLinkSchema = new mongoose.Schema({
    instagram: String,
    linkedin: String,
    github: String,
    telegram: String,
},
{
    collection: "social-links",
})

const SocialLink = mongoose.model("SocialLink",socialLinkSchema)

module.exports = SocialLink
