export type Profile = {
  username: string;
  email?: string;
  bio: string;
  image: string;
  password?: string;
  following?: boolean;
};

export type UpdateProfileRequest = {
  user: {
    username?: string;
    email?: string;
    bio?: string | null;
    image?: string | null;
    password?: string;
  };
};
