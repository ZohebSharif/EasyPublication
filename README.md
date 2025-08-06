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

[View Diagram on Lucid](https://lucid.app/documents/embedded/b9e81ee3-78ca-4802-b0a4-a03c5d9f6b3e)

