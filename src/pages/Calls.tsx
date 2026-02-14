import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonAvatar, IonIcon, IonButton, IonModal, IonButtons, IonAlert } from '@ionic/react';
import { call, videocam, mic, micOff, videocamOff, closeCircle, volumeHigh, person, checkmarkCircle, closeOutline } from 'ionicons/icons';
import { useState, useRef, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { webRTCService, CallData } from '../services/webrtc';
import './Calls.css';

interface CallHistory {
  id: string;
  callId: string;
  callerId: string;
  callerName: string;
  receiverId: string;
  receiverName: string;
  type: 'voice' | 'video' | 'missed';
  status: string;
  createdAt: any;
  duration?: number;
  incoming: boolean;
}

const Calls: React.FC = () => {
  const [activeCall, setActiveCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState('00:00');
  const [callHistory, setCallHistory] = useState<CallHistory[]>([]);
  const [incomingCall, setIncomingCall] = useState<CallData | null>(null);
  const [currentCallId, setCurrentCallId] = useState<string>('');
  const [currentCallType, setCurrentCallType] = useState<'voice' | 'video'>('voice');
  const [remotePeerName, setRemotePeerName] = useState('');
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const { currentUser, userData } = useAuth();

  // Listen for incoming calls
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'calls'),
      where('receiverId', '==', currentUser.uid),
      where('status', '==', 'calling')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const callData = change.doc.data() as CallData;
          setIncomingCall(callData);
        }
      });
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Load call history
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'calls'),
      where('status', '==', 'ended'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const history: CallHistory[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.callerId === currentUser.uid || data.receiverId === currentUser.uid) {
          history.push({
            id: doc.id,
            ...data,
            incoming: data.receiverId === currentUser.uid
          } as CallHistory);
        }
      });
      setCallHistory(history);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const startCall = async (type: 'voice' | 'video', friendId?: string, friendName?: string) => {
    if (!currentUser || !userData) return;

    try {
      const callId = `call_${Date.now()}`;
      setCurrentCallId(callId);
      setCurrentCallType(type);
      setIsVideoOff(type === 'voice');
      setActiveCall(true);
      setRemotePeerName(friendName || 'Friend');

      // Start call duration counter
      let seconds = 0;
      intervalRef.current = setInterval(() => {
        seconds++;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        setCallDuration(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      }, 1000);

      // Initialize WebRTC call
      await webRTCService.initiateCall(
        callId,
        currentUser.uid,
        userData.displayName,
        friendId || 'demo-friend',
        friendName || 'Demo Friend',
        type,
        (remoteStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        }
      );

      // Set local video
      const localStream = webRTCService.getLocalStream();
      if (localStream && localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }
    } catch (error) {
      console.error('Error starting call:', error);
      setActiveCall(false);
    }
  };

  const answerCall = async () => {
    if (!incomingCall || !currentUser) return;

    try {
      setCurrentCallId(incomingCall.callId);
      setCurrentCallType(incomingCall.type);
      setIsVideoOff(incomingCall.type === 'voice');
      setActiveCall(true);
      setRemotePeerName(incomingCall.callerName);
      setIncomingCall(null);

      // Start call duration counter
      let seconds = 0;
      intervalRef.current = setInterval(() => {
        seconds++;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        setCallDuration(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      }, 1000);

      // Answer WebRTC call
      await webRTCService.answerCall(
        incomingCall.callId,
        incomingCall.signal,
        incomingCall.type,
        (remoteStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        }
      );

      // Set local video
      const localStream = webRTCService.getLocalStream();
      if (localStream && localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }
    } catch (error) {
      console.error('Error answering call:', error);
      setIncomingCall(null);
    }
  };

  const endCall = async () => {
    if (currentCallId) {
      await webRTCService.endCall(currentCallId);
    }
    
    setActiveCall(false);
    setCallDuration('00:00');
    setIsMuted(false);
    setIsVideoOff(false);
    setCurrentCallId('');
    setRemotePeerName('');
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Clear video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  };

  const toggleMute = () => {
    const enabled = webRTCService.toggleAudio();
    setIsMuted(!enabled);
  };

  const toggleVideo = () => {
    const enabled = webRTCService.toggleVideo();
    setIsVideoOff(!enabled);
  };

  const declineCall = () => {
    setIncomingCall(null);
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
            {callHistory.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📞</div>
                <div className="empty-text">No call history</div>
                <div className="empty-subtext">Start a call to see history here</div>
              </div>
            ) : (
              callHistory.map((callItem, index) => {
                const displayName = callItem.incoming ? callItem.callerName : callItem.receiverName;
                const timestamp = callItem.createdAt?.toDate?.();
                const timeStr = timestamp ? timestamp.toLocaleString() : '';
                
                return (
                  <div 
                    key={callItem.id} 
                    className="call-history-item animate-card"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="call-info">
                      <IonAvatar className="call-avatar">
                        <div className="avatar-emoji">👤</div>
                      </IonAvatar>
                      <div className="call-details">
                        <div className="caller-name">{displayName}</div>
                        <div className="call-meta">
                          <IonIcon 
                            icon={callItem.type === 'video' ? videocam : call} 
                            className={`call-type-icon ${callItem.type}`}
                          />
                          <span className={callItem.incoming ? 'incoming' : 'outgoing'}>
                            {callItem.incoming ? '↓' : '↑'}
                          </span>
                          <span className="call-time">{timeStr}</span>
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
                );
              })
            )}
          </div>
        </div>

        {/* Incoming Call Alert */}
        <IonAlert
          isOpen={!!incomingCall}
          header="Incoming Call"
          message={`${incomingCall?.callerName} is calling...`}
          buttons={[
            {
              text: 'Decline',
              role: 'cancel',
              handler: declineCall
            },
            {
              text: 'Answer',
              handler: answerCall
            }
          ]}
        />

        {/* Active Call Modal */}
        <IonModal isOpen={activeCall} className="call-modal">
          <div className="active-call-container">
            {/* Remote video (main) */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="remote-video"
              style={{ display: isVideoOff && currentCallType === 'voice' ? 'none' : 'block' }}
            />
            
            {/* Local video (small overlay) */}
            {currentCallType === 'video' && !isVideoOff && (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="local-video"
              />
            )}
            
            <div className="call-background" style={{ opacity: isVideoOff || currentCallType === 'voice' ? 1 : 0.3 }}>
              <div className="call-participant animate-scale-in">
                <IonAvatar className="participant-avatar">
                  <div className="avatar-emoji large">👤</div>
                </IonAvatar>
                <h2 className="participant-name">{remotePeerName}</h2>
                <p className="call-status">Connected</p>
                <div className="call-timer">{callDuration}</div>
              </div>
            </div>

            <div className="call-controls">
              <div className="control-buttons">
                <button 
                  className={`control-btn ${isMuted ? 'active' : ''}`}
                  onClick={toggleMute}
                >
                  <IonIcon icon={isMuted ? micOff : mic} />
                </button>
                
                {currentCallType === 'video' && (
                  <button 
                    className={`control-btn ${isVideoOff ? 'active' : ''}`}
                    onClick={toggleVideo}
                  >
                    <IonIcon icon={isVideoOff ? videocamOff : videocam} />
                  </button>
                )}
                
                <button className="control-btn">
                  <IonIcon icon={volumeHigh} />
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
