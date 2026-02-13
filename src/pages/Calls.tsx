import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonAvatar, IonIcon, IonButton, IonModal, IonButtons } from '@ionic/react';
import { call, videocam, mic, micOff, videocamOff, closeCircle, volumeHigh, person, checkmarkCircle, closeOutline } from 'ionicons/icons';
import { useState } from 'react';
import './Calls.css';

interface CallHistory {
  id: number;
  name: string;
  avatar: string;
  type: 'voice' | 'video' | 'missed';
  time: string;
  duration?: string;
  incoming: boolean;
}

const Calls: React.FC = () => {
  const [activeCall, setActiveCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState('00:00');

  const [callHistory] = useState<CallHistory[]>([
    { id: 1, name: 'Alex Wave', avatar: '👨‍💻', type: 'video', time: '2 hours ago', duration: '45:32', incoming: false },
    { id: 2, name: 'Sarah Dev', avatar: '👩‍🎨', type: 'voice', time: '5 hours ago', duration: '12:15', incoming: true },
    { id: 3, name: 'Mike Code', avatar: '👨‍🚀', type: 'missed', time: 'Yesterday', incoming: true },
    { id: 4, name: 'Emma Tech', avatar: '👩‍💼', type: 'voice', time: '2 days ago', duration: '8:42', incoming: false },
    { id: 5, name: 'Lisa Test', avatar: '👩‍🔬', type: 'video', time: '3 days ago', duration: '1:23:45', incoming: true },
  ]);

  const startCall = (type: 'voice' | 'video') => {
    setActiveCall(true);
    setIsVideoOff(type === 'voice');
    
    // Simulate call duration counter
    let seconds = 0;
    const interval = setInterval(() => {
      seconds++;
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      setCallDuration(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    }, 1000);

    // Store interval ID for cleanup
    (window as any).callInterval = interval;
  };

  const endCall = () => {
    setActiveCall(false);
    setCallDuration('00:00');
    setIsMuted(false);
    setIsVideoOff(false);
    if ((window as any).callInterval) {
      clearInterval((window as any).callInterval);
    }
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': 'var(--discord-background-tertiary)' }}>
          <IonTitle className="calls-title">Calls</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="calls-content">
        <div className="quick-call-section animate-slide-in">
          <h2 className="section-title">Start a Call</h2>
          <div className="quick-call-buttons">
            <button className="quick-call-btn voice-call" onClick={() => startCall('voice')}>
              <div className="call-icon-wrapper">
                <IonIcon icon={call} />
              </div>
              <span>Voice Call</span>
            </button>
            <button className="quick-call-btn video-call" onClick={() => startCall('video')}>
              <div className="call-icon-wrapper">
                <IonIcon icon={videocam} />
              </div>
              <span>Video Call</span>
            </button>
          </div>
        </div>

        <div className="call-history-section">
          <h2 className="section-title">Recent</h2>
          <div className="call-history-list">
            {callHistory.map((callItem, index) => (
              <div 
                key={callItem.id} 
                className="call-history-item animate-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="call-info">
                  <IonAvatar className="call-avatar">
                    <div className="avatar-emoji">{callItem.avatar}</div>
                  </IonAvatar>
                  <div className="call-details">
                    <div className="caller-name">{callItem.name}</div>
                    <div className="call-meta">
                      <IonIcon 
                        icon={callItem.type === 'video' ? videocam : call} 
                        className={`call-type-icon ${callItem.type}`}
                      />
                      <span className={callItem.incoming ? 'incoming' : 'outgoing'}>
                        {callItem.incoming ? '↓' : '↑'}
                      </span>
                      <span className="call-time">{callItem.time}</span>
                      {callItem.duration && (
                        <>
                          <span className="separator">•</span>
                          <span className="call-duration">{callItem.duration}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="call-actions">
                  <IonButton fill="clear" className="recall-btn voice">
                    <IonIcon icon={call} />
                  </IonButton>
                  <IonButton fill="clear" className="recall-btn video">
                    <IonIcon icon={videocam} />
                  </IonButton>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Call Modal */}
        <IonModal isOpen={activeCall} className="call-modal">
          <div className="active-call-container">
            <div className="call-background">
              <div className="call-participant animate-scale-in">
                <IonAvatar className="participant-avatar">
                  <div className="avatar-emoji large">👨‍💻</div>
                </IonAvatar>
                <h2 className="participant-name">Alex Wave</h2>
                <p className="call-status">Connected</p>
                <div className="call-timer">{callDuration}</div>
              </div>
            </div>

            <div className="call-controls">
              <div className="control-buttons">
                <button 
                  className={`control-btn ${isMuted ? 'active' : ''}`}
                  onClick={() => setIsMuted(!isMuted)}
                >
                  <IonIcon icon={isMuted ? micOff : mic} />
                </button>
                
                <button 
                  className={`control-btn ${isVideoOff ? 'active' : ''}`}
                  onClick={() => setIsVideoOff(!isVideoOff)}
                >
                  <IonIcon icon={isVideoOff ? videocamOff : videocam} />
                </button>
                
                <button className="control-btn">
                  <IonIcon icon={volumeHigh} />
                </button>
                
                <button className="control-btn">
                  <IonIcon icon={person} />
                </button>
              </div>

              <button className="end-call-btn" onClick={endCall}>
                <IonIcon icon={closeCircle} />
                <span>End Call</span>
              </button>
            </div>
          </div>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Calls;
