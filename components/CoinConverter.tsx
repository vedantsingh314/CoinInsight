'use client';

import { useState, useEffect } from 'react';
import { ArrowRightLeft } from 'lucide-react';

interface CoinConverterProps {
  coinSymbol: string;
  currentPrice: number;
  coinName: string;
}

const SUPPORTED_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
];

const formatAmount = (amount: number, currency: string): string => {
  const symbol = SUPPORTED_CURRENCIES.find(c => c.code === currency)?.symbol || '$';
  return `${symbol}${amount.toFixed(2)}`;
};

export default function CoinConverter({ coinSymbol, currentPrice, coinName }: CoinConverterProps) {
  const [fromAmount, setFromAmount] = useState(1);
  const [toCurrency, setToCurrency] = useState('USD');
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchExchangeRates();
  }, []);

  const fetchExchangeRates = async () => {
    try {
      const currencies = SUPPORTED_CURRENCIES.map(c => c.code).join(',').toLowerCase();
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinSymbol.toLowerCase()}&vs_currencies=${currencies}`
      );
      const data = await response.json();
      const rates = data[coinSymbol.toLowerCase()];
      if (rates) {
        // Convert lowercase keys to uppercase for consistency
        const formattedRates: Record<string, number> = {};
        Object.entries(rates).forEach(([key, value]) => {
          formattedRates[key.toUpperCase()] = value as number;
        });
        setExchangeRates(formattedRates);
      }
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
    } finally {
      setLoading(false);
    }
  };

  const convertedAmount = fromAmount * (exchangeRates[toCurrency] || 0);
  const selectedCurrency = SUPPORTED_CURRENCIES.find(c => c.code === toCurrency);

  // Prevent hydration mismatch by not rendering until client-side
  if (!mounted) {
    return null;
  }

  return (
    <div id="converter">
      <h4>Coin Converter</h4>

      <div className="panel">
        <label className="text-sm text-purple-100 mb-2 block">From</label>
        <div className="input-wrapper">
          <input
            type="number"
            value={fromAmount}
            onChange={(e) => setFromAmount(Number(e.target.value) || 0)}
            placeholder="Enter amount"
            className="input"
          />
          <div className="coin-info">
            <p>{coinSymbol.toUpperCase()}</p>
          </div>
        </div>
      </div>

      <div className="divider">
        <div className="line"></div>
        <div className="icon">
          <ArrowRightLeft size={16} />
        </div>
      </div>

      <div className="panel">
        <label className="text-sm text-purple-100 mb-2 block">To</label>
        <div className="input-wrapper">
          <p className="text-lg font-medium">
            {loading ? 'Loading...' : formatAmount(convertedAmount, toCurrency)}
          </p>
          <select
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
            className="select-trigger"
          >
            {SUPPORTED_CURRENCIES.map(currency => (
              <option key={currency.code} value={currency.code}>
                {currency.symbol} {currency.code}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
