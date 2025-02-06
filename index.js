require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const prompt = "Does this look store-bought or homemade?";


const result = await model.generateContent([prompt]);
console.log(result.response.text());

const app = express();
app.use(express.json());
app.use(cors());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateText?key=${GEMINI_API_KEY}`;

async function queryGemini(prompt) {
    try {
        const response = await axios.post(
            GEMINI_URL,
            { prompt: { text: prompt } }, 
            { headers: { "Content-Type": "application/json" } }
        );

        const textResponse = response.data?.candidates?.[0]?.output;
        return textResponse || "Sorry, I couldn't process that.";
        
    } catch (error) {
        console.error("Error querying Gemini:", error.response?.data || error.message);
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
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
