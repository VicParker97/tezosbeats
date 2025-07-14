TezosBeats - Music NFT Player
=============================

A modern web application for playing and managing music NFTs on the Tezos blockchain.

TECH STACK
----------

Frontend Framework:
- Next.js 15.3.5 (React 19)
- TypeScript 5
- App Router

UI & Styling:
- Tailwind CSS v4
- shadcn/ui component library
- Radix UI primitives
- Lucide React icons
- CSS variables for theming

Blockchain Integration:
- @mavrykdynamics/taquito (Tezos SDK)
- @mavrykdynamics/taquito-beacon-wallet (Wallet integration)
- Support for Temple and Kukai wallets
- Tezos mainnet connectivity

State Management:
- React Context API
- Custom hooks (useWallet, useApp)
- Local storage for persistence

Development Tools:
- ESLint
- Turbopack (dev server)
- PostCSS

FEATURES
--------

- Dark/Light theme support
- Responsive design (mobile-first)
- Collapsible sidebar navigation
- Music player with controls
- Wallet connection (Temple, Kukai)
- Track management and playback
- NFT collection display
- Search functionality
- Balance and address display

ARCHITECTURE
------------

- Component-based architecture
- Context providers for global state
- Service layer for wallet operations
- Custom hooks for reusable logic
- TypeScript interfaces for type safety
- Modular CSS with Tailwind

WALLET INTEGRATION
------------------

Currently using mock wallet service due to circular dependency issues in beacon wallet libraries.
Real Tezos wallet integration code is included but commented out until library issues are resolved.

The mock wallet provides:
- Realistic connection flow
- Error handling simulation
- State management
- UI feedback

DEPLOYMENT
----------

Built for production deployment on modern hosting platforms.
Optimized for performance with Next.js built-in optimizations.

This is a modern, type-safe React application built for the Tezos ecosystem.