
module.exports = {
  apps: [
    {
      name: "bookroom-api",
      script: "./dist/index.js",
      cwd: "./",
      // 传递给脚本的参数
      args: "",
      // 指定的脚本解释器
      interpreter: "",
      // 传递给解释器的参数
      interpreter_args: "",
      //  内存超过512M之后自动重启
      max_memory_restart: "512M",
      watch: true,
      // Delay between restart
      watch_delay: 1000,
      // 是否监听文件变动然后重启
      watch_options: {
        followSymlinks: false,
      },
      ignore_watch: ["logs", "node_modules", "public", "dist", "test"],
      // 默认fork(单实例多进程，常用于多语言混编),cluster(多实例多进程，但是只支持node)
      exec_mode: "cluster",
      instances: "2",
      // "output": './logs/out.log',
      // "error": './logs/error.log',
      // "merge_logs": true,
      // "log_type":'json',
      // "log_date_format": "YYYY-MM-DD HH:mm:ss:SSS",
      env: {
        // 环境参数，当前指定为生产环境
        NODE_ENV: "production",
      },
      env_dev: {
        // 环境参数，当前指定为开发环境
        NODE_ENV: "development",
      },
      env_test: {
        // 环境参数，当前指定为测试环境
        NODE_ENV: "test",
      },
    },
  ],
};
