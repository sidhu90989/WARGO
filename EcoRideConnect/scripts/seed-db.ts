import 'dotenv/config';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../shared/schema';
import { users, driverProfiles, ecoBadges, rides, payments, ratings } from '../shared/schema';

const DATABASE_URL = process.env.DATABASE_URL!;

async function seed() {
  console.log('🌱 Seeding database...\n');
  
  const pool = new Pool({ connectionString: DATABASE_URL });
  const db = drizzle({client: pool, schema });

  try {
    // 1. Create sample badges
    console.log('Creating eco badges...');
    const badgeIds = await db.insert(ecoBadges).values([
      { name: 'Eco Warrior', description: 'Complete 10 rides', iconName: 'eco-warrior', requiredPoints: 100 },
      { name: 'Green Champion', description: 'Save 50kg CO2', iconName: 'green-champion', requiredPoints: 500 },
      { name: 'Carbon Crusher', description: 'Save 100kg CO2', iconName: 'carbon-crusher', requiredPoints: 1000 },
    ]).returning().execute();
    console.log(`✓ Created ${badgeIds.length} badges\n`);

    // 2. Create sample users (riders and drivers)
    console.log('Creating users...');
    const userIds = await db.insert(users).values([
      { 
        name: 'Alice Rider', 
        email: 'alice@example.com', 
        phone: '+911234567890',
        role: 'rider',
        ecoPoints: 150,
        totalCO2Saved: '12.50',
        gender: 'female'
      },
      { 
        name: 'Bob Driver', 
        email: 'bob@example.com', 
        phone: '+911234567891',
        role: 'driver',
        ecoPoints: 500,
        totalCO2Saved: '45.00',
        gender: 'male'
      },
      { 
        name: 'Charlie Rider', 
        email: 'charlie@example.com', 
        phone: '+911234567892',
        role: 'rider',
        ecoPoints: 75,
        totalCO2Saved: '5.25',
        gender: 'male'
      },
      { 
        name: 'Diana Driver', 
        email: 'diana@example.com', 
        phone: '+911234567893',
        role: 'driver',
        ecoPoints: 300,
        totalCO2Saved: '28.00',
        gender: 'female'
      },
      { 
        name: 'Admin User', 
        email: 'admin@wargo.com', 
        phone: '+911234567899',
        role: 'admin',
        ecoPoints: 0,
        totalCO2Saved: '0',
        gender: 'prefer_not_to_say'
      },
    ]).returning().execute();
    console.log(`✓ Created ${userIds.length} users\n`);

    // 3. Create driver profiles
    console.log('Creating driver profiles...');
    const driverUser1 = userIds.find(u => u.name === 'Bob Driver')!;
    const driverUser2 = userIds.find(u => u.name === 'Diana Driver')!;
    
    await db.insert(driverProfiles).values([
      {
        userId: driverUser1.id,
        vehicleType: 'e_rickshaw',
        vehicleNumber: 'DL01AB1234',
        vehicleModel: 'E-Rick 2024',
        licenseNumber: 'DL1234567890',
        kycStatus: 'verified',
        rating: '4.8',
        totalRides: 150,
        totalEarnings: '15000.00',
        isAvailable: true,
        femalePrefEnabled: false
      },
      {
        userId: driverUser2.id,
        vehicleType: 'e_scooter',
        vehicleNumber: 'DL02CD5678',
        vehicleModel: 'EcoScoot Pro',
        licenseNumber: 'DL9876543210',
        kycStatus: 'verified',
        rating: '4.9',
        totalRides: 200,
        totalEarnings: '25000.00',
        isAvailable: true,
        femalePrefEnabled: true
      },
    ]).returning().execute();
    console.log(`✓ Created 2 driver profiles\n`);

    // 4. Create sample rides
    console.log('Creating rides...');
    const riderUser1 = userIds.find(u => u.name === 'Alice Rider')!;
    const riderUser2 = userIds.find(u => u.name === 'Charlie Rider')!;
    
    const rideIds = await db.insert(rides).values([
      {
        riderId: riderUser1.id,
        driverId: driverUser1.id,
        pickupLocation: 'Connaught Place, New Delhi',
        pickupLat: '28.6315',
        pickupLng: '77.2167',
        dropoffLocation: 'India Gate, New Delhi',
        dropoffLat: '28.6129',
        dropoffLng: '77.2295',
        vehicleType: 'e_rickshaw',
        status: 'completed',
        distance: '3.50',
        estimatedFare: '50.00',
        actualFare: '50.00',
        co2Saved: '2.10',
        ecoPointsEarned: 25,
        requestedAt: new Date(Date.now() - 86400000),
        acceptedAt: new Date(Date.now() - 86300000),
        startedAt: new Date(Date.now() - 86200000),
        completedAt: new Date(Date.now() - 85000000)
      },
      {
        riderId: riderUser2.id,
        driverId: driverUser2.id,
        pickupLocation: 'Karol Bagh, Delhi',
        pickupLat: '28.6519',
        pickupLng: '77.1910',
        dropoffLocation: 'Rajiv Chowk, Delhi',
        dropoffLat: '28.6328',
        dropoffLng: '77.2197',
        vehicleType: 'e_scooter',
        status: 'completed',
        distance: '5.20',
        estimatedFare: '75.00',
        actualFare: '75.00',
        co2Saved: '3.12',
        ecoPointsEarned: 35,
        requestedAt: new Date(Date.now() - 43200000),
        acceptedAt: new Date(Date.now() - 43100000),
        startedAt: new Date(Date.now() - 43000000),
        completedAt: new Date(Date.now() - 41800000)
      },
      {
        riderId: riderUser1.id,
        pickupLocation: 'Nehru Place, Delhi',
        pickupLat: '28.5494',
        pickupLng: '77.2501',
        dropoffLocation: 'Hauz Khas, Delhi',
        dropoffLat: '28.5494',
        dropoffLng: '77.1992',
        vehicleType: 'e_rickshaw',
        status: 'pending',
        distance: '4.00',
        estimatedFare: '60.00',
        femalePrefRequested: false,
        requestedAt: new Date()
      }
    ]).returning().execute();
    console.log(`✓ Created ${rideIds.length} rides\n`);

    // 5. Create payments for completed rides
    console.log('Creating payments...');
    const completedRides = rideIds.filter(r => r.status === 'completed');
    await db.insert(payments).values(
      completedRides.map(ride => ({
        rideId: ride.id,
        amount: ride.actualFare!,
        paymentMethod: 'upi' as const,
        paymentStatus: 'completed' as const,
        transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`.toUpperCase()
      }))
    ).execute();
    console.log(`✓ Created ${completedRides.length} payments\n`);

    // 6. Create ratings for completed rides
    console.log('Creating ratings...');
    await db.insert(ratings).values(
      completedRides.map(ride => ({
        rideId: ride.id,
        raterId: ride.riderId,
        rateeId: ride.driverId!,
        rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
        feedback: 'Great ride! Very eco-friendly driver.'
      }))
    ).execute();
    console.log(`✓ Created ${completedRides.length} ratings\n`);

    console.log('✅ Database seeded successfully!\n');
    console.log('Summary:');
    console.log(`  - ${badgeIds.length} eco badges`);
    console.log(`  - ${userIds.length} users (3 riders, 2 drivers, 1 admin)`);
    console.log(`  - 2 driver profiles`);
    console.log(`  - ${rideIds.length} rides`);
    console.log(`  - ${completedRides.length} payments`);
    console.log(`  - ${completedRides.length} ratings`);

  } catch (error: any) {
    console.error('❌ Seeding failed:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

seed()
  .then(() => {
    console.log('\n🎉 Seeding complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Seeding failed:', error);
    process.exit(1);
  });
