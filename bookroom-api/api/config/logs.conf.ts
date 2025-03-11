import path from "path";
const logsPath = path.join(
  process.env.SERVER_LOGS_PATH || __dirname,
  process.env.SERVER_LOGS_PATH ? "/" : "../../"
);
console.log("日志路径:", logsPath);

export default {
  access: {
    filename: logsPath + "logs/access",
  },
  application: {
    filename: logsPath + "logs/application",
  },
};
