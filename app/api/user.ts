export const fetchUser = async (token: string) => {
  const res = await fetch("https://api.realworld.show/api/user", {
    headers: {
      Authorization: `Token ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error("Failed to fetch user");
  }

  return data.user;
};
