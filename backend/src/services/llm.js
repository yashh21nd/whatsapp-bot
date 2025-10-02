
// Free Hugging Face API integration for chatbot responses
export async function generateLLMReply(context, userMessage) {
  try {
    if (!userMessage || userMessage.trim().length === 0) {
      return "I'm here! Please send a message.";
    }

    // Use Hugging Face's free inference API
    const HF_API_URL = "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium";
    
    // Prepare the prompt for conversation
    const prompt = `Human: ${userMessage}\nBot:`;
    
    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // No API key needed for free tier, but you can add one for better rate limits
        // 'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_length: 100,
          temperature: 0.7,
          do_sample: true,
          pad_token_id: 50256
        },
        options: {
          wait_for_model: true
        }
      })
    });

    if (!response.ok) {
      console.warn("Hugging Face API error, falling back to simple responses");
      return generateFallbackReply(userMessage);
    }

    const data = await response.json();
    
    if (data && data[0] && data[0].generated_text) {
      // Extract bot response from generated text
      const generatedText = data[0].generated_text;
      const botResponse = generatedText.split('Bot:')[1]?.trim() || generatedText.trim();
      
      // Clean up the response
      const cleanResponse = botResponse
        .replace(/Human:/g, '')
        .replace(/Bot:/g, '')
        .trim();
      
      return cleanResponse || generateFallbackReply(userMessage);
    }

    return generateFallbackReply(userMessage);

  } catch (error) {
    console.error("Hugging Face API error:", error.message);
    return generateFallbackReply(userMessage);
  }
}

// Fallback responses when AI API is unavailable
function generateFallbackReply(userMessage) {
  const lower = userMessage.toLowerCase();
  
  if (lower.includes("hello") || lower.includes("hi")) {
    return "Hello! How can I help you today?";
  }
  if (lower.includes("bye") || lower.includes("goodbye")) {
    return "Goodbye! Have a great day!";
  }
  if (lower.includes("help")) {
    return "You can ask me anything about WhatsApp, subscriptions, or bot features.";
  }
  if (lower.includes("how are you")) {
    return "I'm doing great! Thanks for asking. How can I assist you?";
  }
  if (lower.includes("what") && lower.includes("your") && lower.includes("name")) {
    return "I'm your WhatsApp assistant bot. How can I help you today?";
  }
  
  // Default response
  return "I understand you're saying: " + userMessage + ". How can I help you with that?";
}
