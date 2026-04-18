import { GoogleGenAI } from '@google/genai';

// Controller to handle chat requests
export const handleChat = async (req, res, next) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        // Check if API key is configured
        if (!process.env.GEMINI_API_KEY) {
            console.error('GEMINI_API_KEY is not defined in environment variables.');
            return res.status(500).json({
                success: false,
                message: 'AI service is not configured correctly on the server.'
            });
        }

        // Initialize Gemini client using the environment variable GEMINI_API_KEY
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        // Generate content
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: message
        });

        // Extract the reply text
        const replyText = response.text || 'I could not generate a response. Please try again.';

        // Return the required format for the frontend
        return res.status(200).json({
            success: true,
            reply: replyText,
            meta: {
                provider: 'Google Gemini',
                model: 'gemini-2.5-flash'
            }
        });

    } catch (error) {
        console.error('AI Chat Error:', error);
        
        // Return a clean error to the frontend
        return res.status(500).json({
            success: false,
            message: 'Error communicating with AI service. Please try again later.'
        });
    }
};
