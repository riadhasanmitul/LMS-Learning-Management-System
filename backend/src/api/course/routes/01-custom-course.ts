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
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/courses/:courseDocumentId/progress",
      handler: "api::course.course.courseProgress",
      config: {
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/courses/instructor-courses",
      handler: "api::course.course.instructorCourses",
      config: {
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/courses/content-manager-courses",
      handler: "api::course.course.contentManagerCourses",
      config: {
        auth: false,
      },
    },
    {
      method: "POST",
      path: "/courses/:courseDocumentId/publish",
      handler: "api::course.course.publishCourse",
      config: {
        auth: false,
      },
    },
    {
      method: "POST",
      path: "/courses/:courseDocumentId/unpublish",
      handler: "api::course.course.unpublishCourse",
      config: {
        auth: false,
      },
    },
  ],
};
