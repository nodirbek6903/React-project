const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Table = require("./data/database");

app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://Nodirbek6903:nyIZtfjTgorkpzkB@cluster0.an9zyql.mongodb.net/?retryWrites=true&w=majority";
const PORT = process.env.PORT || 5000;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// register
app.post("/signup", async (req, res) => {
  console.log(req.body);
  try {
    const existsingUser = await User.findOne({ email: req.body.email });
    if (existsingUser) {
      return res.json({ status: "error", error: "Dublicate email" });
    }
    const newPassword = await bcrypt.hash(req.body.password, 10);
    await User.create({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      password: newPassword,
    });
    const token = jwt.sign(
        {email: User.email, id:User.id},
        "secret123",
        {expiresIn: "1h"}
    )

    res.json({ status: "ok", token: token });
  } catch (error) {
    console.log(error);
    res.json({ status: "error", error: "Internal server error!" });
  }
});
// login
app.post("/signin", async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
      // password: req.body.password,
    });

    if (!user) {
      return res.json({ status: "error", error: "User not found" })
    }

    const isPasswordValid = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (isPasswordValid) {
      const token = jwt.sign(
        {
          email: user.email,
          password: user.password,
        },
        "secret123"
      );
      return res.json({ status: "ok", token: token });
    }
    else {
      return res.json({ status: "error", error: "Invalid password" });
    }
  } catch (error) {
    console.error(error);
    return res.json({ status: "error", error: "Internal server error" });
  }
});

// Table uchun

app.post("/profile",async (req,res) => {
  try {
    const newData = new Table(req.body)
    await newData.save()
    res.status(201).json({status: "ok",success: true, message: "Malumot saqlandi"})
  } catch (error) {
    console.error(error)
    res.status(500).json({status: "error",success: false,message: "Malumot yuborilmadi.Xatolik yuz berdi"})
  }
})
app.get("/table",async (req,res) => {
  try{
    const data = await Table.find()
    res.status(200).json(data)
  }catch(error){
    console.error(error)
    res.status(500).json({success: false,message:"Xatolik yuz berdi"})
  }
})



app.listen(PORT, () => {
  console.log(`server started ${PORT}`);
});

