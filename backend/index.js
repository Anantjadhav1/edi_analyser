// backend/index.js (FINAL POORA CODE)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// --- AI Setup ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const generationConfig = {
  temperature: 0.1, // Ekdum consistent result ke liye
  topP: 1,
  topK: 1,
  maxOutputTokens: 2048,
};
// -----------------

const app = express();
const PORT = 3001;
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// Main analysis function
async function analyzeText(fileContent) {
  
  // --- YEH HAI FIX (PROBLEM 2) ---
  // AI ko sahi LOCAL date batane ka
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // month 0 se start hota hai isliye +1
  const day = String(now.getDate()).padStart(2, '0');
  const todayDate = `${year}-${month}-${day}`; // Format: YYYY-MM-DD (Local)
  // -----------------------------

  const prompt = `
    The user is in Pune, India (IST, UTC+5:30). Today's local date is: ${todayDate}.

    Analyze the following message. Your response MUST be only a valid JSON object, starting with { and ending with }. Do not include any other text, explanations, or markdown formatting.
    The JSON object must have these exact keys: "messageType", "isImportant", "summary", "timestamp", and "keyFields".

    1. "messageType": Classify as ORDER, INVOICE, CANCEL, SHIPMENT, REJECTION, INVITATION, or UNKNOWN.
    
    2. "isImportant": A boolean (true or false). Mark as true if:
       - The message is a CANCEL or REJECTION.
       - The message contains URGENT language.
       - The event date you find is the *same* as today's local date (${todayDate}).
       Otherwise, mark as false.

    3. "summary": A one-sentence professional summary.

    4. "timestamp": This is CRITICAL. Find the *event* or *document* date mentioned in the email body (like the "4:00 PM" event time). 
       This event is in Pune (IST, UTC+5:30). You MUST return the date and time in the correct UTC ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ).
       For example, "November 4, 2025, at 4:00 PM" in Pune (IST) is "2025-11-04T10:30:00Z" in UTC.
       If no specific date is found in the content, return "N/A".

    5. "keyFields": An object containing important values (e.g., "eventName", "eventLocation").

    Here is the message:
    ---
    ${fileContent}
    ---
  `; // <--- Yeh backtick zaroori hai

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash", // Tera wala model
      generationConfig: generationConfig,
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    console.log("Raw AI Response:", text);
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');
    const jsonString = text.substring(startIndex, endIndex + 1);
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error processing AI response:', error);
    throw new Error('Failed to parse the analysis from AI.');
  }
}

// Apun ka API endpoint
app.post('/api/analyze', upload.single('ediFile'), async (req, res) => {
  let fileContent = "";

  if (req.file) {
    console.log("React app se file aayi");
    fileContent = req.file.buffer.toString('utf8');
  } else if (req.body.text) {
    console.log("Extension se text aaya");
    fileContent = req.body.text;
  } else {
    return res.status(400).json({ error: 'Koi file ya text nahi mila.' });
  }

  try {
    const analysisResult = await analyzeText(fileContent);
    res.json(analysisResult);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server http://localhost:${PORT} pe chalu hai`);
});