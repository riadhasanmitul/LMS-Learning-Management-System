/**
 * custom lesson routes
 */

export default {
  routes: [
    {
      method: "GET",
      path: "/lessons/course/:courseDocumentId",
      handler: "api::lesson.lesson.courseLessons",
      config: {
        auth: {
          scope: ["api::lesson.lesson.find"],
        },
      },
    },
    {
      method: "GET",
      path: "/lessons/instructor/:courseDocumentId",
      handler: "api::lesson.lesson.instructorLessons",
      config: {
        auth: {
          scope: ["api::lesson.lesson.find"],
        },
      },
    },
    {
      method: "GET",
      path: "/lessons/content-manager/:courseDocumentId",
      handler: "api::lesson.lesson.contentManagerLessons",
      config: {
        auth: {
          scope: ["api::lesson.lesson.find"],
        },
      },
    },
    {
      method: "POST",
      path: "/lessons/:lessonDocumentId/publish",
      handler: "api::lesson.lesson.publishLesson",
      config: {
        auth: {
          scope: ["api::lesson.lesson.update"],
        },
      },
    },
    {
      method: "POST",
      path: "/lessons/:lessonDocumentId/unpublish",
      handler: "api::lesson.lesson.unpublishLesson",
      config: {
        auth: {
          scope: ["api::lesson.lesson.update"],
        },
      },
    },
  ],
};
