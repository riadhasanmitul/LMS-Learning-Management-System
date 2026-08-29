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
      // 1. Ensure all 4 LMS roles exist in users-permissions plugin
      const roleNames = ["Student", "Instructor", "Content Manager", "Admin"];

      for (const name of roleNames) {
        const existingRole = await strapi.db
          .query("plugin::users-permissions.role")
          .findOne({ where: { name } });

        if (!existingRole) {
          const type = name.toLowerCase().replace(/\s+/g, "_");
          await strapi.db.query("plugin::users-permissions.role").create({
            data: {
              name,
              type,
              description: `${name} role for CPS LMS`,
            },
          });
        }
      }

      // 2. Automatically assign roles based on username / email during bootstrap
      const roleMap = [
        { roleName: "Admin", pattern: "%admin%" },
        { roleName: "Content Manager", pattern: "%content%" },
        { roleName: "Instructor", pattern: "%instructor%" },
      ];

      for (const { roleName, pattern } of roleMap) {
        const roleRecord = await strapi.db
          .query("plugin::users-permissions.role")
          .findOne({ where: { name: roleName } });

        if (roleRecord) {
          const matchedUsers = await strapi.db
            .query("plugin::users-permissions.user")
            .findMany({
              where: {
                $or: [
                  { username: { $iLike: pattern } },
                  { email: { $iLike: pattern } },
                ],
              },
            });

          for (const u of matchedUsers) {
            await strapi.db.query("plugin::users-permissions.user").update({
              where: { id: u.id },
              data: { role: roleRecord.id },
            });
          }
        }
      }

      // 3. Ensure permissions linkage for custom routes
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
        "api::quiz.quiz.publishQuiz",
        "api::quiz.quiz.unpublishQuiz",
        "api::lesson.lesson.find",
        "api::lesson.lesson.findOne",
        "api::lesson.lesson.create",
        "api::lesson.lesson.update",
        "api::lesson.lesson.delete",
        "api::lesson.lesson.publishLesson",
        "api::lesson.lesson.unpublishLesson",
        "api::course.course.publishCourse",
        "api::course.course.unpublishCourse",
        "api::blog-post.blog-post.find",
        "api::blog-post.blog-post.findOne",
        "api::blog-post.blog-post.create",
        "api::blog-post.blog-post.update",
        "api::blog-post.blog-post.delete",
        "api::blog-post.blog-post.published",
        "api::blog-post.blog-post.publishedOne",
        "api::admin-dashboard.admin-dashboard.me",
      ];

      const allRoles = await strapi.db
        .query("plugin::users-permissions.role")
        .findMany({
          where: {
            name: ["Instructor", "Admin", "Content Manager", "Student", "Authenticated"],
          },
        });

      for (const role of allRoles) {
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

          // Safe linkage across SQLite and Postgres table naming schemas
          const tableNames = ["up_permissions_role_links", "up_permissions_role_lnk"];
          for (const tableName of tableNames) {
            try {
              const hasTable = await strapi.db.connection.schema.hasTable(tableName);
              if (hasTable) {
                const existingLink = await strapi.db
                  .connection(tableName)
                  .where({
                    permission_id: permission.id,
                    role_id: role.id,
                  })
                  .first();

                if (!existingLink) {
                  await strapi.db.connection(tableName).insert({
                    permission_id: permission.id,
                    role_id: role.id,
                  });
                }
                break;
              }
            } catch {
              // Ignore if individual table query fails
            }
          }
        }
      }
    } catch (err) {
      console.error("Bootstrap permissions setup error:", err);
    }
  },
};
