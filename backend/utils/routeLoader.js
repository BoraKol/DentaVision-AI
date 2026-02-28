const fs = require('fs');
const path = require('path');

/**
 * Automatically loads and mounts routes from the routes directory
 * @param {express.Application} app - The Express application instance
 */
const loadRoutes = (app) => {
    const routesPath = path.join(__dirname, '../routes');
    
    // Read all files in the routes directory
    fs.readdirSync(routesPath).forEach(file => {
        // Only process .js files and skip index.js if it exists
        if (file.endsWith('.js') && file !== 'index.js') {
            const routeName = file.split('.')[0];
            const route = require(path.join(routesPath, file));
            
            // Map camelCase names to kebab-case API paths or simple aliases
            let apiPath = `/api/${routeName.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`;
            
            // Specific overrides for clean legacy paths
            const customMappings = {
                'auth': '/api/auth',
                'whatsappRoutes': '/api/whatsapp',
                'patientPortal': '/api/portal'
            };
            
            if (customMappings[routeName]) {
                apiPath = customMappings[routeName];
            }
            
            app.use(apiPath, route);
            console.log(`🚀 Route mounted: ${apiPath}`);
        }
    });
};

module.exports = loadRoutes;
