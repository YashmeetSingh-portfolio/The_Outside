const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const PORT = 5000;

app.use(cors()); // Enable CORS for all origins
app.use(bodyParser.json()); // Parse JSON request bodies

// Replace with your OpenRouter API key
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Existing /ask endpoint
app.post('/ask', async (req, res) => {
    const { question } = req.body;

    try {
        const aiResponse = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: 'openai/gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: `You are a helpful AI that answers only space-related questions. First, check if the user's question is clearly related to astronomy, astrophysics, planets, stars, galaxies, space missions, black holes, or the universe. If it's not, reply briefly: "Sorry, this question doesn't seem to be space-related. Please ask something about space." Otherwise, answer concisely but informatively.`
                    },
                    { role: 'user', content: question }
                ]
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const answer = aiResponse.data.choices[0].message.content;
        res.json({ answer });

    } catch (error) {
        console.error('AI Error (ask endpoint):', error.response?.data || error.message);
        res.status(500).json({ answer: 'Failed to get a response from the AI model.' });
    }
});

// Existing /fact endpoint
app.post('/fact', async (req, res) => {
    try {
        const aiResponse = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: 'openai/gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: `You are a helpful AI that shares short but fascinating space-related facts. Each fact should be scientifically accurate, concise (1-2 sentences), and unique.`
                    },
                    {
                        role: 'user',
                        content: 'Give me one cool fact about space.'
                    }
                ]
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const fact = aiResponse.data.choices[0].message.content.trim();
        res.json({ fact });
    } catch (error) {
        console.error('AI Fact Error (fact endpoint):', error.response?.data || error.message);
        res.status(500).json({ fact: 'Unable to fetch space fact at this moment.' });
    }
});

// NEW: Endpoint to generate quiz questions (corrected response_format)
app.post('/quiz', async (req, res) => {
    const { theme, difficulty } = req.body;
    const numberOfQuestions = 5; // You can make this configurable if needed

    let promptTheme = theme;
    if (theme === 'random') {
        promptTheme = "a random fascinating space-related topic"; // Instruct AI to pick a random theme
    }

    try {
        const prompt = `Generate a ${numberOfQuestions} question multiple-choice quiz about ${promptTheme} with ${difficulty} difficulty. Each question should have exactly 4 options. Provide the correct answer.`;
        const systemInstruction = `You are an expert quiz master specializing in space and astronomy. Your task is to generate multiple-choice questions in JSON format. Ensure all questions are unique, accurate, and the options are distinct and plausible. Always provide exactly 4 options per question.

        The JSON response MUST be a single object with a 'questions' key, which is an array of question objects. Each question object MUST have the following keys:
        - "question": (string) The quiz question.
        - "options": (array of strings) An array containing exactly 4 multiple-choice options.
        - "correctAnswer": (string) The correct answer, which must be one of the provided options.

        Example of expected JSON structure:
        {
          "questions": [
            {
              "question": "Which planet is known as the Red Planet?",
              "options": ["Earth", "Mars", "Jupiter", "Venus"],
              "correctAnswer": "Mars"
            },
            {
              "question": "What is the largest moon of Saturn?",
              "options": ["Io", "Europa", "Titan", "Ganymede"],
              "correctAnswer": "Titan"
            }
          ]
        }`;

        const aiResponse = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: 'openai/gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: systemInstruction
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                response_format: {
                    type: "json_object"
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const responseContent = aiResponse.data.choices[0].message.content;

        let parsedData;
        try {
            parsedData = JSON.parse(responseContent);
        } catch (jsonError) {
            console.error("Failed to parse AI response as JSON:", jsonError);
            console.error("Raw AI response content:", responseContent);
            return res.status(500).json({ error: "AI returned malformed JSON. Please try again." });
        }

        if (parsedData && parsedData.questions && Array.isArray(parsedData.questions) && parsedData.questions.length > 0) {
            const isValid = parsedData.questions.every(q =>
                typeof q.question === 'string' &&
                Array.isArray(q.options) && q.options.length === 4 &&
                q.options.every(opt => typeof opt === 'string') &&
                typeof q.correctAnswer === 'string' &&
                q.options.includes(q.correctAnswer)
            );

            if (isValid) {
                res.json({ questions: parsedData.questions });
            } else {
                console.error("AI returned questions in unexpected valid JSON format:", parsedData);
                res.status(500).json({ error: "AI questions format is incorrect. Please try again." });
            }
        } else {
            console.error("AI returned questions in unexpected (but valid) JSON format or empty:", parsedData);
            res.status(500).json({ error: "AI did not return questions in the expected array format or returned an empty array." });
        }

    } catch (error) {
        console.error('AI Quiz Error (quiz endpoint):', error.response?.data || error.message);
        if (error.response && error.response.data && error.response.data.error) {
            res.status(500).json({ error: `Failed to generate quiz questions: ${error.response.data.error.message}` });
        } else {
            res.status(500).json({ error: 'Failed to generate quiz questions from the AI model.' });
        }
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
