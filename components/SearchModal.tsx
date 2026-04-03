'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CoinResult {
  id: string;
  name: string;
  symbol: string;
  image: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CoinResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (!isOpen) {
          setQuery('');
          setResults([]);
          setSelectedIndex(0);
        }
      }
      if (e.key === 'Escape') {
        onClose();
      }
      if (isOpen && e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % results.length);
      }
      if (isOpen && e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
      }
      if (isOpen && e.key === 'Enter' && results.length > 0) {
        e.preventDefault();
        handleSelectCoin(results[selectedIndex].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSelectedIndex(0);
      return;
    }

    const timer = setTimeout(() => {
      searchCoins(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const searchCoins = async (searchQuery: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(searchQuery)}`
      );
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.coins) {
        const coins = data.coins
          .slice(0, 10)
          .map((coin: any) => ({
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol.toUpperCase(),
            image: coin.large,
          }));
        setResults(coins);
        setSelectedIndex(0);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCoin = (coinId: string) => {
    onClose();
    setQuery('');
    router.push(`/coins/${coinId}`);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl z-50">
        <div className="bg-dark-700 rounded-lg shadow-2xl overflow-hidden border border-dark-500">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-dark-500">
            <Search size={20} className="text-purple-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search coins by name or symbol..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-white placeholder-gray-500 text-lg"
            />
            <button
              onClick={onClose}
              className="p-1 hover:bg-dark-500 rounded transition"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-8 text-center text-gray-400">
                Searching...
              </div>
            ) : results.length > 0 ? (
              <div className="divide-y divide-dark-500">
                {results.map((coin, index) => (
                  <button
                    key={coin.id}
                    onClick={() => handleSelectCoin(coin.id)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full px-4 py-3 flex items-center gap-3 transition ${
                      index === selectedIndex
                        ? 'bg-dark-500'
                        : 'hover:bg-dark-600'
                    }`}
                  >
                    <img
                      src={coin.image}
                      alt={coin.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="text-left flex-1">
                      <p className="font-medium text-white">{coin.name}</p>
                      <p className="text-sm text-gray-400">{coin.symbol}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : query.trim() ? (
              <div className="px-4 py-8 text-center text-gray-400">
                No coins found
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                Start typing to search for coins
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-dark-600 border-t border-dark-500 flex items-center justify-between text-xs text-gray-400">
            <div className="flex gap-4">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
            </div>
            <span>ESC to close</span>
          </div>
        </div>
      </div>
    </>
  );
}
