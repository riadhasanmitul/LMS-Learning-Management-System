export default {
  routes: [
    {
      method: "POST",
      path: "/quiz-attempts/submit",
      handler: "api::quiz-attempt.quiz-attempt.submit",
      config: {
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/quiz-attempts/my-attempts",
      handler: "api::quiz-attempt.quiz-attempt.myAttempts",
      config: {
        auth: false,
      },
    },
  ],
};