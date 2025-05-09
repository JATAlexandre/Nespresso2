module.exports = {
  apps: [
    {
      name: 'devis-cafe-client', // Nom de votre application
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
	PORT: "3000"
      },
    },
  ],
};
