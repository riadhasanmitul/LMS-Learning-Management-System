/**
 * custom course routes
 */

export default {
  routes: [
    {
      method: "GET",
      path: "/courses/my-courses",
      handler: "api::course.course.myCourses",
      config: {
        auth: {
          scope: ["api::course.course.find"],
        },
      },
    },
    {
      method: "GET",
      path: "/courses/:courseDocumentId/progress",
      handler: "api::course.course.courseProgress",
      config: {
        auth: {
          scope: ["api::course.course.find"],
        },
      },
    },
    {
      method: "GET",
      path: "/courses/instructor-courses",
      handler: "api::course.course.instructorCourses",
      config: {
        auth: {
          scope: ["api::course.course.find"],
        },
      },
    },
    {
      method: "GET",
      path: "/courses/content-manager-courses",
      handler: "api::course.course.contentManagerCourses",
      config: {
        auth: {
          scope: ["api::course.course.find"],
        },
      },
    },
    {
      method: "POST",
      path: "/courses/:courseDocumentId/publish",
      handler: "api::course.course.publishCourse",
      config: {
        auth: {
          scope: ["api::course.course.update"],
        },
      },
    },
    {
      method: "POST",
      path: "/courses/:courseDocumentId/unpublish",
      handler: "api::course.course.unpublishCourse",
      config: {
        auth: {
          scope: ["api::course.course.update"],
        },
      },
    },
  ],
};
