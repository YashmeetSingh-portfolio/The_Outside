const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config(); // Load environment variables from .env
const admin = require('firebase-admin'); // Firebase Admin SDK

// --- MongoDB Imports and Connection Setup ---
const { MongoClient, ServerApiVersion } = require('mongodb');

// Get MongoDB URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

// Check if MONGODB_URI is provided
if (!MONGODB_URI) {
    console.error('ERROR: MONGODB_URI is missing in .env file. Please set it to connect to MongoDB Atlas.');
    process.exit(1); // Exit if database connection string is not found
}

let db; // Global variable to store the MongoDB database connection instance

// Function to connect to MongoDB Atlas
async function connectToMongo() {
    try {
        const client = new MongoClient(MONGODB_URI, {
            serverApi: {
                version: ServerApiVersion.v1, // Specify MongoDB API version
                strict: true,
                deprecationErrors: true,
            }
        });
        await client.connect(); // Establish connection to MongoDB Atlas
        console.log("Successfully connected to MongoDB Atlas!");
        // Select the database to use. If it doesn't exist, MongoDB will create it on first write.
        db = client.db("the_outside_db"); // You can name your database whatever you like here
    } catch (error) {
        console.error("Error connecting to MongoDB Atlas:", error);
        // If the database connection fails, the application cannot function correctly, so exit.
        process.exit(1);
    }
}
// --- END MongoDB Connection Setup ---

const app = express();
let PORT = 5000; // Default port, with retry logic for EADDRINUSE

app.use(cors()); // Enable CORS for all routes (important for frontend-backend communication)
app.use(bodyParser.json()); // Parse JSON request bodies

// --- Firebase Admin SDK Initialization ---
const serviceAccount = require('./firebase-admin-sdk.json'); // Path to your Firebase Admin SDK service account key file

try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin SDK initialized successfully.');
} catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error.message);
    process.exit(1);
}

// --- Middleware for Firebase ID Token Verification ---
const authenticateFirebaseToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No authentication token provided. Authorization header missing or malformed.' });
    }
    const idToken = authHeader.split('Bearer ')[1];
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Error verifying Firebase ID token:', error.message);
        return res.status(403).json({ error: 'Unauthorized. Invalid or expired authentication token.' });
    }
};

// --- API Key setup for external services ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const NASA_API_KEY = process.env.NASA_API_KEY;

if (!GEMINI_API_KEY) {
    console.error('ERROR: GEMINI_API_KEY is missing in .env file');
    process.exit(1);
}
if (!NASA_API_KEY) {
    console.error('ERROR: NASA_API_KEY is missing in .env file');
    process.exit(1);
}

const GEMINI_BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
const NASA_APOD_BASE_URL = 'https://api.nasa.gov/planetary/apod';

const geminiHeaders = {
    'Content-Type': 'application/json'
};

// --- Existing API Endpoints (from your previous code) ---

app.get('/api/apod', async (req, res) => {
    const { date } = req.query;
    try {
        let apodUrl = `${NASA_APOD_BASE_URL}?api_key=${NASA_API_KEY}`;
        if (date) {
            apodUrl += `&date=${date}`;
        }
        const response = await axios.get(apodUrl);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching APOD from NASA:', error.response?.data || error.message);
        const errorMessage = error.response?.data?.msg || 'Failed to fetch Astronomy Picture of the Day from NASA.';
        res.status(error.response?.status || 500).json({ error: errorMessage });
    }
});

