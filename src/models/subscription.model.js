import mongoose, {schema} from "mongoose"

const subscriptionSchema = new Schema({
    subscriber:{
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    channel:{
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, {timestamps: true})


export const Subscription = mongoose.model("Subscription", subscriptionSchema)