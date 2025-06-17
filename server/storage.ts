import { db } from './db';
import { users, userProfiles, rides, matches, swipeActions } from './schema';
import { eq, and, sql } from 'drizzle-orm';
import type { User, InsertUser, UserProfile, InsertUserProfile, Ride, InsertRide, Match, InsertMatch, SwipeAction, InsertSwipeAction } from './schema';

// User management
export class UserService {
  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByPhone(phoneNumber: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phoneNumber, phoneNumber));
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db.update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }
}

// User profile management
export class UserProfileService {
  async createProfile(profileData: InsertUserProfile): Promise<UserProfile> {
    const [profile] = await db.insert(userProfiles).values(profileData).returning();
    return profile;
  }

  async getProfileByUserId(userId: string): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    return profile;
  }

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const [profile] = await db.update(userProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userProfiles.userId, userId))
      .returning();
    return profile;
  }
}

// Ride management
export class RideService {
  async createRide(rideData: InsertRide): Promise<Ride> {
    const [ride] = await db.insert(rides).values(rideData).returning();
    return ride;
  }

  async getRideById(id: string): Promise<Ride | undefined> {
    const [ride] = await db.select().from(rides).where(eq(rides.id, id));
    return ride;
  }

  async getRidesByRiderId(riderId: string): Promise<Ride[]> {
    return await db.select().from(rides).where(eq(rides.riderId, riderId));
  }

  async getNearbyRides(latitude: number, longitude: number, radiusKm: number = 10): Promise<Ride[]> {
    // Using Haversine formula to find nearby rides
    const ridesNearby = await db.select().from(rides).where(
      and(
        eq(rides.status, 'available'),
        sql`(
          6371 * acos(
            cos(radians(${latitude})) * 
            cos(radians(${rides.startLatitude})) * 
            cos(radians(${rides.startLongitude}) - radians(${longitude})) + 
            sin(radians(${latitude})) * 
            sin(radians(${rides.startLatitude}))
          )
        ) <= ${radiusKm}`
      )
    );
    return ridesNearby;
  }

  async updateRideStatus(id: string, status: 'available' | 'matched' | 'in_progress' | 'completed' | 'cancelled'): Promise<Ride> {
    const [ride] = await db.update(rides)
      .set({ status, updatedAt: new Date() })
      .where(eq(rides.id, id))
      .returning();
    return ride;
  }

  async deleteRide(id: string): Promise<void> {
    await db.delete(rides).where(eq(rides.id, id));
  }
}

// Swipe and matching system
export class MatchService {
  async recordSwipe(swipeData: InsertSwipeAction): Promise<SwipeAction> {
    const [swipe] = await db.insert(swipeActions).values(swipeData).returning();
    
    // Check if this creates a match (if rider has already swiped right on this seeker)
    if (swipeData.action === 'like') {
      await this.checkForMatch(swipeData.seekerId, swipeData.rideId);
    }
    
    return swipe;
  }

  private async checkForMatch(seekerId: string, rideId: string): Promise<void> {
    // Get the ride to find the rider
    const [ride] = await db.select().from(rides).where(eq(rides.id, rideId));
    if (!ride) return;

    // Create a pending match that rider can accept/decline
    const matchData: InsertMatch = {
      rideId,
      riderId: ride.riderId,
      seekerId,
      status: 'pending',
      riderAccepted: false,
    };

    await db.insert(matches).values(matchData);
  }

  async respondToMatch(matchId: string, accepted: boolean): Promise<Match> {
    const status = accepted ? 'active' : 'cancelled';
    const [match] = await db.update(matches)
      .set({ 
        riderAccepted: accepted, 
        status,
        updatedAt: new Date() 
      })
      .where(eq(matches.id, matchId))
      .returning();
    
    // If accepted, update ride status
    if (accepted) {
      await db.update(rides)
        .set({ status: 'matched' })
        .where(eq(rides.id, match.rideId));
    }
    
    return match;
  }

  async getMatchesForUser(userId: string, role: 'rider' | 'seeker'): Promise<Match[]> {
    if (role === 'rider') {
      return await db.select().from(matches).where(eq(matches.riderId, userId));
    } else {
      return await db.select().from(matches).where(eq(matches.seekerId, userId));
    }
  }

  async getPendingNotificationsForRider(riderId: string): Promise<Match[]> {
    return await db.select().from(matches).where(
      and(
        eq(matches.riderId, riderId),
        eq(matches.status, 'pending')
      )
    );
  }

  async rateMatch(matchId: string, rating: number, raterRole: 'rider' | 'seeker'): Promise<Match> {
    const updateData = raterRole === 'rider' 
      ? { riderRating: rating } 
      : { seekerRating: rating };
    
    const [match] = await db.update(matches)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(matches.id, matchId))
      .returning();
    
    return match;
  }
}

// Export service instances
export const userService = new UserService();
export const userProfileService = new UserProfileService();
export const rideService = new RideService();
export const matchService = new MatchService();