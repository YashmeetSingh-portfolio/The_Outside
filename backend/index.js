const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
let PORT = 5000; // Let's make PORT mutable so we can try other ports

app.use(cors());
app.use(bodyParser.json());

// Get API key from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.error('ERROR: GEMINI_API_KEY is missing in .env file');
    process.exit(1);
}

// Base URL for Gemini API
const GEMINI_BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// Common headers for Gemini API (Content-Type is usually sufficient as key is in URL)
const geminiHeaders = {
    'Content-Type': 'application/json'
};

// 1. Question Answering Endpoint
app.post('/ask', async (req, res) => {
    const { question } = req.body;

    if (!question) {
        return res.status(400).json({ error: "Question is required" });
    }

    try {
        const response = await axios.post(
            GEMINI_BASE_URL,
            {
                contents: [
                    {
                        role: 'user',
                        parts: [
                            {
                                text: `Analyze the following question: "${question}".
                                If the question is about space, provide a short, simple, and direct answer (2-3 sentences maximum) using basic words, without any markdown formatting like asterisks (*), hashtags (#), or backticks (\`).
                                If the question is NOT about space, respond with appropriate message to make user aware that the question is not space themed and to ask a space themed question"
                                Always provide your response in the following JSON format:
                                { "isSpaceThemed": true/false, "responseMessage": "Your answer or the predefined message" }`
                            }
                        ]
                    }
                ],
                generationConfig: {
                    responseMimeType: "application/json", // Instruct Gemini to return JSON
                    responseSchema: { // Define the expected JSON structure
                        type: "OBJECT",
                        properties: {
                            isSpaceThemed: { type: "BOOLEAN" },
                            responseMessage: { type: "STRING" }
                        },
                        required: ["isSpaceThemed", "responseMessage"]
                    },
                    temperature: 0.2, // Keep temperature low for more direct responses and classification
                    maxOutputTokens: 250 // Limit output tokens to ensure brevity for answers/messages
                }
            },
            { headers: geminiHeaders }
        );

        const responseDataString = response.data.candidates[0]?.content?.parts[0]?.text;

        if (responseDataString) {
            const parsedResponse = JSON.parse(responseDataString);
            res.json({ answer: parsedResponse.responseMessage }); // Send back only the message
        } else {
            console.error("Gemini API did not return expected content for /ask (structured output):", response.data);
            res.status(500).json({ error: "Failed to get answer: Gemini API response unexpected." });
        }

    } catch (error) {
        console.error("Gemini Error (/ask):", {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        res.status(500).json({
            error: "Failed to get answer",
            details: error.response?.data?.error?.message || error.message
        });
    }
});

// 2. Space Fact Generator
app.post('/fact', async (req, res) => {
    // Receive the forbiddenFacts array from the frontend
    const { forbiddenFacts = [] } = req.body;

    // Construct the base prompt
    let promptText = 'Provide one short (1-2 sentence) accurate, and interesting space fact. Do not include any introductory phrases like "Here is a fact" or "Did you know?". Just the fact.';

    // If there are forbidden facts, add them to the prompt
    if (forbiddenFacts.length > 0) {
        // Format facts for the prompt to clearly tell the model to avoid them
        const factsList = forbiddenFacts.map(fact => `"${fact}"`).join(', ');
        promptText += ` Ensure the fact is NOT one of the following: ${factsList}.`;
    }

    try {
        const response = await axios.post(
            GEMINI_BASE_URL,
            {
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: promptText }] // Use the dynamically constructed prompt
                    }
                ],
                generationConfig: {
                    temperature: 0.8, // Slightly higher temp for varied facts
                    maxOutputTokens: 100 // Keep it short
                }
            },
            { headers: geminiHeaders }
        );

        const fact = response.data.candidates[0]?.content?.parts[0]?.text?.trim();
        if (fact) {
            // Remove any potential leading/trailing quotes or markdown the model might still add
            const cleanFact = fact.replace(/^["'`\s]+|["'`\s]+$/g, '');
            res.json({ fact: cleanFact });
        } else {
            console.error("Gemini API did not return expected content for /fact:", response.data);
            res.status(500).json({ fact: "Failed to fetch space fact: Gemini API response unexpected." });
        }

    } catch (error) {
        console.error('Gemini Error (/fact):', error.response?.data || error.message);
        res.status(500).json({ fact: "Failed to fetch space fact" });
    }
});

// 3. Quiz Generator
app.post('/quiz', async (req, res) => {
    const { theme = 'space', difficulty = 'medium' } = req.body;

    try {
        const response = await axios.post(
            GEMINI_BASE_URL,
            {
                contents: [
                    {
                        role: 'user',
                        // Instructing the model to output JSON directly within the prompt
                        parts: [{ text: `Generate 5 multiple-choice quiz questions with 4 options each about ${theme}. Difficulty: ${difficulty}. Ensure the output is in the following JSON format: { "questions": [ { "question": "...", "options": ["...", "..."], "correctAnswer": "..." } ] }` }]
                    }
                ],
                generationConfig: {
                    responseMimeType: "application/json", // This tells Gemini to attempt to return valid JSON
                    responseSchema: { // Defines the expected JSON structure
                        type: "OBJECT",
                        properties: {
                            questions: {
                                type: "ARRAY",
                                items: {
                                    type: "OBJECT",
                                    properties: {
                                        question: { type: "STRING" },
                                        options: { type: "ARRAY", items: { type: "STRING" } },
                                        correctAnswer: { type: "STRING" }
                                    },
                                    required: ["question", "options", "correctAnswer"]
                                }
                            }
                        },
                        required: ["questions"]
                    },
                    temperature: 0.5
                }
            },
            { headers: geminiHeaders }
        );

        // Parse the JSON string from the response
        const quizDataString = response.data.candidates[0]?.content?.parts[0]?.text;
        if (quizDataString) {
            const quizData = JSON.parse(quizDataString);
            res.json(quizData);
        } else {
            console.error("Gemini API did not return expected content for /quiz:", response.data);
            res.status(500).json({ error: "Quiz generation failed: Gemini API response unexpected." });
        }

    } catch (error) {
        console.error('Gemini Error (/quiz):', {
            error: error.response?.data || error.message,
            request: { theme, difficulty }
        });
        res.status(500).json({
            error: "Quiz generation failed",
            details: error.response?.data?.error?.message || "Internal server error"
        });
    }
});



// This for server keeping.
const SELF_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;


// Start server with port retry logic
function startServer(port) {
    app.listen(port, () => {
        console.log(`Server running on ${SELF_URL}`);
        console.log('Available endpoints:');
        console.log(`- POST /ask (Question answering)`);
        console.log(`- POST /fact (Get space facts)`);
        console.log(`- POST /quiz (Generate space quizzes)`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Port ${port} is already in use. Trying port ${port + 1}...`);
            startServer(port + 1); // Try the next port
        } else {
            console.error('Server error:', err);
        }
    });
}

startServer(PORT);






// This for server keeping.
setInterval(() => {
    try{

        https.get(SELF_URL, (res) => {
            console.log("Self-ping successful");
        });
    }catch(error){
        console.log(error);
    }
}, 1000 * 60 * 4); // Every 4 minutes