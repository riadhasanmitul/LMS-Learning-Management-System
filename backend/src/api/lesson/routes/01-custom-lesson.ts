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
  ],
};
