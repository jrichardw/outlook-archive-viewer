# Outlook Archive Viewer

A modern, full-stack web application for viewing and managing Outlook PST (Personal Storage Table) files. Built with React and Node.js, featuring a clean, intuitive interface for browsing emails, folders, and attachments.

![License](https://img.shields.io/badge/license-MIT-blue.svg)

## ✨ Features

- **PST File Upload**: Drag-and-drop or browse to upload PST files (configurable size limit, unlimited by default)
- **Folder Navigation**: Browse your email folder structure with expandable tree view
- **Email Viewer**: Read emails with full HTML rendering support
- **Search Functionality**: Search across all emails by subject, sender, or content
- **Attachment Support**: View attachment information and details
- **Modern UI/UX**: Clean, responsive design with smooth animations
- **Real-time Progress**: Upload progress indicator with percentage display
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd outlook-archive-viewer
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Configuration

The application supports configuration through environment variables.

#### Backend Configuration

Create a `.env` file in the `backend/` directory (or use environment variables):

```bash
# Copy the example file
cd backend
cp .env.example .env
```

Available options:
- `PORT` - Server port (default: 3001)
- `MAX_FILE_SIZE_MB` - Maximum PST file size in MB. Set to `0` for unlimited (default: 0)
- `UPLOAD_DIR` - Directory for temporary file uploads (default: ./uploads)

Example `.env` file:
```bash
PORT=3001
MAX_FILE_SIZE_MB=0        # 0 = unlimited (supports large files like 3.55GB+)
UPLOAD_DIR=./uploads
```

#### Frontend Configuration

Create a `.env` file in the `frontend/` directory (optional):

```bash
# Copy the example file
cd frontend
cp .env.example .env
```

Available options:
- `VITE_MAX_FILE_SIZE_MB` - Display max file size hint. Set to `0` for unlimited (default: 0)
- `VITE_API_URL` - Backend API URL (default: http://localhost:3001)

Example `.env` file:
```bash
VITE_MAX_FILE_SIZE_MB=0   # 0 = unlimited, displays "No file size limit"
VITE_API_URL=http://localhost:3001
```

**Note**: For large PST files (3GB+), keep `MAX_FILE_SIZE_MB=0` to allow unlimited file uploads.

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```
   The server will run on `http://localhost:3001`

2. **Start the frontend development server** (in a new terminal)
   ```bash
   cd frontend
   npm run dev
   ```
   The application will open at `http://localhost:3000`

3. **Upload a PST file**
   - Drag and drop your PST file onto the upload area, or
   - Click "Choose File" to browse and select a file
   - Wait for the upload and parsing to complete
   - Start browsing your emails!

## 📁 Project Structure

```
outlook-archive-viewer/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Custom middleware
│   │   ├── utils/             # Utility functions
│   │   └── server.js          # Express server setup
│   ├── uploads/               # Temporary file storage
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── services/          # API services
│   │   ├── styles/            # Global styles
│   │   ├── App.jsx            # Main App component
│   │   └── main.jsx           # Entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## 🛠️ Technology Stack

### Backend
- **Express.js**: Fast, minimalist web framework
- **pst-extractor**: Library for parsing PST files
- **Multer**: File upload middleware
- **CORS**: Cross-origin resource sharing

### Frontend
- **React 18**: Modern UI library
- **Vite**: Next-generation frontend tooling
- **Axios**: HTTP client
- **Lucide React**: Beautiful icon library
- **date-fns**: Date formatting utilities

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface with gradient accents
- **Responsive Layout**: Adapts to all screen sizes
- **Smooth Animations**: Polished transitions and interactions
- **Loading States**: Clear feedback during operations
- **Error Handling**: User-friendly error messages
- **Accessibility**: Keyboard navigation and ARIA labels
- **Dark Mode Ready**: CSS variables for easy theming

## 📖 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/pst/upload` | Upload and parse PST file |
| GET | `/api/pst/:fileId/info` | Get PST file information |
| GET | `/api/pst/:fileId/folders` | Get folder structure |
| GET | `/api/pst/:fileId/emails` | Get emails (with pagination and search) |
| GET | `/api/pst/:fileId/emails/:emailId` | Get specific email details |

### Query Parameters

- `folderId`: Filter emails by folder
- `search`: Search emails by content
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50)

## 🔒 Security Considerations

- File type validation (only .pst files accepted)
- Configurable file size limits (unlimited by default, can be restricted via config)
- Uploaded files are deleted after processing to save disk space
- Input sanitization for search queries
- CORS configuration for API access

## 🚧 Development

### Backend Development
```bash
cd backend
npm run dev  # Runs with nodemon for auto-restart
```

### Frontend Development
```bash
cd frontend
npm run dev  # Runs with Vite HMR
```

### Production Build
```bash
cd frontend
npm run build  # Creates optimized production build
npm run preview  # Preview production build
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🐛 Known Limitations

- PST files are processed in-memory (large files may require more RAM)
- Attachments are listed but not downloadable in current version
- Search is performed on already-loaded emails
- Session data is stored in-memory (not persistent)

## 🔮 Future Enhancements

- [ ] Attachment download functionality
- [ ] Export emails to various formats
- [ ] Advanced filtering options
- [ ] Email threading/conversation view
- [ ] Database integration for persistence
- [ ] Multi-file support
- [ ] Dark mode toggle
- [ ] Print email functionality

## 💬 Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

Made with ❤️ for better email management
