import React from 'react';
import { fetcher } from '@/lib/coingecko.actions';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import { CoinOverviewFallback } from './fallback';
import CandlestickChart from '@/components/CandlestickChart';

const CoinOverview = async () => {
  try {
    const [coin, coinOHLCData] = await Promise.all([
      fetcher<CoinDetailsData>({
        endpoint: '/coins/bitcoin',
        params: { dex_pair_format: 'symbol' },
      }),
      fetcher<OHLCData[]>({
        endpoint: '/coins/bitcoin/ohlc',
        params: {
          vs_currency: 'inr',
          days: 1,
        },
      }),
    ]);

    return (
      <div id="coin-overview">
        <CandlestickChart
          data={coinOHLCData}
          coinId="bitcoin"
        >
          <div className="header pt-2">
            <Image src={coin.image.large} alt={coin.name} width={56} height={56} />
            <div className="info">
              <p>
                {coin.name} / {coin.symbol.toUpperCase()}
              </p>
              <h1>{formatCurrency(coin.market_data.current_price.inr, 2, 'INR')}</h1>
            </div>
          </div>
        </CandlestickChart>
      </div>
    );
  } catch (error) {
    console.error('Error fetching coin overview:', error);
    return <CoinOverviewFallback />;
  }
};

export default CoinOverview;