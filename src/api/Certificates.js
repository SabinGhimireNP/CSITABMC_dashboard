// Dummy data source for Certificates. Mirrors the shape produced by certificateSchema.
// event: event ID (see Events.js) this certificate was issued for.

export const Certificates = [
  {
    id: 1,
    event: 1,
    fullName: "Sujata Gurung",
    isProjectComplete: true,
  },
  {
    id: 2,
    event: 1,
    fullName: "Rajan Maharjan",
    isProjectComplete: false,
  },
  {
    id: 3,
    event: 2,
    fullName: "Anjali Rai",
    isProjectComplete: true,
  },
  {
    id: 4,
    event: 3,
    fullName: "Kiran Basnet",
    isProjectComplete: true,
  } 
];