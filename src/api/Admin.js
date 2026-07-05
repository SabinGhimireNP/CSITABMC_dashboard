// Dummy data source for Admins/Sub-admins.
// Passwords are placeholder strings — in production these would be hashed server-side.

export const Admins = [
  {
    id: 1,
    fullName: "Rohan Shrestha",
    email: "rohan@platform.dev",
    password: "hashed_secret_1",
    role: "Super Admin",
    status: "active",
    createdAt: "2026-01-10",
  },
  {
    id: 2,
    fullName: "Nisha Tamang",
    email: "nisha@platform.dev",
    password: "hashed_secret_2",
    role: "Manager",
    status: "active",
    createdAt: "2026-02-14",
  },
  {
    id: 3,
    fullName: "Bikash Karki",
    email: "bikash@platform.dev",
    password: "hashed_secret_3",
    role: "Admin",
    status: "inactive",
    createdAt: "2026-03-05",
  },
  {
    id: 4,
    fullName: "Samita Lama",
    email: "samita@platform.dev",
    password: "hashed_secret_4",
    role: "Admin",
    status: "active",
    createdAt: "2026-04-22",
  },
];