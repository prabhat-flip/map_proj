# 🗺️ Interactive Geospatial Map Application

An interactive map application built with ReactJS and Mapbox GL JS that enables users to perform basic geospatial operations with a focus on simplicity and functionality.

## ✨ Features

### 🎯 Core Functionality
- **📍 Marker Placement**: Click anywhere on the map to add location markers
- **🔺 Polygon Drawing**: Draw custom polygons and calculate their area in real-time
- **🔄 Mode Switching**: Toggle between marker placement and polygon drawing modes
- **📱 Responsive Design**: Optimized for both desktop and mobile devices

### 💾 Data Management
- **🔄 Auto-Save**: Automatically saves your work to browser's localStorage
- **📤 Export GeoJSON**: Export all markers and polygons as GeoJSON files
- **📥 Import GeoJSON**: Import existing GeoJSON files to continue previous work
- **🗑️ Clear All**: Remove all markers and polygons with one click

### 📊 Geospatial Operations
- **📐 Area Calculation**: Real-time polygon area calculation using Turf.js
- **🎯 Marker Management**: Add, select, and remove individual markers
- **🌍 Satellite View**: High-quality satellite imagery with street labels

## 🛠️ Technologies Used

- **React 18** - Modern React with Hooks
- **Mapbox GL JS** - Interactive vector maps
- **Mapbox Draw** - Drawing and editing tools
- **Turf.js** - Geospatial analysis library
- **Vite** - Fast development build tool

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (version 16 or higher)
- **npm** or **yarn** package manager
- **Mapbox Access Token** (free account required)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/interactive-geospatial-map.git
cd interactive-geospatial-map
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Set Up Mapbox Access Token

1. Create a free account at [Mapbox](https://www.mapbox.com/)
2. Get your access token from the [Mapbox Account Dashboard](https://account.mapbox.com/access-tokens/)
3. Create a `.env` file in the project root:

```env
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here
```

⚠️ **Important**: Never commit your access token to version control. The `.env` file should be added to `.gitignore`.

### 4. Start the Development Server
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## 📖 Usage Guide

### 🎮 Getting Started

1. **Choose Your Mode**: Use the mode selection buttons to choose between:
   - **📍 Marker Mode**: Click on the map to place location pins
   - **🔺 Polygon Mode**: Click to start drawing shapes

2. **Adding Markers** (Marker Mode):
   - Click anywhere on the map to place a marker
   - View marker coordinates in the sidebar
   - Click on markers in the list to highlight them
   - Remove individual markers using the "Remove" button

3. **Drawing Polygons** (Polygon Mode):
   - Click on the map to start drawing
   - Continue clicking to add more points
   - Double-click or use "Finish Polygon" to complete the shape
   - View real-time area calculations in square meters
   - Use the trash tool (🗑️) to delete polygons

### 💾 Data Management

- **Auto-Save**: Your work is automatically saved to browser storage
- **Export**: Click "Export GeoJSON" to download your data
- **Import**: Click "Import GeoJSON" to load previously saved data
- **Clear All**: Remove all markers and polygons to start fresh

### 📱 Mobile Experience

On mobile devices:
- Mode selection appears at the top of the screen
- Action buttons are located at the bottom
- All functionality remains fully accessible

## 🏗️ Project Structure

```
src/
├── components/
│   └── PrimaryMap.jsx          # Main map component
├── App.jsx                     # Root application component
├── main.jsx                    # Application entry point
└── index.css                   # Global styles
```

## 🔧 Key Components

### PrimaryMap Component
The main component that handles:
- Map initialization and configuration
- Mode switching logic
- Marker and polygon management
- Data import/export functionality
- localStorage integration
- Mobile responsiveness

## 🌟 Features in Detail

### 📍 Marker System
- Click-to-place functionality
- Unique ID generation with timestamp
- Coordinate display with 6-decimal precision
- Individual marker selection and removal
- Persistent storage across sessions

### 🔺 Polygon System
- Interactive drawing with Mapbox Draw
- Real-time area calculation using Turf.js
- Area display in square meters with comma formatting
- Complete polygon management (create, edit, delete)
- Finish polygon functionality for mobile users

### 💾 Data Persistence
- Automatic localStorage saving
- Complete state restoration on page reload
- GeoJSON import/export compatibility
- Cross-session data continuity

## 🎨 Styling & UI

- **Clean Interface**: Minimal, intuitive design
- **Visual Feedback**: Clear mode indicators and active states
- **Responsive Layout**: Adapts to desktop and mobile screens
- **Consistent Theming**: Blue primary color with professional styling

## 🐛 Troubleshooting

### Common Issues

1. **Map not loading**: Check your Mapbox access token in the `.env` file
2. **Markers not appearing**: Ensure you're in Marker Mode (📍)
3. **Polygons not drawing**: Switch to Polygon Mode (🔺)
4. **Data not saving**: Check browser localStorage permissions

### Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Mapbox](https://www.mapbox.com/) for excellent mapping services
- [Turf.js](https://turfjs.org/) for geospatial analysis capabilities
- [React](https://reactjs.org/) for the powerful UI framework

---

## 📞 Support

For questions or support, please open an issue on GitHub or contact the development team.

**Happy Mapping! 🗺️✨**
