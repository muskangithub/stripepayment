
import 'dotenv/config';

const API_URL = 'http://localhost:3001/api';

async function testCart() {
    console.log('🛒 Testing Cart API...');

    // 1. Register a new user
    console.log('\n📝 Registering new user...');
    const randomEmail = `testuser_${Date.now()}@example.com`;
    const password = 'password123';

    const registerRes = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: randomEmail, password, firstName: 'Test', lastName: 'User' }),
    });

    let token = '';

    if (registerRes.ok) {
        const data = await registerRes.json();
        token = data.token;
        console.log(`✅ Registered successfully: ${randomEmail}`);
    } else {
        console.log('⚠️  Registration failed (maybe user exists), trying login...');
        // Try login
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: randomEmail, password }),
        });

        if (!loginRes.ok) {
            console.error('❌ Login failed:', await loginRes.text());
            return;
        }
        const data = await loginRes.json();
        token = data.token;
        console.log('✅ Login successful');
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    // 2. Get Products to find an ID
    console.log('\n📦 Fetching products...');
    const productsRes = await fetch(`${API_URL}/products?limit=1`, { headers });
    const productsData = await productsRes.json();

    if (!productsData.products || productsData.products.length === 0) {
        console.error('❌ No products found to add to cart (please run seed script first)');
        // Check if we can seed? No, just fail.
        return;
    }

    const product = productsData.products[0];
    console.log(`✅ Found product: ${product.name} (${product.id})`);

    // 3. Add to Cart
    console.log(`\n➕ Adding product to cart...`);
    const addRes = await fetch(`${API_URL}/cart`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ productId: product.id, quantity: 2 }),
    });

    if (!addRes.ok) {
        console.error('❌ Failed to add to cart:', await addRes.text());
        return;
    }

    const addedCart = await addRes.json();
    console.log('✅ Added to cart:', JSON.stringify(addedCart, null, 2));

    // 4. Update Quantity
    console.log(`\n🔄 Updating quantity...`);
    // Note: My implementation uses PUT /:productId with body { quantity }
    const updateRes = await fetch(`${API_URL}/cart/${product.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ quantity: 5 }),
    });

    if (!updateRes.ok) {
        console.error('❌ Failed to update quantity:', await updateRes.text());
        return;
    }
    console.log('✅ Quantity updated');

    // 5. Verify Cart Content (fetch fresh)
    console.log(`\n🔍 Verifying cart content...`);
    const getRes = await fetch(`${API_URL}/cart`, { headers });
    const currentCart = await getRes.json();

    // Check if items exist and match
    if (!currentCart.items || currentCart.items.length === 0) {
        console.error('❌ Cart is empty but should have items:', JSON.stringify(currentCart, null, 2));
    } else {
        const item = currentCart.items.find((i: any) => i.productId === product.id || (i.product && i.product.id === product.id));
        // Backend returns userCart with items relations. Item has product relation.
        // item structure: { id, cartId, productId, quantity, product: { ... } }

        if (item && item.quantity === 5) {
            console.log('✅ Cart verified successfully (Quantity: 5)');
        } else {
            console.error('❌ Cart verification failed (Expected quantity 5):', JSON.stringify(currentCart, null, 2));
        }
    }

    // 6. Remove Item
    console.log(`\n🗑️ Removing item...`);
    const removeRes = await fetch(`${API_URL}/cart/${product.id}`, {
        method: 'DELETE',
        headers
    });

    if (!removeRes.ok) {
        console.error('❌ Failed to remove item:', await removeRes.text());
        return;
    }
    console.log('✅ Item removed');

    // 7. Clear Cart (ensure empty)
    console.log(`\n🧹 Clearing cart...`);
    const clearRes = await fetch(`${API_URL}/cart`, {
        method: 'DELETE',
        headers
    });

    if (!clearRes.ok) {
        console.error('❌ Failed to clear cart:', await clearRes.text());
        return;
    }
    console.log('✅ Cart cleared');

    console.log('\n🎉 Cart API Test Completed Successfully!');
}

testCart().catch(console.error);
