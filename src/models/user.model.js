import { Schema, model } from "mongoose";




const userSchema = new Schema({
    name: {
        type: String
    },
    email: {
        type:String,
        required: true,
        unique: true,
        lowercases: true,
        trim: true
    },

    passwordHash: {
        type:String,
        required: true,
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    avatar: {
        type: String,
    },
   
   
},{
    timestamps: true
});



export const User = model('User', userSchema)