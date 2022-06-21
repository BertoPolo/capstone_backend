import mongoos from "mongoose";

const { Schema , model} = mongoose

const usersSchema = new Schema(
    {


    },
  { timestamps: true }
)

export default model ("Users", usersSchema)