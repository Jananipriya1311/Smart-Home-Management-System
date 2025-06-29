# Smart-Home-Management-System# Home Management System

This project is a full-stack web application designed to simplify home and task management. It includes both a responsive frontend built with modern web technologies and a backend powered by Node.js and Firebase for secure data storage and user authentication.

---

## Project Structure

```
Home-Management-System/
├── frontend/   → All client-side code (UI)
├── backend/    → Server-side logic, API routes, Firebase setup
```

---

## Frontend

### Tech Stack
- HTML5 and CSS3
- JavaScript (Vanilla)
- Vite (for bundling and local development)
- Firebase Hosting (optional)

### Key Files and Folders
- `index.html` – Main homepage
- `src/` – Custom JS and CSS
- `public/` – Static assets like images
- `firebase.json` – Firebase hosting configuration
- `.gitignore` – To ignore node_modules and build files

---

## Backend

### Tech Stack
- Node.js
- Express.js
- Firebase Admin SDK
- dotenv (for environment variables)

### Key Files and Folders
- `server.js` – Main server file
- `routes/` – API route handlers
- `.env` – Stores secrets and credentials (not uploaded to GitHub)
- `.gitignore` – Ensures secrets and large files are ignored

---

## How to Run Locally

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser.

---

### Backend

```bash
cd backend
npm install
node server.js
```

Create a `.env` file inside the backend directory containing your Firebase credentials like this:

```env
FIREBASE_CONFIG={"type":"service_account",...}
```

---

## Security Note

Do not upload `serviceAccountKey.json` or any `.env` files to GitHub. Use `.gitignore` to keep them private and secure.

---

## Credits

Developed as a team as part of a full-stack project for learning and portfolio showcasing.

---

## License

This project is open source and available under the MIT License.
