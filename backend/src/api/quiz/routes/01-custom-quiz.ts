export default {
  routes: [
    {
      method: "GET",
      path: "/quizzes/content-manager/:courseDocumentId",
      handler: "api::quiz.quiz.contentManagerQuizzes",
      config: {
        auth: false,
      },
    },
    {
      method: "POST",
      path: "/quizzes/:quizDocumentId/publish",
      handler: "api::quiz.quiz.publishQuiz",
      config: {
        auth: false,
      },
    },
    {
      method: "POST",
      path: "/quizzes/:quizDocumentId/unpublish",
      handler: "api::quiz.quiz.unpublishQuiz",
      config: {
        auth: false,
      },
    },
  ],
};