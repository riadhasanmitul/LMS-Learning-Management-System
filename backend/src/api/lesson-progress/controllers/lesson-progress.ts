/**
 * lesson-progress controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::lesson-progress.lesson-progress",
  ({ strapi }) => ({
    async create(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("Authentication required");
      }

      const { lesson, completed } = ctx.request.body.data;

      if (!lesson) {
        return ctx.badRequest("Lesson is required");
      }

      const lessonRecord = await strapi
        .documents("api::lesson.lesson")
        .findOne({
          documentId: lesson,
          populate: ["course"],
        });

      if (!lessonRecord) {
        return ctx.notFound("Lesson not found");
      }

      const courseDocumentId = lessonRecord.course?.documentId;

      if (!courseDocumentId) {
        return ctx.badRequest("Lesson is not assigned to a course");
      }

      // Check whether the student is enrolled in the course
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
        });

      if (enrollments.length === 0) {
        return ctx.forbidden(
          "You are not enrolled in this course",
        );
      }

      // Check whether progress already exists
      const existingProgress = await strapi
        .documents("api::lesson-progress.lesson-progress")
        .findMany({
          filters: {
            student: user.id,
            lesson: {
              documentId: lesson,
            },
          },
        });

      // Update existing progress
      if (existingProgress.length > 0) {
        const progress = await strapi
          .documents("api::lesson-progress.lesson-progress")
          .update({
            documentId: existingProgress[0].documentId,
            data: {
              completed: completed ?? true,
              ...(completed === false
                ? { completedAt: "" }
                : { completedAt: new Date() }),
            },
          });

        return { data: progress };
      }

      // Create new progress
      const progressData: {
        completed: boolean;
        student: number;
        lesson: string;
        completedAt?: Date;
      } = {
        completed: completed ?? true,
        student: user.id,
        lesson,
      };

      if (completed !== false) {
        progressData.completedAt = new Date();
      }

      const progress = await strapi
        .documents("api::lesson-progress.lesson-progress")
        .create({
          data: progressData,
        });

      return { data: progress };
    },

    async myProgress(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("Authentication required");
      }

      const progress = await strapi
        .documents("api::lesson-progress.lesson-progress")
        .findMany({
          filters: {
            student: user.id,
          },
          populate: ["lesson"],
          sort: ["createdAt:desc"],
        });

      return {
        data: progress,
      };
    },
  }),
);