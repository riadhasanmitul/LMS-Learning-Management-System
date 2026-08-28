export default {
  routes: [
    {
      method: "GET",
      path: "/quizzes/content-manager/:courseDocumentId",
      handler: "api::quiz.quiz.contentManagerQuizzes",
      config: {
        auth: {
          scope: ["api::quiz.quiz.find"],
        },
      },
    },
    {
      method: "POST",
      path: "/quizzes/:quizDocumentId/publish",
      handler: "api::quiz.quiz.publishQuiz",
      config: {
        auth: {
          scope: ["api::quiz.quiz.update"],
        },
      },
    },
    {
      method: "POST",
      path: "/quizzes/:quizDocumentId/unpublish",
      handler: "api::quiz.quiz.unpublishQuiz",
      config: {
        auth: {
          scope: ["api::quiz.quiz.update"],
        },
      },
    },
  ],
};