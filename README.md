# EasyPublication

A streamlined platform for showcasing scientific publications from Lawrence Berkeley National Laboratory (LBNL) beamlines.

## Features

- **Web View**: Browse publications in a responsive card layout
- **Slideshow View**: Immersive presentation mode for publications and figures
- **Admin Interface**: Tools to manage publication content
- **Enhanced Mobile Support**: 
  - Touch-friendly navigation with swipe gestures
  - Responsive layout for different screen sizes and orientations
  - Optimized image viewing on mobile devices
- **QR Codes**: Quick access to full publications via DOI links

## Getting Started

```bash
# Install
npm install

# Run
npm run dev
```

## Admin Guide

Access via `/admin` route to:

- **Add Publications**: Upload new papers with title, authors, DOI, abstract, key points, and images
- **Edit**: Update existing publications with new content
- **Delete**: Remove outdated publications
- **Manage Images**: Add/remove figures and reorganize their display order

## Development Guidelines

### Technology Stack
- React 18 with TypeScript
- CSS Modules for component styling
- React Router for navigation
- Node.js/Express backend
- SQLite database (via sql.js)

### Project Structure
- `src/`: Frontend React components and styles
- `server/`: Backend Express API and database operations
- `public/`: Static assets

### Running the Full Stack
```bash
# Run both frontend and backend concurrently
npm run dev:full

# Run frontend only
npm run dev

# Run backend server only
npm run server
```
```


### Diagrams

# Admin Upload - Sequence Diagram

[View Diagram on Lucid]([https://lucid.app/publicSegments/view/f6e79b29-9245-48fc-a1f8-f2d811c0e564/image.png])

# User View - Sequence Diagram
[View Diagram on Lucid] (https://lucid.app/publicSegments/view/0d19c55a-e8da-4f12-b3c7-fb1b09df5f41/image.png)

## Database Management

### Refreshing Publications Data

EasyPublication includes a script to automatically fetch new publications from the ALS database without overwriting existing data:

```bash
# Run the publications refresh script
node scripts/refresh_publications.js

I'll create a new section in the README.md specifically to document how to use the publication refresh script. Let me first check the current content of the README to see where this section would fit best. I'm still having issues with the file reading tool. Let me create a comprehensive README section that you can manually add to your README.md file. This section will document how to use the refresh_publications.js script:

```markdown
## Database Management

### Refreshing Publications Data

EasyPublication includes a script to automatically fetch new publications from the ALS database without overwriting existing data:

```bash
# Run the publications refresh script
node scripts/refresh_publications.js
```

This script performs the following operations:

1. Loads the existing database or creates a new one if needed
2. Fetches the latest beamline data from the ALS API
3. Fetches publications for beamline 8.3.2
4. Adds only new publications that don't already exist in the database
5. Updates the JSON exports for the frontend application

#### Requirements

- Node.js 16.0 or higher
- Internet connection (to access the ALS API)
- Sufficient permissions to write to the als-publications.db file

#### Options

The script is currently configured to only fetch publications from beamline 8.3.2. To add additional beamlines:

1. Open refresh_publications.js
2. Locate the fetch URL for publications
3. Add additional fetch calls for other beamlines or modify the URL parameter

#### Manual Database Export

You can manually run:

```bash
cd server
node export-database-to-json.js
```

This will update all necessary JSON files that the frontend uses to display publications.

### EasyPublication Server Documentation

# Server Environment 
URL: https://easypublication.onrender.com
Platform: Render web service

# Environment Variables
CLOUDINARY_CLOUD_NAME, 
CLOUDINARY_API_KEY, 
CLOUDINARY_API_SECRET: Image storage 
GROQ_API_KEY: AI features integration 
PORT: Server port configuration

# Key Components 
Media Storage: Cloudinary (images/figures)
Database: SQLite (embedded, persistent on Render) 
AI Services: Groq for content analysis 

# Security Status
No authentication currently implemented
Admin interface accessible without login
API endpoints unprotected

# Maintenance
Environment variables managed via Render dashboard
Database included in deployment package
Image management through Cloudinary console

# Future Improvements 
*Add authentication system 
Implement role-based access
Add security logging and monitoring



