# PeerLink Frontend

Modern Next.js frontend for PeerLink P2P File Sharing Network

## What is PeerLink?

PeerLink is a **decentralized, peer-to-peer file sharing network** where users can directly share files with each other without relying on a central server. Each file is served on its own dynamic port, enabling true P2P connectivity.

## How It Works

### Upload Flow
1. User uploads a file via the web interface
2. Backend receives the file and assigns it a **unique dynamic port** (49152-85535)
3. Backend starts a file server on that port
4. Frontend displays the **port number** to the user
5. User shares the port number with peers

### Download Flow
1. User receives a port number from a peer
2. User enters the port number in the download page
3. Frontend connects to `localhost:port` (or peer's IP:port)
4. File is downloaded directly from the peer

## Features

- 🚀 **Fast & Modern**: Built with Next.js 14 and React 18
- 📤 **Easy File Upload**: Drag & drop or click to upload files
- 📥 **P2P Download**: Download files from peers using port numbers
- 💎 **Beautiful UI**: Modern glass-morphism design with Tailwind CSS
- 🎨 **Responsive**: Works perfectly on desktop, tablet, and mobile
- ⚡ **Real-time Progress**: Upload progress indicator
- 🔗 **Port Sharing**: Copy port numbers to share with peers
- 🔐 **Decentralized**: No central server dependency

## Prerequisites

- Node.js 16+ 
- npm or yarn
- PeerLink backend running on `http://localhost:8080`

## Installation

```bash
npm install
# or
yarn install
```

## Configuration

The frontend automatically connects to the backend on `http://localhost:8080`. 

To change the API URL, set the environment variable:

```bash
export NEXT_PUBLIC_API_URL=http://your-backend-url:8080
```

Or create a `.env.local` file:

```
NEXT_PUBLIC_API_URL=http://your-backend-url:8080
```

## Development

Start the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Production Build

Build for production:

```bash
npm run build
npm start
```

## File Structure

```
UI/
├── components/
│   ├── Header.js          # App header with navigation
│   ├── FileUpload.js      # File upload component
│   └── FileList.js        # File list with download component
├── pages/
│   ├── _app.js            # Next.js app component
│   ├── index.js           # Home/uploads page
│   ├── download-by-port.js # Download from peer page
│   └── api/
│       └── config.js      # API configuration
├── globals.css            # Global styles
├── next.config.js         # Next.js configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── package.json           # Dependencies
```

## Pages

### Home Page (`/`)
- **Upload Section**: Drag & drop file upload with progress indicator
- **Uploads Section**: View all your uploaded files with their port numbers
- **Copy Port**: One-click copy of port numbers to share with peers

### Download Page (`/download-by-port`)
- **Port Input**: Enter a port number from a peer
- **Direct Download**: Download files directly from peers
- **Instructions**: Clear guide on how to use P2P downloading

## API Endpoints

### Upload
- **POST** `/upload` 
- Accepts: multipart/form-data with file
- Returns: `{ "port": 54321 }`

### Download
- **GET** `/download/{port}`
- Downloads the file served on that port
- Direct connection to peer's file server

## How to Use

### Sharing Your Files

1. **Upload a file** on the home page
2. **Copy the port number** displayed next to your file
3. **Share the port** with your peer (via chat, email, etc.)
4. Peers can download your file using that port

### Downloading from Peers

1. **Receive a port number** from a peer
2. Go to **Download** page
3. **Enter the port number**
4. Click **Download File**
5. File will download automatically

## Port Range

Files are served on **dynamic ports** between **49152** and **85535**. These are ephemeral ports reserved for temporary use in P2P applications.

## Network Configuration

### Local Network (LAN)
For sharing files within a local network:
1. Find the backend's local IP (e.g., 192.168.x.x)
2. Peers should use that IP instead of localhost
3. Example: `http://192.168.1.100:8080`

### Internet (WAN)
For sharing across the internet:
1. Port forward the backend port (8080) on your router
2. Get your public IP address
3. Share backend URL as: `http://your-public-ip:8080`
4. Frontend can connect to any peer's backend URL

## Features Explained

### File Upload
- Drag files into the upload area or click to browse
- Real-time upload progress indicator
- Shows file size and upload time
- Automatic error handling
- Displays unique port number after upload

### File Sharing
- Copy port numbers with one click
- Share ports via any communication channel
- No file size limits (limited by storage)
- Multiple files can be shared simultaneously

### File Download
- Enter port number to download from peer
- Direct peer-to-peer connection
- No intermediary server required
- Automatic filename extraction
- Progress indication during download

### UI/UX Highlights
- Glass-morphism design
- Smooth animations and transitions
- Gradient backgrounds
- Real-time feedback with alerts
- Mobile-friendly responsive design
- Accessibility features
- Dark/light theme support through system preference

## Styling

The project uses Tailwind CSS for styling with custom configurations:

- Custom gradient colors (blue, purple, green)
- Responsive breakpoints
- Custom animations (fade-in, pulse)
- Glass-effect styling for modern look
- Icons from Lucide React

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### CORS Issues
Make sure your Java backend has CORS enabled. The backend should respond with:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

### Connection Failed
Check that:
1. Backend is running on `http://localhost:8080`
2. Firewall is not blocking connections
3. `NEXT_PUBLIC_API_URL` is set correctly
4. For peer connections, ensure network is accessible

### Upload Fails
Ensure:
1. File size is reasonable
2. Backend storage directory has write permissions
3. Backend is receiving the request (check logs)
4. Port is available for file server

### Download from Peer Fails
Check:
1. Port number is correct
2. Peer's backend/file server is still running
3. Network connectivity between peers
4. Firewall is not blocking the port

## Performance Optimization

- Image optimization with Next.js Image component
- Code splitting for smaller bundle sizes
- CSS minification with Tailwind
- SWC compiler for faster builds
- Efficient state management
- Minimal re-renders

## Security Considerations

- CORS is configured for decentralized access
- Input validation on port numbers
- Error messages don't expose sensitive information
- Files are handled securely on backend
- No authentication required (P2P design)
- Each file gets a unique identifier (port)

## Advanced Usage

### Using with Custom Backend URL

For development or custom deployments:

```bash
NEXT_PUBLIC_API_URL=http://custom-server:8080 npm run dev
```

### Building for Deployment

```bash
npm run build
npm start
```

Deploy the `.next` folder to your hosting provider (Vercel, Netlify, etc.)

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review backend logs for server-side errors
3. Check browser console for client-side errors
4. Verify network connectivity between peers
5. Ensure environment variables are set correctly

## Architecture Diagram

```
Peer A (Uploader)          Peer B (Downloader)
┌─────────────────┐        ┌──────────────────┐
│  Next.js App    │        │   Next.js App    │
│  Port: 3000     │        │   Port: 3000     │
└────────┬────────┘        └────────┬─────────┘
         │                          │
         └──────┬────────┬──────────┘
                │        │
         ┌──────▼─┐      │
         │Backend │      │
         │ 8080   │      │
         └──┬─────┘      │
            │            │
      ┌─────▼──────┐     │
      │ File Server│◄────┘
      │ Port 54321 │
      └────────────┘
```

## Real-World Example

### User Flow

**Alice wants to share a document with Bob:**

1. Alice uploads `presentation.pdf` on her PeerLink frontend
2. Backend assigns port `54321` to the file
3. Frontend shows: "presentation.pdf - Port: 54321"
4. Alice copies and sends port number to Bob via chat
5. Bob goes to Download page, enters `54321`
6. Bob's frontend connects to Alice's backend
7. File is downloaded directly from Alice's backend
8. Both can view their files without a central server!

This is the power of **decentralized P2P sharing**! 🚀

