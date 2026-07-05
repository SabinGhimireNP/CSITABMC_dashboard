// Dummy data source for Certificates. Mirrors the shape produced by certificateSchema.
// event: event ID (see Events.js) this certificate was issued for.

export const Certificates = [
  {
    id: 1,
    event: 1,
    fullName: "Sujata Gurung",
    isProjectComplete: true,
    createdAt: "2023-08-15",
  },
  {
    id: 2,
    event: 1,
    fullName: "Rajan Maharjan",
    isProjectComplete: false,
    createdAt: "2023-08-16",
  },
  {
    id: 3,
    event: 2,
    fullName: "Anjali Rai",
    isProjectComplete: true,
    createdAt: "2023-08-17",
  },
  {
    id: 4,
    event: 3,
    fullName: "Kiran Basnet",
    isProjectComplete: true,
    createdAt: "2023-08-18",
  } 
];