module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [

    // First application
    {
	name: "socketio server",
	cwd : "C:\\nodeServices\\ORM",
	script: "socketio_server.js",
	node_args :"--max-old-space-size=8192",
	env: {
      "ENV": "qa",
    },
    }
  ]
}
