
// Conversation memory to track chat context
const conversationHistory = new Map();

// Realistic conversational AI system
export async function generateLLMReply(userMessage, chatId = 'default') {
  try {
    console.log("LLM called with:", { userMessage, chatId, messageLength: userMessage?.length });
    
    if (!userMessage || userMessage.trim().length === 0) {
      const casualResponses = [
        "Hey! What's up?",
        "Hi there! How's it going?",
        "Hello! How can I help you today?",
        "Hey! What's on your mind?"
      ];
      return casualResponses[Math.floor(Math.random() * casualResponses.length)];
    }

    // Get conversation history for this chat
    let history = conversationHistory.get(chatId) || [];
    
    // Add user message to history
    history.push({ role: 'user', message: userMessage, timestamp: Date.now() });
    
    // Keep only last 8 messages for context
    if (history.length > 8) {
      history = history.slice(-8);
    }
    
    // Generate realistic response
    let response = await generateRealisticResponse(userMessage, history);
    
    // Add bot response to history
    history.push({ role: 'bot', message: response, timestamp: Date.now() });
    conversationHistory.set(chatId, history);
    
    console.log("Final response:", response);
    return response;

  } catch (error) {
    console.error("LLM error:", error.message);
    return generateCasualResponse(userMessage);
  }
}

