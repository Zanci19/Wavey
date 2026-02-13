import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonAvatar, IonIcon, IonButton, IonSearchbar, IonSegment, IonSegmentButton, IonBadge, IonLabel } from '@ionic/react';
import { personAdd, chatbubbleEllipses, videocam, call } from 'ionicons/icons';
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import './Friends.css';

interface Friend {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'idle' | 'dnd' | 'offline';
  statusText: string;
  email: string;
}

const Friends: React.FC = () => {
  const [segment, setSegment] = useState<string>('online');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [allUsers, setAllUsers] = useState<Friend[]>([]);
  const { currentUser, userData } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    // Listen to all users for potential friends
    const usersQuery = query(collection(db, 'users'));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const users: Friend[] = [];
      snapshot.forEach((doc) => {
        if (doc.id !== currentUser.uid) {
          const data = doc.data();
          users.push({
            id: doc.id,
            name: data.displayName,
            avatar: data.photoURL || '👤',
            status: data.status || 'offline',
            statusText: data.statusText || '',
            email: data.email
          });
        }
      });
      setAllUsers(users);
    });

    // Listen to friends collection
    const friendsQuery = query(
      collection(db, 'friends'),
      where('userId', '==', currentUser.uid)
    );
    
    const unsubscribeFriends = onSnapshot(friendsQuery, async (snapshot) => {
      const friendIds: string[] = [];
      snapshot.forEach((doc) => {
        friendIds.push(doc.data().friendId);
      });

      // Get friend details
      if (friendIds.length > 0) {
        const friendsData: Friend[] = [];
        for (const friendId of friendIds) {
          const friendSnapshot = await getDocs(query(collection(db, 'users'), where('__name__', '==', friendId)));
          friendSnapshot.forEach((doc) => {
            const data = doc.data();
            friendsData.push({
              id: doc.id,
              name: data.displayName,
              avatar: data.photoURL || '👤',
              status: data.status || 'offline',
              statusText: data.statusText || '',
              email: data.email
            });
          });
        }
        setFriends(friendsData);
      } else {
        setFriends([]);
      }
    });

    return () => {
      unsubscribeUsers();
      unsubscribeFriends();
    };
  }, [currentUser]);

  const addFriend = async (friendId: string) => {
    if (!currentUser) return;
    
    try {
      // Add friend relationship (bidirectional)
      await setDoc(doc(db, 'friends', `${currentUser.uid}_${friendId}`), {
        userId: currentUser.uid,
        friendId: friendId,
        createdAt: new Date()
      });
      
      await setDoc(doc(db, 'friends', `${friendId}_${currentUser.uid}`), {
        userId: friendId,
        friendId: currentUser.uid,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Error adding friend:', error);
    }
  };

  const filteredFriends = friends.filter(friend => {
    if (segment === 'all') return true;
    if (segment === 'pending') return false; // No pending implemented yet
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
            <IonLabel>Add Friends</IonLabel>
            <IonBadge className="segment-badge">{allUsers.filter(u => !friends.find(f => f.id === u.id)).length}</IonBadge>
          </IonSegmentButton>
        </IonSegment>

        <div className="friends-list">
          {segment === 'pending' ? (
            // Show all users who are not friends yet
            allUsers
              .filter(user => !friends.find(f => f.id === user.id))
              .map((user, index) => (
                <div 
                  key={user.id} 
                  className="friend-card animate-card"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="friend-info">
                    <div className="friend-avatar-container">
                      <IonAvatar className="friend-avatar">
                        <div className="avatar-emoji">{user.avatar}</div>
                      </IonAvatar>
                      <div 
                        className="status-indicator"
                        style={{ backgroundColor: getStatusColor(user.status) }}
                      />
                    </div>
                    <div className="friend-details">
                      <div className="friend-name">{user.name}</div>
                      <div className="friend-status">{user.statusText}</div>
                    </div>
                  </div>
                  <div className="friend-actions">
                    <IonButton fill="solid" color="primary" size="small" onClick={() => addFriend(user.id)}>
                      Add Friend
                    </IonButton>
                  </div>
                </div>
              ))
          ) : (
            // Show actual friends
            filteredFriends.map((friend, index) => (
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
          ))
          )}
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
