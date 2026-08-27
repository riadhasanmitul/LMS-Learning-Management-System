import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::quiz-attempt.quiz-attempt",
  ({ strapi }) => ({
    async submit(ctx) {
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
        return ctx.forbidden("Only students can take quizzes");
      }

      const { quiz, answers } = ctx.request.body.data;

      if (!quiz) {
        return ctx.badRequest("Quiz is required");
      }

      if (!answers || typeof answers !== "object") {
        return ctx.badRequest("Answers are required");
      }

      const quizRecord = await strapi.documents("api::quiz.quiz").findOne({
        documentId: quiz,
        populate: ["questions", "course"],
      });

      if (!quizRecord) {
        return ctx.notFound("Quiz not found");
      }

      const courseDocumentId = quizRecord.course?.documentId;

      if (!courseDocumentId) {
        return ctx.badRequest("Quiz is not assigned to a course");
      }

      const enrollments = await strapi
        .documents("api::enrollment.enrollment")
        .findMany({
          filters: {
            student: user.id,
            course: {
              documentId: courseDocumentId,
            },
          },
        });

      if (enrollments.length === 0) {
        return ctx.forbidden("You are not enrolled in this course");
      }

      const questions = quizRecord.questions ?? [];

      let score = 0;

      for (const question of questions) {
        const submittedAnswer = answers[question.documentId];

        if (
          submittedAnswer !== undefined &&
          submittedAnswer === question.correctAnswer
        ) {
          score++;
        }
      }

      const totalQuestions = questions.length;

      const attempt = await strapi
        .documents("api::quiz-attempt.quiz-attempt")
        .create({
          data: {
            score,
            totalQuestions,
            submittedAt: new Date(),
            quiz,
            student: user.id,
          },
        });

      return {
        data: {
          attempt: {
            documentId: attempt.documentId,
            score,
            totalQuestions,
            percentage:
              totalQuestions === 0
                ? 0
                : Math.round((score / totalQuestions) * 100),
          },
        },
      };
    },
    async myAttempts(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("Authentication required");
      }

      const attempts = await strapi
        .documents("api::quiz-attempt.quiz-attempt")
        .findMany({
          filters: {
            student: user.id,
          },
          populate: {
            quiz: {
              populate: ["course"],
            },
          },
          sort: ["submittedAt:desc"],
        });

      return {
        data: attempts,
      };
    },
  }),
);
