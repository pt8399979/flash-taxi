// socket/index.js
module.exports = (io) => {
  console.log('📡 Socket.io server initialized');
  
  io.on('connection', (socket) => {
    console.log('✅ New client connected:', socket.id);
    
    // Join a ride room for tracking
    socket.on('join-ride', (rideId) => {
      if (rideId && rideId !== 'null' && rideId !== 'undefined') {
        socket.join(`ride-${rideId}`);
        console.log(`Socket ${socket.id} joined ride-${rideId}`);
      } else {
        console.log(`⚠️ Invalid rideId received: ${rideId}`);
      }
    });
    
    // Leave ride room
    socket.on('leave-ride', (rideId) => {
      if (rideId && rideId !== 'null' && rideId !== 'undefined') {
        socket.leave(`ride-${rideId}`);
        console.log(`Socket ${socket.id} left ride-${rideId}`);
      }
    });
    
    // Driver location updates
    socket.on('driver-location', (data) => {
      const { rideId, location } = data;
      if (rideId && rideId !== 'null' && rideId !== 'undefined') {
        // Broadcast to all clients in this ride room except sender
        socket.to(`ride-${rideId}`).emit('location-update', location);
      }
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);
    });
  });
};