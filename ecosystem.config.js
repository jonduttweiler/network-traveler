module.exports = {
  apps: [{
    name: "nerwork-exporter",
    script: 'api.js',
    instance_var: 'INSTANCE_ID',
    env: {
      "APP_PORT": 8085,
    },
  }],
};


