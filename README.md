# NoteCreep

<div align="center">
  <img src="https://notecreep.vercel.app/assets/Note_Creep-removebg-preview-CAZBbMl4.png" alt="NoteCreep Logo">
</div>

**NoteCreep** is a modern, responsive, and secure note-taking web application built with the MERN stack. It allows users to create, manage, and organize notes efficiently, with features like pinned notes, trash management, and profile customization.

---

## 🚀 Features

- **User Authentication**: Register, login, and verify emails using JWT.
- **Note Management**: Create, edit, delete, and organize notes.
- **Pinned Notes**: Quickly access important notes.
- **Trash Management**: Recover deleted notes or permanently remove them.
- **Profile Management**: Update username, email, and personal information.
- **Analytics**: Track session activity and usage statistics.
- **Responsive Design**: Fully functional on desktop and mobile.
- **Dual-language Support**: English and Bengali translations.
- **Dark Mode**: Toggle between light and dark themes.

---

## 🛠 Technologies Used

- **Frontend**: React, Vite, React Router, Axios, i18next
- **Backend**: Node.js, Express.js, MongoDB, JWT Authentication
- **Deployment**: Vercel (Frontend), Render (Backend)
- **Security**: Helmet, CORS, HPP

---

## 📦 Installation

### Frontend

```bash
git clone https://github.com/yourusername/notecreep.git
cd notecreep
npm install
npm run dev
```

### Backend

```bash
git clone https://github.com/yourusername/notecreep-backend.git
cd notecreep-backend
npm install
npm start
```

>### Configure your .env file in the backend root directory

---

### 🌐 Live Demo 

Check the deployed web app: [Note Creep](https://notecreep.vercel.app)

---

## 📄 API Endpoints (Backend)

### Auth
  * POST /auth/register - Register a new user
  * POST /auth/login - Login user
  * GET /auth/profile/:username - Get user profile
  * PATCH /auth/profile - Update user profile

### Notes
  * POST /note - Create a new note
  * GET /note - Get all notes
  * PATCH /note/:id - Update a note
  * DELETE /note/:id - Delete a note
  * PATCH /note/:id/pin - Pin a note
  * PATCH /note/:id/unpin - Unpin a note
  * PATCH /note/:id/restore - Restore a deleted note

### Analytics
  * POST /analytics/update-session - Update session activity


---

# 💬 Feedback & Support

If you encounter any issues or have suggestions, feel free to open an issue on the [GitHub repository](https://github.com/alrifatsabbir/notecreep).

---


# 🔐 License

This project is licensed under the **NoteCreep Non‑Commercial License (NNCL) — v1.0**. See [LICENSE](LICENSE) for details. For commercial licensing, contact: alrifatsabbir@gmail.com
[![License](https://img.shields.io/badge/license-NNCL%20v1.0-red.svg)](LICENSE)
