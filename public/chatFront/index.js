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
            messageList.innerHTML += `
                <li>
                    <strong>${response.data.name}</strong>: <p>${response.data.message}</p>
                </li>
            `;
            document.getElementById('message').value = '';
            scrollToBottom();
        }
    } catch (err) {
        console.error('Error sending message:', err);
        document.body.innerHTML += `<div style="color:red;">${err.message}</div>`;
    }
}

// Function to fetch all messages from backend
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

            // Append new messages
            response.data.forEach(msg => {
                messageList.innerHTML += `
                    <li>
                        <strong>${msg.name}</strong>: <p>${msg.message}</p>
                    </li>
                `;
            });
            
            scrollToBottom();  // Scroll to the bottom after new messages are added
        }
    } catch (err) {
        console.error('Error fetching messages:', err);
        document.body.innerHTML += `<div style="color:red;">${err.message}</div>`;
    }
}

// Scroll to the bottom of the message list
function scrollToBottom() {
    const messageList = document.querySelector('.message-list');
    messageList.scrollTop = messageList.scrollHeight;
}

// Fetch messages every 5 seconds
setInterval(fetchMessages, 2000);

// Event listener for sending a message
document.getElementById('chatForm').addEventListener('submit', sendMessage);

// Load messages when the page loads
window.addEventListener('load', fetchMessages);
