const socket = io();

const clientsTotal = document.getElementById('clients-total');
const messageContainer = document.getElementById('message-container');
const nameInput = document.getElementById('name-input');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');

messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  sendMessage();
});

socket.on('clients-total', (data) => {
  clientsTotal.innerText = `Total Clients : ${data}`;
});

function sendMessage() {
  if (messageInput.value.trim() === '') return;

  const data = {
    name: nameInput.value,
    message: messageInput.value,
    dateTime: new Date(),
  };

  socket.emit('message', data);
  addMessageToUI(true, data);
  messageInput.value = '';
}

socket.on('chat-message', (data) => {
  addMessageToUI(false, data);
});

function addMessageToUI(isOwnMessage, data) {
  clearFeedback();

  const element = `
    <li class="${isOwnMessage ? 'message-right' : 'message-left'}">
      <p class="message">
        ${data.message}
        <span>${data.name} 🔴 ${moment(data.dateTime).fromNow()}</span>
      </p>
    </li>
  `;

  messageContainer.insertAdjacentHTML('beforeend', element);
  scrollToBottom();
}

function scrollToBottom() {
  messageContainer.scrollTo(0, messageContainer.scrollHeight);
}

// ✍🏻 Typing indicator logic
messageInput.addEventListener('focus', () => {
  socket.emit('feedback', { feedback: `${nameInput.value} is typing a message ✍🏻` });
});
messageInput.addEventListener('keypress', () => {
  socket.emit('feedback', { feedback: `${nameInput.value} is typing a message ✍🏻` });
});
messageInput.addEventListener('blur', () => {
  socket.emit('feedback', { feedback: '' });
});

socket.on('feedback', (data) => {
  clearFeedback();
  if (data.feedback) {
    const element = `
      <li class="message-feedback">
        <p class="feedback" id="feedback">${data.feedback}</p>
      </li>
    `;
    messageContainer.insertAdjacentHTML('beforeend', element);
    scrollToBottom();
  }
});

function clearFeedback() {
  document
    .querySelectorAll('li.message-feedback')
    .forEach((element) => element.remove());
}
