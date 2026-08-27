import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::quiz.quiz",
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
        return ctx.forbidden("You cannot create quizzes");
      }

      const body = ctx.request.body?.data;

      if (!body?.course) {
        return ctx.badRequest("Course is required");
      }

      const course = await strapi
        .documents("api::course.course")
        .findOne({
          documentId: body.course,
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
          "You can only create quizzes in your own courses",
        );
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
        return ctx.forbidden("You cannot update quizzes");
      }

      const documentId = ctx.params.id;

      const quiz = await strapi
        .documents("api::quiz.quiz")
        .findOne({
          documentId,
          populate: ["course", "course.instructor"],
        });

      if (!quiz) {
        return ctx.notFound("Quiz not found");
      }

      if (
        role === "Instructor" &&
        quiz.course?.instructor?.id !== user.id
      ) {
        return ctx.forbidden(
          "You can only update quizzes in your own courses",
        );
      }

      // If instructor changes the course, validate the new course too.
      const newCourseDocumentId = ctx.request.body?.data?.course;

      if (
        role === "Instructor" &&
        newCourseDocumentId !== undefined &&
        newCourseDocumentId !== quiz.course?.documentId
      ) {
        const newCourse = await strapi
          .documents("api::course.course")
          .findOne({
            documentId: newCourseDocumentId,
            populate: ["instructor"],
          });

        if (!newCourse) {
          return ctx.notFound("Target course not found");
        }

        if (newCourse.instructor?.id !== user.id) {
          return ctx.forbidden(
            "You can only move quizzes into your own courses",
          );
        }
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
        return ctx.forbidden("You cannot delete quizzes");
      }

      const documentId = ctx.params.id;

      const quiz = await strapi
        .documents("api::quiz.quiz")
        .findOne({
          documentId,
          populate: ["course", "course.instructor"],
        });

      if (!quiz) {
        return ctx.notFound("Quiz not found");
      }

      if (
        role === "Instructor" &&
        quiz.course?.instructor?.id !== user.id
      ) {
        return ctx.forbidden(
          "You can only delete quizzes in your own courses",
        );
      }

      return await super.delete(ctx);
    },
  }),
);
