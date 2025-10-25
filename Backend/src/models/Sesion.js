import mongoose from "mongoose";

const sesionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        index: true
    },
    refreshToken: {
        type: String,
        required: true
    },
}, { timestamps: true });

//tu dong xoa khi het han
sesionSchema.index({ createdAt: 1 }, { expireAfterSeconds:0 }); // 14 ngay

export const Sesion = mongoose.model('Sesion', sesionSchema);