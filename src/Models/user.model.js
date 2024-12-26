import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";

const UserSchema = new Schema(
  {
    UserName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    FullName: {
      type: String,
      required: true,
    },
    Email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    Password: {
      type: String,
      required: true,
    },
    WatchHistory: [{
      type: Schema.Types.ObjectId,
      ref: "Video",
    }],
    Avatar: {
      type: String, //cloudniary
      required: true,
    },
    CoverImage: {
      type: String,
    },
    RefreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (this.isModified("Password")) {
    this.Password = await bcrypt.hash(this.Password, 10);
    next();
  } else {
    next();
  }
});

UserSchema.methods.isPasswordCorrect = async function (Password) {
  return bcrypt.compare(Password, this.Password);
};

UserSchema.methods.generateAccessToken = async function () {
  return jsonwebtoken.sign(
    {
      _id: this._id,
      Username: this.UserName,
      FullName: this.FullName,
      Email: this.Email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "1d",
    }
  );
};
UserSchema.methods.generateRefreshToken = async function () {
  return jsonwebtoken.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "10d",
    }
  );
};

 const  User = mongoose.model("User", UserSchema);

 export default User
