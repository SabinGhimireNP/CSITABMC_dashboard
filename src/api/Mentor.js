// Dummy data source for Mentors. Mirrors the shape produced by mentorSchema.
// events: array of event IDs (see Events.js) this mentor is attached to.

export const Mentors = [
  {
    id: 1,
    fullName: "Aarav Sharma",
    socialLink: "https://linkedin.com/in/aaravsharma",
    image: null,
    events: [1, 4],
    role: "Lead Mentor",
    status: "published",
  },
  {
    id: 2,
    fullName: "Priya Koirala",
    socialLink: "https://linkedin.com/in/priyakoirala",
    image: null,
    events: [1, 2],
    role: "Technical Mentor",
    status: "draft",
  },
  {
    id: 3,
    fullName: "Bishal Thapa",
    socialLink: "https://twitter.com/bishalthapa",
    image: null,
    events: [2, 3],
    role: "Co-Mentor",
    status: "published",
  },
];