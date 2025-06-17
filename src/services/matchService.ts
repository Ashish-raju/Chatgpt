import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Match, Rating, SwipeAction } from '../types';
import { rideService } from './rideService';

class MatchService {
  private readonly matchesCollection = 'matches';
  private readonly swipesCollection = 'swipes';

  /**
   * Record a swipe action
   */
  async recordSwipe(swipeAction: SwipeAction): Promise<boolean> {
    try {
      const swipeId = `${swipeAction.userId}_${swipeAction.rideId}`;
      
      await setDoc(doc(db, this.swipesCollection, swipeId), {
        ...swipeAction,
        timestamp: serverTimestamp(),
      });

      // Check if this creates a match
      if (swipeAction.type === 'like') {
        return await this.checkForMatch(swipeAction.userId, swipeAction.rideId);
      }

      return false;
    } catch (error: any) {
      console.error('Error recording swipe:', error);
      throw new Error(error.message || 'Failed to record swipe');
    }
  }

  /**
   * Check if a swipe creates a match
   */
  private async checkForMatch(seekerId: string, rideId: string): Promise<boolean> {
    try {
      const ride = await rideService.getRideById(rideId);
      if (!ride) {
        throw new Error('Ride not found');
      }

      // For now, we'll create a match immediately when seeker likes a ride
      // In a full implementation, you might want to wait for rider approval
      const matchId = `match_${rideId}_${seekerId}_${Date.now()}`;
      
      const match: Match = {
        id: matchId,
        rideId,
        riderId: ride.riderId,
        seekerId,
        status: 'pending',
        paymentRequired: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(doc(db, this.matchesCollection, matchId), {
        ...match,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Update ride status to matched
      await rideService.updateRideStatus(rideId, 'matched', seekerId, matchId);

      return true;
    } catch (error: any) {
      console.error('Error checking for match:', error);
      throw new Error(error.message || 'Failed to check for match');
    }
  }

  /**
   * Get match by ID
   */
  async getMatchById(matchId: string): Promise<Match | null> {
    try {
      const matchDoc = await getDoc(doc(db, this.matchesCollection, matchId));
      
      if (!matchDoc.exists()) {
        return null;
      }

      const matchData = matchDoc.data();
      return {
        ...matchData,
        id: matchDoc.id,
        createdAt: matchData.createdAt?.toDate() || new Date(),
        updatedAt: matchData.updatedAt?.toDate() || new Date(),
      } as Match;
    } catch (error: any) {
      console.error('Error getting match:', error);
      throw new Error(error.message || 'Failed to get match');
    }
  }

  /**
   * Get matches for a user
   */
  async getMatchesForUser(userId: string): Promise<Match[]> {
    try {
      // Get matches where user is either rider or seeker
      const riderQuery = query(
        collection(db, this.matchesCollection),
        where('riderId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const seekerQuery = query(
        collection(db, this.matchesCollection),
        where('seekerId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const [riderSnapshot, seekerSnapshot] = await Promise.all([
        getDocs(riderQuery),
        getDocs(seekerQuery)
      ]);

      const matches: Match[] = [];

      riderSnapshot.forEach((doc) => {
        const matchData = doc.data();
        matches.push({
          ...matchData,
          id: doc.id,
          createdAt: matchData.createdAt?.toDate() || new Date(),
          updatedAt: matchData.updatedAt?.toDate() || new Date(),
        } as Match);
      });

      seekerSnapshot.forEach((doc) => {
        const matchData = doc.data();
        matches.push({
          ...matchData,
          id: doc.id,
          createdAt: matchData.createdAt?.toDate() || new Date(),
          updatedAt: matchData.updatedAt?.toDate() || new Date(),
        } as Match);
      });

      // Sort by creation date (most recent first)
      return matches.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error: any) {
      console.error('Error getting matches for user:', error);
      throw new Error(error.message || 'Failed to get matches');
    }
  }

  /**
   * Update match status
   */
  async updateMatchStatus(
    matchId: string,
    status: Match['status']
  ): Promise<Match> {
    try {
      await updateDoc(doc(db, this.matchesCollection, matchId), {
        status,
        updatedAt: serverTimestamp(),
      });

      const updatedMatch = await this.getMatchById(matchId);
      if (!updatedMatch) {
        throw new Error('Match not found after update');
      }

      return updatedMatch;
    } catch (error: any) {
      console.error('Error updating match status:', error);
      throw new Error(error.message || 'Failed to update match status');
    }
  }

  /**
   * Rate a match participant
   */
  async rateMatch(
    matchId: string,
    userId: string,
    rating: Rating
  ): Promise<Match> {
    try {
      const match = await this.getMatchById(matchId);
      if (!match) {
        throw new Error('Match not found');
      }

      const updateData: any = {
        updatedAt: serverTimestamp(),
      };

      if (match.riderId === userId) {
        updateData.riderRating = rating;
      } else if (match.seekerId === userId) {
        updateData.seekerRating = rating;
      } else {
        throw new Error('User not part of this match');
      }

      await updateDoc(doc(db, this.matchesCollection, matchId), updateData);

      // Check if both users rated it as a "date"
      const updatedMatch = await this.getMatchById(matchId);
      if (updatedMatch && this.isMutualDateMatch(updatedMatch)) {
        // Waive payment for mutual date matches
        await this.waivePayment(matchId);
      }

      return updatedMatch!;
    } catch (error: any) {
      console.error('Error rating match:', error);
      throw new Error(error.message || 'Failed to rate match');
    }
  }

  /**
   * Check if match is a mutual "date" match
   */
  private isMutualDateMatch(match: Match): boolean {
    return !!(
      match.riderRating?.type === 'date' &&
      match.seekerRating?.type === 'date'
    );
  }

  /**
   * Waive payment for mutual date matches
   */
  private async waivePayment(matchId: string): Promise<void> {
    try {
      await updateDoc(doc(db, this.matchesCollection, matchId), {
        paymentRequired: false,
        paymentStatus: 'waived',
        updatedAt: serverTimestamp(),
      });
    } catch (error: any) {
      console.error('Error waiving payment:', error);
      throw new Error(error.message || 'Failed to waive payment');
    }
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(
    matchId: string,
    paymentStatus: 'pending' | 'completed' | 'waived',
    paymentAmount?: number
  ): Promise<Match> {
    try {
      const updateData: any = {
        paymentStatus,
        updatedAt: serverTimestamp(),
      };

      if (paymentAmount !== undefined) {
        updateData.paymentAmount = paymentAmount;
      }

      await updateDoc(doc(db, this.matchesCollection, matchId), updateData);

      const updatedMatch = await this.getMatchById(matchId);
      if (!updatedMatch) {
        throw new Error('Match not found after update');
      }

      return updatedMatch;
    } catch (error: any) {
      console.error('Error updating payment status:', error);
      throw new Error(error.message || 'Failed to update payment status');
    }
  }

  /**
   * Get user's swipe history for a specific ride
   */
  async getUserSwipeForRide(userId: string, rideId: string): Promise<SwipeAction | null> {
    try {
      const swipeId = `${userId}_${rideId}`;
      const swipeDoc = await getDoc(doc(db, this.swipesCollection, swipeId));
      
      if (!swipeDoc.exists()) {
        return null;
      }

      const swipeData = swipeDoc.data();
      return {
        ...swipeData,
        timestamp: swipeData.timestamp?.toDate(),
      } as SwipeAction;
    } catch (error: any) {
      console.error('Error getting user swipe:', error);
      throw new Error(error.message || 'Failed to get swipe history');
    }
  }
}

export const matchService = new MatchService();
