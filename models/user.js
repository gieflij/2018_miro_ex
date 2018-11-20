var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
    id : String,///String : 문자열
    pw : String
});

var bcrypt = require('bcryptjs'); ///var bcrypt : 비밀번호 암호화시 필요함

User.methods.generateHash = function(password) { ///generateHash : 암호화 시킴
  return bcrypt.hashSync(password, 8);//간격을 떨어뜨려 놓고 암호를 넣는 방식
};
User.methods.validateHash = function(password) {
  return bcrypt.compareSync(password, this.pw);//// validateHash : 로그인시 넣은 비밀번호와 DB에 저장된 비밀번호를 비교함
}; //this 는 속해있는 객체를 의미 비교해서 같으면 true리턴 다르면 false 리턴
module.exports = mongoose.model('user', User);