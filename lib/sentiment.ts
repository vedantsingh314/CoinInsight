export async function getCoinSentiment(coin: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/coin-sentiment?coin=${coin}`,
      {
        next: { revalidate: 86400 }, // cache 1 day
      }
    );

    if (!res.ok) throw new Error("Failed to fetch sentiment");

    return res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}
