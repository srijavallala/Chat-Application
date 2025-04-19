// Initialize socket connection
const socket = io();

// DOM elements
const roomInput = document.getElementById('room-input');
const usernameInput = document.getElementById('username-input');
const joinButton = document.getElementById('join-room-btn');
const chatBox = document.querySelector('.chat-box');
const roomSelection = document.querySelector('.room-selection');
const messagesContainer = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-message-btn');
const typingIndicator = document.getElementById('typing-indicator');
const userList = document.getElementById('user-list');

// Variables to store the current room and username
let currentUsername = '';
let currentRoom = '';
let typingTimeout;

// Join room event
joinButton.addEventListener('click', function () {
  const room = roomInput.value.trim(); // Get the room name from input
  const username = usernameInput.value.trim(); // Get the username from input

  // Check if room and username are provided
  if (room && username) {
    currentUsername = username; // Store the username
    currentRoom = room; // Store the room name
    socket.emit('joinRoom', room, username); // Emit 'joinRoom' event to server
  } else {
    alert('Room and Username are required!'); // Show alert if either is missing
  }
});

// On successful room join
socket.on('joinSuccess', () => {
  // Hide the room selection form and show the chat box
  roomSelection.classList.add('hidden');
  chatBox.classList.remove('hidden');
  roomInput.value = ''; // Clear the input fields
  usernameInput.value = '';
});

// On room join error
socket.on('joinError', (message) => {
  alert(message); // Show error message
  roomSelection.classList.remove('hidden'); // Show the room selection form again
  chatBox.classList.add('hidden'); // Hide the chat box
});

// Receive messages from server
socket.on('message', (msg) => {
  const messageElem = document.createElement('p'); // Create a new <p> element for the message
  
  messageElem.innerHTML = msg; // Set the message content

  // Check if it's a system message (e.g., join/leave)
  const isSystemMessage =
    msg.includes('joined the room') ||
    msg.includes('left the room') ||
    msg.includes('Welcome');

  // Check if the message is from the current user
  const isOwnMessage = msg.includes(`${currentUsername}:`);

  // Apply appropriate CSS classes for message styles
  if (isSystemMessage) {
    messageElem.className = 'system-message';
  } else if (isOwnMessage) {
    messageElem.className = 'user-message current-user-message';
  } else {
    messageElem.className = 'user-message';
  }

  // Append the message to the container
  messagesContainer.appendChild(messageElem);
  
  // Scroll to the bottom to show the latest message
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
});

// Send message event
sendButton.addEventListener('click', () => {
  const message = messageInput.value.trim(); // Get the trimmed message from input
  if (message) {
    // Emit 'chatMessage' event to server with the room, username, and message
    socket.emit('chatMessage', currentRoom, { username: currentUsername, message });
    messageInput.value = ''; // Clear the input field
    socket.emit('stopTyping'); // Stop typing indicator after sending message
  }
});

// Typing detection event
messageInput.addEventListener('input', () => {
  // Emit 'typing' event to server with the current username
  socket.emit('typing', currentUsername); 

  clearTimeout(typingTimeout); // Clear the previous timeout
  typingTimeout = setTimeout(() => {
    socket.emit('stopTyping'); // Emit 'stopTyping' event after 1 second
  }, 1000);
});

// Typing indicator event
socket.on('typing', (username) => {
  // Show typing indicator when another user is typing
  typingIndicator.textContent = `${username} is typing...`;
});

// Stop typing indicator event
socket.on('stopTyping', () => {
  typingIndicator.textContent = ''; // Clear typing indicator
});

// Update user list event
socket.on('userList', (users) => {
  userList.innerHTML = ''; // Clear current user list
  // Add each user to the list
  users.forEach(user => {
    const userItem = document.createElement('li');
    userItem.textContent = user;
    userList.appendChild(userItem);
  });
});

// Scroll to the bottom of the chat window
function scrollToBottom() {
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
