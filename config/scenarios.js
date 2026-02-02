export const scenarios = {
  load: {
    vus: 2,
    duration: '12s',
  },

  spike: {
    stages: [
      { duration: '10s', target: 3 },
      { duration: '10s', target: 15 },
      { duration: '10s', target: 0 },
    ],
  },

  stress: {
    stages: [
      { duration: '10s', target: 5 },
      { duration: '10s', target: 12 },
      { duration: '10s', target: 20 },
      { duration: '10s', target: 0 },
    ],
  },
};
