# Outlook Archive Viewer

A modern, full-stack web application for viewing and managing Outlook PST (Personal Storage Table) files. Built with React and Node.js, featuring a clean, intuitive interface for browsing emails, folders, and attachments.

![License](https://img.shields.io/badge/license-MIT-blue.svg)

## ✨ Features

- **PST File Upload**: Drag-and-drop or browse to upload PST files (up to 500MB)
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
- File size limits (500MB maximum)
- Uploaded files are deleted after processing
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
