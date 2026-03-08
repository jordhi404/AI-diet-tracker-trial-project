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
    const initialMessage = `Here is my profile: Height: ${height}cm, Weight: ${weight}kg, Lifestyle: ${lifestyle}, Goal: ${goal}. Please help me achieve this goal. Be my support system, encourage me, and guide me with meal plans and workout advice. I need you to be empathetic and motivating.`;

    // Switch UI to chat mode
    profileSection.style.display = 'none';
    chatSection.style.display = 'flex';

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
        
        if (aiReply) {
            botMessageElement.innerHTML = marked.parse(aiReply);
            conversation.push({ role: 'model', text: aiReply });
        } else {
            // Handles case #2: AI returns no text (e.g., due to safety filters)
            botMessageElement.textContent = 'Bot: I could not generate a plan. This might be due to safety filters. Please try rephrasing your goals.';
        }
    } catch (error) {
        console.error('Error:', error);
        // Handles case #1: Backend or network failure
        botMessageElement.textContent = 'Bot: Failed to connect to the AI service. Please check the backend server and API key.';
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
        if (aiReply) {
            botMessageElement.innerHTML = marked.parse(aiReply);
            conversation.push({ role: 'model', text: aiReply });
        } else {
            botMessageElement.textContent = 'Bot: I received an empty response. Please try again.';
        }

    } catch (error) {
        console.error('Error:', error);
        botMessageElement.textContent = 'Bot: Sorry, I could not get a response from the server.';
    }
});

function appendMessage(sender, text) {
    const div = document.createElement('div');
    div.classList.add('message', sender.toLowerCase());
    
    // Jika pengirim adalah bot dan marked tersedia, render sebagai HTML
    if (sender === 'bot' && typeof marked !== 'undefined') {
        div.innerHTML = marked.parse(text);
    } else {
        div.textContent = text;
    }
    
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
    return div;
}
