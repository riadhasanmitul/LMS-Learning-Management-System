export default {
  routes: [
    {
      method: "GET",
      path: "/blog-posts/published",
      handler: "api::blog-post.blog-post.published",
      config: {
        auth: {},
      },
    },
    {
      method: "GET",
      path: "/blog-posts/published/:documentId",
      handler: "api::blog-post.blog-post.publishedOne",
      config: {
        auth: {},
      },
    },
    {
      method: "GET",
      path: "/blog-posts",
      handler: "api::blog-post.blog-post.find",
      config: {
        auth: {},
      },
    },
    {
      method: "GET",
      path: "/blog-posts/:id",
      handler: "api::blog-post.blog-post.findOne",
      config: {
        auth: {},
      },
    },
    {
      method: "POST",
      path: "/blog-posts",
      handler: "api::blog-post.blog-post.create",
      config: {
        auth: {},
      },
    },
    {
      method: "PUT",
      path: "/blog-posts/:id",
      handler: "api::blog-post.blog-post.update",
      config: {
        auth: {},
      },
    },
    {
      method: "DELETE",
      path: "/blog-posts/:id",
      handler: "api::blog-post.blog-post.delete",
      config: {
        auth: {},
      },
    },
  ],
};