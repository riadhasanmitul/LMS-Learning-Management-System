import { factories } from "@strapi/strapi";
import jwt from "jsonwebtoken";

async function getAuthUser(ctx: any, strapi: any) {
  if (ctx.state.user) {
    const populated = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({
        where: { id: ctx.state.user.id },
        populate: { role: true },
      });
    if (populated) return populated;
  }

  const authHeader =
    ctx.headers?.authorization ||
    ctx.request?.headers?.authorization ||
    ctx.header?.authorization;

  if (
    !authHeader ||
    typeof authHeader !== "string" ||
    !authHeader.startsWith("Bearer ")
  ) {
    return null;
  }

  const token = authHeader.substring(7).trim();
  if (!token) return null;

  try {
    const jwtSecret =
      process.env.JWT_SECRET ||
      strapi.config.get("plugin::users-permissions.jwtSecret") ||
      "default_jwt_secret";

    const payload = jwt.verify(token, jwtSecret) as { id?: number };
    if (!payload || !payload.id) return null;

    const user = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({
        where: { id: payload.id },
        populate: { role: true },
      });

    return user;
  } catch {
    return null;
  }
}

export default factories.createCoreController(
  "api::lesson-progress.lesson-progress",
  ({ strapi }) => ({
    async create(ctx) {
      const user = await getAuthUser(ctx, strapi);

      if (!user) {
        return ctx.unauthorized("Authentication required");
      }

      if (user.blocked) {
        return ctx.forbidden("Your account has been blocked by an administrator");
      }

      const { lesson, completed } = ctx.request.body.data || {};

      if (!lesson) {
        return ctx.badRequest("Lesson is required");
      }

      let lessonRecord = await strapi
        .documents("api::lesson.lesson")
        .findOne({
          documentId: lesson,
          populate: ["course"],
          status: "draft",
        });

      if (!lessonRecord) {
        lessonRecord = await strapi
          .documents("api::lesson.lesson")
          .findOne({
            documentId: lesson,
            populate: ["course"],
            status: "published",
          });
      }

      if (!lessonRecord) {
        return ctx.notFound("Lesson not found");
      }

      const courseDocumentId = lessonRecord.course?.documentId;

      if (!courseDocumentId) {
        return ctx.badRequest("Lesson is not assigned to a course");
      }

      const roleName = user.role?.name || "";
      const isManagement =
        roleName.toLowerCase().includes("admin") ||
        roleName.toLowerCase().includes("content") ||
        roleName.toLowerCase().includes("instructor");

      if (!isManagement) {
        let enrollment = await strapi.db
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
          const enrollmentsDoc = await strapi
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
          if (enrollmentsDoc.length > 0) {
            enrollment = enrollmentsDoc[0];
          }
        }

        if (!enrollment) {
          await strapi.documents("api::enrollment.enrollment").create({
            data: {
              student: user.id,
              course: courseDocumentId,
              enrolledAt: new Date(),
            },
            status: "published",
          });
        }
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
        const updateData: Record<string, any> = {
          completed: completed ?? true,
        };
        if (completed !== false) {
          updateData.completedAt = new Date();
        }

        const progress = await strapi
          .documents("api::lesson-progress.lesson-progress")
          .update({
            documentId: existingProgress[0].documentId,
            data: updateData as any,
          });

        return { data: progress };
      }

      // Create new progress
      const progressData: Record<string, any> = {
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
          data: progressData as any,
        });

      return { data: progress };
    },

    async myProgress(ctx) {
      const user = await getAuthUser(ctx, strapi);

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