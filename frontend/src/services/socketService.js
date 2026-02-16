import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket'],
        autoConnect: true
      });

      this.socket.on('connect', () => {
        console.log('✅ Socket connected:', this.socket.id);
      });

      this.socket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRide(rideId) {
    if (this.socket) {
      this.socket.emit('join-ride', rideId);
    }
  }

  leaveRide(rideId) {
    if (this.socket) {
      this.socket.emit('leave-ride', rideId);
    }
  }

  onLocationUpdate(callback) {
    if (this.socket) {
      this.socket.on('location-update', callback);
    }
  }

  sendLocation(rideId, location) {
    if (this.socket) {
      this.socket.emit('driver-location', { rideId, location });
    }
  }
}

export default new SocketService();