import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonAvatar, IonIcon, IonButton, IonItem, IonLabel, IonToggle, IonList } from '@ionic/react';
import { settings, notifications, shield, moon, language, informationCircle, logOut, pencil, checkmarkCircle } from 'ionicons/icons';
import { useState } from 'react';
import './Profile.css';

const Profile: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const stats = [
    { label: 'Messages', value: '2,847', color: 'var(--discord-blurple)' },
    { label: 'Friends', value: '156', color: 'var(--discord-green)' },
    { label: 'Servers', value: '23', color: 'var(--discord-yellow)' },
  ];

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': 'var(--discord-background-tertiary)' }}>
          <IonTitle className="profile-title">Profile</IonTitle>
          <IonButton slot="end" fill="clear" className="edit-btn" onClick={() => setIsEditing(!isEditing)}>
            <IonIcon icon={isEditing ? checkmarkCircle : pencil} />
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="profile-content">
        <div className="profile-header">
          <div className="profile-banner animate-slide-down"></div>
          <div className="profile-info animate-scale-in">
            <div className="avatar-container">
              <IonAvatar className="profile-avatar">
                <div className="avatar-emoji">👤</div>
              </IonAvatar>
              <div className="status-badge online">
                <div className="status-dot"></div>
              </div>
            </div>
            <h1 className="profile-name">WaveUser</h1>
            <p className="profile-tag">#1234</p>
            <p className="profile-status">🌊 Riding the waves of code</p>
          </div>
        </div>

        <div className="stats-container">
          {stats.map((stat, index) => (
            <div 
              key={stat.label} 
              className="stat-card animate-card"
              style={{ 
                animationDelay: `${index * 0.1}s`,
                borderTop: `3px solid ${stat.color}`
              }}
            >
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="settings-section">
          <h2 className="section-title">Settings</h2>
          
          <IonList className="settings-list">
            <IonItem className="setting-item animate-slide-right" style={{ animationDelay: '0.1s' }}>
              <IonIcon icon={moon} slot="start" className="setting-icon" />
              <IonLabel>
                <h3>Dark Mode</h3>
                <p>Toggle dark theme</p>
              </IonLabel>
              <IonToggle 
                checked={darkMode} 
                onIonChange={e => setDarkMode(e.detail.checked)}
                className="setting-toggle"
              />
            </IonItem>

            <IonItem className="setting-item animate-slide-right" style={{ animationDelay: '0.2s' }}>
              <IonIcon icon={notifications} slot="start" className="setting-icon" />
              <IonLabel>
                <h3>Notifications</h3>
                <p>Enable push notifications</p>
              </IonLabel>
              <IonToggle 
                checked={notificationsEnabled} 
                onIonChange={e => setNotificationsEnabled(e.detail.checked)}
                className="setting-toggle"
              />
            </IonItem>

            <IonItem button className="setting-item animate-slide-right" style={{ animationDelay: '0.3s' }}>
              <IonIcon icon={shield} slot="start" className="setting-icon privacy" />
              <IonLabel>
                <h3>Privacy & Safety</h3>
                <p>Control your privacy</p>
              </IonLabel>
            </IonItem>

            <IonItem button className="setting-item animate-slide-right" style={{ animationDelay: '0.4s' }}>
              <IonIcon icon={language} slot="start" className="setting-icon" />
              <IonLabel>
                <h3>Language</h3>
                <p>English (US)</p>
              </IonLabel>
            </IonItem>

            <IonItem button className="setting-item animate-slide-right" style={{ animationDelay: '0.5s' }}>
              <IonIcon icon={informationCircle} slot="start" className="setting-icon" />
              <IonLabel>
                <h3>About</h3>
                <p>Version 1.0.0</p>
              </IonLabel>
            </IonItem>
          </IonList>
        </div>

        <div className="logout-section">
          <IonButton 
            expand="block" 
            color="danger" 
            className="logout-button animate-scale"
          >
            <IonIcon icon={logOut} slot="start" />
            Log Out
          </IonButton>
        </div>

        <div className="app-version">
          <p>Wavey v1.0.0</p>
          <p>Made with 💙 by WaveDev</p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Profile;
