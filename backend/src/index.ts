import type { Core } from "@strapi/strapi";

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    try {
      const actionsToEnsure = [
        "api::question.question.find",
        "api::question.question.findOne",
        "api::question.question.create",
        "api::question.question.update",
        "api::question.question.delete",
        "api::quiz.quiz.find",
        "api::quiz.quiz.findOne",
        "api::quiz.quiz.create",
        "api::quiz.quiz.update",
        "api::quiz.quiz.delete",
        "api::lesson.lesson.find",
        "api::lesson.lesson.findOne",
        "api::lesson.lesson.create",
        "api::lesson.lesson.update",
        "api::lesson.lesson.delete",
        "api::admin-dashboard.admin-dashboard.me",
      ];

      const roles = await strapi.db
        .query("plugin::users-permissions.role")
        .findMany({
          where: {
            name: ["Instructor", "Admin", "Content Manager", "Student", "Authenticated"],
          },
        });

      for (const role of roles) {
        for (const action of actionsToEnsure) {
          let permission = await strapi.db
            .query("plugin::users-permissions.permission")
            .findOne({
              where: { action },
            });

          if (!permission) {
            permission = await strapi.db
              .query("plugin::users-permissions.permission")
              .create({
                data: { action },
              });
          }

          const existingLink = await strapi.db
            .connection("up_permissions_role_lnk")
            .where({
              permission_id: permission.id,
              role_id: role.id,
            })
            .first();

          if (!existingLink) {
            await strapi.db
              .connection("up_permissions_role_lnk")
              .insert({
                permission_id: permission.id,
                role_id: role.id,
              });
          }
        }
      }
    } catch (err) {
      console.error("Bootstrap permissions setup error:", err);
    }
  },
};
