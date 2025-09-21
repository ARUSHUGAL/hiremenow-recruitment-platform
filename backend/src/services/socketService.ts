import { Server, Socket } from 'socket.io';
import { auth } from '../config/firebase';
import { firestore } from '../config/firebase';
import { v4 as uuidv4 } from 'uuid';
import { VideoCall } from '../types';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: 'candidate' | 'recruiter';
}

export const setupSocketHandlers = (io: Server): void => {
  // Authentication middleware for Socket.IO
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decodedToken = await auth.verifyIdToken(token);
      const userDoc = await firestore.collection('users').doc(decodedToken.uid).get();
      
      if (!userDoc.exists) {
        return next(new Error('Authentication error: User not found'));
      }

      const userData = userDoc.data();
      socket.userId = decodedToken.uid;
      socket.userRole = userData?.role;

      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User ${socket.userId} (${socket.userRole}) connected`);

    // Update user online status
    updateUserOnlineStatus(socket.userId!, true);

    // Join user-specific room
    socket.join(`user:${socket.userId}`);

    // Handle finding a match (recruiter requests a candidate)
    socket.on('find_match', async (data) => {
      try {
        if (socket.userRole !== 'recruiter') {
          socket.emit('error', { message: 'Only recruiters can find matches' });
          return;
        }

        // Import matching service
        const { MatchingService } = await import('./matchingService');
        const matchResult = await MatchingService.findBestMatch(socket.userId!);

        if (!matchResult) {
          socket.emit('no_match_found', { message: 'No suitable candidates available' });
          return;
        }

        // Create video call room
        const roomId = uuidv4();
        const callData: VideoCall = {
          id: uuidv4(),
          candidateId: matchResult.candidate.id,
          recruiterId: socket.userId!,
          roomId,
          status: 'waiting',
          createdAt: new Date(),
        };

        // Save call to database
        await firestore.collection('calls').doc(callData.id).set(callData);

        // Notify both parties
        socket.emit('match_found', {
          callId: callData.id,
          roomId,
          candidate: {
            id: matchResult.candidate.id,
            displayName: matchResult.candidate.displayName,
            skills: matchResult.candidate.skills,
            experience: matchResult.candidate.experience,
          },
          matchScore: matchResult.score,
        });

        // Notify candidate
        io.to(`user:${matchResult.candidate.id}`).emit('incoming_call', {
          callId: callData.id,
          roomId,
          recruiter: {
            id: socket.userId,
            company: data.company || 'Unknown Company',
          },
        });

      } catch (error) {
        console.error('Error finding match:', error);
        socket.emit('error', { message: 'Failed to find match' });
      }
    });

    // Handle joining a call room
    socket.on('join_call', async (data) => {
      try {
        const { callId, roomId } = data;
        
        // Verify user is part of this call
        const callDoc = await firestore.collection('calls').doc(callId).get();
        if (!callDoc.exists) {
          socket.emit('error', { message: 'Call not found' });
          return;
        }

        const callData = callDoc.data() as VideoCall;
        if (callData.candidateId !== socket.userId && callData.recruiterId !== socket.userId) {
          socket.emit('error', { message: 'Unauthorized to join this call' });
          return;
        }

        // Join the room
        socket.join(roomId);

        // Update call status if both parties are present
        const room = io.sockets.adapter.rooms.get(roomId);
        if (room && room.size >= 2) {
          await firestore.collection('calls').doc(callId).update({
            status: 'active',
            startTime: new Date(),
          });

          io.to(roomId).emit('call_started', {
            callId,
            duration: 300, // 5 minutes in seconds
          });

          // Start call timer
          setTimeout(async () => {
            await endCall(callId, io);
          }, 300000); // 5 minutes
        }

        socket.emit('joined_call', { callId, roomId });

      } catch (error) {
        console.error('Error joining call:', error);
        socket.emit('error', { message: 'Failed to join call' });
      }
    });

    // Handle WebRTC signaling
    socket.on('webrtc_offer', (data) => {
      socket.to(data.roomId).emit('webrtc_offer', data);
    });

    socket.on('webrtc_answer', (data) => {
      socket.to(data.roomId).emit('webrtc_answer', data);
    });

    socket.on('webrtc_ice_candidate', (data) => {
      socket.to(data.roomId).emit('webrtc_ice_candidate', data);
    });

    // Handle call end
    socket.on('end_call', async (data) => {
      try {
        const { callId } = data;
        await endCall(callId, io);
      } catch (error) {
        console.error('Error ending call:', error);
        socket.emit('error', { message: 'Failed to end call' });
      }
    });

    // Handle recruiter decision
    socket.on('recruiter_decision', async (data) => {
      try {
        if (socket.userRole !== 'recruiter') {
          socket.emit('error', { message: 'Only recruiters can make decisions' });
          return;
        }

        const { callId, decision, notes, priority } = data;
        
        await firestore.collection('calls').doc(callId).update({
          recruiterDecision: {
            decision,
            notes,
            priority,
            timestamp: new Date(),
          },
        });

        // Get call data to notify candidate
        const callDoc = await firestore.collection('calls').doc(callId).get();
        const callData = callDoc.data() as VideoCall;

        // Notify candidate of decision
        io.to(`user:${callData.candidateId}`).emit('decision_received', {
          decision,
          notes,
        });

        // Trigger email notification
        const { NotificationService } = await import('./notificationService');
        await NotificationService.sendDecisionNotification(callData, decision, notes);

        socket.emit('decision_saved', { success: true });

      } catch (error) {
        console.error('Error saving decision:', error);
        socket.emit('error', { message: 'Failed to save decision' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
      updateUserOnlineStatus(socket.userId!, false);
    });
  });
};

const updateUserOnlineStatus = async (userId: string, isOnline: boolean): Promise<void> => {
  try {
    await firestore.collection('users').doc(userId).update({
      isOnline,
      lastSeen: new Date(),
    });
  } catch (error) {
    console.error('Error updating online status:', error);
  }
};

const endCall = async (callId: string, io: Server): Promise<void> => {
  try {
    const callDoc = await firestore.collection('calls').doc(callId).get();
    if (!callDoc.exists) return;

    const callData = callDoc.data() as VideoCall;
    const endTime = new Date();
    const duration = callData.startTime 
      ? Math.floor((endTime.getTime() - callData.startTime.getTime()) / 1000)
      : 0;

    await firestore.collection('calls').doc(callId).update({
      status: 'ended',
      endTime,
      duration,
    });

    // Notify all participants
    io.to(callData.roomId).emit('call_ended', {
      callId,
      duration,
    });

  } catch (error) {
    console.error('Error ending call:', error);
  }
};
