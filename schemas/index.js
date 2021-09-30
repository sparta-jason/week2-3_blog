const mongoose = require("mongoose");

const connect = () => {
  mongoose
  //테스트 환경에 따라 주석변경
    //.connect("mongodb://test:test@localhost:27017/postDB?authSource=admin", {
    .connect("mongodb://localhost:27017/postDB", {
      useNewUrlParser: true,
      ignoreUndefined: true
    })
    .catch(err => console.log(err));
};

mongoose.connection.on("error", err => {
  console.error("몽고디비 연결 에러", err);
});

module.exports = connect;