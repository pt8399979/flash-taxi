// test-mongodb-atlas.js
const { MongoClient } = require('mongodb');
require('dotenv').config();

async function testMongoDB() {
  console.log('🔍 Testing MongoDB Atlas Connection...\n');
  
  // Use the connection string from .env
  const uri = process.env.MONGODB_URI;
  
  // Show connection string (hiding password for security)
  const hiddenUri = uri.replace(/:[^:@]+@/, ':****@');
  console.log('📡 Connecting to:', hiddenUri);
  
  const client = new MongoClient(uri);
  
  try {
    // Connect to MongoDB
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas successfully!\n');
    
    // Get the database
    const db = client.db('taxi_booking');
    console.log('📊 Database: taxi_booking');
    
    // Test creating collections
    console.log('\n📁 Testing Collection Operations...');
    
    // Create users collection
    await db.createCollection('users');
    console.log('✅ Created users collection');
    
    // Insert a test user
    const testUser = {
      email: 'test@example.com',
      name: 'Test User',
      createdAt: new Date(),
      isVerified: true
    };
    
    const result = await db.collection('users').insertOne(testUser);
    console.log('✅ Inserted test user with ID:', result.insertedId);
    
    // Read the test user
    const user = await db.collection('users').findOne({ _id: result.insertedId });
    console.log('✅ Retrieved test user:', user.email);
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('\n📋 Collections in database:');
    collections.forEach(col => console.log(`   - ${col.name}`));
    
    // Clean up - remove test user
    await db.collection('users').deleteOne({ _id: result.insertedId });
    console.log('\n✅ Cleaned up test data');
    
    console.log('\n🎉 MongoDB Atlas is working perfectly!');
    console.log('\n📝 Database Info:');
    console.log(`   - Host: cluster0.so8u9ik.mongodb.net`);
    console.log(`   - Database: taxi_booking`);
    console.log(`   - User: pt8399979_db_user`);
    
  } catch (error) {
    console.error('\n❌ MongoDB Connection Failed:', error.message);
    
    console.log('\n🔧 Troubleshooting Steps:');
    console.log('1. Check if username/password is correct:');
    console.log('   Username: pt8399979_db_user');
    console.log('   Password: TfophCMkBQ2vyVFu');
    console.log('\n2. Check Network Access in MongoDB Atlas:');
    console.log('   - Go to Atlas dashboard → Network Access');
    console.log('   - Add your current IP or allow from anywhere (0.0.0.0/0)');
    console.log('\n3. Verify cluster is running:');
    console.log('   - Go to Atlas dashboard → Clusters');
    console.log('   - Check if cluster status is "ACTIVE"');
    
  } finally {
    await client.close();
    console.log('\n👋 Connection closed');
  }
}

// Run the test
testMongoDB();