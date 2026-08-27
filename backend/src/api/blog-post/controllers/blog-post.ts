import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::blog-post.blog-post",
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
        currentUser?.role?.name !== "Admin" &&
        currentUser?.role?.name !== "Content Manager"
      ) {
        return ctx.forbidden(
          "Only Admin or Content Manager can create blog posts",
        );
      }

      const body = ctx.request.body?.data;

      if (!body?.title) {
        return ctx.badRequest("Title is required");
      }

      if (!body?.body) {
        return ctx.badRequest("Body is required");
      }

      const publicationStatus: "draft" | "published" =
        body.publicationStatus === "published"
          ? "published"
          : "draft";

      let author = await strapi.db
        .query("api::author.author")
        .findOne({
          where: {
            email: currentUser.email,
          },
        });

      if (!author) {
        author = await strapi.documents("api::author.author").create({
          data: {
            name: currentUser.username,
            email: currentUser.email,
          },
        });
      }

      const post = await strapi
        .documents("api::blog-post.blog-post")
        .create({
          data: {
            title: body.title,
            body: body.body,
            coverImage: body.coverImage ?? null,
            publicationStatus,
            author: author.documentId,
          },
        });

      if (publicationStatus === "published") {
        await strapi
          .documents("api::blog-post.blog-post")
          .publish({
            documentId: post.documentId,
          });
      }

      const result = await strapi
        .documents("api::blog-post.blog-post")
        .findOne({
          documentId: post.documentId,
          populate: {
            author: {
              fields: ["id", "documentId", "name"],
            },
          },
        });

      if (!result) {
        return ctx.notFound("Blog post could not be retrieved");
      }

      return {
        data: result,
      };
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

      if (
        currentUser?.role?.name !== "Admin" &&
        currentUser?.role?.name !== "Content Manager"
      ) {
        return ctx.forbidden(
          "Only Admin or Content Manager can update blog posts",
        );
      }

      const documentId = ctx.params.id;

      const existingPost = await strapi
        .documents("api::blog-post.blog-post")
        .findOne({
          documentId,
        });

      if (!existingPost) {
        return ctx.notFound("Blog post not found");
      }

      const body = ctx.request.body?.data ?? {};

      const publicationStatus: "draft" | "published" =
        body.publicationStatus === "published"
          ? "published"
          : body.publicationStatus === "draft"
            ? "draft"
            : existingPost.publicationStatus === "published"
              ? "published"
              : "draft";

      const updatedPost = await strapi
        .documents("api::blog-post.blog-post")
        .update({
          documentId,
          data: {
            ...(body.title !== undefined
              ? { title: body.title }
              : {}),
            ...(body.body !== undefined
              ? { body: body.body }
              : {}),
            ...(body.coverImage !== undefined
              ? { coverImage: body.coverImage }
              : {}),
            publicationStatus,
          },
        });

      if (!updatedPost) {
        return ctx.notFound("Blog post could not be updated");
      }

      if (publicationStatus === "published") {
        await strapi
          .documents("api::blog-post.blog-post")
          .publish({
            documentId,
          });
      } else {
        await strapi
          .documents("api::blog-post.blog-post")
          .unpublish({
            documentId,
          });
      }

      const result = await strapi
        .documents("api::blog-post.blog-post")
        .findOne({
          documentId: updatedPost.documentId,
          populate: {
            author: {
              fields: ["id", "documentId", "name"],
            },
          },
        });

      if (!result) {
        return ctx.notFound("Blog post could not be retrieved");
      }

      return {
        data: result,
      };
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

      if (
        currentUser?.role?.name !== "Admin" &&
        currentUser?.role?.name !== "Content Manager"
      ) {
        return ctx.forbidden(
          "Only Admin or Content Manager can delete blog posts",
        );
      }

      const documentId = ctx.params.id;

      const existingPost = await strapi
        .documents("api::blog-post.blog-post")
        .findOne({
          documentId,
        });

      if (!existingPost) {
        return ctx.notFound("Blog post not found");
      }

      const result = await strapi
        .documents("api::blog-post.blog-post")
        .delete({
          documentId,
        });

      return {
        data: result,
      };
    },

    async published(ctx) {
      const posts = await strapi
        .documents("api::blog-post.blog-post")
        .findMany({
          filters: {
            publicationStatus: "published",
          },
          populate: {
            author: {
              fields: ["id", "documentId", "name"],
            },
          },
          sort: ["publishedAt:desc"],
        });

      return {
        data: posts,
      };
    },

    async publishedOne(ctx) {
      const documentId = ctx.params.documentId;

      const post = await strapi
        .documents("api::blog-post.blog-post")
        .findOne({
          documentId,
          populate: {
            author: {
              fields: ["id", "documentId", "name"],
            },
          },
        });

      if (!post || post.publicationStatus !== "published") {
        return ctx.notFound("Published blog post not found");
      }

      return {
        data: post,
      };
    },
  }),
);