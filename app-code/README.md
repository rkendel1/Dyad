# App Code Directory

This directory is for placing your application code that will be:

1. **Accessible in Code Server** - Edit your apps via the web-based VS Code interface at http://localhost:8080
2. **Served by Dyad Test Server** - Test your apps at http://localhost:5000
3. **Connected to all services** - Your apps can connect to Supabase, PostgreSQL, Redis, and other stack services

## Directory Structure

Place your application directories here:

```
app-code/
├── my-app-1/
│   ├── package.json
│   ├── src/
│   └── ...
├── my-app-2/
│   ├── package.json
│   ├── src/
│   └── ...
└── ...
```

## Using Services

Your applications can connect to all services in the stack using environment variables:

### Supabase
```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL || 'http://localhost:54322',
  process.env.SUPABASE_ANON_KEY
)
```

### PostgreSQL
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: process.env.POSTGRES_DB || 'dyad_db',
  user: process.env.POSTGRES_USER || 'dyad',
  password: process.env.POSTGRES_PASSWORD || 'dyad_password'
});
```

### Redis
```javascript
const redis = require('redis');

const client = redis.createClient({
  url: 'redis://localhost:6379'
});
```

## Development Workflow

1. Place your app code in this directory
2. Open Code Server at http://localhost:8080 to edit
3. Run your app via the Dyad Test Server or directly
4. Use Supabase Studio (http://localhost:3001) for database management
5. Use pgAdmin (http://localhost:5050) for PostgreSQL management

## Notes

- Files in this directory are mounted as volumes in the Docker containers
- Changes are immediately reflected without restarting containers
- Git repositories can be initialized in subdirectories
