import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::lesson.lesson",
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
        return ctx.forbidden("You cannot create lessons");
      }

      const lesson = ctx.request.body?.data;

      if (!lesson?.course) {
        return ctx.badRequest("Course is required");
      }

      const course = await strapi.documents("api::course.course").findOne({
        documentId: lesson.course,
        populate: ["instructor"],
      });

      if (!course) {
        return ctx.notFound("Course not found");
      }

      if (role === "Instructor" && course.instructor?.id !== user.id) {
        return ctx.forbidden("You can only add lessons to your own courses");
      }

      return await super.create(ctx);
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
        return ctx.forbidden("You cannot update lessons");
      }

      const documentId = ctx.params.id;

      const lesson = await strapi.documents("api::lesson.lesson").findOne({
        documentId,
        populate: {
          course: {
            populate: {
              instructor: true,
            },
          },
        },
      });

      if (!lesson) {
        return ctx.notFound("Lesson not found");
      }

      if (role === "Instructor" && lesson.course?.instructor?.id !== user.id) {
        return ctx.forbidden("You can only update lessons in your own courses");
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
        return ctx.forbidden("You cannot delete lessons");
      }

      const documentId = ctx.params.id;

      const lesson = await strapi.documents("api::lesson.lesson").findOne({
        documentId,
        populate: {
          course: {
            populate: {
              instructor: true,
            },
          },
        },
      });

      if (!lesson) {
        return ctx.notFound("Lesson not found");
      }

      if (role === "Instructor" && lesson.course?.instructor?.id !== user.id) {
        return ctx.forbidden("You can only delete lessons in your own courses");
      }

      return await super.delete(ctx);
    },

    async courseLessons(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("Authentication required");
      }

      const courseDocumentId = ctx.params.courseDocumentId;

      const enrollment = await strapi.db
        .query("api::enrollment.enrollment")
        .findOne({
          where: {
            student: user.id,
            course: {
              documentId: courseDocumentId,
            },
          },
        });

      if (!enrollment) {
        return ctx.forbidden("You are not enrolled in this course");
      }

      const lessons = await strapi.documents("api::lesson.lesson").findMany({
        filters: {
          course: {
            documentId: courseDocumentId,
          },
        },
        status: "published",
        sort: ["order:asc"],
      });

      return {
        data: lessons,
      };
    },
    async instructorLessons(ctx) {
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

      const courseDocumentId = ctx.params.courseDocumentId;

      const course = await strapi.documents("api::course.course").findOne({
        documentId: courseDocumentId,
      });

      if (!course) {
        return ctx.notFound("Course not found");
      }

      const courseWithInstructor = await strapi
        .documents("api::course.course")
        .findOne({
          documentId: courseDocumentId,
          populate: ["instructor"],
        });

      if (courseWithInstructor?.instructor?.id !== user.id) {
        return ctx.forbidden("You can only manage lessons in your own courses");
      }

      const lessons = await strapi.documents("api::lesson.lesson").findMany({
        filters: {
          course: {
            documentId: courseDocumentId,
          },
        },
        sort: ["order:asc"],
      });

      return {
        data: lessons,
      };
    },
  }),
);
