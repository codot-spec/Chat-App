const MAX_MESSAGES = 100; // Limit to 100 messages

// Function to send a message
async function sendMessage(event) {
  event.preventDefault();

  const messageText = document.getElementById('message').value;

  const message = {
    message: messageText
  };

  try {
    const response = await axios.post("http://localhost:3000/chat/message", message, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    });

    if (response.status === 201) {
      const messageList = document.querySelector('.message-list');

      // Load existing messages from localStorage
      let existingMessages = JSON.parse(localStorage.getItem('messages')) || [];

      // Add new message
      existingMessages.push({ name: response.data.name, message: response.data.message });

      // Limit messages to MAX_MESSAGES
      if (existingMessages.length > MAX_MESSAGES) {
        existingMessages.shift(); // Remove the oldest message
      }

      // Store updated messages in localStorage
      storeMessages(existingMessages); 

      // Update message list with new message
      messageList.innerHTML += `
        <li>
          <strong>${response.data.name}</strong>: <p>${response.data.message}</p>
        </li>
      `;

      document.getElementById('message').value = '';
    }
  } catch (err) {
    console.error('Error sending message:', err);
    document.body.innerHTML += `<div style="color:red;">${err.message}</div>`;
  }
}

// Function to fetch messages
async function fetchMessages() {
  try {
    const response = await axios.get("http://localhost:3000/chat/messages", {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    });

    if (response.status === 200) {
      const messageList = document.querySelector('.message-list');
      messageList.innerHTML = ''; // Clear current messages

      // Load messages from localStorage
      let localStorageMessages = JSON.parse(localStorage.getItem('messages')) || [];

      // Append messages from localStorage
      localStorageMessages.forEach(msg => {
        messageList.innerHTML += `
          <li>
            <strong>${msg.name}</strong>: <p>${msg.message}</p>
          </li>
        `;
      });

      // Append new messages from backend response (if any)
      response.data.forEach(msg => {
        messageList.innerHTML += `
          <li>
            <strong>${msg.name}</strong>: <p>${msg.message}</p>
          </li>
        `;
      });

      // Update localStorage with combined messages (but limited by MAX_MESSAGES)
      storeMessages([...localStorageMessages, ...response.data]); 

    }
  } catch (err) {
    console.error('Error fetching messages:', err);
    document.body.innerHTML += `<div style="color:red;">${err.message}</div>`;
  }
}


// Store messages in localStorage with a limit
function storeMessages(messages) {
  if (messages.length > MAX_MESSAGES) {
    messages.splice(0, messages.length - MAX_MESSAGES); // Remove oldest messages
  }
  localStorage.setItem('messages', JSON.stringify(messages));
}

// Event listeners
document.getElementById('chatForm').addEventListener('submit', sendMessage);
window.addEventListener('load', fetchMessages);