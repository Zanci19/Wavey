import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonAvatar, IonIcon, IonButton, IonSearchbar, IonSegment, IonSegmentButton, IonBadge, IonLabel } from '@ionic/react';
import { personAdd, chatbubbleEllipses, videocam, call } from 'ionicons/icons';
import { useState } from 'react';
import './Friends.css';

interface Friend {
  id: number;
  name: string;
  avatar: string;
  status: 'online' | 'idle' | 'dnd' | 'offline';
  statusText: string;
  lastSeen?: string;
}

const Friends: React.FC = () => {
  const [segment, setSegment] = useState<string>('online');
  const [friends] = useState<Friend[]>([
    { id: 1, name: 'Alex Wave', avatar: '👨‍💻', status: 'online', statusText: 'Building something cool' },
    { id: 2, name: 'Sarah Dev', avatar: '👩‍🎨', status: 'online', statusText: 'Designing UI/UX' },
    { id: 3, name: 'Mike Code', avatar: '👨‍🚀', status: 'idle', statusText: 'Away from keyboard' },
    { id: 4, name: 'Emma Tech', avatar: '👩‍💼', status: 'dnd', statusText: 'Do Not Disturb' },
    { id: 5, name: 'John Build', avatar: '👨‍🔧', status: 'offline', statusText: 'Offline', lastSeen: '2 hours ago' },
    { id: 6, name: 'Lisa Test', avatar: '👩‍🔬', status: 'online', statusText: 'Testing features' },
  ]);

  const filteredFriends = friends.filter(friend => {
    if (segment === 'all') return true;
    return friend.status === segment;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'var(--discord-green)';
      case 'idle': return 'var(--discord-yellow)';
      case 'dnd': return 'var(--discord-red)';
      default: return 'var(--discord-text-muted)';
    }
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': 'var(--discord-background-tertiary)' }}>
          <IonTitle className="friends-title">Friends</IonTitle>
          <IonButton slot="end" fill="clear" className="add-friend-btn animate-scale">
            <IonIcon icon={personAdd} />
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="friends-content">
        <div className="search-container animate-slide-down">
          <IonSearchbar 
            placeholder="Search friends..." 
            className="friends-search"
            animated
          />
        </div>

        <IonSegment 
          value={segment} 
          onIonChange={e => setSegment(e.detail.value as string)}
          className="friends-segment"
        >
          <IonSegmentButton value="online">
            <IonLabel>Online</IonLabel>
            <IonBadge className="segment-badge">{friends.filter(f => f.status === 'online').length}</IonBadge>
          </IonSegmentButton>
          <IonSegmentButton value="all">
            <IonLabel>All</IonLabel>
            <IonBadge className="segment-badge">{friends.length}</IonBadge>
          </IonSegmentButton>
          <IonSegmentButton value="pending">
            <IonLabel>Pending</IonLabel>
            <IonBadge className="segment-badge">2</IonBadge>
          </IonSegmentButton>
        </IonSegment>

        <div className="friends-list">
          {filteredFriends.map((friend, index) => (
            <div 
              key={friend.id} 
              className="friend-card animate-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="friend-info">
                <div className="friend-avatar-container">
                  <IonAvatar className="friend-avatar">
                    <div className="avatar-emoji">{friend.avatar}</div>
                  </IonAvatar>
                  <div 
                    className="status-indicator"
                    style={{ backgroundColor: getStatusColor(friend.status) }}
                  />
                </div>
                <div className="friend-details">
                  <div className="friend-name">{friend.name}</div>
                  <div className="friend-status">
                    {friend.statusText}
                    {friend.lastSeen && (
                      <span className="last-seen"> • {friend.lastSeen}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="friend-actions">
                <IonButton fill="clear" className="action-button message-btn">
                  <IonIcon icon={chatbubbleEllipses} />
                </IonButton>
                <IonButton fill="clear" className="action-button call-btn">
                  <IonIcon icon={call} />
                </IonButton>
                <IonButton fill="clear" className="action-button video-btn">
                  <IonIcon icon={videocam} />
                </IonButton>
              </div>
            </div>
          ))}
        </div>

        {filteredFriends.length === 0 && (
          <div className="empty-state animate-fade-in">
            <div className="empty-icon">👥</div>
            <div className="empty-text">No friends found</div>
            <div className="empty-subtext">Try adjusting your filters</div>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Friends;
