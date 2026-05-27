module.exports = {
  apps: [
    {
      name: "property-next",
      script: "./node_modules/next/dist/bin/next",
      args: "start -p 3000",
      cwd: "/home/esupport/property-new",
      interpreter: "node",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
      },
    },
  ],
};
