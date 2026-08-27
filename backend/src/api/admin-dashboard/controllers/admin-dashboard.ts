import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::course.course",
  ({ strapi }) => ({
    async stats(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("Authentication required");
      }

      const adminUser = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({
          where: {
            id: user.id,
          },
          populate: {
            role: true,
          },
        });

      if (adminUser?.role?.name !== "Admin") {
        return ctx.forbidden("Admin access required");
      }

      const users = await strapi.db
        .query("plugin::users-permissions.user")
        .count();

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
          courses,
          lessons,
          enrollments,
          quizzes,
          quizAttempts,
        },
      };
    },

    async users(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("Authentication required");
      }

      const adminUser = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({
          where: {
            id: user.id,
          },
          populate: {
            role: true,
          },
        });

      if (adminUser?.role?.name !== "Admin") {
        return ctx.forbidden("Admin access required");
      }

      const users = await strapi.db
        .query("plugin::users-permissions.user")
        .findMany({
          populate: {
            role: true,
          },
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
    async assignRole(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("Authentication required");
      }

      // Check current user's role
      const adminUser = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({
          where: {
            id: user.id,
          },
          populate: {
            role: true,
          },
        });

      if (adminUser?.role?.name !== "Admin") {
        return ctx.forbidden("Admin access required");
      }

      const { documentId } = ctx.params;
      const { role } = ctx.request.body;

      if (!role) {
        return ctx.badRequest("Role is required");
      }

      // Find requested role
      const targetRole = await strapi.db
        .query("plugin::users-permissions.role")
        .findOne({
          where: {
            name: role,
          },
        });

      if (!targetRole) {
        return ctx.badRequest(`Role '${role}' does not exist`);
      }

      // Find target user
      const targetUser = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({
          where: {
            documentId,
          },
        });

      if (!targetUser) {
        return ctx.notFound("User not found");
      }

      // Assign role
      await strapi.db.query("plugin::users-permissions.user").update({
        where: {
          id: targetUser.id,
        },
        data: {
          role: targetRole.id,
        },
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
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("Authentication required");
      }

      const adminUser = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({
          where: {
            id: user.id,
          },
          populate: {
            role: true,
          },
        });

      if (adminUser?.role?.name !== "Admin") {
        return ctx.forbidden("Admin access required");
      }

      const { documentId } = ctx.params;

      const targetUser = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({
          where: {
            documentId,
          },
          populate: {
            role: true,
          },
        });

      if (!targetUser) {
        return ctx.notFound("User not found");
      }

      if (targetUser.id === adminUser.id) {
        return ctx.badRequest("Admin cannot block themselves");
      }

      await strapi.db.query("plugin::users-permissions.user").update({
        where: {
          id: targetUser.id,
        },
        data: {
          blocked: true,
        },
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
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("Authentication required");
      }

      const adminUser = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({
          where: {
            id: user.id,
          },
          populate: {
            role: true,
          },
        });

      if (adminUser?.role?.name !== "Admin") {
        return ctx.forbidden("Admin access required");
      }

      const { documentId } = ctx.params;

      const targetUser = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({
          where: {
            documentId,
          },
        });

      if (!targetUser) {
        return ctx.notFound("User not found");
      }

      await strapi.db.query("plugin::users-permissions.user").update({
        where: {
          id: targetUser.id,
        },
        data: {
          blocked: false,
        },
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

  if (!currentUser) {
    return ctx.notFound("User not found");
  }

  return {
    data: {
      id: currentUser.id,
      documentId: currentUser.documentId,
      username: currentUser.username,
      email: currentUser.email,
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
