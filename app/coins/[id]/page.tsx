import { fetcher } from '@/lib/coingecko.actions';
import React from 'react';
import Image from 'next/image';
import { formatCurrency, formatPercentage, cn, giveAbbreviationCrypto } from '@/lib/utils';
import CandlestickChart from '@/components/CandlestickChart';
import DataTable from '@/components/DataTable';
import CoinConverter from '@/components/CoinConverter';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { getCoinSentiment } from "@/lib/sentiment";
const page = async ({params}:NextPageProps) => {
    const {id}=await params;
    console.log(id);
    const sentimentData = await getCoinSentiment(id);
    console.log(sentimentData);

    const coinSymbol = giveAbbreviationCrypto(id.toLowerCase());
    const sentiment = sentimentData?.[coinSymbol];
    
    const [coinData, coinOHLCData] = await Promise.all([
        fetcher<CoinDetailsData>({
            endpoint:`/coins/${id}`,
            params:{
                localization: false,
                tickers: true,
                market_data: true,
                community_data: false,
                developer_data: false,
            }
        }),
        fetcher<OHLCData[]>({
            endpoint:`/coins/${id}/ohlc`,
            params:{
                vs_currency:'inr',
                days:365,
            }
        }).catch(() => [])
    ]);

    const priceChange24h = coinData?.market_data?.price_change_24h_in_currency?.usd || 0;
    const priceChangePercentage24h = coinData?.market_data?.price_change_percentage_24h_in_currency?.usd || 0;
    const priceChangePercentage30d = coinData?.market_data?.price_change_percentage_30d_in_currency?.usd || 0;
    const isTrendingUp = priceChange24h > 0;

    // Prepare ticker data for table
    const tickerColumns: DataTableColumn<Ticker>[] = [
        {
            header: 'Exchange',
            cellClassName: 'exchange-name',
            cell: (ticker) => (
                <a href={ticker.trade_url} target="_blank" rel="noopener noreferrer" className="relative">
                    {ticker.market.name}
                </a>
            ),
        },
        {
            header: 'Pair',
            cellClassName: 'pair',
            cell: (ticker) => (
                <p>{ticker.base}/{ticker.target}</p>
            ),
        },
        {
            header: 'Price',
            cellClassName: 'price-cell',
            cell: (ticker) => formatCurrency(ticker.converted_last.usd, 2, 'INR'),
        },
        {
            header: 'Time',
            cellClassName: 'time-cell',
            cell: (ticker) => new Date(ticker.timestamp).toLocaleTimeString(),
        },
    ];

    return (
        <main id="coin-details-page">
            <div className="primary">
                <div id="coin-header">
                    <h3>{coinData?.name || id}</h3>
                    <div className="info">
                        {coinData?.image?.large && <Image src={coinData.image.large} alt={coinData.name} width={70} height={70} />}
                    </div>
                    <div className="price-row">
                        <h1>{formatCurrency(coinData?.market_data?.current_price?.inr || 0, 2, 'INR')}</h1>
                    </div>
                    <div className="stats">
                        <li>
                            <span className="label">24h Change</span>
                            <span className={cn('value', isTrendingUp ? 'text-green-500' : 'text-red-500')}>
                                {isTrendingUp && '+'}
                                {formatPercentage(priceChangePercentage24h)}
                            </span>
                        </li>
                        <li>
                            <span className="label">30d Change</span>
                            <span className={cn('value', priceChangePercentage30d > 0 ? 'text-green-500' : 'text-red-500')}>
                                {priceChangePercentage30d > 0 && '+'}
                                {formatPercentage(priceChangePercentage30d)}
                            </span>
                        </li>
                        <li>
                            <span className="label">Market Cap Rank</span>
                            <span className="value">#{coinData?.market_cap_rank || 'N/A'}</span>
                        </li>
                    </div>
                </div>

                <CandlestickChart
                    data={coinOHLCData}
                    coinId={id}
                    initialPeriod="yearly"
                />

                {coinData?.tickers && coinData.tickers.length > 0 && (
                    <div className="exchange-section">
                        <h4>Trading Pairs</h4>
                        <DataTable
                            data={coinData.tickers.slice(0, 5)}
                            columns={tickerColumns}
                            rowKey={(ticker) => `${ticker.market.name}-${ticker.base}-${ticker.target}`}
                            tableClassName="exchange-table"
                        />
                    </div>
                )}
            </div>

            <div className="secondary">
                <div className="details">
                    <h4>Market Info</h4>
                    <ul className="details-grid">
                        <li>
                            <span className="label">Market Cap</span>
                            <span className="value">{formatCurrency(coinData?.market_data?.market_cap?.usd || 0, 0, 'INR')}</span>
                        </li>
                        <li>
                            <span className="label">Total Volume</span>
                            <span className="value">{formatCurrency(coinData?.market_data?.total_volume?.usd || 0, 0, 'INR')}</span>
                        </li>
                        <li>
                            <span className="label">Circulating Supply</span>
                            <span className="value">{coinData?.circulating_supply?.toLocaleString('en-US', { maximumFractionDigits: 0 }) || 'N/A'}</span>
                        </li>
                        <li>
                            <span className="label">Total Supply</span>
                            <span className="value">{coinData?.total_supply?.toLocaleString('en-US', { maximumFractionDigits: 0 }) || 'N/A'}</span>
                        </li>
                        {coinData?.ath && (
                            <li>
                                <span className="label">All Time High</span>
                                <span className="value">{formatCurrency(coinData.ath, 2, 'INR')}</span>
                            </li>
                        )}
                        {coinData?.atl && (
                            <li>
                                <span className="label">All Time Low</span>
                                <span className="value">{formatCurrency(coinData.atl, 2, 'INR')}</span>
                            </li>
                        )}
                    </ul>
                </div>

                <div className="mt-4 p-4 border rounded-xl">
                    <h3 className="text-lg font-semibold">Market Sentiment</h3>

                    {sentiment ? (
                        <p
                            className={
                                sentiment.sentiment.includes("Bullish")
                                    ? "text-green-500"
                                    : sentiment.sentiment.includes("Bearish")
                                    ? "text-red-500"
                                    : "text-gray-400"
                            }
                        >
                            {sentiment.sentiment} ({sentiment.confidence})
                        </p>
                    ) : (
                        <p className="text-gray-400">No sentiment data 😐</p>
                    )}
                </div>

                <div className="details">
                    <h4>Links</h4>
                    <ul className="details-grid">
                        {coinData?.links?.homepage?.[0] && (
                            <li>
                                <span className="label">Website</span>
                                <a href={coinData.links.homepage[0]} target="_blank" rel="noopener noreferrer" className="link">
                                    Visit →
                                </a>
                            </li>
                        )}
                        {coinData?.links?.blockchain_site?.[0] && (
                            <li>
                                <span className="label">Blockchain</span>
                                <a href={coinData.links.blockchain_site[0]} target="_blank" rel="noopener noreferrer" className="link">
                                    Explorer →
                                </a>
                            </li>
                        )}
                    </ul>
                </div>

                <CoinConverter
                    coinSymbol={id}
                    currentPrice={coinData?.market_data?.current_price?.inr || 0}
                    coinName={coinData?.name || id}
                />
            </div>
        </main>
    );
}

export default page;