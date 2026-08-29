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
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/lessons/instructor/:courseDocumentId",
      handler: "api::lesson.lesson.instructorLessons",
      config: {
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/lessons/content-manager/:courseDocumentId",
      handler: "api::lesson.lesson.contentManagerLessons",
      config: {
        auth: false,
      },
    },
    {
      method: "POST",
      path: "/lessons/:lessonDocumentId/publish",
      handler: "api::lesson.lesson.publishLesson",
      config: {
        auth: false,
      },
    },
    {
      method: "POST",
      path: "/lessons/:lessonDocumentId/unpublish",
      handler: "api::lesson.lesson.unpublishLesson",
      config: {
        auth: false,
      },
    },
  ],
};
