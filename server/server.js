const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Table = require("./data/database");
const SocialLink = require("./SocialLinks/social_link")
const multer = require("multer")

app.use(cors());
app.use(express.json());


const uri =
  "mongodb+srv://Nodirbek6903:nyIZtfjTgorkpzkB@cluster0.an9zyql.mongodb.net/test?retryWrites=true&w=majority";
const PORT = process.env.PORT || 5000;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });


const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ error: 'Authorization token not provided' });
  }

  try {
    const decoded = jwt.verify(token, 'secret123');
    req.user = decoded;
    next();
  } catch (error) {
    console.error(error);
    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({ error: 'Invalid token' });
    } else {
      res.status(500).json({ error: 'Internal Server error' });
    }
  }
};

// register
app.post("/signup", async (req, res) => {
  console.log(req.body);
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.json({ status: "error", error: "Duplicate email" });
    }

    const newPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = await User.create({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      username: req.body.username,
      email: req.body.email,
      password: newPassword,
      editpassword: req.body.password
    });

    const token = jwt.sign(
      { email: req.body.email, id: newUser.id, username: req.body.username },
      "secret123",
      { expiresIn: "168h" }
    );
    res.json({ status: "ok", token: token });

  } catch (error) {
    console.error(error);
    res.json({ status: "error", error: "Internal server error!" });
  }
});

// login
app.post("/signin", async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
    });

    if (!user) {
      return res.json({ status: "error", error: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (isPasswordValid) {
      // Token yaratish
      const token = jwt.sign(
        { email: user.email, id: user.id, username: user.username },
        "secret123",
        { expiresIn: "168h" }
      );
      
      return res.json({ status: "ok", token: token });
    } else {
      return res.json({ status: "error", error: "Invalid password" });
    }
  } catch (error) {
    console.error(error);
    return res.json({ status: "error", error: "Internal server error" });
  }
});

// myprofile
app.get('/user/:username', authenticateToken, async (req, res) => {
  try {
    const { email, id, username,firstname,lastname,password } = req.user;

    const user = await User.findById(id);

    if (user) {
      res.json({
        id: user._id,
        firstname: user.firstname,
        lastname:user.lastname,
        username: user.username,
        email: user.email,
        password:user.password
      });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server error' });
  }
});
//edit  profile get qismi
app.get('/user-edit/:username', authenticateToken, async (req, res) => {
  try {
    const { firstname,lastname,password, email, id, username } = req.user;

    const user = await User.findById(id);

    if (user) {
      res.json({
        id: user._id,
        firstname: user.firstname,
        lastname:user.lastname,
        username: user.username,
        email: user.email,
        password:user.password
      });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server error' });
  }
});

// edit profile put qismi
app.put("/user-edit/:username",authenticateToken, async (req, res) => {
  try {
    const username = req.params.username;
    const updatedData = req.body;

    const data = await User.findOneAndUpdate({ username: username }, updatedData, { new: true });

    if (!data) {
      return res.status(404).json({ error: "Malumot topilmadi" });
    } else {
      res.json(data);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server xatosi" });
  }
});

// social links

app.post("/social-links",authenticateToken, async (req,res) => {
  try {
    const newData = new SocialLink(req.body);
    await newData.save();
    res.status(201).json({ status: "ok", success: true, message: "Malumot saqlandi" });

    const token = jwt.sign(
      { email: req.body.email, id: newUser.id, username: req.body.username },
      "secret123",
      { expiresIn: "168h" }
    );
    res.json({ status: "ok", token: token,success: true, message: "Malumot saqlandi"});

  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      success: false,
      message: "Malumot yuborilmadi.Xatolik yuz berdi",
    });
  }
})

app.get("/links",authenticateToken, async (req,res) => {
  try {
    const data = await SocialLink.find();
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Xatolik yuz berdi" });
  }
})


// Table uchun

app.post("/profile", async (req, res) => {
  try {
    const newData = new Table(req.body);
    await newData.save();
    res.status(201).json({ status: "ok", success: true, message: "Malumot saqlandi" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      success: false,
      message: "Malumot yuborilmadi.Xatolik yuz berdi",
    });
  }
});
app.get("/table", async (req, res) => {
  try {
    const data = await Table.find();
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Xatolik yuz berdi" });
  }
});
// table edit
app.get("/table/edit/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Table.findById(id);

    if (!data) {
      return res.status(404).json({ error: "Malumot topilmadi." });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Server xatosi." });
  }
});

app.put("/table/edit/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updatedData = req.body;

    const data = await Table.findByIdAndUpdate(id, updatedData, { new: true });

    if (!data) {
      return res.status(404).json({ error: "Malumot topilmadi" });
    }
    else{
      res.json(data)
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server xatosi" });
  }
});
// table delete
app.post("/deleteData", async (req, res) => {
  const { id } = req.body;
  try {
    await Table.deleteOne({ _id: id });
    res.send({ status: "ok", success: "Data Deleted" });
  } catch (error) {
    console.error("Malumotni o'chirishda xatolik yuz berdi:", error);
    res
      .status(500)
      .send({
        status: "error",
        success: false,
        message: "Server xatoligi yuz berdi.",
      });
  }
});

app.listen(PORT, () => {
  console.log(`server started ${PORT}`);
});
