import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::course.course",
  ({ strapi }) => ({
    async create(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("Authentication required");
      }

      const currentUser = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({
          where: {
            id: user.id,
          },
          populate: {
            role: true,
          },
        });

      const role = currentUser?.role?.name;

      if (
        role !== "Admin" &&
        role !== "Content Manager" &&
        role !== "Instructor"
      ) {
        return ctx.forbidden("You cannot create courses");
      }

      const response = await super.create(ctx);

      if (response?.data && role === "Instructor") {
        await strapi.documents("api::course.course").update({
          documentId: response.data.documentId,
          data: {
            instructor: user.id,
          },
        });
      }

      if (response?.data) {
        response.data = await strapi
          .documents("api::course.course")
          .findOne({
            documentId: response.data.documentId,
            populate: {
              instructor: {
                fields: ["id", "documentId", "username", "email"],
              },
            },
          });
      }

      return response;

    },

    async update(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("Authentication required");
      }

      const currentUser = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({
          where: {
            id: user.id,
          },
          populate: {
            role: true,
          },
        });

      const role = currentUser?.role?.name;

      if (
        role !== "Admin" &&
        role !== "Content Manager" &&
        role !== "Instructor"
      ) {
        return ctx.forbidden("You cannot update courses");
      }

      const documentId = ctx.params.id;

      const course = await strapi
        .documents("api::course.course")
        .findOne({
          documentId,
          populate: ["instructor"],
        });

      if (!course) {
        return ctx.notFound("Course not found");
      }

      if (
        role === "Instructor" &&
        course.instructor?.id !== user.id
      ) {
        return ctx.forbidden(
          "You can only update your own courses",
        );
      }

      return await super.update(ctx);
    },

    async delete(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("Authentication required");
      }

      const currentUser = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({
          where: {
            id: user.id,
          },
          populate: {
            role: true,
          },
        });

      const role = currentUser?.role?.name;

      if (
        role !== "Admin" &&
        role !== "Content Manager" &&
        role !== "Instructor"
      ) {
        return ctx.forbidden("You cannot delete courses");
      }

      const documentId = ctx.params.id;

      const course = await strapi
        .documents("api::course.course")
        .findOne({
          documentId,
          populate: ["instructor"],
        });

      if (!course) {
        return ctx.notFound("Course not found");
      }

      if (
        role === "Instructor" &&
        course.instructor?.id !== user.id
      ) {
        return ctx.forbidden(
          "You can only delete your own courses",
        );
      }

      return await super.delete(ctx);
    },

    async myCourses(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("Authentication required");
      }

      const enrollments = await strapi
        .documents("api::enrollment.enrollment")
        .findMany({
          filters: {
            student: {
              id: user.id,
            },
          },
          populate: ["course"],
        });

      const courses = enrollments
        .map((enrollment) => enrollment.course)
        .filter(Boolean);

      return {
        data: courses,
      };
    },

    async instructorCourses(ctx) {
  const user = ctx.state.user;

  if (!user) {
    return ctx.unauthorized("Authentication required");
  }

  const currentUser = await strapi.db
    .query("plugin::users-permissions.user")
    .findOne({
      where: {
        id: user.id,
      },
      populate: {
        role: true,
      },
    });

  if (currentUser?.role?.name !== "Instructor") {
    return ctx.forbidden("Instructor access required");
  }

  const publishedCourses = await strapi
    .documents("api::course.course")
    .findMany({
      status: "published",
    });

  const publishedMap = new Map(
    publishedCourses.map((c) => [c.documentId, c.publishedAt || c.updatedAt || new Date().toISOString()]),
  );

  const courses = await strapi
    .documents("api::course.course")
    .findMany({
      status: "draft",
      filters: {
        instructor: {
          id: user.id,
        },
      },
      sort: ["createdAt:desc"],
    });

  const result = courses.map((course) => ({
    ...course,
    publishedAt: publishedMap.has(course.documentId)
      ? publishedMap.get(course.documentId)
      : null,
  }));

  return {
    data: result,
  };
},
async contentManagerCourses(ctx) {
  const user = ctx.state.user;

  if (!user) {
    return ctx.unauthorized("Authentication required");
  }

  const currentUser = await strapi.db
    .query("plugin::users-permissions.user")
    .findOne({
      where: {
        id: user.id,
      },
      populate: {
        role: true,
      },
    });

  if (
    currentUser?.role?.name !== "Content Manager" &&
    currentUser?.role?.name !== "Admin"
  ) {
    return ctx.forbidden("Content Manager or Admin access required");
  }

  const publishedCourses = await strapi
    .documents("api::course.course")
    .findMany({
      status: "published",
    });

  const publishedMap = new Map(
    publishedCourses.map((c) => [c.documentId, c.publishedAt || c.updatedAt || new Date().toISOString()]),
  );

  const courses = await strapi
    .documents("api::course.course")
    .findMany({
      status: "draft",
      sort: ["createdAt:desc"],
    });

  const result = courses.map((course) => ({
    ...course,
    publishedAt: publishedMap.has(course.documentId)
      ? publishedMap.get(course.documentId)
      : null,
  }));

  return {
    data: result,
  };
},
    async courseProgress(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("Authentication required");
      }

      const courseDocumentId = ctx.params.courseDocumentId;

      const enrollments = await strapi
        .documents("api::enrollment.enrollment")
        .findMany({
          filters: {
            student: {
              id: user.id,
            },
            course: {
              documentId: courseDocumentId,
            },
          },
          populate: {
            course: true,
          },
        });

      if (enrollments.length === 0) {
        return ctx.forbidden(
          "You are not enrolled in this course",
        );
      }

      const course = await strapi
        .documents("api::course.course")
        .findOne({
          documentId: courseDocumentId,
        });

      if (!course) {
        return ctx.notFound("Course not found");
      }

      const lessons = await strapi
        .documents("api::lesson.lesson")
        .findMany({
          filters: {
            course: {
              documentId: courseDocumentId,
            },
          },
        });

      const lessonDocumentIds = lessons.map(
        (lesson) => lesson.documentId,
      );

      const progress = await strapi
        .documents("api::lesson-progress.lesson-progress")
        .findMany({
          filters: {
            student: {
              id: user.id,
            },
            lesson: {
              documentId: {
                $in: lessonDocumentIds,
              },
            },
          },
        });

      const totalLessons = lessons.length;

      const completedLessons = progress.filter(
        (item) => item.completed === true,
      ).length;

      const progressPercentage =
        totalLessons === 0
          ? 0
          : Math.round(
              (completedLessons / totalLessons) * 100,
            );

      return {
        data: {
          course: {
            documentId: course.documentId,
            title: course.title,
          },
          totalLessons,
          completedLessons,
          progressPercentage,
        },
      };
    },
    async publishCourse(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("Authentication required");
      }

      const currentUser = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({
          where: { id: user.id },
          populate: { role: true },
        });

      const role = currentUser?.role?.name;

      if (
        role !== "Admin" &&
        role !== "Content Manager" &&
        role !== "Instructor"
      ) {
        return ctx.forbidden("You cannot publish courses");
      }

      const documentId = ctx.params.courseDocumentId;

      const course = await strapi.documents("api::course.course").findOne({
        documentId,
        populate: ["instructor"],
      });

      if (!course) {
        return ctx.notFound("Course not found");
      }

      if (role === "Instructor" && course.instructor?.id !== user.id) {
        return ctx.forbidden("You can only publish your own courses");
      }

      const published = await strapi.documents("api::course.course").publish({
        documentId,
      });

      return { data: published };
    },
    async unpublishCourse(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("Authentication required");
      }

      const currentUser = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({
          where: { id: user.id },
          populate: { role: true },
        });

      const role = currentUser?.role?.name;

      if (
        role !== "Admin" &&
        role !== "Content Manager" &&
        role !== "Instructor"
      ) {
        return ctx.forbidden("You cannot unpublish courses");
      }

      const documentId = ctx.params.courseDocumentId;

      const course = await strapi.documents("api::course.course").findOne({
        documentId,
        populate: ["instructor"],
      });

      if (!course) {
        return ctx.notFound("Course not found");
      }

      if (role === "Instructor" && course.instructor?.id !== user.id) {
        return ctx.forbidden("You can only unpublish your own courses");
      }

      const unpublished = await strapi.documents("api::course.course").unpublish({
        documentId,
      });

      return { data: unpublished };
    },
    
  }),
);