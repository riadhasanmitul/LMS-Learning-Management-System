import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::course.course",
  ({ strapi }) => ({
    async users(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("Authentication required");
      }

      const adminRole = await strapi
        .documents("plugin::users-permissions.role")
        .findMany({
          filters: {
            name: "Admin",
          },
        });

      const isAdmin = adminRole.some(
        (role) => role.id === user.role?.id,
      );

      if (!isAdmin) {
        return ctx.forbidden("Admin access required");
      }

      const users = await strapi
        .documents("plugin::users-permissions.user")
        .findMany({
          populate: ["role"],
        });

      return {
        data: users.map((item) => ({
          documentId: item.documentId,
          username: item.username,
          email: item.email,
          confirmed: item.confirmed,
          blocked: item.blocked,
          role: item.role
            ? {
                documentId: item.role.documentId,
                name: item.role.name,
                type: item.role.type,
              }
            : null,
        })),
      };
    },
  }),
);
