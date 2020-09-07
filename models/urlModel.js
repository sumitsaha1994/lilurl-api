const { Schema, model } = require("mongoose");

const URLSchema = new Schema(
    {
        user_ids: { type: [String], maxlength: 100 },
        main_url: { type: String, required: true },
        short_url: { type: String, required: true },
        alias: { type: String },
        click_count: { type: Number, default: 0 },
    },
    { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports = model("URL", URLSchema);
