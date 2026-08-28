export default {
  routes: [
    {
      method: "GET",
      path: "/questions/content-manager/:quizDocumentId",
      handler: "api::question.question.contentManagerQuestions",
      config: {
        auth: {
          scope: ["api::question.question.find"],
        },
      },
    },
  ],
};