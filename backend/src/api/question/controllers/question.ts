import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::question.question",
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

      if (
        currentUser?.role?.name !== "Instructor" &&
        currentUser?.role?.name !== "Admin" &&
        currentUser?.role?.name !== "Content Manager"
      ) {
        return ctx.forbidden("You cannot create questions");
      }

      const body = ctx.request.body?.data;

      if (!body?.quiz) {
        return ctx.badRequest("Quiz is required");
      }

      const quiz = await strapi
        .documents("api::quiz.quiz")
        .findOne({
          documentId: body.quiz,
          populate: {
            course: {
              populate: {
                instructor: true,
              },
            },
          },
        });

      if (!quiz) {
        return ctx.notFound("Quiz not found");
      }

      if (
        currentUser.role.name === "Instructor" &&
        quiz.course?.instructor?.id !== user.id
      ) {
        return ctx.forbidden(
          "You can only create questions in your own quizzes",
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
        role !== "Instructor" &&
        role !== "Admin" &&
        role !== "Content Manager"
      ) {
        return ctx.forbidden("You cannot update questions");
      }

      const documentId = ctx.params.id;

      const question = await strapi
        .documents("api::question.question")
        .findOne({
          documentId,
          populate: ["quiz", "quiz.course", "quiz.course.instructor"],
        });

      if (!question) {
        return ctx.notFound("Question not found");
      }

      if (
        role === "Instructor" &&
        question.quiz?.course?.instructor?.id !== user.id
      ) {
        return ctx.forbidden(
          "You can only update questions in your own quizzes",
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
        role !== "Instructor" &&
        role !== "Admin" &&
        role !== "Content Manager"
      ) {
        return ctx.forbidden("You cannot delete questions");
      }

      const documentId = ctx.params.id;

      const question = await strapi
        .documents("api::question.question")
        .findOne({
          documentId,
          populate: ["quiz", "quiz.course", "quiz.course.instructor"],
        });

      if (!question) {
        return ctx.notFound("Question not found");
      }

      if (
        role === "Instructor" &&
        question.quiz?.course?.instructor?.id !== user.id
      ) {
        return ctx.forbidden(
          "You can only delete questions in your own quizzes",
        );
      }

      return await super.delete(ctx);
    },
    async contentManagerQuestions(ctx) {
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

  if (currentUser?.role?.name !== "Content Manager") {
    return ctx.forbidden("Content Manager access required");
  }

  const quizDocumentId = ctx.params.quizDocumentId;

  const quiz = await strapi
    .documents("api::quiz.quiz")
    .findOne({
      documentId: quizDocumentId,
    });

  if (!quiz) {
    return ctx.notFound("Quiz not found");
  }

  const questions = await strapi
    .documents("api::question.question")
    .findMany({
      filters: {
        quiz: {
          documentId: quizDocumentId,
        },
      },
      sort: ["createdAt:asc"],
    });

  return {
    data: questions.map((item) => ({
      id: item.id,
      documentId: item.documentId,
      question: item.question,
      options: item.options,
      correctAnswer: item.correctAnswer,
    })),
  };
},
  }),
);