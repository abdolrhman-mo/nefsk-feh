/**
 * DataService Singleton
 *
 * A singleton class that centralizes all JSON file data operations.
 * This ensures only one instance manages file read/write operations
 * throughout the application, providing efficient data access.
 *
 * Usage:
 *   const dataService = require('./services/DataService');
 *   const users = dataService.read('users');
 *   dataService.write('users', updatedUsers);
 */

const fs = require('fs');
const path = require('path');

class DataService {
    constructor() {
        // Singleton pattern: check if instance already exists
        if (DataService.instance) {
            return DataService.instance;
        }

        // Initialize the singleton instance
        this.dataDir = path.join(__dirname, '../data');
        this.cache = {}; // In-memory cache for performance

        // Ensure data directory exists
        this.ensureDataDirectory();

        // Store the singleton instance
        DataService.instance = this;
    }

    /**
     * Ensures the data directory exists
     */
    ensureDataDirectory() {
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }
    }

    /**
     * Gets the file path for a given collection name
     * @param {string} collection - Name of the collection (e.g., 'users', 'meals')
     * @returns {string} Full file path
     */
    getFilePath(collection) {
        return path.join(this.dataDir, `${collection}.json`);
    }

    /**
     * Ensures a collection file exists
     * @param {string} collection - Name of the collection
     */
    ensureCollectionExists(collection) {
        const filePath = this.getFilePath(collection);
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify([], null, 2));
        }
    }

    /**
     * Reads data from a JSON collection file
     * @param {string} collection - Name of the collection (e.g., 'users', 'meals')
     * @param {boolean} useCache - Whether to use cached data (default: false)
     * @returns {Array} Array of items from the collection
     */
    read(collection, useCache = false) {
        try {
            // Return cached data if available and requested
            if (useCache && this.cache[collection]) {
                return this.cache[collection];
            }

            const filePath = this.getFilePath(collection);

            // Ensure file exists before reading
            this.ensureCollectionExists(collection);

            const data = fs.readFileSync(filePath, 'utf8');
            const parsed = JSON.parse(data || '[]');

            // Update cache
            this.cache[collection] = parsed;

            return parsed;
        } catch (err) {
            console.error(`DataService: Error reading ${collection}:`, err.message);
            return [];
        }
    }

    /**
     * Writes data to a JSON collection file
     * @param {string} collection - Name of the collection
     * @param {Array} data - Data to write
     * @returns {boolean} Success status
     */
    write(collection, data) {
        try {
            const filePath = this.getFilePath(collection);
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

            // Update cache
            this.cache[collection] = data;

            return true;
        } catch (err) {
            console.error(`DataService: Error writing ${collection}:`, err.message);
            return false;
        }
    }

    /**
     * Finds an item by ID in a collection
     * @param {string} collection - Name of the collection
     * @param {number|string} id - ID to search for
     * @returns {Object|null} Found item or null
     */
    findById(collection, id) {
        const data = this.read(collection);
        const numId = parseInt(id);
        return data.find(item => item.id === numId || item.id === id) || null;
    }

    /**
     * Finds items matching a filter function
     * @param {string} collection - Name of the collection
     * @param {Function} filterFn - Filter function
     * @returns {Array} Matching items
     */
    findWhere(collection, filterFn) {
        const data = this.read(collection);
        return data.filter(filterFn);
    }

    /**
     * Adds a new item to a collection
     * @param {string} collection - Name of the collection
     * @param {Object} item - Item to add
     * @returns {Object} Added item with generated ID
     */
    create(collection, item) {
        const data = this.read(collection);

        // Generate new ID
        const maxId = data.length > 0 ? Math.max(...data.map(i => i.id || 0)) : 0;
        const newItem = { id: maxId + 1, ...item };

        data.push(newItem);
        this.write(collection, data);

        return newItem;
    }

    /**
     * Updates an item in a collection
     * @param {string} collection - Name of the collection
     * @param {number|string} id - ID of item to update
     * @param {Object} updates - Fields to update
     * @returns {Object|null} Updated item or null if not found
     */
    update(collection, id, updates) {
        const data = this.read(collection);
        const numId = parseInt(id);
        const index = data.findIndex(item => item.id === numId || item.id === id);

        if (index === -1) return null;

        data[index] = { ...data[index], ...updates };
        this.write(collection, data);

        return data[index];
    }

    /**
     * Deletes an item from a collection
     * @param {string} collection - Name of the collection
     * @param {number|string} id - ID of item to delete
     * @returns {boolean} Success status
     */
    delete(collection, id) {
        const data = this.read(collection);
        const numId = parseInt(id);
        const index = data.findIndex(item => item.id === numId || item.id === id);

        if (index === -1) return false;

        data.splice(index, 1);
        this.write(collection, data);

        return true;
    }

    /**
     * Clears the in-memory cache
     * @param {string} collection - Optional: specific collection to clear
     */
    clearCache(collection = null) {
        if (collection) {
            delete this.cache[collection];
        } else {
            this.cache = {};
        }
    }

    /**
     * Gets the singleton instance
     * @returns {DataService} The singleton instance
     */
    static getInstance() {
        if (!DataService.instance) {
            DataService.instance = new DataService();
        }
        return DataService.instance;
    }
}

// Export a singleton instance
module.exports = new DataService();
