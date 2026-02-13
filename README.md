# Wavey

A fully functional Discord-inspired chat and call application built with Ionic React, Firebase, and WebRTC.

## Features

- 🔐 **Authentication** - Email/password authentication with Firebase
- 💬 **Real-time Chat** - Send and receive messages instantly with Firestore
- 👥 **Friends System** - Add friends and see their online status
- 📞 **Voice Calls** - Real-time voice calls using WebRTC
- 📹 **Video Calls** - Video calls with camera sharing
- 🎨 **Discord-inspired UI** - Beautiful dark theme with smooth animations
- 📱 **Mobile-first** - Optimized for mobile devices with Ionic

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/Zanci19/Wavey.git
cd Wavey
```

### 2. Install dependencies

```bash
npm install
```

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Enable the following services:
   - **Authentication** - Enable Email/Password provider
   - **Firestore Database** - Create a database in production mode
   - **Storage** - Enable Firebase Storage

4. Get your Firebase configuration:
   - Go to Project Settings
   - Scroll down to "Your apps" section
   - Click on the web app icon (</>)
   - Copy the configuration values

5. Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

6. Add your Firebase credentials to `.env`:

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 4. Firestore Security Rules

Add these rules to your Firestore database:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own user document
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to read/write messages
    match /messages/{messageId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Allow authenticated users to manage friends
    match /friends/{friendshipId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Allow authenticated users to manage calls
    match /calls/{callId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (resource.data.callerId == request.auth.uid || 
         resource.data.receiverId == request.auth.uid);
    }
  }
}
```

### 5. Run the application

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Usage

### Creating an Account

1. Open the app
2. Click "Don't have an account? Sign up"
3. Enter your display name, email, and password
4. Click "Sign Up"

### Sending Messages

1. Navigate to the "Servers" tab
2. Type your message in the input field
3. Press Enter or click the send button
4. Messages appear in real-time for all users

### Adding Friends

1. Navigate to the "Friends" tab
2. Click on the "Add Friends" segment
3. Click "Add Friend" next to users you want to add
4. Switch to "All" or "Online" to see your friends

### Making Calls

1. Navigate to the "Calls" tab
2. Click "Voice Call" or "Video Call" to start a demo call
3. To call a friend:
   - Go to Friends tab
   - Click the call icon next to a friend's name
4. When receiving a call, an alert will appear
5. Click "Answer" to accept or "Decline" to reject

### Call Controls

- 🎤 **Mute/Unmute** - Toggle your microphone
- 📹 **Video On/Off** - Toggle your camera (video calls only)
- 🔊 **Speaker** - Adjust speaker volume
- ❌ **End Call** - Hang up the call

## Technologies Used

- **Ionic React** - Mobile app framework
- **Firebase Authentication** - User authentication
- **Firestore** - Real-time database
- **WebRTC** (simple-peer) - Peer-to-peer voice/video calls
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server

## Project Structure

```
src/
├── components/       # Reusable UI components
├── contexts/         # React contexts (Auth)
├── firebase/         # Firebase configuration
├── pages/            # Main app pages
│   ├── Login.tsx     # Authentication page
│   ├── Servers.tsx   # Chat/messages page
│   ├── Friends.tsx   # Friends list page
│   ├── Calls.tsx     # Voice/video calls page
│   └── Profile.tsx   # User profile page
├── services/         # WebRTC and other services
└── theme/            # Global styles and theme
```

## Features in Detail

### Real-time Chat
- Messages are synced in real-time using Firestore listeners
- User avatars and display names
- Message timestamps
- Typing indicators
- Empty state when no messages

### Friends System
- Real-time online/offline status
- Add/remove friends
- Filter by online status
- Friend requests (pending functionality)

### Voice/Video Calls
- WebRTC peer-to-peer connections
- Signaling through Firestore
- Audio and video controls
- Call duration timer
- Call history
- Incoming call notifications

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari (limited WebRTC support)

**Note:** WebRTC requires HTTPS in production. Use `localhost` for development.

## Troubleshooting

### Camera/Microphone not working
- Check browser permissions
- Ensure HTTPS is enabled (required for WebRTC)
- Some browsers block camera/mic on non-secure origins

### Firebase errors
- Verify your Firebase configuration in `.env`
- Check that Authentication and Firestore are enabled
- Review Firestore security rules

### Build errors
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Ensure you're using Node.js 18 or higher

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
