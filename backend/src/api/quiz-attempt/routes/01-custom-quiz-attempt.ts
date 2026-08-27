export default {
  routes: [
    {
      method: "POST",
      path: "/quiz-attempts/submit",
      handler: "api::quiz-attempt.quiz-attempt.submit",
      config: {
        auth: {
          scope: ["api::quiz-attempt.quiz-attempt.create"],
        },
      },
    },
    {
  method: "GET",
  path: "/quiz-attempts/my-attempts",
  handler: "api::quiz-attempt.quiz-attempt.myAttempts",
  config: {
    auth: {
      scope: ["api::quiz-attempt.quiz-attempt.find"],
    },
  },
},
  ],
};