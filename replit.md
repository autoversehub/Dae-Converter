# Beam2Mesh - BeamNG Model Converter

## Overview

Beam2Mesh is a web application for converting BeamNG vehicle models (.DAE files) into universal 3D formats like FBX and OBJ. The application provides a drag-and-drop interface for uploading models, tracks conversion progress, and allows users to download converted files. It's optimized for Blender and Roblox imports with texture preservation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state with 3-second polling for conversion status updates
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom dark theme (industrial/BeamNG-inspired orange accent colors)
- **Animations**: Framer Motion for smooth UI transitions
- **File Upload**: react-dropzone for drag-and-drop file handling
- **Build Tool**: Vite with path aliases (@/ for client/src, @shared for shared)

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with tsx for development, esbuild for production bundling
- **File Handling**: Multer for multipart file uploads
- **File Processing**: AdmZip for handling ZIP archives, child_process exec for external conversion tools
- **API Design**: RESTful endpoints defined in shared/routes.ts with Zod validation schemas

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: shared/schema.ts contains the conversions table
- **Key Entity**: Conversions table tracks file uploads with status (pending/processing/completed/failed), file metadata, and download URLs

### Project Structure
```
client/           # React frontend
  src/
    components/   # UI components including shadcn/ui
    hooks/        # Custom React hooks
    pages/        # Page components
    lib/          # Utilities and query client
server/           # Express backend
  index.ts        # Server entry point
  routes.ts       # API route handlers
  storage.ts      # Database access layer
  db.ts           # Drizzle database connection
shared/           # Shared types and schemas
  schema.ts       # Drizzle schema definitions
  routes.ts       # API route definitions with Zod schemas
```

### API Endpoints
- `GET /api/conversions` - List all conversions
- `GET /api/conversions/:id` - Get single conversion details
- `POST /api/conversions/upload` - Upload file for conversion (multipart/form-data)
- `GET /api/conversions/:id/download` - Download converted file

### File Processing Flow
1. User uploads .DAE or .ZIP file via dropzone
2. File saved to uploads/ directory with multer
3. Conversion record created in database with "pending" status
4. Background processing converts to target format (FBX/OBJ)
5. Converted files stored in converted/ directory
6. Status updated and download URL provided

## External Dependencies

### Database
- PostgreSQL database required (DATABASE_URL environment variable)
- Drizzle Kit for schema migrations (`npm run db:push`)

### Key NPM Packages
- **drizzle-orm / drizzle-zod**: Database ORM and validation
- **@tanstack/react-query**: Server state management
- **zod**: Runtime type validation
- **multer**: File upload handling
- **adm-zip**: ZIP file processing
- **framer-motion**: Animations
- **react-dropzone**: File upload UI
- **date-fns**: Date formatting

### Fonts (External)
- Inter (body text)
- JetBrains Mono (monospace)
- Rajdhani (display/headings)
- Loaded via Google Fonts