// Generate realistic, human-like responses
async function generateRealisticResponse(userMessage, history) {
  const lower = userMessage.toLowerCase();
  const isFirstMessage = history.length <= 1;
  
  // Greeting handling - more natural
  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
    if (isFirstMessage) {
      const greetings = [
        "Hey! Good to hear from you 😊 What's going on?",
        "Hi there! How's your day treating you?",
        "Hello! Nice to meet you. What brings you here today?",
        "Hey! Hope you're having a good day. What can I help you with?",
        "Hi! Great timing - I was just here. What's up?"
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    } else {
      return "Hey again! What else is on your mind?";
    }
  }
  
  // How are you - realistic responses
  if (lower.includes("how are you") || lower.includes("how do you do")) {
    const responses = [
      "I'm doing pretty well, thanks for asking! How about you? How's your day going?",
      "Can't complain! Things are going smoothly here. What about you?",
      "I'm good! Always ready to chat and help out. How are things on your end?",
      "Doing great, thanks! I appreciate you asking. How are you holding up today?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Time/schedule questions - realistic responses
  if (lower.includes("free") || lower.includes("available") || lower.includes("busy") || lower.includes("time")) {
    const timeResponses = [
      "I'm here right now! What do you need help with?",
      "Yep, I'm free to chat. What's going on?",
      "I've got time! What can I do for you?",
      "Available and ready to help! What's up?",
      "I'm here whenever you need me. What's on your mind?"
    ];
    return timeResponses[Math.floor(Math.random() * timeResponses.length)];
  }
  
  // Schedule/appointment requests
  if (lower.includes("schedule") || lower.includes("appointment") || lower.includes("meeting") || lower.includes("call")) {
    const scheduleResponses = [
      "Sure thing! What kind of call or meeting are you looking to set up? And when works best for you?",
      "Absolutely! Let me know what you need to schedule and your preferred time.",
      "I can help with that! What type of appointment are you thinking about?",
      "Of course! What would you like to schedule? Just let me know the details.",
      "Happy to help you get something on the calendar! What are you thinking?"
    ];
    return scheduleResponses[Math.floor(Math.random() * scheduleResponses.length)];
  }
  
  // Weather questions - casual responses
  if (lower.includes("weather")) {
    const weatherResponses = [
      "I wish I could check the weather for you! I don't have access to current weather data, but you could try checking your weather app. What's it like where you are?",
      "Unfortunately I can't pull up weather info right now - but how's it looking outside your window?",
      "I don't have weather access, but I'm curious - are you planning something outdoors?",
      "Can't help with weather data I'm afraid! But is it nice where you are today?"
    ];
    return weatherResponses[Math.floor(Math.random() * weatherResponses.length)];
  }
  
  // Business/service questions - natural responses
  if (lower.includes("business") || lower.includes("service") || lower.includes("work") || lower.includes("help")) {
    const businessResponses = [
      "What kind of help are you looking for? I'm here to assist however I can!",
      "Sure! What do you need help with? I'd be happy to point you in the right direction.",
      "I'd love to help! What specifically are you looking for?",
      "Absolutely! Tell me more about what you need - I'll do my best to help.",
      "What can I do for you? I'm here to help with whatever you need!"
    ];
    return businessResponses[Math.floor(Math.random() * businessResponses.length)];
  }
  
  // Questions - engaging responses
  if (lower.includes("what") || lower.includes("how") || lower.includes("why") || lower.includes("when") || lower.includes("where")) {
    const questionResponses = [
      `That's a good question! About "${userMessage}" - tell me more about what you're thinking?`,
      `Interesting! Regarding "${userMessage}" - what specifically would you like to know?`,
      `I'd be happy to help with that! Can you give me a bit more context about "${userMessage}"?`,
      `Good question! For "${userMessage}" - what's the situation you're dealing with?`,
      `Let me help you with that! About "${userMessage}" - what's prompting this question?`
    ];
    return questionResponses[Math.floor(Math.random() * questionResponses.length)];
  }
  
  // Thanks/appreciation
  if (lower.includes("thank") || lower.includes("thanks") || lower.includes("appreciate")) {
    const thankResponses = [
      "You're very welcome! Happy I could help 😊",
      "No problem at all! Glad to be of help.",
      "My pleasure! Let me know if you need anything else.",
      "You bet! Always here if you need more help.",
      "Anytime! Feel free to reach out whenever you need something."
    ];
    return thankResponses[Math.floor(Math.random() * thankResponses.length)];
  }
  
  // Goodbye responses
  if (lower.includes("bye") || lower.includes("goodbye") || lower.includes("see you") || lower.includes("talk later")) {
    const goodbyeResponses = [
      "Take care! Feel free to message anytime 😊",
      "See you later! Don't hesitate to reach out if you need anything.",
      "Goodbye! Have a great rest of your day!",
      "Catch you later! I'll be here whenever you need me.",
      "Take it easy! Always happy to chat when you need to."
    ];
    return goodbyeResponses[Math.floor(Math.random() * goodbyeResponses.length)];
  }
  
  // Default conversational responses - more natural
  return generateCasualResponse(userMessage);
}

// Generate casual, realistic responses for general conversation
function generateCasualResponse(userMessage) {
  const messageLength = userMessage.length;
  const lower = userMessage.toLowerCase();
  
  // Short messages get casual responses
  if (messageLength < 10) {
    const shortResponses = [
      "Yeah? Tell me more!",
      "Oh cool! What's that about?",
      "Interesting! What's going on?",
      "Nice! What's up with that?",
      "Really? How so?",
      "I see! What's the deal?",
      "Got it! And then what?",
      "Right! What happened next?"
    ];
    return shortResponses[Math.floor(Math.random() * shortResponses.length)];
  }
  
  // Longer messages get more thoughtful responses
  if (messageLength > 50) {
    const thoughtfulResponses = [
      `Wow, that's quite a story about "${userMessage.substring(0, 30)}..." - I'd love to hear more about your experience with this!`,
      `That's really interesting! The part about "${userMessage.substring(0, 25)}..." caught my attention. How did that work out?`,
      `I can see you've put some thought into this. About "${userMessage.substring(0, 30)}..." - what's your perspective on how things are going?`,
      `Thanks for sharing all that detail! Regarding "${userMessage.substring(0, 25)}..." - what's been your experience so far?`,
      `That's a lot to unpack! The "${userMessage.substring(0, 30)}..." part is particularly interesting. What are your thoughts on that?`
    ];
    return thoughtfulResponses[Math.floor(Math.random() * thoughtfulResponses.length)];
  }
  
  // Regular conversational responses with personality
  const personalityResponses = [
    `Gotcha! About "${userMessage}" - that sounds pretty interesting. What's the backstory there?`,
    `Right on! So with "${userMessage}" - I'm curious, how did you get into that?`,
    `Nice! "${userMessage}" is something I hear about quite a bit. What's your take on it?`,
    `Cool! Regarding "${userMessage}" - sounds like there might be more to that story?`,
    `I hear you! With "${userMessage}" - what's been your experience like?`,
    `Ah, "${userMessage}"! That's definitely something worth talking about. What got you thinking about this?`,
    `Totally! About "${userMessage}" - I'd love to know more about what you're dealing with there.`,
    `For sure! "${userMessage}" is interesting - what's the situation you're working with?`,
    `Absolutely! So regarding "${userMessage}" - what's going on in your world with that?`,
    `I get it! With "${userMessage}" - that sounds like it could be pretty important to you. What's up?`
  ];
  
  return personalityResponses[Math.floor(Math.random() * personalityResponses.length)];
}
