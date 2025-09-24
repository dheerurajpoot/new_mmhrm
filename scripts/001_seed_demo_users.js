// MongoDB script to create demo users
const { MongoClient } = require("mongodb")
const bcrypt = require("bcryptjs")

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB

async function seedDemoUsers() {
  const client = new MongoClient(uri)

  try {
    await client.connect()
    const db = client.db(dbName)
    const usersCollection = db.collection("users")

    // Hash passwords
    const adminPassword = await bcrypt.hash("admin123", 12)
    const hrPassword = await bcrypt.hash("hr123", 12)
    const employeePassword = await bcrypt.hash("employee123", 12)

    // Create demo users
    const demoUsers = [
      {
        email: "admin@mmhrm.com",
        password: adminPassword,
        full_name: "System Administrator",
        role: "admin",
        department: "IT",
        position: "System Admin",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        email: "hr@mmhrm.com",
        password: hrPassword,
        full_name: "HR Manager",
        role: "hr",
        department: "Human Resources",
        position: "HR Manager",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        email: "employee@mmhrm.com",
        password: employeePassword,
        full_name: "John Employee",
        role: "employee",
        department: "Engineering",
        position: "Software Developer",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]

    // Insert demo users (ignore duplicates)
    for (const user of demoUsers) {
      const existingUser = await usersCollection.findOne({ email: user.email })
      if (!existingUser) {
        await usersCollection.insertOne(user)
        console.log(`Created demo user: ${user.email}`)
      } else {
        console.log(`Demo user already exists: ${user.email}`)
      }
    }

    console.log("Demo users seeded successfully")
  } catch (error) {
    console.error("Error seeding demo users:", error)
  } finally {
    await client.close()
  }
}

seedDemoUsers()
