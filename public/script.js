const form = document.getElementById('chat-form');
const profileForm = document.getElementById('profile-form');
const profileSection = document.getElementById('profile-section');
const chatSection = document.getElementById('chat-section');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

// Store conversation history
let conversation = [];
const API_URL = 'http://localhost:3000/api/chat';

profileForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    
    const weight = document.getElementById('weight').value;
    const height = document.getElementById('height').value;
    const lifestyle = document.getElementById('lifestyle').value;
    const goal = document.getElementById('goal').value;

    // Construct the initial context for the AI
    const initialMessage = `I am ${height}cm tall and weigh ${weight}kg. My lifestyle is ${lifestyle}. My goal is to ${goal}. Please act as my personal diet assistant and help me achieve my goals.`;

    // Switch UI to chat mode
    profileSection.style.display = 'none';
    chatSection.style.display = 'block';

    // Add context to history (hidden from user view, but sent to API)
    conversation.push({ role: 'user', text: initialMessage });
    
    // Show a temporary bot message while generating the plan
    const botMessageElement = appendMessage('bot', 'Generating your personalized plan...');
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ conversation })
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        const aiReply = data.result;

        botMessageElement.textContent = `Bot: ${aiReply}`;
        conversation.push({ role: 'model', text: aiReply });
    } catch (error) {
        console.error('Error:', error);
        botMessageElement.textContent = 'Bot: Failed to generate plan. Please try asking in the chat.';
    }
});

form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const userMessage = input.value.trim();
    if (!userMessage) return;

    // Add user message to chat
    appendMessage('user', userMessage);
    input.value = '';

    // Add to history
    conversation.push({ role: 'user', text: userMessage });

    // Show temporary bot message
    const botMessageElement = appendMessage('bot', 'Thinking...');

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ conversation })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        const aiReply = data.result;

        // Update the "Thinking..." message with the actual response
        botMessageElement.textContent = `Bot: ${aiReply}`;

        // Add AI response to history
        conversation.push({ role: 'model', text: aiReply });

    } catch (error) {
        console.error('Error:', error);
        botMessageElement.textContent = 'Bot: Sorry, something went wrong.';
    }
});

function appendMessage(sender, text) {
    const div = document.createElement('div');
    // Capitalize sender for display (e.g., "user" -> "User")
    const senderDisplay = sender.charAt(0).toUpperCase() + sender.slice(1);
    div.textContent = `${senderDisplay}: ${text}`;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
    return div;
}
