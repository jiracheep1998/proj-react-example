const jwt = require('jsonwebtoken');
const fs = require('fs');

const privateKey = fs.readFileSync(__dirname + '/../config/private.key', 'utf8');

function User(mysql) {
    this.mysql = mysql;
}

User.prototype = {
    mysqlSingleTon: function () {
        if (typeof this.mysql === "undefined") {
            this.mysql = global.mySQL;
        }
    },
    login(email, password, remember, callback) {
        var self = this;
        self.mysqlSingleTon();

        var sql = "SELECT t_operator_account.user_id, t_operator_account.name FROM t_operator_account, t_user_setting WHERE t_operator_account.user_id=t_user_setting.user_id AND t_operator_account.email='" + email + "' AND t_operator_account.password='" + password + "' AND t_user_setting.is_active=1";

        self.mysql.execute(sql, function (err, data) {

            if (err) {
                callback(false);
                return;
            }

            if(data.length > 0){
                var issuer_claim = '30d';

                if(remember){
                    issuer_claim = '30d';
                }

                const payload = {
                    _id: data[0].user_id,
                };
                const signOptions = {
                    algorithm: 'RS256',
                    expiresIn: issuer_claim
                };

                const token = jwt.sign(payload, privateKey, signOptions);

                let result = {
                    user_id: data[0].user_id,
                    name: data[0].name,
                    token: 'BZToken '+token
                }
                callback(result);
            }else{
                callback(false);
            }
        });
    }
}

module.exports = new User(global.db_config);