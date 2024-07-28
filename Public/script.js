const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
let threadId = null; // To store the thread ID

sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

function sendMessage() {
    const message = userInput.value.trim();
    if (message) {
        addMessageToChat('user', message);
        userInput.value = '';
        showTypingIndicator();
        sendToServer(message);
    }
}

function addMessageToChat(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', `${sender}-message`);
    
    const iconElement = document.createElement('div');
    iconElement.classList.add('message-icon', `${sender}-icon`);
    iconElement.innerHTML = sender === 'user' ? 
        '<img src="https://icons.veryicon.com/png/o/miscellaneous/youyinzhibo/guest.png" alt="User">' : 
        '<img src="https://github.com/Fikret-Alimov/Project2/blob/main/images/asst_logo.png?raw=true" alt="Assistant" width="50" height="25"> alt="Assistant">';
    
    const contentElement = document.createElement('div');
    contentElement.classList.add('message-content');
    contentElement.innerHTML = formatMessage(message);
    
    messageElement.appendChild(iconElement);
    messageElement.appendChild(contentElement);
    
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
    const typingIndicator = document.createElement('div');
    typingIndicator.classList.add('message', 'assistant-message');
    
    const iconElement = document.createElement('div');
    iconElement.classList.add('message-icon', 'assistant-icon');
    iconElement.innerHTML = '<img src="https://github.com/Fikret-Alimov/Project2/blob/main/images/Designer%20(1).png?raw=true" alt="Assistant">';
    
    const indicatorElement = document.createElement('div');
    indicatorElement.classList.add('typing-indicator');
    indicatorElement.innerHTML = '<span></span><span></span><span></span>';
    
    typingIndicator.appendChild(iconElement);
    typingIndicator.appendChild(indicatorElement);
    
    chatMessages.appendChild(typingIndicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
    const typingIndicator = chatMessages.querySelector('.message:last-child');
    if (typingIndicator && typingIndicator.querySelector('.typing-indicator')) {
        typingIndicator.remove();
    }
}

function formatMessage(message) {
    // Convert numbered lists to HTML
    message = message.replace(/(\d+\.\s)([^\n]+)/g, '<li><strong>$1</strong>$2</li>');
    if (message.includes('<li>')) {
        message = '<ul>' + message + '</ul>';
    }
    
    // Convert bold text
    message = message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert line breaks to <br> tags
    message = message.replace(/\n/g, '<br>');
    
    return message;
}

function sendToServer(message) {
    fetch('/message', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, threadId }),
    })
    .then(response => response.json())
    .then(data => {
        removeTypingIndicator();
        addMessageToChat('assistant', data.response);
        threadId = data.threadId; // Store the thread ID for future messages
    })
    .catch(error => {
        console.error('Error:', error);
        removeTypingIndicator();
        addMessageToChat('assistant', 'Sorry, there was an error processing your request.');
    });
}
