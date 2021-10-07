const jwt = require("jsonwebtoken");
const User = require("../schemas/users");

//미들웨어는 next필수! 호출안하면 다른 미들웨어가 처리되지 않음
module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    res.status(401).send({
      errorMessage: '로그인 후 사용하세요.'
    });
    return;
  }

  const [tokenType, tokenValue] = authorization.split(' ');
  
  if (tokenType !== 'Bearer'){
    res.status(401).send({
      errorMessage: '로그인 후 사용하세요.'
    });
    return;
  }

  //토큰 검증
  try {
    const { userId } = jwt.verify(tokenValue, "jasonblog-secret-key");

    //async 함수가 아니므로 await 사용못함 .then활용!
    User.findOne({nickname: userId})
      .exec()
      .then((user) => {
      //locals는 마음대로 쓸 수 있는 저장공간
      res.locals.user = user;
      
      next();
    });

  } catch (error) {
    res.status(401).send({
      errorMessage: '로그인 후 사용하세요.'
    });
    return;
  }
};