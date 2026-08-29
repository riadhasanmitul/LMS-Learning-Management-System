export default {
  routes: [
    {
      method: "GET",
      path: "/admin-dashboard/stats",
      handler: "admin-dashboard.stats",
      config: {
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/admin-dashboard/users",
      handler: "admin-dashboard.users",
      config: {
        auth: false,
      },
    },
    {
      method: "PUT",
      path: "/admin-dashboard/users/:documentId/role",
      handler: "admin-dashboard.assignRole",
      config: {
        auth: false,
      },
    },
    {
      method: "PUT",
      path: "/admin-dashboard/users/:documentId/block",
      handler: "admin-dashboard.blockUser",
      config: {
        auth: false,
      },
    },
    {
      method: "PUT",
      path: "/admin-dashboard/users/:documentId/unblock",
      handler: "admin-dashboard.unblockUser",
      config: {
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/current-user",
      handler: "admin-dashboard.me",
      config: {
        auth: false,
      },
    },
  ],
};
