export interface User {
  id: number;
  name: string;
  age: number;
  email: string;
  address: string;
}

export interface Profile {
  id: number;
  userId: number;
  phone: string;
  profileImage: string | null;
  website: string | null;
}
