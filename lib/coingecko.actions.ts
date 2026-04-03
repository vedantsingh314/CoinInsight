'use server';

import qs from "query-string";

const BASE_URL = process.env.COINGECKO_BASE_URL;
const API_KEY = process.env.COINGECKO_API_KEY;

if (!BASE_URL) throw new Error("Could not get the base URL");
if (!API_KEY) throw new Error("Could not get the API key");

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
      "x-cg-demo-api-key": API_KEY, // ✅ DEMO KEY ONLY
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