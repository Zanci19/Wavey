import SimplePeer from 'simple-peer';
import { doc, setDoc, onSnapshot, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

export interface CallData {
  callId: string;
  callerId: string;
  callerName: string;
  receiverId: string;
  receiverName: string;
  type: 'voice' | 'video';
  status: 'calling' | 'ringing' | 'active' | 'ended';
  signal?: any;
  answer?: any;
  createdAt: any;
}

class WebRTCService {
  private peer: SimplePeer.Instance | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;

  // Initialize a call (caller side)
  async initiateCall(
    callId: string,
    callerId: string,
    callerName: string,
    receiverId: string,
    receiverName: string,
    type: 'voice' | 'video',
    onRemoteStream: (stream: MediaStream) => void
  ): Promise<void> {
    try {
      // Get user media
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: type === 'video',
        audio: true
      });

      // Create peer connection
      this.peer = new SimplePeer({
        initiator: true,
        trickle: false,
        stream: this.localStream
      });

      // Handle signal data
      this.peer.on('signal', async (signal) => {
        // Save call data to Firestore
        await setDoc(doc(db, 'calls', callId), {
          callId,
          callerId,
          callerName,
          receiverId,
          receiverName,
          type,
          status: 'calling',
          signal,
          createdAt: serverTimestamp()
        });
      });

      // Handle remote stream
      this.peer.on('stream', (stream) => {
        this.remoteStream = stream;
        onRemoteStream(stream);
      });

      // Handle errors
      this.peer.on('error', (err) => {
        console.error('Peer connection error:', err);
        this.endCall(callId);
      });

      // Listen for answer
      const unsubscribe = onSnapshot(doc(db, 'calls', callId), (snapshot) => {
        const data = snapshot.data();
        if (data?.answer && this.peer) {
          this.peer.signal(data.answer);
          unsubscribe();
        }
      });
    } catch (error) {
      console.error('Error initiating call:', error);
      throw error;
    }
  }

  // Answer a call (receiver side)
  async answerCall(
    callId: string,
    signal: any,
    type: 'voice' | 'video',
    onRemoteStream: (stream: MediaStream) => void
  ): Promise<void> {
    try {
      // Get user media
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: type === 'video',
        audio: true
      });

      // Create peer connection
      this.peer = new SimplePeer({
        initiator: false,
        trickle: false,
        stream: this.localStream
      });

      // Handle signal data (answer)
      this.peer.on('signal', async (answerSignal) => {
        // Update call with answer
        await updateDoc(doc(db, 'calls', callId), {
          answer: answerSignal,
          status: 'active'
        });
      });

      // Handle remote stream
      this.peer.on('stream', (stream) => {
        this.remoteStream = stream;
        onRemoteStream(stream);
      });

      // Handle errors
      this.peer.on('error', (err) => {
        console.error('Peer connection error:', err);
        this.endCall(callId);
      });

      // Signal the peer with the offer
      this.peer.signal(signal);
    } catch (error) {
      console.error('Error answering call:', error);
      throw error;
    }
  }

  // End call
  async endCall(callId: string): Promise<void> {
    try {
      // Stop all media tracks
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop());
        this.localStream = null;
      }

      // Close peer connection
      if (this.peer) {
        this.peer.destroy();
        this.peer = null;
      }

      // Update call status in Firestore
      await updateDoc(doc(db, 'calls', callId), {
        status: 'ended',
        endedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error ending call:', error);
    }
  }

  // Toggle audio
  toggleAudio(): boolean {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return audioTrack.enabled;
      }
    }
    return false;
  }

  // Toggle video
  toggleVideo(): boolean {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return videoTrack.enabled;
      }
    }
    return false;
  }

  // Get local stream
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  // Get remote stream
  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }
}

export const webRTCService = new WebRTCService();
