const { CartItem: CartItemModel } = require('./index');

// Helper: Generate unique cart item ID
function generateCartItemId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Validation: Check required fields for cart item
function validateCartItem(item) {
    const errors = [];
    if (!item.mealId) {
        errors.push('Meal ID is required');
    }
    if (!item.name || item.name.trim() === '') {
        errors.push('Meal name is required');
    }
    if (item.price === undefined || item.price === null) {
        errors.push('Price is required');
    }
    if (isNaN(parseFloat(item.price))) {
        errors.push('Price must be a number');
    }
    if (!item.image) {
        errors.push('Image is required');
    }
    if (!item.quantity || item.quantity < 1) {
        errors.push('Quantity must be at least 1');
    }
    if (!item.userId) {
        errors.push('User ID is required');
    }
    return errors;
}

// Validation: Check quantity for update
function validateQuantity(quantity) {
    if (quantity === undefined || quantity === null) {
        return ['Quantity is required'];
    }
    if (isNaN(parseInt(quantity)) || parseInt(quantity) < 1) {
        return ['Quantity must be at least 1'];
    }
    return [];
}

const Cart = {
    // Ensure data exists (no-op for database, kept for backward compatibility)
    ensureDataExists() {
        // Database tables are created via sequelize.sync()
    },

    // Get all cart items (for admin/debug purposes)
    async getAll() {
        const items = await CartItemModel.findAll();
        return items.map(item => item.get({ plain: true }));
    },

    // Get cart items for a specific user
    async getByUserId(userId) {
        const userIdNum = parseInt(userId);
        const items = await CartItemModel.findAll({
            where: { userId: userIdNum }
        });
        return items.map(item => item.get({ plain: true }));
    },

    // Find cart item by meal ID for a specific user
    async findByMealIdAndUser(mealId, userId) {
        const userIdNum = parseInt(userId);
        const item = await CartItemModel.findOne({
            where: { mealId, userId: userIdNum }
        });
        return item ? item.get({ plain: true }) : undefined;
    },

    // Find cart item by cart item ID for a specific user
    async findByIdAndUser(id, userId) {
        const userIdNum = parseInt(userId);
        const item = await CartItemModel.findOne({
            where: { id, userId: userIdNum }
        });
        return item ? item.get({ plain: true }) : undefined;
    },

    // Add item to user's cart (or increase quantity if exists)
    async addItem(userId, itemData) {
        // Add userId to itemData for validation
        const itemWithUser = { ...itemData, userId };

        // Validate input
        const errors = validateCartItem(itemWithUser);
        if (errors.length > 0) {
            return { success: false, errors };
        }

        const userIdNum = parseInt(userId);

        try {
            // Check if item already exists in this user's cart
            const existingItem = await CartItemModel.findOne({
                where: { mealId: itemData.mealId, userId: userIdNum }
            });

            if (existingItem) {
                // Update quantity
                existingItem.quantity += parseInt(itemData.quantity);
                await existingItem.save();

                const userCart = await CartItemModel.findAll({
                    where: { userId: userIdNum }
                });
                return {
                    success: true,
                    cart: userCart.map(item => item.get({ plain: true })),
                    message: 'Quantity updated'
                };
            }

            // Add new item
            const cartItem = await CartItemModel.create({
                id: generateCartItemId(),
                userId: userIdNum,
                mealId: itemData.mealId,
                name: itemData.name,
                price: parseFloat(itemData.price),
                image: itemData.image,
                quantity: parseInt(itemData.quantity),
                sellerId: itemData.sellerId ? parseInt(itemData.sellerId) : null
            });

            const userCart = await CartItemModel.findAll({
                where: { userId: userIdNum }
            });

            return {
                success: true,
                cart: userCart.map(item => item.get({ plain: true })),
                item: cartItem.get({ plain: true }),
                message: 'Item added to cart'
            };
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                // Handle race condition - item was added by concurrent request
                const existingItem = await CartItemModel.findOne({
                    where: { mealId: itemData.mealId, userId: userIdNum }
                });
                if (existingItem) {
                    existingItem.quantity += parseInt(itemData.quantity);
                    await existingItem.save();
                    const userCart = await CartItemModel.findAll({
                        where: { userId: userIdNum }
                    });
                    return {
                        success: true,
                        cart: userCart.map(item => item.get({ plain: true })),
                        message: 'Quantity updated'
                    };
                }
            }
            throw error;
        }
    },

    // Remove item from user's cart
    async removeItem(userId, itemId) {
        const userIdNum = parseInt(userId);

        const item = await CartItemModel.findOne({
            where: { id: itemId, userId: userIdNum }
        });

        if (!item) {
            return { success: false, errors: ['Cart item not found'] };
        }

        await item.destroy();

        const userCart = await CartItemModel.findAll({
            where: { userId: userIdNum }
        });

        return {
            success: true,
            cart: userCart.map(item => item.get({ plain: true })),
            message: 'Item removed from cart'
        };
    },

    // Update item quantity in user's cart
    async updateQuantity(userId, itemId, quantity) {
        // Validate quantity
        const errors = validateQuantity(quantity);
        if (errors.length > 0) {
            return { success: false, errors };
        }

        const userIdNum = parseInt(userId);

        const item = await CartItemModel.findOne({
            where: { id: itemId, userId: userIdNum }
        });

        if (!item) {
            return { success: false, errors: ['Cart item not found'] };
        }

        item.quantity = parseInt(quantity);
        await item.save();

        const userCart = await CartItemModel.findAll({
            where: { userId: userIdNum }
        });

        return {
            success: true,
            cart: userCart.map(item => item.get({ plain: true })),
            message: 'Cart item updated'
        };
    },

    // Clear user's entire cart
    async clearByUserId(userId) {
        const userIdNum = parseInt(userId);

        await CartItemModel.destroy({
            where: { userId: userIdNum }
        });

        return { success: true, cart: [], message: 'Cart cleared' };
    },

    // Clear entire cart (all users - for admin/testing)
    async clear() {
        await CartItemModel.destroy({ where: {} });
        return { success: true, cart: [], message: 'All carts cleared' };
    }
};

module.exports = Cart;
