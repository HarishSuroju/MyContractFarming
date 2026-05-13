const path = require('path');
const dotenv = require('dotenv');

// Load the project-root .env so backend entrypoints work from either the root or backend directory.
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

