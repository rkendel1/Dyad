/\*\*

- API Layer Documentation
-
- This directory contains the centralized API layer for Dyad, providing:
-
- 1.  **Service Layer** (`services/`):
- - Business logic abstraction
- - Decoupled from IPC handlers
- - Testable and reusable service implementations
-
- 2.  **Routes** (`routes/`):
- - API route definitions
- - Request/response handling
- - Route-level middleware
-
- 3.  **Middleware** (`middleware/`):
- - Request validation
- - Error handling
- - Logging and monitoring
-
- 4.  **Documentation** (`docs/`):
- - OpenAPI specification
- - API documentation generation
- - Schema definitions
-
- ## Architecture Principles
-
- - **Separation of Concerns**: Business logic is separated from IPC/transport layer
- - **Type Safety**: All APIs are fully typed using centralized type definitions
- - **Documentation First**: API changes require documentation updates
- - **Testability**: Services can be tested independently
- - **Reusability**: Services can be used from multiple transports (IPC, HTTP, etc.)
-
- ## Usage Example
-
- ```typescript

  ```
- // In IPC handler
- import { AppService } from '@/api/services/app.service';
-
- const appService = new AppService();
- const result = await appService.createApp({ name: 'my-app' });
- ```
  */
  ```

export {};
