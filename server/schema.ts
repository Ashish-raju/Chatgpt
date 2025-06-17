import { pgTable, varchar, text, timestamp, boolean, integer, real, uuid, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['rider', 'seeker']);
export const kycStatusEnum = pgEnum('kyc_status', ['pending', 'verified', 'rejected']);
export const rideStatusEnum = pgEnum('ride_status', ['available', 'matched', 'in_progress', 'completed', 'cancelled']);
export const matchStatusEnum = pgEnum('match_status', ['pending', 'active', 'completed', 'cancelled']);

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  phoneNumber: varchar('phone_number', { length: 20 }).notNull().unique(),
  role: userRoleEnum('role').notNull(),
  kycStatus: kycStatusEnum('kyc_status').default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User profiles table
export const userProfiles = pgTable('user_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  age: integer('age').notNull(),
  gender: varchar('gender', { length: 10 }).notNull(), // 'male', 'female', 'other'
  bio: text('bio'),
  photos: text('photos').array(), // Array of photo URLs
  hobbies: text('hobbies').array(),
  interests: text('interests').array(),
  habits: text('habits').array(),
  personalityTraits: text('personality_traits').array(),
  vehicleInfo: text('vehicle_info'), // For riders
  isKycVerified: boolean('is_kyc_verified').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Rides table
export const rides = pgTable('rides', {
  id: uuid('id').primaryKey().defaultRandom(),
  riderId: uuid('rider_id').references(() => users.id).notNull(),
  startLatitude: real('start_latitude').notNull(),
  startLongitude: real('start_longitude').notNull(),
  startAddress: text('start_address'),
  endLatitude: real('end_latitude'),
  endLongitude: real('end_longitude'),
  endAddress: text('end_address'),
  status: rideStatusEnum('status').default('available').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Matches table
export const matches = pgTable('matches', {
  id: uuid('id').primaryKey().defaultRandom(),
  rideId: uuid('ride_id').references(() => rides.id).notNull(),
  riderId: uuid('rider_id').references(() => users.id).notNull(),
  seekerId: uuid('seeker_id').references(() => users.id).notNull(),
  status: matchStatusEnum('status').default('pending').notNull(),
  seekerRating: integer('seeker_rating'), // 1-5 stars
  riderRating: integer('rider_rating'), // 1-5 stars
  riderAccepted: boolean('rider_accepted').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Swipe actions table (for tracking who swiped on whom)
export const swipeActions = pgTable('swipe_actions', {
  id: uuid('id').primaryKey().defaultRandom(),
  seekerId: uuid('seeker_id').references(() => users.id).notNull(),
  rideId: uuid('ride_id').references(() => rides.id).notNull(),
  action: varchar('action', { length: 10 }).notNull(), // 'like' or 'pass'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  rides: many(rides),
  seekerMatches: many(matches, { relationName: 'seekerMatches' }),
  riderMatches: many(matches, { relationName: 'riderMatches' }),
  swipeActions: many(swipeActions),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

export const ridesRelations = relations(rides, ({ one, many }) => ({
  rider: one(users, {
    fields: [rides.riderId],
    references: [users.id],
  }),
  matches: many(matches),
  swipeActions: many(swipeActions),
}));

export const matchesRelations = relations(matches, ({ one }) => ({
  ride: one(rides, {
    fields: [matches.rideId],
    references: [rides.id],
  }),
  rider: one(users, {
    fields: [matches.riderId],
    references: [users.id],
    relationName: 'riderMatches',
  }),
  seeker: one(users, {
    fields: [matches.seekerId],
    references: [users.id],
    relationName: 'seekerMatches',
  }),
}));

export const swipeActionsRelations = relations(swipeActions, ({ one }) => ({
  seeker: one(users, {
    fields: [swipeActions.seekerId],
    references: [users.id],
  }),
  ride: one(rides, {
    fields: [swipeActions.rideId],
    references: [rides.id],
  }),
}));

// TypeScript types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;
export type Ride = typeof rides.$inferSelect;
export type InsertRide = typeof rides.$inferInsert;
export type Match = typeof matches.$inferSelect;
export type InsertMatch = typeof matches.$inferInsert;
export type SwipeAction = typeof swipeActions.$inferSelect;
export type InsertSwipeAction = typeof swipeActions.$inferInsert;