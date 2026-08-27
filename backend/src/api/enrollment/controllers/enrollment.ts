import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::enrollment.enrollment",
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

      if (currentUser?.role?.name !== "Student") {
        return ctx.forbidden("Only students can enroll in courses");
      }

      const body = ctx.request.body?.data;

      if (!body?.course) {
        return ctx.badRequest("Course is required");
      }

      const courseDocumentId = body.course;

      const course = await strapi
        .documents("api::course.course")
        .findOne({
          documentId: courseDocumentId,
        });

      if (!course) {
        return ctx.notFound("Course not found");
      }

      const existingEnrollment = await strapi.db
        .query("api::enrollment.enrollment")
        .findOne({
          where: {
            student: user.id,
            course: {
              documentId: courseDocumentId,
            },
          },
        });

      if (existingEnrollment) {
        return ctx.badRequest(
          "You are already enrolled in this course",
        );
      }

      const enrollment = await strapi
        .documents("api::enrollment.enrollment")
        .create({
          data: {
            enrolledAt: new Date(),
            course: courseDocumentId,
            student: user.id,
          },
        });

      return {
        data: enrollment,
      };
    },
  }),
);
