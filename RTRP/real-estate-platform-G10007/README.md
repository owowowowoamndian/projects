# Real Estate Marketplace Platform

A modern, full-stack real estate marketplace with a premium dark-themed UI.

## Project Structure

This project is organized as a monorepo with separate `client` (Frontend) and `server` (Backend) directories.

```
real-estate-platform/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   │   ├── Home.jsx           # Landing page with listings
│   │   │   ├── AddListing.jsx     # Form to create new listings
│   │   │   └── ListingDetails.jsx # Detailed view with modals
│   │   ├── App.jsx         # Main router setup
│   │   └── index.css       # Global styles (Dark Theme)
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite configuration
│
└── server/                 # Express Backend
    ├── models/             # Mongoose Models
    │   ├── Property.js     # Property schema
    │   └── User.js         # User schema
    ├── routes/             # API Routes
    │   ├── auth.js         # Authentication endpoints
    │   └── properties.js   # Property CRUD & Image Upload
    ├── uploads/            # Directory for uploaded images
    ├── index.js            # Server entry point
    └── package.json        # Backend dependencies
```

## Features Implemented

- **Premium Dark UI**: Custom CSS with gold accents and gradients.
- **Property Listings**: Create, Read, and Delete properties.
- **Image Upload**: Upload images directly from your device.
- **Interactive Modals**: 
  - Contact Agent Form
  - Schedule Viewing Form
  - Delete Confirmation
- **Responsive Design**: Mobile-friendly layout.

## Getting Started

### Prerequisites
- Node.js installed

### 1. Setup Backend
```bash
cd server
npm install
# Create a .env file with your MONGO_URI
npm run dev
```
Server runs on `http://localhost:5000`.

### 2. Setup Frontend
```bash
cd client
npm install
npm run dev
```
Client runs on `http://localhost:5174`.

## API Endpoints

- `GET /api/properties` - Get all listings
- `GET /api/properties/:id` - Get single listing
- `POST /api/properties` - Create listing (Multipart Form Data)
- `DELETE /api/properties/:id` - Delete listing

## Notes
- Authentication is currently simplified for demonstration purposes.
- Images are stored locally in `server/uploads`.
