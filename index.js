require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(express.json());
app.use(cors());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function queryGemini(prompt) {
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        const textResponse = response.text(); // Correct way to extract response
        return textResponse || "Sorry, I couldn't process that.";
        
    } catch (error) {
        console.error("Error querying Gemini:", error.message);
        return "An error occurred while processing your request.";
    }
}

app.post("/check-symptom", async (req, res) => {
    const symptoms = req.body.symptoms;
    const prompt = `A patient has the following symptoms: ${symptoms}. What possible illnesses could this indicate?`;
    const response = await queryGemini(prompt);
    res.json({ diagnosis: response });
});

app.post("/mental-health", async (req, res) => {
    const issue = req.body.issue;
    const prompt = `A user feels ${issue}. Provide mental health support advice.`;
    const response = await queryGemini(prompt);
    res.json({ support: response });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
