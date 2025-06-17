import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  serverTimestamp,
  GeoPoint,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Ride, Location, User } from '../types';
import { userService } from './userService';

class RideService {
  private readonly ridesCollection = 'rides';

  /**
   * Create a new ride
   */
  async createRide(
    riderId: string,
    startLocation: Location,
    endLocation?: Location
  ): Promise<Ride> {
    try {
      const rider = await userService.getUserById(riderId);
      if (!rider) {
        throw new Error('Rider not found');
      }

      if (rider.role !== 'rider') {
        throw new Error('User is not a rider');
      }

      if (rider.kycStatus !== 'verified') {
        throw new Error('Rider KYC verification required');
      }

      const rideId = `ride_${riderId}_${Date.now()}`;
      const ride: Ride = {
        id: rideId,
        riderId,
        riderProfile: rider.profile,
        startLocation,
        endLocation,
        status: 'available',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(doc(db, this.ridesCollection, rideId), {
        ...ride,
        startLocation: new GeoPoint(startLocation.latitude, startLocation.longitude),
        endLocation: endLocation 
          ? new GeoPoint(endLocation.latitude, endLocation.longitude)
          : null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return ride;
    } catch (error: any) {
      console.error('Error creating ride:', error);
      throw new Error(error.message || 'Failed to create ride');
    }
  }

  /**
   * Get ride by ID
   */
  async getRideById(rideId: string): Promise<Ride | null> {
    try {
      const rideDoc = await getDoc(doc(db, this.ridesCollection, rideId));
      
      if (!rideDoc.exists()) {
        return null;
      }

      const rideData = rideDoc.data();
      return this.formatRideData(rideDoc.id, rideData);
    } catch (error: any) {
      console.error('Error getting ride:', error);
      throw new Error(error.message || 'Failed to get ride');
    }
  }

  /**
   * Get rides by rider ID
   */
  async getRidesByRiderId(riderId: string): Promise<Ride[]> {
    try {
      const q = query(
        collection(db, this.ridesCollection),
        where('riderId', '==', riderId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const rides: Ride[] = [];

      querySnapshot.forEach((doc) => {
        const rideData = doc.data();
        rides.push(this.formatRideData(doc.id, rideData));
      });

      return rides;
    } catch (error: any) {
      console.error('Error getting rides by rider:', error);
      throw new Error(error.message || 'Failed to get rides');
    }
  }

  /**
   * Get nearby rides for seekers
   */
  async getNearbyRides(location: Location, radiusInMeters: number): Promise<Ride[]> {
    try {
      // Note: This is a simplified implementation. In a production app,
      // you would use Firebase's geohash or a proper geospatial query
      const q = query(
        collection(db, this.ridesCollection),
        where('status', '==', 'available'),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      const querySnapshot = await getDocs(q);
      const allRides: Ride[] = [];

      querySnapshot.forEach((doc) => {
        const rideData = doc.data();
        allRides.push(this.formatRideData(doc.id, rideData));
      });

      // Filter by distance (client-side filtering for simplicity)
      const nearbyRides = allRides.filter(ride => {
        const distance = this.calculateDistance(
          location.latitude,
          location.longitude,
          ride.startLocation.latitude,
          ride.startLocation.longitude
        );
        return distance <= radiusInMeters;
      });

      return nearbyRides;
    } catch (error: any) {
      console.error('Error getting nearby rides:', error);
      throw new Error(error.message || 'Failed to get nearby rides');
    }
  }

  /**
   * Update ride status
   */
  async updateRideStatus(
    rideId: string,
    status: Ride['status'],
    seekerId?: string,
    matchId?: string
  ): Promise<Ride> {
    try {
      const updateData: any = {
        status,
        updatedAt: serverTimestamp(),
      };

      if (seekerId) {
        updateData.seekerId = seekerId;
      }

      if (matchId) {
        updateData.matchId = matchId;
      }

      await updateDoc(doc(db, this.ridesCollection, rideId), updateData);

      const updatedRide = await this.getRideById(rideId);
      if (!updatedRide) {
        throw new Error('Ride not found after update');
      }

      return updatedRide;
    } catch (error: any) {
      console.error('Error updating ride status:', error);
      throw new Error(error.message || 'Failed to update ride status');
    }
  }

  /**
   * Cancel ride
   */
  async cancelRide(rideId: string, userId: string): Promise<void> {
    try {
      const ride = await this.getRideById(rideId);
      if (!ride) {
        throw new Error('Ride not found');
      }

      if (ride.riderId !== userId) {
        throw new Error('Only the rider can cancel this ride');
      }

      if (ride.status === 'completed') {
        throw new Error('Cannot cancel completed ride');
      }

      await this.updateRideStatus(rideId, 'cancelled');
    } catch (error: any) {
      console.error('Error cancelling ride:', error);
      throw new Error(error.message || 'Failed to cancel ride');
    }
  }

  /**
   * Delete ride
   */
  async deleteRide(rideId: string, userId: string): Promise<void> {
    try {
      const ride = await this.getRideById(rideId);
      if (!ride) {
        throw new Error('Ride not found');
      }

      if (ride.riderId !== userId) {
        throw new Error('Only the rider can delete this ride');
      }

      if (ride.status === 'in_progress') {
        throw new Error('Cannot delete ride in progress');
      }

      await deleteDoc(doc(db, this.ridesCollection, rideId));
    } catch (error: any) {
      console.error('Error deleting ride:', error);
      throw new Error(error.message || 'Failed to delete ride');
    }
  }

  /**
   * Get available rides for swipe interface
   */
  async getAvailableRidesForSwipe(seekerId: string, location: Location): Promise<Ride[]> {
    try {
      // Get nearby available rides
      const nearbyRides = await this.getNearbyRides(location, 10000); // 10km radius
      
      // Filter out rides the seeker has already interacted with
      // Note: In a production app, you would track user interactions
      return nearbyRides.filter(ride => ride.status === 'available');
    } catch (error: any) {
      console.error('Error getting rides for swipe:', error);
      throw new Error(error.message || 'Failed to get rides for swipe');
    }
  }

  /**
   * Format ride data from Firestore
   */
  private formatRideData(id: string, data: any): Ride {
    return {
      ...data,
      id,
      startLocation: {
        latitude: data.startLocation.latitude,
        longitude: data.startLocation.longitude,
        address: data.startLocation.address,
        name: data.startLocation.name,
      },
      endLocation: data.endLocation ? {
        latitude: data.endLocation.latitude,
        longitude: data.endLocation.longitude,
        address: data.endLocation.address,
        name: data.endLocation.name,
      } : undefined,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Ride;
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }
}

export const rideService = new RideService();
