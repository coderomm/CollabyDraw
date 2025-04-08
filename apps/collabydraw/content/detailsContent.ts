const detailsContent = String.raw`
---

**CollabyDraw** is a web-based collaborative whiteboard where multiple users can draw, edit, and brainstorm together in real time. Whether solo or in a group session, the app offers a smooth, intuitive canvas experience with real-time sync, shape tools, editable text, and privacy-focused end-to-end encryption — all without needing an account.

---

### ✅ Core Features

- **Canvas Drawing**: Freehand, shapes, and editable text  
- **Rough.js Support**: Optional sketch-style drawing  
- **Perfect-freehand Support**: Hand drawn feel  
- **Eraser Tool**: Remove individual shapes  
- **Editable Text**: Double-click to edit on canvas  

---

### 🔗 Collaboration

- **Real-time Sync**: WebSocket-powered live drawing  
- **Multi-Tab Awareness**: No duplicate join/leave events  
- **Optimistic Updates**: Instant feedback before server response  

---

### 🔐 Privacy & End-to-End Encryption (E2EE) in CollabyDraw

CollabyDraw is built with **privacy by design** to ensure that no sensitive drawing data can be accessed by anyone other than the intended participants.

#### 🔑 How It Works

When a user creates or joins a room, the app generates a link like:

\`\`\`
https://collabydraw.app/#room=abc123,xyz456
\`\`\`

- \`abc123\`: Unique room ID (used by the server)  
- \`xyz456\`: Encryption key (used **only** on the client)

---

#### 🧠 Key Never Touches the Server

- The **encryption key** after the comma (\`xyz456\`) is part of the URL fragment (\`#...\`)  
- This fragment is **never sent** in HTTP requests, meaning:

> The server cannot see or store the encryption key.

---

#### 🔒 Client-Side Only Decryption

- All encrypted drawing data is transmitted over WebSocket  
- The **decryption and rendering** happen completely on the client-side using the \`key\` from the URL  
- Even if someone intercepts the WebSocket traffic, they cannot decrypt the data without the key

---

#### 🛡️ Benefits

- No one — not even the server — can read what’s drawn in a room without the key  
- Ensures **confidentiality** for private brainstorming, teaching, or design sessions  
- Works like **Collabydraw's E2EE rooms**, but tailored for your collaborative drawing logic

---

### 🧠 Reliability

- **Message Queue**: Stores unsent messages in memory/localStorage  
- **Auto Retry**: Flushes queued messages on reconnect  

---

### 🧭 Modes

- **Standalone Mode**: Offline/local drawing  
- **Room Mode**: Collaborative sessions  

---

### ⚙️ Tech Stack

- **Frontend**: React (Vite), TypeScript, Tailwind CSS  
- **Canvas**: HTML Canvas API + Custom Engine  
- **Realtime**: Native WebSocket (\`useWebSocket\` hook)  
- **Security**: Hash-based E2EE  

---

### 📂 Github Repo

[github.com/coderomm/CollabyDraw](https://github.com/coderomm/CollabyDraw)

---

### 📽️ YouTube Demo

<iframe width="100%" height="400" src="https://www.youtube.com/embed/NNVdRCoFnK0" frameborder="0" allowfullscreen></iframe>

---

### 🐦 Tweet Embed

<Tweet id="1711737824058880576" />

`;

export default detailsContent;
