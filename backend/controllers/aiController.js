import { GoogleGenAI } from '@google/genai';

/**
 * Controller: handleChat
 * Handles incoming user AI prompts for locator assistance & test automation.
 * 
 * Developer Flow:
 * 1. Validates input prompt message presence in request body.
 * 2. Verifies GEMINI_API_KEY environment variable availability.
 * 3. Instantiates GoogleGenAI SDK securely on the backend server.
 * 4. Calls gemini-2.5-flash model to generate response content.
 * 5. Returns structured JSON reply payload to client without exposing API keys or stack traces.
 */
export const handleChat = async (req, res, next) => {
    try {
        const { message } = req.body;

        // Step 1: Input Validation - Ensure prompt string exists
        if (!message || typeof message !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'A valid text message prompt is required.'
            });
        }

        // Step 2: Environment Check - Verify Gemini API key configuration
        if (!process.env.GEMINI_API_KEY) {
            console.error('CRITICAL: GEMINI_API_KEY is missing in server environment variables.');
            return res.status(500).json({
                success: false,
                message: 'AI service is currently unavailable. Please contact system administrator.'
            });
        }

        // Step 3: Initialize Google GenAI client securely on backend
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        // Step 4: Dispatch prompt request to Gemini 2.5 Flash model
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: message
        });

        // Step 5: Extract generated response text safely
        const replyText = response.text || 'I could not generate a response. Please try again.';

        // Step 6: Return clean JSON payload to frontend
        return res.status(200).json({
            success: true,
            reply: replyText,
            meta: {
                provider: 'Google Gemini',
                model: 'gemini-2.5-flash'
            }
        });

    } catch (error) {
        // Defensive Error Shielding: Log full error internally for debugging, return generic error to client
        console.error('AI Chat Controller Error:', error);
        
        return res.status(500).json({
            success: false,
            message: 'Error communicating with AI service. Please try again later.'
        });
    }
};
