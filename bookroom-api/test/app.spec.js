
const supertest = require("supertest");
// const should= require('should')

const app = require("./../api/test");
const server = supertest(app.listen());

// const server = supertest.agent("http://localhost:3000");

// 测试套件/组
describe("开始测试app的GET请求", () => {
  // 测试用例
  it("测试首页请求", (done) => {
    server
      .get("/")
      .expect(200)
      .end((err, res) => {
        if (err) {
          console.log(err);
        } else {
          res.text.should.equal("Hello World!");
        }
        done();
      });
  });
});
