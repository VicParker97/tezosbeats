# TezosBeats 🎵

A decentralized music NFT player built on the Tezos blockchain. Discover, play, and enjoy your music NFT collection with a beautiful, responsive interface.

## ✨ Features

- 🎶 **Music NFT Discovery** - Automatically scan your Tezos wallet for music NFTs with TezRadio integration
- 🎵 **Built-in Audio Player** - Play your music NFTs with full playback controls in sidebar
- 📋 **Playlist Management** - Create, edit, and manage custom playlists
- 🔀 **Smart Playback** - Shuffle, repeat modes, and intelligent queue management
- 🎨 **Beautiful UI** - Modern, responsive design with dark/light theme support
- 📌 **Sticky Sidebar** - Navigation and player controls stay accessible while browsing
- 🔗 **Wallet Integration** - Connect with Temple, Kukai, and other Tezos wallets
- 📱 **Mobile Responsive** - Optimized for all screen sizes with mobile-specific navigation
- 🧪 **Demo Mode** - Try the app without connecting a wallet
- ⚡ **Fast Performance** - Built with Next.js 15 and optimized for speed
- 🗃️ **Database Integration** - Enhanced metadata through TezRadio's curated database

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- A Tezos wallet (Temple, Kukai, etc.) for full functionality

### Installation

1. Clone the repository:
```bash
git clone https://github.com/VicParker97/tezosbeats.git
cd tezosbeats
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎮 Usage

### Connecting Your Wallet
1. Click "Connect Wallet" in the sidebar
2. Choose your preferred Tezos wallet
3. Approve the connection
4. Your music NFTs will be automatically discovered and loaded

### Demo Mode
1. Click "Demo Mode" in the sidebar to try the app without a wallet
2. Explore the interface with sample music NFTs
3. Click "Exit Demo" to return to wallet mode

### Playing Music
1. Browse your music NFT collection in the main area
2. Click any track to start playing
3. Use the player controls in the sidebar (shows album art and track info)
4. Use keyboard shortcuts: Space (play/pause), ← (previous), → (next)
5. Create and manage playlists via the playlist panel

### Managing Playlists
1. Click "Playlists" in the sidebar to open the playlist panel
2. Click "New Playlist" to create a custom playlist
3. Add tracks to playlists using the "+" button on any track
4. Rename, duplicate, or delete playlists using the context menu (⋮)

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS v4, Radix UI
- **Database**: Supabase (for TezRadio integration)
- **Blockchain**: Tezos, Taquito, Beacon SDK
- **State Management**: React Context API
- **Icons**: Lucide React
- **Deployment**: Vercel

## 🏗️ Architecture

- **`/src/components`** - Reusable UI components (Player, Sidebar, Playlists)
- **`/src/contexts`** - React context for global state management (AppContext)
- **`/src/hooks`** - Custom React hooks (wallet, NFTs, TezRadio integration)
- **`/src/lib`** - Core services (NFT fetching, TezRadio integration, playlist management)
- **`/src/app`** - Next.js app router pages and layouts

## 🎨 Features in Detail

### NFT Discovery & TezRadio Integration
- Scans your wallet for FA2 tokens on Tezos mainnet
- Enhanced metadata through TezRadio's curated database
- Intelligently identifies music NFTs using metadata analysis
- Supports TZIP-21 standard and various metadata formats
- Wallet-filtered content ensures you only see your owned NFTs
- Caches results for improved performance

### Audio Playback & Controls
- Sidebar-integrated player with album art display
- Extracts audio URLs from NFT metadata with intelligent fallbacks
- Supports common audio formats (MP3, WAV, OGG, etc.)
- Shuffle, repeat modes (none/all/one), and queue management
- Graceful fallback for NFTs without audio files
- Keyboard shortcuts and accessibility features
- Player state clears automatically when wallet disconnects

### Playlist Management
- Create custom playlists with intuitive interface
- Add tracks to playlists via quick-add dialog
- Rename, duplicate, and delete playlists
- Visual indicators for empty playlists
- Enhanced playlist panel with modern styling and smooth animations

### Responsive Design & UX
- Globally sticky sidebar for consistent navigation
- Mobile-optimized interface with touch-friendly controls
- Dark/light theme support with system preference detection
- Smooth transitions and modern visual effects
- Context menus and tooltips for enhanced usability

### Wallet Integration
- Uses Beacon SDK for secure wallet connections
- Supports major Tezos wallets (Temple, Kukai, etc.)
- Handles connection errors gracefully
- Session persistence across browser refreshes
- Automatic state cleanup on wallet disconnect

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🔗 Links

- **Live Demo**: [TezosBeats on Vercel](https://tezosbeats.vercel.app/)
- **GitHub**: [github.com/VicParker97/tezosbeats](https://github.com/VicParker97/tezosbeats)

## 🐛 Known Issues

- Some music NFTs may not have playable audio files (gracefully handled with visual indicators)
- IPFS gateway performance may vary depending on network conditions
- Large NFT collections may take time to load initially (progressive loading implemented)
- TezRadio database coverage may be incomplete for some NFT collections

## 🙏 Acknowledgments

- **TezRadio** for providing curated music NFT database and metadata enhancement
- **Tezos ecosystem** for the amazing blockchain infrastructure
- **NFT creators and collectors** on Tezos for the incredible music content
- **Open source community** for the tools and libraries that make this possible
- **Supabase** for database infrastructure and real-time capabilities

---

Built with ❤️ for the Tezos music NFT community