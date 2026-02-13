import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonAvatar, IonChip, IonIcon, IonButton, IonFab, IonFabButton, IonBadge } from '@ionic/react';
import { send, addCircle, notifications, search, ellipsisHorizontal } from 'ionicons/icons';
import { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import './Servers.css';

interface Message {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  message: string;
  timestamp: any;
  channelId: string;
}

const Servers: React.FC = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const { currentUser, userData } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelId = 'general'; // Default channel

  useEffect(() => {
    // Real-time listener for messages
    const q = query(
      collection(db, 'messages'),
      where('channelId', '==', channelId),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages: Message[] = [];
      snapshot.forEach((doc) => {
        newMessages.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(newMessages);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [channelId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (message.trim() && currentUser && userData) {
      try {
        await addDoc(collection(db, 'messages'), {
          userId: currentUser.uid,
          userName: userData.displayName,
          userAvatar: userData.photoURL || '👤',
          message: message.trim(),
          timestamp: serverTimestamp(),
          channelId: channelId
        });
        setMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
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
          {messages.map((msg, index) => {
            const isOwn = msg.userId === currentUser?.uid;
            const timestamp = msg.timestamp?.toDate?.();
            const timeStr = timestamp ? timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
            
            return (
              <div 
                key={msg.id} 
                className={`message-wrapper ${isOwn ? 'own-message' : ''} animate-message`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {!isOwn && (
                  <IonAvatar className="message-avatar">
                    <div className="avatar-emoji">{msg.userAvatar}</div>
                  </IonAvatar>
                )}
                <div className="message-content">
                  {!isOwn && <div className="message-user">{msg.userName}</div>}
                  <div className={`message-bubble ${isOwn ? 'own' : ''}`}>
                    <div className="message-text">{msg.message}</div>
                    <div className="message-time">{timeStr}</div>
                  </div>
                </div>
                {isOwn && (
                  <IonAvatar className="message-avatar">
                    <div className="avatar-emoji">{msg.userAvatar}</div>
                  </IonAvatar>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {messages.length === 0 && (
          <div className="empty-chat">
            <div className="empty-icon">💬</div>
            <div className="empty-text">No messages yet</div>
            <div className="empty-subtext">Be the first to say something!</div>
          </div>
        )}
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
