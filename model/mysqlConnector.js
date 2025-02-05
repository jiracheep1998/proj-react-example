const debug = require('debug')('app');
var conn = require('../config/configuration');

function mysqlConnector(mysql, database) {

    switch (database) {
        case 'config':
            debug("connect database baezenic_config");
            this.pool = mysql.createPool(conn.config());
            break;
        case 'sketch_plans':
            debug("connect database baezenic_sketch_plans");
            this.pool = mysql.createPool(conn.sketch_plans());
            break;

    }
}

mysqlConnector.prototype = {

    escape: function (input) {
        return this.pool.escape(input);
    },

    execute: function (statment, data, callback) {
        var self = this;
        if (typeof data === "function") {
            callback = data;
        }
        this.pool.getConnection(function (err, connection) {
            if (err) {
                console.log(err);
                connection.release();
                if (typeof callback === "function") {
                    callback({
                        code: 100,
                        status: "Error in connection database " + err
                    }, null);
                }
                return;
            }

            if (typeof data === "function") {
                self.executeNodata(connection, statment, callback);
            } else {
                self.executeWidthData(connection, statment, data, callback);
            }
        });
    },

    executeNodata: function (connection, statment, callback) {
        connection.query(statment, function (err, rows) {
            if (err) {
                console.log(err);
                if (typeof callback === "function") {
                    callback(err, null);
                }
            }
            connection.release();
            if (typeof callback === "function") {
                callback(null, rows);
            }
        });
    },

    executeWidthData: function (connection, statment, data, callback) {
        connection.query(statment, data, function (err, rows) {
            if (err) {
                console.log(err);
                if (typeof callback === "function") {
                    callback(err, null);
                }
            }
            connection.release();
            if (typeof callback === "function") {
                callback(null, rows);
            }
        });
    },

    syncExecute: function (statementlist, callback) {

        var self = this;
        var outputArray = [];
        var currentStatment = statementlist;
        this.pool.getConnection(function (err, connection) {

            if (err) {
                console.log(err);
                connection.release();
                if (typeof callback === "function") {
                    callback({
                        code: 100,
                        status: "Error in connection database " + err
                    }, null);
                }
                return;
            }

            self.continueExecute(connection, 0, currentStatment, 0, outputArray, callback);
        });

    },

    continueExecute: function (connection, parentIndex, statementList, statementIndex, previousResult, callback) {

        var self = this;
        if (statementList === null) {
            if (typeof callback === "function") {
                connection.release();
                callback(previousResult);
                return;
            }
        }
        var statement = self.getStatement(statementList, statementIndex);

        if (typeof statement.joinParent === "undefined") {
            //console.log("query with no link: ",statementList.query);
            connection.query(statement.query, function (error, results) {

                if (error) {
                    connection.release();
                    console.log(error);
                }
                //console.log("Query result: ",results);
                if (previousResult.length === 0) {
                    previousResult = results;
                    statementList = statement.sub;

                    self.continueExecute(connection, 0, statementList, 0, previousResult, callback);
                }
            });
        } else {
            var sqlStatement = statement.query;
            if (previousResult.length > 0) {
                sqlStatement = sqlStatement.replace("#parent#", previousResult[parentIndex][statement.joinParent]);
                sqlStatement = sqlStatement.replace("#parentInArray#", self.replaceID(previousResult[parentIndex][statement.joinParent]));

                //console.log("query with with link: ", sqlStatement+" index:"+statementIndex);
                connection.query(sqlStatement, function (error, results) {

                    if (error) {
                        connection.release();
                        console.log(error);
                    }
                    //console.log("Query result: ", results);
                    previousResult[parentIndex][statement.subName] = results;

                    parentIndex++;
                    if (previousResult.length > parentIndex) {
                        //console.log("look next index ", parentIndex);
                        self.continueExecute(connection, parentIndex, statementList, statementIndex, previousResult, callback);
                    } else {
                        //console.log(statementList, statementIndex);
                        if (Array.isArray(statementList) && (statementList.length > statementIndex + 1)) {
                            //console.log("look next sub ");
                            statementIndex++;
                            self.continueExecute(connection, 0, statementList, statementIndex, previousResult, callback);
                        } else {
                            //console.log("look down sub node ");
                            statementList = null; //statementList.sub;
                            self.continueExecute(connection, 0, statementList, 0, previousResult, callback);
                        }
                    }
                });
            } else {
                self.continueExecute(connection, 0, null, 0, previousResult, callback);
            }
        }
    },

    getStatement: function (statementList, index) {

        //console.log(statementList);
        var statement = null;
        if (typeof statementList === "object") {
            statement = statementList;
        }

        if (Array.isArray(statementList)) {
            statement = statementList[index];
        }

        return statement;
    },

    createQueryChain: function (sqlStatement) {
        return {
            query: sqlStatement,
            sub: null
        };
    },

    queryAddChain: function (query, sqlStatement, linker, subAlias) {
        query.sub = [];
        query.sub.push({
            query: sqlStatement,
            joinParent: linker,
            subName: subAlias,
            sub: null
        });
        return query;
    },

    queryAppendChain: function (query, sqlStatement, linker, subAlias) {
        query.sub.push({
            query: sqlStatement,
            joinParent: linker,
            subName: subAlias,
            sub: null
        });
        return query;
    },

    replaceID: function (idList) {
        return idList.replace(/,/g, "','");
    },

    getByID: function (tableName, fieldName, idValue, callback) {
        var self = this;
        var sql = "SELECT * FROM `" + tableName + "` WHERE `" + fieldName + "` = " + self.escape(idValue) + "  LIMIT 0,1";

        self.execute(sql, callback);
    },

    updateByID: function (tableName, fieldName, idValue, data, callback) {
        var self = this;
        var sql = "UPDATE `" + tableName + "` SET ? WHERE `" + fieldName + "` = " + self.escape(idValue) + " ;";

        self.execute(sql, data, callback);
    },

    add: function (tableName, data, callback) {
        var self = this;
        var sql = "INSERT INTO `" + tableName + "` SET ?";

        self.execute(sql, data, callback);

    },
    delete: function (tableName, fieldName, idValue, callback) {
        var self = this;
        var sql = "DELETE FROM `" + tableName + "` WHERE `" + fieldName + "` = " + self.escape(idValue);
        self.execute(sql, callback);
    }
};

module.exports = mysqlConnector;
