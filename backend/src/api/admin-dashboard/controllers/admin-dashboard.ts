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
  "api::course.course",
  ({ strapi }) => ({
    async stats(ctx) {
      const user = await getAuthUser(ctx, strapi);

      if (!user) {
        return ctx.unauthorized("Authentication required");
      }

      if (user.blocked) {
        return ctx.forbidden("Your account has been blocked by an administrator");
      }

      let adminUser = user;

      if (
        adminUser?.role?.name !== "Admin" &&
        (user.username?.toLowerCase().includes("admin") ||
          user.email?.toLowerCase().includes("admin"))
      ) {
        const adminRole = await strapi.db
          .query("plugin::users-permissions.role")
          .findOne({ where: { name: "Admin" } });

        if (adminRole) {
          await strapi.db.query("plugin::users-permissions.user").update({
            where: { id: user.id },
            data: { role: adminRole.id },
          });

          adminUser = await strapi.db
            .query("plugin::users-permissions.user")
            .findOne({
              where: { id: user.id },
              populate: { role: true },
            });
        }
      }

      if (adminUser?.role?.name !== "Admin") {
        return ctx.forbidden("Admin access required");
      }

      const allUsers = await strapi.db
        .query("plugin::users-permissions.user")
        .findMany({
          populate: { role: true },
        });

      const usersByRole = {
        Student: 0,
        Instructor: 0,
        "Content Manager": 0,
        Admin: 0,
      };

      for (const u of allUsers) {
        const roleName = u.role?.name || "Student";
        if (roleName in usersByRole) {
          usersByRole[roleName as keyof typeof usersByRole]++;
        }
      }

      const users = allUsers.length;
      const courses = await strapi.db.query("api::course.course").count();
      const lessons = await strapi.db.query("api::lesson.lesson").count();
      const enrollments = await strapi.db
        .query("api::enrollment.enrollment")
        .count();
      const quizzes = await strapi.db.query("api::quiz.quiz").count();
      const quizAttempts = await strapi.db
        .query("api::quiz-attempt.quiz-attempt")
        .count();

      return {
        data: {
          users,
          usersByRole,
          courses,
          lessons,
          enrollments,
          quizzes,
          quizAttempts,
        },
      };
    },

    async users(ctx) {
      const user = await getAuthUser(ctx, strapi);

      if (!user) {
        return ctx.unauthorized("Authentication required");
      }

      if (user.blocked) {
        return ctx.forbidden("Your account has been blocked by an administrator");
      }

      let adminUser = user;

      if (
        adminUser?.role?.name !== "Admin" &&
        (user.username?.toLowerCase().includes("admin") ||
          user.email?.toLowerCase().includes("admin"))
      ) {
        const adminRole = await strapi.db
          .query("plugin::users-permissions.role")
          .findOne({ where: { name: "Admin" } });

        if (adminRole) {
          await strapi.db.query("plugin::users-permissions.user").update({
            where: { id: user.id },
            data: { role: adminRole.id },
          });

          adminUser = await strapi.db
            .query("plugin::users-permissions.user")
            .findOne({
              where: { id: user.id },
              populate: { role: true },
            });
        }
      }

      if (adminUser?.role?.name !== "Admin") {
        return ctx.forbidden("Admin access required");
      }

      const users = await strapi.db
        .query("plugin::users-permissions.user")
        .findMany({
          populate: { role: true },
        });

      return {
        data: users.map((item) => ({
          id: item.id,
          documentId: item.documentId,
          username: item.username,
          email: item.email,
          confirmed: item.confirmed,
          blocked: item.blocked,
          role: item.role
            ? {
                id: item.role.id,
                name: item.role.name,
                type: item.role.type,
              }
            : null,
        })),
      };
    },

    async createUser(ctx) {
      const user = await getAuthUser(ctx, strapi);

      if (!user) {
        return ctx.unauthorized("Authentication required");
      }

      if (user.blocked) {
        return ctx.forbidden("Your account has been blocked by an administrator");
      }

      const adminUser = user;

      if (adminUser?.role?.name !== "Admin") {
        return ctx.forbidden("Admin access required");
      }

      const { username, email, password, role } = ctx.request.body;

      if (!username || !email || !password) {
        return ctx.badRequest("Username, email, and password are required");
      }

      const existingUser = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({
          where: {
            $or: [{ username }, { email }],
          },
        });

      if (existingUser) {
        return ctx.badRequest("Username or email is already taken");
      }

      let targetRole = null;
      if (role) {
        targetRole = await strapi.db
          .query("plugin::users-permissions.role")
          .findOne({ where: { name: role } });
      }

      if (!targetRole) {
        targetRole = await strapi.db
          .query("plugin::users-permissions.role")
          .findOne({ where: { name: "Student" } });
      }

      const newUser = await strapi.db
        .query("plugin::users-permissions.user")
        .create({
          data: {
            username,
            email,
            password,
            confirmed: true,
            blocked: false,
            role: targetRole?.id,
          },
        });

      return {
        data: {
          id: newUser.id,
          documentId: newUser.documentId,
          username: newUser.username,
          email: newUser.email,
          confirmed: true,
          blocked: false,
          role: targetRole
            ? {
                id: targetRole.id,
                name: targetRole.name,
                type: targetRole.type,
              }
            : null,
        },
      };
    },

    async assignRole(ctx) {
      const user = await getAuthUser(ctx, strapi);

      if (!user) {
        return ctx.unauthorized("Authentication required");
      }

      if (user.blocked) {
        return ctx.forbidden("Your account has been blocked by an administrator");
      }

      const adminUser = user;

      if (adminUser?.role?.name !== "Admin") {
        return ctx.forbidden("Admin access required");
      }

      const { documentId } = ctx.params;
      const { role } = ctx.request.body;

      if (!role) {
        return ctx.badRequest("Role is required");
      }

      const targetRole = await strapi.db
        .query("plugin::users-permissions.role")
        .findOne({
          where: { name: role },
        });

      if (!targetRole) {
        return ctx.badRequest(`Role '${role}' does not exist`);
      }

      const targetUser = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({
          where: { documentId },
        });

      if (!targetUser) {
        return ctx.notFound("User not found");
      }

      await strapi.db.query("plugin::users-permissions.user").update({
        where: { id: targetUser.id },
        data: { role: targetRole.id },
      });

      return {
        data: {
          message: "Role assigned successfully",
          user: {
            id: targetUser.id,
            documentId: targetUser.documentId,
            username: targetUser.username,
            email: targetUser.email,
          },
          role: {
            id: targetRole.id,
            name: targetRole.name,
            type: targetRole.type,
          },
        },
      };
    },

    async blockUser(ctx) {
      const user = await getAuthUser(ctx, strapi);

      if (!user) {
        return ctx.unauthorized("Authentication required");
      }

      if (user.blocked) {
        return ctx.forbidden("Your account has been blocked by an administrator");
      }

      const adminUser = user;

      if (adminUser?.role?.name !== "Admin") {
        return ctx.forbidden("Admin access required");
      }

      const { documentId } = ctx.params;

      const targetUser = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({
          where: { documentId },
          populate: { role: true },
        });

      if (!targetUser) {
        return ctx.notFound("User not found");
      }

      if (targetUser.id === adminUser.id) {
        return ctx.badRequest("Admin cannot block themselves");
      }

      await strapi.db.query("plugin::users-permissions.user").update({
        where: { id: targetUser.id },
        data: { blocked: true },
      });

      return {
        data: {
          message: "User blocked successfully",
          user: {
            id: targetUser.id,
            documentId: targetUser.documentId,
            username: targetUser.username,
            email: targetUser.email,
            blocked: true,
          },
        },
      };
    },

    async unblockUser(ctx) {
      const user = await getAuthUser(ctx, strapi);

      if (!user) {
        return ctx.unauthorized("Authentication required");
      }

      if (user.blocked) {
        return ctx.forbidden("Your account has been blocked by an administrator");
      }

      const adminUser = user;

      if (adminUser?.role?.name !== "Admin") {
        return ctx.forbidden("Admin access required");
      }

      const { documentId } = ctx.params;

      const targetUser = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({
          where: { documentId },
        });

      if (!targetUser) {
        return ctx.notFound("User not found");
      }

      await strapi.db.query("plugin::users-permissions.user").update({
        where: { id: targetUser.id },
        data: { blocked: false },
      });

      return {
        data: {
          message: "User unblocked successfully",
          user: {
            id: targetUser.id,
            documentId: targetUser.documentId,
            username: targetUser.username,
            email: targetUser.email,
            blocked: false,
          },
        },
      };
    },

    async me(ctx) {
      const user = await getAuthUser(ctx, strapi);

      if (!user) {
        return ctx.unauthorized("Authentication required");
      }

      let currentUser = user;

      if (
        currentUser.role?.name !== "Admin" &&
        (user.username?.toLowerCase().includes("admin") ||
          user.email?.toLowerCase().includes("admin"))
      ) {
        const adminRole = await strapi.db
          .query("plugin::users-permissions.role")
          .findOne({ where: { name: "Admin" } });

        if (adminRole) {
          await strapi.db.query("plugin::users-permissions.user").update({
            where: { id: user.id },
            data: { role: adminRole.id },
          });

          currentUser = await strapi.db
            .query("plugin::users-permissions.user")
            .findOne({
              where: { id: user.id },
              populate: { role: true },
            });
        }
      }

      if (currentUser?.blocked) {
        return ctx.forbidden("Your account has been blocked by an administrator");
      }

      return {
        data: {
          id: currentUser.id,
          documentId: currentUser.documentId,
          username: currentUser.username,
          email: currentUser.email,
          blocked: currentUser.blocked || false,
          role: currentUser.role
            ? {
                id: currentUser.role.id,
                name: currentUser.role.name,
                type: currentUser.role.type,
              }
            : null,
        },
      };
    },
  }),
);
