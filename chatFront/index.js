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
        }
    } catch (err) {
        console.error('Error sending message:', err);
        document.body.innerHTML += `<div style="color:red;">${err.message}</div>`;
    }
}


async function fetchMessages() {
    try {
        const response = await axios.get("http://localhost:3000/chat/messages", {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });

        if (response.status === 200) {
            const messageList = document.querySelector('.message-list');
            messageList.innerHTML = ''; 

            response.data.forEach(msg => {
                messageList.innerHTML += `
                    <li>
                        <strong>${msg.name}</strong>: <p>${msg.message}</p>
                    </li>
                `;
            });
        }
    } catch (err) {
        console.error('Error fetching messages:', err);
        document.body.innerHTML += `<div style="color:red;">${err.message}</div>`;
    }
}

document.getElementById('chatForm').addEventListener('submit', sendMessage);

window.addEventListener('load', fetchMessages);
