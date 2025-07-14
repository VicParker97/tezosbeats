# TezosBeats 🎵

A decentralized music NFT player built on the Tezos blockchain. Discover, play, and enjoy your music NFT collection with a beautiful, responsive interface.

## ✨ Features

- 🎶 **Music NFT Discovery** - Automatically scan your Tezos wallet for music NFTs
- 🎵 **Built-in Audio Player** - Play your music NFTs with full playback controls
- 🎨 **Beautiful UI** - Modern, responsive design with dark/light theme support
- 🔗 **Wallet Integration** - Connect with Temple, Kukai, and other Tezos wallets
- 📱 **Mobile Responsive** - Optimized for all screen sizes
- 🧪 **Demo Mode** - Try the app without connecting a wallet
- ⚡ **Fast Performance** - Built with Next.js 15 and optimized for speed

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
1. Browse your music NFT collection
2. Click any track to start playing
3. Use the player controls at the bottom for playback control
4. Use keyboard shortcuts: Space (play/pause), ← (previous), → (next)

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS v4, Radix UI
- **Blockchain**: Tezos, Taquito, Beacon SDK
- **Icons**: Lucide React
- **Deployment**: Vercel

## 🏗️ Architecture

- **`/src/components`** - Reusable UI components
- **`/src/contexts`** - React context for global state management
- **`/src/hooks`** - Custom React hooks for wallet and NFT operations
- **`/src/lib`** - Core services (NFT fetching, wallet integration)
- **`/src/app`** - Next.js app router pages

## 🎨 Features in Detail

### NFT Discovery
- Scans your wallet for FA2 tokens on Tezos mainnet
- Intelligently identifies music NFTs using metadata analysis
- Supports TZIP-21 standard and various metadata formats
- Caches results for improved performance

### Audio Playback
- Extracts audio URLs from NFT metadata
- Supports common audio formats (MP3, WAV, OGG, etc.)
- Graceful fallback for NFTs without audio files
- Keyboard shortcuts and accessibility features

### Wallet Integration
- Uses Beacon SDK for secure wallet connections
- Supports major Tezos wallets
- Handles connection errors gracefully
- Session persistence across browser refreshes

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

- **Live Demo**: [TezosBeats on Vercel](https://your-deployment-url.vercel.app)
- **GitHub**: [github.com/VicParker97/tezosbeats](https://github.com/VicParker97/tezosbeats)

## 🐛 Known Issues

- Some music NFTs may not have playable audio files
- IPFS gateway performance may vary
- Large NFT collections may take time to load initially

## 🙏 Acknowledgments

- Tezos ecosystem for the amazing blockchain infrastructure
- NFT creators and collectors on Tezos
- Open source community for the tools and libraries used

---

Built with ❤️ for the Tezos music NFT community