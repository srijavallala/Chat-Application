# Real-Time Chat Application

This is a simple real-time chat application built with Node.js, Express, MongoDB, and Socket.IO. It allows multiple users to join specific chat rooms, send messages, and view typing indicators. Messages are saved in MongoDB and support basic formatting such as bold, italics, and clickable links.

---

## How to Run the Project

Follow these steps to get the chat application up and running on your local machine:

### 1. Clone the Repository

Clone the repository from GitHub:

```bash
git clone https://github.com/your-username/chat-app.git
cd chat-app
```
### 2. Install Dependencies

Make sure you have Node.js installed. If not, you can download it from the official website.

Install the required dependencies:

```bash
npm install
```
This will install Express, Socket.IO, Mongoose, and other required libraries.

### 3. Set Up Environment Variables

Create a .env file in the root directory of your project and add your MongoDB connection string:

```env
MONGODB_URI=your-mongodb-connection-string
```
### 4. Run the Application

Start the server:

```bash
node server.js
```
Visit http://localhost:3000 in your browser to use the application.

## Project Structure

root/
├── models/           # MongoDB schemas
├── public/           # Frontend files (HTML, CSS, JS)
├── server.js         # Backend logic and socket setup
├── .env              # Environment variables
├── package.json      # Dependencies and metadata
└── README.md         # Project info

## Features

1. Real-Time Chat: Send and receive messages instantly within a chat room.

2. Typing Indicator: Displays when users are typing.

3. Message Formatting:

- `*bold*` → **bold**
- `_italic_` → *italic*
- URLs (e.g., `https://example.com`) are automatically clickable.

4. User List: Shows current participants in the room.

5. Persistent Chat History: Loads the latest 100 messages from MongoDB when a user joins.

6. Message Sanitization: Prevents XSS attacks using sanitize-html.

## Built With

- **Node.js**: JavaScript runtime for server-side development.

- **Express.js**: Framework for building web APIs.

- **Socket.IO**: Enables real-time communication.

- **MongoDB**: NoSQL database to store messages.

- **Mongoose**: ODM for interacting with MongoDB.

- **HTML, CSS, JavaScript**: For frontend UI.

## How to Use the Application

1. Joining a Room

- Enter a username and room name.

- Click Join Room to enter. If the room doesn’t exist, it will be automatically created.

2. Sending Messages

- Use the input box at the bottom to type your message.

- Click Send to deliver your message.

- Messages are broadcast to all users in the room in real time.

3. Viewing Message History

- Upon joining, you’ll see the last 100 messages from that room.

- Messages include timestamps.

4. User List

- View the list of users currently in the room at the bottom of the chat box.

- When users leave, they are automatically removed from the list.

5. Typing Indicator

- When someone types, a “User is typing...” message appears.

- It disappears once they stop typing.

##  License

This project was created for educational purposes only.  
Feel free to use or modify it to enhance your learning experience.
