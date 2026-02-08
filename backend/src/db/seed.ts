import 'dotenv/config';
import { db } from './index.js';
import { users, categories, products, reviews, productQAs, testimonials } from './schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

/**
 * Generates a cryptographically secure random password
 */
function generateSecurePassword(length: number = 16): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    const randomBytes = crypto.randomBytes(length);
    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset[randomBytes[i] % charset.length];
    }
    return password;
}

/**
 * Seeds the admin user if one doesn't already exist
 */
async function seedAdmin(): Promise<void> {
    console.log('🔍 Checking for existing admin user...');

    const existingAdmin = await db.query.users.findFirst({
        where: eq(users.role, 'ADMIN'),
    });

    if (existingAdmin) {
        console.log('✅ Admin user already exists:', existingAdmin.email);
        return;
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || generateSecurePassword();
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    await db.insert(users).values({
        email: adminEmail,
        passwordHash: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        mustChangePassword: !process.env.ADMIN_PASSWORD, // Force change if generated
    });

    console.log('\n' + '='.repeat(50));
    console.log('✅ Admin user created successfully!');
    console.log('='.repeat(50));
    console.log(`📧 Email: ${adminEmail}`);

    if (!process.env.ADMIN_PASSWORD) {
        console.log(`🔑 Generated Password: ${adminPassword}`);
        console.log('\n⚠️  IMPORTANT: Save this password now!');
        console.log('   It will not be shown again.');
        console.log('   You will be prompted to change it on first login.');
    } else {
        console.log('🔑 Password: (from environment variable)');
    }
    console.log('='.repeat(50) + '\n');
}

/**
 * Seeds sample categories
 */
async function seedCategories(): Promise<void> {
    console.log('🔍 Checking for existing categories...');

    const existingCategories = await db.query.categories.findFirst();

    if (existingCategories) {
        console.log('✅ Categories already exist, skipping...');
        return;
    }

    const sampleCategories = [
        { name: 'Electronics', slug: 'electronics', description: 'Electronic devices and gadgets' },
        { name: 'Clothing', slug: 'clothing', description: 'Fashion and apparel' },
        { name: 'Home & Garden', slug: 'home-garden', description: 'Home improvement and garden supplies' },
        { name: 'Sports', slug: 'sports', description: 'Sports equipment and accessories' },
        { name: 'Books', slug: 'books', description: 'Books, magazines, and publications' },
    ];

    await db.insert(categories).values(sampleCategories);
    console.log(`✅ Added ${sampleCategories.length} sample categories`);
}

/**
 * Seeds sample products
 */
async function seedProducts(): Promise<void> {
    const categoryList = await db.query.categories.findMany();
    const categoryMap = new Map(categoryList.map(c => [c.slug, c.id]));

    const sampleProducts = [
        {
            name: 'Wireless Bluetooth Headphones',
            slug: 'wireless-bluetooth-headphones',
            description: 'Premium wireless headphones with noise cancellation and 30-hour battery life.',
            price: '149.99',
            discountPercent: '10',
            stock: 50,
            categoryId: categoryMap.get('electronics'),
            featured: true,
            imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
        },
        {
            name: 'Smart Watch Pro',
            slug: 'smart-watch-pro',
            description: 'Advanced smartwatch with health monitoring and GPS tracking.',
            price: '299.99',
            stock: 30,
            categoryId: categoryMap.get('electronics'),
            featured: true,
            imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
        },
        {
            name: 'Ultra-Slim Laptop',
            slug: 'ultra-slim-laptop',
            description: 'High-performance laptop with 16GB RAM and 512GB SSD.',
            price: '999.99',
            stock: 20,
            categoryId: categoryMap.get('electronics'),
            featured: true,
            imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
        },
        {
            name: 'Classic Cotton T-Shirt',
            slug: 'classic-cotton-tshirt',
            description: 'Comfortable 100% organic cotton t-shirt in various colors.',
            price: '29.99',
            discountPercent: '15',
            stock: 200,
            categoryId: categoryMap.get('clothing'),
            imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
        },
        {
            name: 'Slim Fit Jeans',
            slug: 'slim-fit-jeans',
            description: 'Stylish and durable slim-fit denim jeans.',
            price: '49.99',
            stock: 150,
            categoryId: categoryMap.get('clothing'),
            imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
        },
        {
            name: 'Hooded Sweatshirt',
            slug: 'hooded-sweatshirt',
            description: 'Warm and cozy fleece-lined hoodie.',
            price: '39.99',
            stock: 100,
            categoryId: categoryMap.get('clothing'),
            imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',
        },
        {
            name: 'Running Shoes Elite',
            slug: 'running-shoes-elite',
            description: 'Lightweight running shoes with superior cushioning and support.',
            price: '129.99',
            stock: 75,
            categoryId: categoryMap.get('sports'),
            featured: true,
            imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
        },
        {
            name: 'Yoga Mat Non-Slip',
            slug: 'yoga-mat-non-slip',
            description: 'Eco-friendly non-slip yoga mat for all types of exercises.',
            price: '19.99',
            stock: 120,
            categoryId: categoryMap.get('sports'),
            imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400',
        },
        {
            name: 'Adjustable Dumbbells',
            slug: 'adjustable-dumbbells',
            description: 'Pair of adjustable dumbbells ranging from 5 to 50 lbs.',
            price: '89.99',
            stock: 45,
            categoryId: categoryMap.get('sports'),
            imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400',
        },
        {
            name: 'Bestseller Novel Collection',
            slug: 'bestseller-novel-collection',
            description: 'A curated collection of top 5 bestselling novels.',
            price: '49.99',
            discountPercent: '20',
            stock: 100,
            categoryId: categoryMap.get('books'),
            imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
        },
        {
            name: 'Gourmet Cookbook',
            slug: 'gourmet-cookbook',
            description: 'Over 100 delicious recipes from world-renowned chefs.',
            price: '34.99',
            stock: 60,
            categoryId: categoryMap.get('books'),
            imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400',
        },
        {
            name: 'Science Fiction Masterpiece',
            slug: 'science-fiction-masterpiece',
            description: 'An epic tale of space exploration and future technology.',
            price: '14.99',
            stock: 150,
            categoryId: categoryMap.get('books'),
            imageUrl: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=400',
        },
        {
            name: 'Garden Tool Set',
            slug: 'garden-tool-set',
            description: 'Complete 10-piece garden tool set with carrying case.',
            price: '79.99',
            stock: 40,
            categoryId: categoryMap.get('home-garden'),
            imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
        },
        {
            name: 'Ceramic Plant Pot',
            slug: 'ceramic-plant-pot',
            description: 'Beautiful handcrafted ceramic pot for indoor plants.',
            price: '24.99',
            stock: 80,
            categoryId: categoryMap.get('home-garden'),
            imageUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400',
        },
        {
            name: 'Professional Knife Set',
            slug: 'professional-knife-set',
            description: 'High-carbon stainless steel kitchen knife set.',
            price: '119.99',
            stock: 25,
            categoryId: categoryMap.get('home-garden'),
            imageUrl: 'https://images.unsplash.com/photo-1556910111-a393083c9cc9?w=400',
        },
    ];

    console.log('🔍 Checking for existing products...');
    let addedCount = 0;
    for (const product of sampleProducts) {
        const existing = await db.query.products.findFirst({
            where: eq(products.slug, product.slug),
        });

        if (!existing) {
            await db.insert(products).values(product as any);
            addedCount++;
        }
    }

    console.log(`✅ Added ${addedCount} new sample products`);
}

/**
 * Seeds sample testimonials
 */
async function seedTestimonials(): Promise<void> {
    console.log('🔍 Checking for existing testimonials...');
    const existing = await db.query.testimonials.findFirst();
    if (existing) {
        console.log('✅ Testimonials already exist, skipping...');
        return;
    }

    const sampleTestimonials = [
        {
            name: 'Sarah Johnson',
            role: 'Verified Buyer',
            content: 'The quality of the products is outstanding. I bought the Wireless Headphones and they are better than any premium brand I have used before.',
            avatarUrl: 'https://i.pravatar.cc/150?u=sarah',
            rating: 5,
            featured: true,
        },
        {
            name: 'Michael Chen',
            role: 'Tech Enthusiast',
            content: 'Fast shipping and great customer service. The Smart Watch Pro is a game-changer for my daily fitness routine.',
            avatarUrl: 'https://i.pravatar.cc/150?u=michael',
            rating: 5,
            featured: true,
        },
        {
            name: 'Emily Davis',
            role: 'Home Gardener',
            content: 'Beautifully designed items. The ceramic pots added a modern touch to my living room. Highly recommend!',
            avatarUrl: 'https://i.pravatar.cc/150?u=emily',
            rating: 5,
            featured: true,
        },
    ];

    await db.insert(testimonials).values(sampleTestimonials);
    console.log(`✅ Added ${sampleTestimonials.length} testimonials`);
}

/**
 * Seeds sample reviews and Q&As for products
 */
async function seedReviewsAndQA(): Promise<void> {
    console.log('🔍 Checking for existing reviews...');
    const existingReview = await db.query.reviews.findFirst();
    if (existingReview) {
        console.log('✅ Reviews already exist, skipping...');
        return;
    }

    const productList = await db.query.products.findMany();
    const adminUser = await db.query.users.findFirst({ where: eq(users.role, 'ADMIN') });

    if (!adminUser) return;

    for (const product of productList) {
        // Add 2-3 reviews per product
        await db.insert(reviews).values([
            {
                productId: product.id,
                userId: adminUser.id,
                rating: 5,
                comment: `Absolutely love this ${product.name}! High quality and worth every penny.`,
                createdAt: new Date(),
            },
            {
                productId: product.id,
                userId: adminUser.id,
                rating: 4,
                comment: `Great product, fast delivery. Very satisfied with my purchase.`,
                createdAt: new Date(),
            }
        ]);

        // Add 1-2 Q&As per product
        await db.insert(productQAs).values([
            {
                productId: product.id,
                question: `Is this ${product.name} durable?`,
                answer: `Yes, it is designed with high-quality materials to ensure long-lasting durability.`,
            },
            {
                productId: product.id,
                question: `What is the warranty period?`,
                answer: `All our products come with a standard 12-month manufacturer warranty.`,
            }
        ]);
    }

    console.log(`✅ Added reviews and Q&As for ${productList.length} products`);
}

/**
 * Main seed function
 */
async function main(): Promise<void> {
    console.log('\n🌱 Starting database seeding...\n');

    try {
        await seedAdmin();
        await seedCategories();
        await seedProducts();
        await seedTestimonials();
        await seedReviewsAndQA();

        console.log('\n✨ Database seeding completed successfully!\n');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Seeding failed:', error);
        process.exit(1);
    }
}

main();

