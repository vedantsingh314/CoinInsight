'use server';

import qs from "query-string";

const BASE_URL = process.env.COINGECKO_BASE_URL || 'https://api.coingecko.com/api/v3';

type QueryParams = Record<string, string | number | boolean | undefined>;

type FetcherProps = {
  endpoint: string;
  params?: QueryParams;
  revalidate?: number;
};

type CoinGeckoErrorBody = {
  error?: string;
};

export async function fetcher<T>(
  { endpoint, params, revalidate = 60 }: FetcherProps
): Promise<T> {

  const url = qs.stringifyUrl(
    {
      url: `${BASE_URL}${endpoint}`,
      query: params,
    },
    { skipEmptyString: true, skipNull: true }
  );

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    } as Record<string, string>,
    next: { revalidate },
  });

  console.log("FINAL URL:", url);

  if (!response.ok) {
    const errorBody: CoinGeckoErrorBody = await response
      .json()
      .catch(() => ({}));

    throw new Error(
      `API Error: ${response.status}: ${
        errorBody.error || response.statusText
      }`
    );
  }

  return response.json();
}
export async function getPools(
  id: string,
  network?: string | null,
  contractAddress?: string | null,
): Promise<PoolData> {
  const fallback: PoolData = {
    id: '',
    address: '',
    name: '',
    network: '',
  };

  if (network && contractAddress) {
    try {
      const poolData = await fetcher<{ data: PoolData[] }>({
        endpoint: `/onchain/networks/${network}/tokens/${contractAddress}/pools`,
      });

      return poolData.data?.[0] ?? fallback;
    } catch (error) {
      console.log(error);
      return fallback;
    }
  }

  try {
    const poolData = await fetcher<{ data: PoolData[] }>({
      endpoint: '/onchain/search/pools',
      params: { query: id },
    });

    return poolData.data?.[0] ?? fallback;
  } catch {
    return fallback;
  }
}