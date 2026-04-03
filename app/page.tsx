import React from 'react';
import Image from "next/image";
import DataTable from '@/components/DataTable';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { fetcher } from '@/lib/coingecko.actions';

const trendingCoins: TrendingCoin[] = [
  {
    item: {
      id: 'bitcoin',
      name: 'Bitcoin',
      symbol: 'BTC',
      market_cap_rank: 1,
      thumb: '/logo.svg',
      large: '/logo.svg',
      data: {
        price: 89113,
        price_change_percentage_24h: {
          usd: 2.41,
        },
      },
    },
  },
  {
    item: {
      id: 'ethereum',
      name: 'Ethereum',
      symbol: 'ETH',
      market_cap_rank: 2,
      thumb: '/converter.svg',
      large: '/converter.svg',
      data: {
        price: 4826.13,
        price_change_percentage_24h: {
          usd: -1.32,
        },
      },
    },
  },
  {
    item: {
      id: 'solana',
      name: 'Solana',
      symbol: 'SOL',
      market_cap_rank: 5,
      thumb: '/logo.svg',
      large: '/logo.svg',
      data: {
        price: 194.57,
        price_change_percentage_24h: {
          usd: 4.88,
        },
      },
    },
  },
];

const columns: DataTableColumn<TrendingCoin>[] = [
  {
    header: 'Name',
    cellClassName: 'name-cell',
    cell: (coin) => {
      const item = coin.item;

      return (
        <Link href={`/coins/${item.id}`}>
          <Image
            src={item.large}
            alt={item.name}
            width={36}
            height={36}
          />
          <p>{item.name}</p>
        </Link>
      );
    }
  },
  {
    header: '24h Change',
    cellClassName: 'name-cell',
    cell: (coin) => {
      const item = coin.item;

      const isTrendingUp =
        item.data.price_change_percentage_24h.usd > 0;

      return (
        <div
          className={cn(
            'price-change',
            isTrendingUp ? 'text-green-500' : 'text-red-500'
          )}
        >
          <p>
            {isTrendingUp ? (
              <TrendingUp width={16} height={16} />
            ) : (
              <TrendingDown width={16} height={16} />
            )}
          </p>
          <span>{Math.abs(item.data.price_change_percentage_24h.usd).toFixed(2)}%</span>
        </div>
      );
    },
  },
  {
    header: 'Price',
    cellClassName: 'price-cell',
    cell: (coin) =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(coin.item.data.price),
  },
];

const Page = async () => {
  const coin=await fetcher<CoinDetailsData>({endpoint:'/coins/bitcoin'});
  return (
    <main className="main-container">
      <section className="home-grid">
        <div id="coin-overview">
          <div className="header pt-2">
            <Image
              src={coin.image.large}
              alt="coin.name"
              width={56}
              height={56}
            />
            <div className="info">
              <p>{coin.name}/{coin.symbol.toUpperCase()}</p>
              <h1>{coin.market_data.current_price.inr}</h1>
            </div>
          </div>
        </div>

        <p>Trending Coins</p>
        <DataTable
          data={trendingCoins}
          columns={columns}
          rowKey={(coin) => coin.item.id}
        />
      </section>

      <section className="w-full mt-7 space-y-4">
        <p>Categories</p>
      </section>
    </main>
  );
};

export default Page;
