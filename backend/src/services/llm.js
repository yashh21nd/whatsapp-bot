
// Free local AI: simple rule-based reply (can be replaced with a local model)
export async function generateLLMReply(context, userMessage) {
  try {
    // Example: echo user message, add friendly response
    if (!userMessage || userMessage.trim().length === 0) {
      return "I'm here! Please send a message.";
    }
    // Add simple rules for common questions
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
    // Math example
    if (lower.match(/\d+ [\+\-\*\/] \d+/)) {
      try {
        // Evaluate simple math
        // eslint-disable-next-line no-eval
        const result = eval(lower.match(/\d+ [\+\-\*\/] \d+/)[0]);
        return `The answer is ${result}.`;
      } catch {
        return "Sorry, I couldn't calculate that.";
      }
    }
    // Default: echo
    return `You said: ${userMessage}`;
  } catch (e) {
    console.error("Local AI error:", e.message);
    return "Sorry, something went wrong. Please try again.";
  }
}
