import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonAvatar, IonChip, IonIcon, IonButton, IonFab, IonFabButton, IonBadge } from '@ionic/react';
import { send, addCircle, notifications, search, ellipsisHorizontal } from 'ionicons/icons';
import { useState } from 'react';
import './Servers.css';

const Servers: React.FC = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, user: 'WaveBot', avatar: '🤖', message: 'Welcome to Wavey! Your Discord-inspired chat app.', time: '10:30 AM', isOwn: false },
    { id: 2, user: 'You', avatar: '👤', message: 'Thanks! This looks amazing!', time: '10:31 AM', isOwn: true },
    { id: 3, user: 'WaveBot', avatar: '🤖', message: 'Feel free to explore all the features and animations!', time: '10:32 AM', isOwn: false },
  ]);

  const sendMessage = () => {
    if (message.trim()) {
      setMessages([...messages, {
        id: messages.length + 1,
        user: 'You',
        avatar: '👤',
        message: message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: true
      }]);
      setMessage('');
    }
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': 'var(--discord-background-tertiary)' }}>
          <div className="header-content">
            <div className="channel-info">
              <IonIcon icon={notifications} className="channel-icon" />
              <IonTitle className="channel-title"># general</IonTitle>
            </div>
            <div className="header-actions">
              <IonButton fill="clear" className="header-button">
                <IonIcon icon={search} />
              </IonButton>
              <IonButton fill="clear" className="header-button">
                <IonIcon icon={ellipsisHorizontal} />
              </IonButton>
            </div>
          </div>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="chat-content">
        <div className="server-banner">
          <div className="banner-content animate-slide-in">
            <h1 className="server-name">🌊 Wavey Server</h1>
            <p className="server-description">Welcome to the official Wavey community!</p>
            <div className="online-count">
              <div className="status-dot online"></div>
              <span>1,234 members online</span>
            </div>
          </div>
        </div>
        
        <div className="messages-container">
          {messages.map((msg, index) => (
            <div 
              key={msg.id} 
              className={`message-wrapper ${msg.isOwn ? 'own-message' : ''} animate-message`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {!msg.isOwn && (
                <IonAvatar className="message-avatar">
                  <div className="avatar-emoji">{msg.avatar}</div>
                </IonAvatar>
              )}
              <div className="message-content">
                {!msg.isOwn && <div className="message-user">{msg.user}</div>}
                <div className={`message-bubble ${msg.isOwn ? 'own' : ''}`}>
                  <div className="message-text">{msg.message}</div>
                  <div className="message-time">{msg.time}</div>
                </div>
              </div>
              {msg.isOwn && (
                <IonAvatar className="message-avatar">
                  <div className="avatar-emoji">{msg.avatar}</div>
                </IonAvatar>
              )}
            </div>
          ))}
        </div>

        <div className="typing-indicator animate-pulse">
          <div className="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span className="typing-text">Someone is typing...</span>
        </div>
      </IonContent>

      <div className="message-input-container">
        <IonButton 
          fill="clear" 
          className="add-button animate-scale"
        >
          <IonIcon icon={addCircle} />
        </IonButton>
        <input
          type="text"
          placeholder="Message #general"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          className="message-input"
        />
        <IonButton 
          fill="clear" 
          className="send-button animate-scale"
          onClick={sendMessage}
          disabled={!message.trim()}
        >
          <IonIcon icon={send} />
        </IonButton>
      </div>

      <IonFab vertical="bottom" horizontal="end" slot="fixed" style={{ marginBottom: '80px' }}>
        <IonFabButton className="fab-button animate-bounce">
          <IonBadge className="notification-badge">3</IonBadge>
          <IonIcon icon={notifications} />
        </IonFabButton>
      </IonFab>
    </IonPage>
  );
};

export default Servers;
