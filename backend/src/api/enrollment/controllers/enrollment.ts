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
  "api::enrollment.enrollment",
  ({ strapi }) => ({
    async create(ctx) {
      const user = await getAuthUser(ctx, strapi);

      if (!user) {
        return ctx.unauthorized("Authentication required");
      }

      if (user.blocked) {
        return ctx.forbidden("Your account has been blocked by an administrator");
      }

      const body = ctx.request.body?.data || {};

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