app.post('/ask', authenticateFirebaseToken, async (req, res) => {
    const { question } = req.body;
    console.log(`Protected /ask endpoint accessed by user UID: ${req.user.uid}`);
    console.log(`User email: ${req.user.email}`);

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
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: "OBJECT",
                        properties: {
                            isSpaceThemed: { type: "BOOLEAN" },
                            responseMessage: { type: "STRING" }
                        },
                        required: ["isSpaceTheemed", "responseMessage"]
                    },
                    temperature: 0.2,
                    maxOutputTokens: 250
                }
            },
            { headers: geminiHeaders }
        );

        const responseDataString = response.data.candidates[0]?.content?.parts[0]?.text;

        if (responseDataString) {
            const parsedResponse = JSON.parse(responseDataString);
            res.json({ answer: parsedResponse.responseMessage });
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

app.post('/fact', authenticateFirebaseToken, async (req, res) => {
    const { forbiddenFacts = [] } = req.body;
    let promptText = 'Provide one short (1-2 sentence) accurate, and interesting space fact. Do not include any introductory phrases like "Here is a fact" or "Did you know?". Just the fact.';

    if (forbiddenFacts.length > 0) {
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
                        parts: [{ text: promptText }]
                    }
                ],
                generationConfig: {
                    temperature: 0.8,
                    maxOutputTokens: 100
                }
            },
            { headers: geminiHeaders }
        );

        const fact = response.data.candidates[0]?.content?.parts[0]?.text?.trim();
        if (fact) {
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

app.post('/quiz', authenticateFirebaseToken, async (req, res) => {
    const { theme = 'space', difficulty = 'medium' } = req.body;

    let promptText;
    // Modified prompt based on whether theme is 'random' or specific
    if (theme === 'random') {
        promptText = `Generate 5 multiple-choice quiz questions with 4 options each about various, distinct aspects of space (e.g., planets, stars, galaxies, missions, black holes, exoplanets, cosmology, space history, rockets). Ensure each question is from a potentially different sub-theme of space. Difficulty: ${difficulty}. Ensure the output is in the following JSON format: { "questions": [ { "question": "...", "options": ["...", "..."], "correctAnswer": "..." } ] }`;
    } else {
        promptText = `Generate 5 multiple-choice quiz questions with 4 options each about ${theme}. Difficulty: ${difficulty}. Ensure the output is in the following JSON format: { "questions": [ { "question": "...", "options": ["...", "..."], "correctAnswer": "..." } ] }`;
    }

    try {
        const response = await axios.post(
            GEMINI_BASE_URL,
            {
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: promptText }]
                    }
                ],
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: {
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

app.get('/api/protected-data', authenticateFirebaseToken, (req, res) => {
    res.json({
        message: 'You have successfully accessed protected data!',
        uid: req.user.uid,
        email: req.user.email,
        name: req.user.name || 'N/A'
    });
});

// --- MongoDB Atlas Endpoints for User Profiles ---
app.post('/api/profiles', async (req, res) => {
    const { firebaseUid, fullName, email } = req.body;

    if (!firebaseUid || !fullName || !email) {
        return res.status(400).json({ error: 'Missing required fields: firebaseUid, fullName, email.' });
    }

    try {
        if (!db) {
            console.error('MongoDB database connection not established.');
            return res.status(500).json({ error: 'Database not connected.' });
        }
        const profilesCollection = db.collection('profiles');

        const result = await profilesCollection.updateOne(
            { _id: firebaseUid },
            {
                $set: {
                    full_name: fullName,
                    email: email,
                    updated_at: new Date(),
                },
                $setOnInsert: {
                    xp: 0,
                    created_at: new Date(),
                }
            },
            { upsert: true }
        );

        if (result.upsertedCount > 0) {
            res.status(201).json({ message: 'Profile created successfully.', profileId: firebaseUid });
        } else {
            res.status(200).json({ message: 'Profile updated successfully.', profileId: firebaseUid });
        }

    } catch (error) {
        console.error('Error in /api/profiles POST endpoint:', error);
        res.status(500).json({ error: 'Failed to create or update profile.', details: error.message });
    }
});

app.get('/api/profiles/:firebaseUid', async (req, res) => {
    const firebaseUid = req.params.firebaseUid;

    if (!firebaseUid) {
        return res.status(400).json({ error: 'Firebase UID is required.' });
    }

    try {
        if (!db) {
            console.error('MongoDB database connection not established.');
            return res.status(500).json({ error: 'Database not connected.' });
        }
        const profilesCollection = db.collection('profiles');
        const profile = await profilesCollection.findOne({ _id: firebaseUid });

        if (profile) {
            res.status(200).json(profile);
        } else {
            res.status(404).json({ error: 'Profile not found.' });
        }

    } catch (error) {
        console.error('Error in /api/profiles/:firebaseUid GET endpoint:', error);
        res.status(500).json({ error: 'Failed to fetch profile.', details: error.message });
    }
});

app.put('/api/profiles/:firebaseUid/add-xp', authenticateFirebaseToken, async (req, res) => {
    const firebaseUid = req.params.firebaseUid;
    const { xpToAdd } = req.body;

    if (req.user.uid !== firebaseUid) {
        return res.status(403).json({ error: 'Forbidden: You can only update your own profile XP.' });
    }

    if (typeof xpToAdd !== 'number' || !Number.isInteger(xpToAdd)) {
        return res.status(400).json({ error: 'Invalid XP amount. Must be an integer number.' });
    }

    try {
        if (!db) {
            console.error('MongoDB database connection not established.');
            return res.status(500).json({ error: 'Database not connected.' });
        }
        const profilesCollection = db.collection('profiles');

        const result = await profilesCollection.updateOne(
            { _id: firebaseUid },
            {
                $inc: { xp: xpToAdd },
                $set: { updated_at: new Date() }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Profile not found to update XP.' });
        }

        const updatedProfile = await profilesCollection.findOne({ _id: firebaseUid });
        res.status(200).json({ message: 'XP updated successfully.', newXp: updatedProfile.xp });

    } catch (error) {
        console.error('Error in /api/profiles/:firebaseUid/add-xp PUT endpoint:', error);
        res.status(500).json({ error: 'Failed to update XP.', details: error.message });
    }
});
// --- END MongoDB Atlas Endpoints ---


// --- Server Start Logic ---
async function startApp() {
    await connectToMongo();
    app.listen(PORT, () => {
        console.log(`Backend Server running on http://localhost:${PORT}`);
        console.log('Available API endpoints:');
        console.log(`- GET /api/apod (Astronomy Picture of the Day - Public)`);
        console.log(`- POST /ask (Question answering - PROTECTED)`);
        console.log(`- POST /fact (Get space facts - PROTECTED)`);
        console.log(`- POST /quiz (Generate space quizzes - PROTECTED)`);
        console.log(`- GET /api/protected-data (Example Protected Route - PROTECTED)`);
        console.log(`- POST /api/profiles (Create/Update user profile - Publicly accessible for signup)`);
        console.log(`- GET /api/profiles/:firebaseUid (Get user profile - Consider protecting)`);
        console.log(`- PUT /api/profiles/:firebaseUid/xp (Update user XP - PROTECTED)`); // New XP endpoint
        console.log(`- PUT /api/profiles/:firebaseUid/add-xp (Add XP to user profile - PROTECTED)`); // New XP endpoint
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Port ${PORT} is already in use. Trying port ${PORT + 1}...`);
            PORT++;
            startApp();
        } else {
            console.error('Server error:', err);
            process.exit(1);
        }
    });
}

// Initiate the application start process
startApp();
