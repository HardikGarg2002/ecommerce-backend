import mongoose from "mongoose";
import { IHsn } from "../common/type/hsn";

const hsnSchema =new mongoose.Schema<IHsn>({
    code:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        index:true,
    },
    desc:{
        type:String,
        required:true,
        trim:true,

    },
    gst:{
        type:Number,
        required:true
    },
    is_active:{
        type:Boolean,
        default:true
    },
    created:{
        _id:{
            type:mongoose.Schema.Types.ObjectId,
            immutable: true
        },
        name:{
            type: String,
            immutable: true
        },
        date:{
            type: Date,
            default:Date.now,
            immutable: true
        }
    },
    updated:{
        _id:{
            type:mongoose.Schema.Types.ObjectId
        },
        name:{
            type: String
        },
        date:{
            type: Date,
            default:Date.now
        }
    },
})

export default mongoose.model<IHsn>('hsns',hsnSchema);