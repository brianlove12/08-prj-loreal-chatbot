/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

/* System prompt for the chatbot */
const systemPrompt = `You are a helpful L'Oréal beauty advisor chatbot. Your role is to assist customers with L'Oréal products, skincare routines, and beauty recommendations.

You should:
- Answer questions about L'Oréal products, ingredients, and usage
- Provide personalized skincare and beauty routine recommendations
- Help customers find products suited to their skin type, concerns, and preferences
- Share tips on how to use L'Oréal products effectively
- Be friendly, professional, and knowledgeable about beauty and skincare

You should NOT:
- Answer questions unrelated to L'Oréal, beauty, skincare, or cosmetics
- Provide medical advice (recommend seeing a dermatologist for medical concerns)
- Discuss competitor brands in detail
- Make claims beyond L'Oréal's official product information

IMPORTANT: If a user asks about topics completely unrelated to L'Oréal, beauty, skincare, haircare, or cosmetics (such as sports, politics, technology, math, etc.), you MUST politely decline and redirect them. Respond with something like: "I'm specialized in L'Oréal beauty products and skincare advice. I'd be happy to help you with product recommendations, skincare routines, or beauty tips instead! What beauty concern can I assist you with today?"

Stay focused on your role as a L'Oréal beauty advisor at all times.`;

//Replace with your actual Cloudflare Worker URL
const CLOUD_FLARE_WORKER_URL =
  "https://autobot-eagletron.brianlove-film.workers.dev/";

/* Conversation history - stores all messages */
const conversationHistory = [{ role: "system", content: systemPrompt }];

// Set initial message
chatWindow.textContent = "👋 Hello! How can I help you today?";

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get the user's message from the input field
  const userMessage = userInput.value.trim();

  // Don't send empty messages
  if (!userMessage) return;

  // Add user message to conversation history
  conversationHistory.push({ role: "user", content: userMessage });

  // Display user message in chat window
  displayMessage(userMessage, "user");

  // Clear the input field
  userInput.value = "";

  // Show "thinking" indicator
  displayMessage("Thinking...", "ai");

  try {
    // Send request to Cloudflare Worker endpoint
    const response = await fetch(CLOUD_FLARE_WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: conversationHistory,
      }),
    });

    // Check if the response is successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Response error:", response.status, errorText);
      throw new Error(`API error: ${response.status}`);
    }

    // Parse the response data
    const data = await response.json();
    console.log("Response data:", data);

    // Get the AI's message from the response
    const aiMessage = data.choices[0].message.content;

    // Add AI message to conversation history
    conversationHistory.push({ role: "assistant", content: aiMessage });

    // Remove "thinking" indicator and display AI response
    removeLastMessage();
    displayMessage(aiMessage, "ai");
  } catch (error) {
    // Remove "thinking" indicator
    removeLastMessage();

    // Display error message
    displayMessage("Sorry, I encountered an error. Please try again.", "ai");
    console.error("Error:", error);
    console.error("Full error details:", error.message, error.stack);
  }
});

/* Function to display a message in the chat window */
function displayMessage(message, sender) {
  // Create a new message element
  const messageElement = document.createElement("div");
  messageElement.classList.add("msg", sender);
  messageElement.textContent = message;

  // Add the message to the chat window
  chatWindow.appendChild(messageElement);

  // Scroll to the bottom of the chat window
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

/* Function to remove the last message (used for "thinking" indicator) */
function removeLastMessage() {
  const lastMessage = chatWindow.lastElementChild;
  if (lastMessage) {
    chatWindow.removeChild(lastMessage);
  }
}
