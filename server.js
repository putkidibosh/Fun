const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
const mongoURI = "mongodb+srv://crashking999999_db_user:Maka_Vosda_Aghh%23tawhidmarufuganda@cluster0.rioeukl.mongodb.net/freefire_db?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(mongoURI)
    .then(() => console.log("🟢 MongoDB Connected Successfully!"))
    .catch(err => console.error("🔴 MongoDB Connection Error:", err));

// Mongoose Schema & Model
const videoSchema = new mongoose.Schema({
    url: { type: String, required: true, unique: true },
    addedAt: { type: Date, default: Date.now }
});

const Video = mongoose.model('Video', videoSchema);

// --- API Endpoints ---

// ১. নতুন ভিডিও লিঙ্ক সেভ করার API
app.post('/api/videos', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) return res.status(400).json({ success: false, message: "URL is required!" });
        if (!url.includes('catbox.moe')) return res.status(400).json({ success: false, message: "Only Catbox links are allowed!" });

        const newVideo = new Video({ url });
        await newVideo.save();
        res.status(201).json({ success: true, message: "Video link saved successfully!" });
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ success: false, message: "This link already exists!" });
        res.status(500).json({ success: false, message: "Server error!" });
    }
});

// ২. সব ভিডিও লিঙ্কের লিস্ট পাওয়ার API (ফিক্সড)
app.get('/api/videos', async (req, res) => {
    try {
        const videos = await Video.find({}).sort({ addedAt: -1 }).lean();
        res.json({ success: true, videos: videos || [] });
    } catch (error) {
        console.error("Error fetching videos:", error);
        res.status(500).json({ success: false, message: "Server error fetching links!" });
    }
});

// ৩. লিঙ্ক ডিলিট করার API
app.delete('/api/videos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Video.findByIdAndDelete(id);
        res.json({ success: true, message: "Link deleted successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error!" });
    }
});

// ৪. মোট কয়টি লিঙ্ক আছে তার সংখ্যা পাওয়ার API
app.get('/api/videos/count', async (req, res) => {
    try {
        const count = await Video.countDocuments();
        res.json({ success: true, count });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error!" });
    }
});

// ৫. GoatBot এর জন্য র‍্যান্ডম ভিডিও লিঙ্ক পাওয়ার API
app.get('/api/videos/random', async (req, res) => {
    try {
        const count = await Video.countDocuments();
        if (count === 0) return res.status(404).json({ success: false, message: "No videos found!" });
        
        const randomIndex = Math.floor(Math.random() * count);
        const randomVideo = await Video.findOne().skip(randomIndex);
        res.json({ success: true, url: randomVideo.url });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error!" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

