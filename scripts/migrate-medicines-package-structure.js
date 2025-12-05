/**
 * Script: Migrate old medicines to support new package_structure
 * Purpose: Update existing medicines without package_structure to add default structure
 * Run: node scripts/migrate-medicines-package-structure.js
 */

import mongoose from 'mongoose'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') })

// Import Medicine model
import { Medicine } from '../src/modules/medicines/medicines.model.js'

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pharmacy_management'
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log('✓ Connected to MongoDB')
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error.message)
    process.exit(1)
  }
}

const disconnectDB = async () => {
  await mongoose.disconnect()
  console.log('✓ Disconnected from MongoDB')
}

const DEFAULT_PACKAGE_STRUCTURE = {
  box: { contains: 10, child: 'blister' },
  blister: { contains: 10, child: 'tablet' },
  tablet: { contains: 1, child: null },
}

const DEFAULT_PRICES = {
  base_unit_price: 0,
  price_per_unit: {
    box: null,
    blister: null,
    tablet: null,
  },
}

async function migrateMedicines() {
  try {
    console.log('Starting medicine migration...\n')

    // Find all medicines without package_structure
    const medicinesToUpdate = await Medicine.find({
      $or: [{ package_structure: null }, { package_structure: { $exists: false } }],
    })

    if (medicinesToUpdate.length === 0) {
      console.log('✓ No medicines to update - all have package_structure')
      return
    }

    console.log(`Found ${medicinesToUpdate.length} medicines to update\n`)

    let updated = 0
    let errors = 0

    for (const medicine of medicinesToUpdate) {
      try {
        // Update with default package_structure if not present
        if (!medicine.package_structure) {
          medicine.package_structure = DEFAULT_PACKAGE_STRUCTURE
        }

        // Update prices if not present
        if (!medicine.prices) {
          medicine.prices = DEFAULT_PRICES
        } else {
          if (!medicine.prices.base_unit_price) {
            medicine.prices.base_unit_price = 0
          }
          if (!medicine.prices.price_per_unit) {
            medicine.prices.price_per_unit = {
              box: null,
              blister: null,
              tablet: null,
            }
          }
        }

        await medicine.save()
        updated++
        console.log(`✓ Updated: ${medicine.name} (${medicine._id}) - package_structure added`)
      } catch (error) {
        errors++
        console.error(`✗ Failed to update ${medicine.name} (${medicine._id}):`, error.message)
      }
    }

    console.log(`\n=== Migration Summary ===`)
    console.log(`Total medicines processed: ${medicinesToUpdate.length}`)
    console.log(`✓ Successfully updated: ${updated}`)
    console.log(`✗ Failed: ${errors}`)
  } catch (error) {
    console.error('Migration error:', error.message)
    throw error
  }
}

async function main() {
  await connectDB()
  try {
    await migrateMedicines()
  } finally {
    await disconnectDB()
  }
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
