


class WebRTCHandler {
  constructor(onIceCandidate, onTrack) {
    this.peerConnection = null;
    this.localStream = null;
    this.onIceCandidate = onIceCandidate;
    this.onTrack = onTrack;
    this.iceCandidates = [];
  }

  async recreatePeerConnection() {
    if (this.peerConnection) {
      this.peerConnection.close();
    }
    await this.createPeerConnection();
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => this.peerConnection.addTrack(track, this.localStream));
    }
    // Trigger renegotiation if necessary
  }

  async addIceCandidate(candidate) {
    try {
      if (this.peerConnection.remoteDescription && this.peerConnection.iceConnectionState !== 'closed') {
        await this.peerConnection.addIceCandidate(candidate);
        console.log('Added ICE candidate successfully');
      } else {
        this.iceCandidates.push(candidate);
        console.log('ICE candidate buffered');
      }
    } catch (error) {
      console.error('Error adding received ICE candidate', error);
    }
  }
}

// Make WebRTCHandler available globally
window.WebRTCHandler = WebRTCHandler;


// Make WebRTCHandler available globally
window.WebRTCHandler = WebRTCHandler;