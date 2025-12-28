/**
 * One-time migration script: JSON to SQLite
 *
 * Run: node migrations/migrate-json-to-sqlite.js
 *
 * This script:
 * 1. Reads all JSON data files
 * 2. Creates SQLite tables via Sequelize sync
 * 3. Migrates data with proper transformations
 * 4. Hashes existing plaintext passwords
 * 5. Moves JSON files to backup folder
 */

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const { sequelize, User, Meal, CartItem, Order, OrderItem, Category, Review } = require('../models');

const DATA_DIR = path.join(__dirname, '../data');
const BACKUP_DIR = path.join(DATA_DIR, 'backup');

// Read JSON file helper
function readJSON(filename) {
    try {
        const filePath = path.join(DATA_DIR, filename);
        if (!fs.existsSync(filePath)) {
            console.warn(`  Warning: ${filename} not found, skipping...`);
            return [];
        }
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data || '[]');
    } catch (err) {
        console.warn(`  Warning: Could not read ${filename}:`, err.message);
        return [];
    }
}

// Move file to backup
function backupFile(filename) {
    const srcPath = path.join(DATA_DIR, filename);
    const destPath = path.join(BACKUP_DIR, filename);

    if (fs.existsSync(srcPath)) {
        // Ensure backup directory exists
        if (!fs.existsSync(BACKUP_DIR)) {
            fs.mkdirSync(BACKUP_DIR, { recursive: true });
        }
        fs.copyFileSync(srcPath, destPath);
        console.log(`  Backed up: ${filename}`);
    }
}

async function migrate() {
    console.log('='.repeat(50));
    console.log('Starting JSON to SQLite Migration');
    console.log('='.repeat(50));
    console.log('');

    try {
        // 1. Sync database (creates tables)
        console.log('Step 1: Creating database tables...');
        await sequelize.sync({ force: true }); // WARNING: force:true drops existing tables
        console.log('  Tables created successfully.\n');

        // 2. Migrate Users (with password hashing)
        console.log('Step 2: Migrating users...');
        const usersData = readJSON('users.json');
        for (const userData of usersData) {
            // Hash the plaintext password
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            await User.create({
                id: userData.id,
                username: userData.username,
                email: userData.email,
                address: userData.address || '',
                password: hashedPassword
            }, { hooks: false }); // Skip hooks since we already hashed
        }
        console.log(`  Migrated ${usersData.length} users.\n`);

        // 3. Migrate Meals
        console.log('Step 3: Migrating meals...');
        const mealsData = readJSON('meals.json');
        for (const meal of mealsData) {
            await Meal.create({
                id: meal.id,
                name: meal.name,
                description: meal.description || '',
                price: meal.price,
                image: meal.image || '/images/meals/default.jpg',
                category: meal.category || 'main',
                userId: meal.userId
            });
        }
        console.log(`  Migrated ${mealsData.length} meals.\n`);

        // 4. Migrate Cart Items
        console.log('Step 4: Migrating cart items...');
        const cartData = readJSON('cart.json');
        for (const item of cartData) {
            await CartItem.create({
                id: item.id, // Keep the STRING id
                userId: item.userId,
                mealId: item.mealId,
                name: item.name,
                price: item.price,
                image: item.image,
                quantity: item.quantity,
                sellerId: item.sellerId || null
            });
        }
        console.log(`  Migrated ${cartData.length} cart items.\n`);

        // 5. Migrate Categories
        console.log('Step 5: Migrating categories...');
        const categoriesData = readJSON('categories.json');
        for (const category of categoriesData) {
            await Category.create({
                id: category.id,
                name: category.name,
                description: category.description || '',
                image: category.image || '',
                type: category.type || ''
            });
        }
        console.log(`  Migrated ${categoriesData.length} categories.\n`);

        // 6. Migrate Reviews
        console.log('Step 6: Migrating reviews...');
        const reviewsData = readJSON('reviews.json');
        for (const review of reviewsData) {
            await Review.create({
                id: review.id,
                name: review.name,
                avatar: review.avatar || '',
                rating: review.rating,
                comment: review.comment || '',
                date: review.date
            });
        }
        console.log(`  Migrated ${reviewsData.length} reviews.\n`);

        // 7. Migrate Orders and OrderItems
        console.log('Step 7: Migrating orders...');
        const ordersData = readJSON('orders.json');
        let totalOrderItems = 0;
        for (const orderData of ordersData) {
            // Create Order (flattening customer object)
            const order = await Order.create({
                id: orderData.id,
                userId: orderData.userId,
                customerName: orderData.customer.name,
                customerPhone: orderData.customer.phone,
                customerAddress: orderData.customer.address,
                customerNotes: orderData.customer.notes || '',
                total: orderData.total,
                paymentMethod: orderData.paymentMethod,
                status: orderData.status,
                createdAt: orderData.createdAt,
                estimatedDelivery: orderData.estimatedDelivery
            });

            // Create OrderItems
            for (const item of orderData.items) {
                await OrderItem.create({
                    orderId: order.id,
                    mealId: item.mealId,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    sellerId: item.sellerId || null
                });
                totalOrderItems++;
            }
        }
        console.log(`  Migrated ${ordersData.length} orders with ${totalOrderItems} order items.\n`);

        // 8. Backup JSON files
        console.log('Step 8: Backing up JSON files...');
        backupFile('users.json');
        backupFile('meals.json');
        backupFile('cart.json');
        backupFile('orders.json');
        backupFile('categories.json');
        backupFile('reviews.json');
        console.log('');

        // 9. Print summary
        console.log('='.repeat(50));
        console.log('Migration completed successfully!');
        console.log('='.repeat(50));
        console.log('');
        console.log('Summary:');
        console.log(`  - Users: ${usersData.length}`);
        console.log(`  - Meals: ${mealsData.length}`);
        console.log(`  - Cart Items: ${cartData.length}`);
        console.log(`  - Orders: ${ordersData.length}`);
        console.log(`  - Order Items: ${totalOrderItems}`);
        console.log(`  - Categories: ${categoriesData.length}`);
        console.log(`  - Reviews: ${reviewsData.length}`);
        console.log('');
        console.log(`Database file: ${path.join(__dirname, '../database/food-delivery.sqlite')}`);
        console.log(`JSON backups: ${BACKUP_DIR}`);
        console.log('');
        console.log('NOTE: User passwords have been hashed with bcrypt.');
        console.log('      Users can login with their existing passwords.');

    } catch (error) {
        console.error('');
        console.error('='.repeat(50));
        console.error('Migration FAILED!');
        console.error('='.repeat(50));
        console.error('Error:', error.message);
        console.error('');
        console.error('Full error:', error);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

// Run migration
migrate();
