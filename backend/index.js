// backend/index.js 
//receives the request from background.js
//reads the email text 
//sends to the api and returns the result to both background.js and index.js in JSON
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { GoogleGenerativeAI } = require("@google/generative-ai");


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const generationConfig = {
  temperature: 0.1, 
  topP: 1,
  topK: 1,
  maxOutputTokens: 2048,
};


const app = express();
const PORT = 3001;
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// Main analysis function
async function analyzeText(fileContent) {
  
  //current date
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayDate = `${year}-${month}-${day}`; // Format: YYYY-MM-DD (Local) 

  
  const prompt = `
    The user is in Pune, India (IST, UTC+5:30). Today's local date is: ${todayDate}.

    Analyze the following message. Your response MUST be only a valid JSON object, starting with { and ending with }. Do not include any other text, explanations, or markdown formatting.
    The JSON object must have these exact keys: "messageType", "isImportant", "summary", "timestamp", and "keyFields".

    1. "messageType": Classify as ORDER, INVOICE, CANCEL, SHIPMENT, REJECTION, INVITATION, or UNKNOWN.
    
    2. "timestamp": This is CRITICAL. Find the *event* or *document* date mentioned in the email body (like "4:00 PM" event time or "Thursday, 13 Nov 2025" deadline).
       This event is in Pune (IST, UTC+5:30). You MUST return the date and time in the correct UTC ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ).
       For example, "Thursday, 13 Nov 2025, 6:30 PM" in Pune (IST) is "2025-11-13T13:00:00Z" in UTC.
       If no specific date is found in the content, return "N/A".

    3. "isImportant": A boolean (true or false). Follow these rules IN ORDER:
       - First, look at the "timestamp" you found.
       - **Rule A (Expired):** If the "timestamp" is "N/A" or is *before* today's date (${todayDate}), it is EXPIRED. 'isImportant' MUST be 'false'.
       - **Rule B (Today/Future):** If the "timestamp" is *on or after* ${todayDate}, THEN check for these conditions:
         - The message is a CANCEL or REJECTION.
         - The message contains URGENT language.
         - **The event date is within the next 3 days from today (${todayDate}).** <--- YEH NAYA RULE HAI
         If any of these are true, set 'isImportant' to 'true'. Otherwise, set it to 'false'.

    4. "summary": A one-sentence professional summary.

    5. "keyFields": An object containing important values (e.g., "eventName", "eventLocation").

    Here is the message:
    ---
    ${fileContent}
    ---
  `; 

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash", 
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