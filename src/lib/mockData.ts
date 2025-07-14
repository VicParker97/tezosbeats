export interface Track {
  id: string;
  title: string;
  artist: string;
  cover: string;
  duration: number;
  collection: string;
  isLiked: boolean;
  audioUrl?: string | null;
}

export const mockTracks: Track[] = [
  {
    id: '1',
    title: 'Tezos Dreams',
    artist: 'CryptoBeats',
    cover: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iOCIgZmlsbD0iIzM5ODVmZiIvPgo8Y2lyY2xlIGN4PSIyNCIgY3k9IjI0IiByPSIxMiIgZmlsbD0iI2ZmZmZmZiIgZmlsbC1vcGFjaXR5PSIwLjIiLz4KPHN2ZyB4PSIxOCIgeT0iMTgiIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjZmZmZmZmIj4KPHA+cGF0aCBkPSJNOCA1djE0bDExLTdMOCA1eiIvPgo8L3N2Zz4KPC9zdmc+',
    duration: 237,
    collection: 'Electronic Vibes',
    isLiked: true,
    audioUrl: null
  },
  {
    id: '2',
    title: 'Blockchain Symphony',
    artist: 'Digital Harmony',
    cover: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iOCIgZmlsbD0iI2Y5NzMxNiIvPgo8Y2lyY2xlIGN4PSIyNCIgY3k9IjI0IiByPSIxMiIgZmlsbD0iI2ZmZmZmZiIgZmlsbC1vcGFjaXR5PSIwLjIiLz4KPHN2ZyB4PSIxOCIgeT0iMTgiIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjZmZmZmZmIj4KPHA+cGF0aCBkPSJNOCA1djE0bDExLTdMOCA1eiIvPgo8L3N2Zz4KPC9zdmc+',
    duration: 198,
    collection: 'Orchestral',
    isLiked: false
  },
  {
    id: '3',
    title: 'NFT Nights',
    artist: 'TokenBeats',
    cover: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iOCIgZmlsbD0iIzEwYjk4MSIvPgo8Y2lyY2xlIGN4PSIyNCIgY3k9IjI0IiByPSIxMiIgZmlsbD0iI2ZmZmZmZiIgZmlsbC1vcGFjaXR5PSIwLjIiLz4KPHN2ZyB4PSIxOCIgeT0iMTgiIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjZmZmZmZmIj4KPHA+cGF0aCBkPSJNOCA1djE0bDExLTdMOCA1eiIvPgo8L3N2Zz4KPC9zdmc+',
    duration: 312,
    collection: 'Electronic Vibes',
    isLiked: true
  },
  {
    id: '4',
    title: 'Crypto Waves',
    artist: 'SoundChain',
    cover: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iOCIgZmlsbD0iI2VmNDQ0NCIvPgo8Y2lyY2xlIGN4PSIyNCIgY3k9IjI0IiByPSIxMiIgZmlsbD0iI2ZmZmZmZiIgZmlsbC1vcGFjaXR5PSIwLjIiLz4KPHN2ZyB4PSIxOCIgeT0iMTgiIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjZmZmZmZmIj4KPHA+cGF0aCBkPSJNOCA1djE0bDExLTdMOCA1eiIvPgo8L3N2Zz4KPC9zdmc+',
    duration: 256,
    collection: 'Ambient',
    isLiked: false
  },
  {
    id: '5',
    title: 'Digital Pulse',
    artist: 'ByteRhythm',
    cover: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iOCIgZmlsbD0iIzhmNWNmNiIvPgo8Y2lyY2xlIGN4PSIyNCIgY3k9IjI0IiByPSIxMiIgZmlsbD0iI2ZmZmZmZiIgZmlsbC1vcGFjaXR5PSIwLjIiLz4KPHN2ZyB4PSIxOCIgeT0iMTgiIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjZmZmZmZmIj4KPHA+cGF0aCBkPSJNOCA1djE0bDExLTdMOCA1eiIvPgo8L3N2Zz4KPC9zdmc+',
    duration: 189,
    collection: 'Techno',
    isLiked: true
  },
  {
    id: '6',
    title: 'Tezos Sunset',
    artist: 'CryptoBeats',
    cover: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iOCIgZmlsbD0iI2Y1OWU0MiIvPgo8Y2lyY2xlIGN4PSIyNCIgY3k9IjI0IiByPSIxMiIgZmlsbD0iI2ZmZmZmZiIgZmlsbC1vcGFjaXR5PSIwLjIiLz4KPHN2ZyB4PSIxOCIgeT0iMTgiIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjZmZmZmZmIj4KPHA+cGF0aCBkPSJNOCA1djE0bDExLTdMOCA1eiIvPgo8L3N2Zz4KPC9zdmc+',
    duration: 278,
    collection: 'Ambient',
    isLiked: false
  },
  {
    id: '7',
    title: 'Smart Contract',
    artist: 'Digital Harmony',
    cover: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iOCIgZmlsbD0iIzM0ZDM5OSIvPgo8Y2lyY2xlIGN4PSIyNCIgY3k9IjI0IiByPSIxMiIgZmlsbD0iI2ZmZmZmZiIgZmlsbC1vcGFjaXR5PSIwLjIiLz4KPHN2ZyB4PSIxOCIgeT0iMTgiIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjZmZmZmZmIj4KPHA+cGF0aCBkPSJNOCA1djE0bDExLTdMOCA1eiIvPgo8L3N2Zz4KPC9zdmc+',
    duration: 203,
    collection: 'Orchestral',
    isLiked: true
  },
  {
    id: '8',
    title: 'Decentralized Beat',
    artist: 'TokenBeats',
    cover: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iOCIgZmlsbD0iIzY2NjZmZiIvPgo8Y2lyY2xlIGN4PSIyNCIgY3k9IjI0IiByPSIxMiIgZmlsbD0iI2ZmZmZmZiIgZmlsbC1vcGFjaXR5PSIwLjIiLz4KPHN2ZyB4PSIxOCIgeT0iMTgiIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjZmZmZmZmIj4KPHA+cGF0aCBkPSJNOCA1djE0bDExLTdMOCA1eiIvPgo8L3N2Zz4KPC9zdmc+',
    duration: 345,
    collection: 'Techno',
    isLiked: false
  }
];

export const generateCoverSVG = (color: string, title: string) => {
  const initials = title.split(' ').map(word => word[0]).join('').toUpperCase();
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="8" fill="${color}"/>
      <text x="24" y="28" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14" font-weight="bold">${initials}</text>
    </svg>
  `)}`;
};