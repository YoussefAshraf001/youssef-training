type Key = [string, string | undefined];

export const fetcher = async ([url, token]: Key) => {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Token ${token}` } : {}),
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch");
  }

  return res.json();
};
