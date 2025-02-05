const fs = require('fs');
const path = require('path');

const generate = require('nanoid/generate');
const { v4: uuidv4 } = require('uuid');

function unique() {
    return generate('1234567890abcdef', 10);
}

function getCurrentDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Function to copy and rename file
function copyFile(source, destination, callabck) {
    fs.copyFile(source, destination, (err) => {
        if (err) {
            console.error('Error copying file:', err);
            callabck(false);
        } else {
            console.log('File copied successfully!');
            callabck(true);
        }
    });
}

function Object(mysql) {
    this.mysql = mysql;
}

Object.prototype = {
    mysqlSingleTon: function () {
        if (typeof this.mysql === "undefined") {
            this.mysql = global.mySQL;
        }
    },
    executeQuery: async function(sql){

        var self = this;

        return new Promise((resolve, reject) => {
            self.mysql.execute(sql, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    },
    get: function (caseName, style_id, name, callback) {
        var self = this;
        self.mysqlSingleTon();

        if (caseName === 'style') {
            let sql = "SELECT id, name FROM t_style WHERE `status`=0 AND `is_delete`=0";
            self.mysql.execute(sql, function (err, Style) {
                if (err) {
                    callback(false);
                    return;
                }
                callback({ style: Style });
            });
        }

        if (caseName === 'type') {
            let sql = "SELECT id, name FROM t_type WHERE `style_id`='" + style_id + "' AND `status`=0 AND `is_delete`=0";

            self.mysql.execute(sql, function (err, Type) {
                if (err) {
                    callback(false);
                    return;
                }
                callback({ type: Type });
            });
        }

        if (caseName === 'class') {
            let sql = "SELECT id, name FROM t_class WHERE `style_id`='" + style_id + "' AND `status`=0 AND `is_delete`=0";

            self.mysql.execute(sql, function (err, Class) {
                if (err) {
                    callback(false);
                    return;
                }

                callback({ class: Class });
            });
        }

        if (caseName === 'name') {

            sql = "SELECT b.key, b.name FROM t_class a LEFT JOIN t_name b ON b.class_id = a.id WHERE a.style_id='" + style_id + "' AND a.name='" + name + "' AND a.status=0 AND a.is_delete=0 AND b.status=0 AND b.is_delete=0 ORDER BY b.sort ASC;";

            self.mysql.execute(sql, function (err, ClassName) {

                if (err) {
                    callback(false);
                    return;
                }

                callback({ className: ClassName });
            });

        }
    },
    list: function (style_id, type_id, class_id, callback) {
        var self = this;
        self.mysqlSingleTon();

        var sql = "SELECT `id`, `name`, `fileType`, `key`, `width`, `height`, `size`, `picture`, `path`, `sort_key` as `sort`, `active`, `status`, `option`, `parametric`, `update_date`, `create_date` FROM t_object WHERE `style_id`='" + style_id + "' AND `type_id`='" + type_id + "' AND `class_id`='" + class_id + "' AND `is_delete`=0 ORDER BY `create_date` DESC";

        self.mysql.execute(sql, function (err, result) {
            if (err) {
                callback(false);
                return;
            }

            callback(result)
        });
    },
    insert: function (Style, Type, Class, id, name, filename, fileType, width, height, key, sort, size, picture, callback) {
        var self = this;
        self.mysqlSingleTon();

        // var sql = "SELECT `id` FROM t_object WHERE `style_id`='" + Style + "' AND `type_id`='" + Type + "' AND `class_id`='" + Class + "' AND `name`='" + name + "' AND `key`='" + key + "' AND `is_delete`=0;";

        var sql = "SELECT log_files FROM t_object WHERE `id`='" + id + "' AND `style_id`='" + Style + "' AND `type_id`='" + Type + "' AND `class_id`='" + Class + "' AND `key`='" + key + "'";

        self.mysql.execute(sql, function (err, num) {
            if (err) {
                callback(false);
                return;
            }

            let sort_key = num.length;

            let date = getCurrentDateTime();
            var sql;

            if (num.length > 0) {

                // const convertedIds = num.map((item, index) => `'${item.id}'`);
                // const formattedIds = convertedIds.join(', ');

                let _log_files = num[0].log_files;

                if(_log_files === ''){
                    _log_files = [];
                }else{
                    _log_files = JSON.parse(_log_files);
                }

                _log_files.push({path: filename, picture: picture, date: date});

                sql = "UPDATE `t_object` SET `key` = '"+key+"', `name` = '"+name+"', `fileType` = '"+fileType+"', `width` = '"+width+"', `height` = '"+height+"', `path` = '"+filename+"', `picture` = '"+picture+"', `size` = '"+size+"', `update_date` = '"+date+"', `log_files` = '"+JSON.stringify(_log_files)+"' WHERE `id` = '"+id+"'";

                self.mysql.execute(sql, function (err, result) {
                    if (err) {
                        callback(false);
                        return;
                    }

                    callback(result)

                    // sql = "INSERT INTO `t_object` (`id`, `style_id`, `type_id`, `class_id`, `name`, `fileType`, `width`, `height`, `size`, `picture`, `path`, `key`, `sort`, `sort_key`, `active`, `update_date`, `create_date`) VALUES ('" + unique() + "', '" + Style + "', '" + Type + "', '" + Class + "', '" + name + "', '" + fileType + "', '" + width + "', '" + height + "', '" + size + "', '" + picture + "', '" + filename + "', '" + key + "', '" + sort + "', '" + sort_key + "', '0', '" + date + "', '" + date + "');";

                    // self.mysql.execute(sql, function (err, result) {
                    //     if (err) {
                    //         callback(false);
                    //         return;
                    //     }

                    //     callback(result)
                    // });
                });

            } else {
    
                sql = "INSERT INTO `t_object` (`id`, `style_id`, `type_id`, `class_id`, `name`, `fileType`, `width`, `height`, `size`, `picture`, `path`, `key`, `sort`, `sort_key`, `active`, `update_date`, `create_date`, `option`, `log_files`) VALUES ('" + unique() + "', '" + Style + "', '" + Type + "', '" + Class + "', '" + name + "', '" + fileType + "', '" + width + "', '" + height + "', '" + size + "', '" + picture + "', '" + filename + "', '" + key + "', '" + sort + "', '" + sort_key + "', '0', '" + date + "', '" + date + "', '', '');";

                self.mysql.execute(sql, function (err, result) {
                    if (err) {
                        callback(false);
                        return;
                    }

                    callback(result)
                });
            }

        });

    },
    manager: function (data, callback) {

        var self = this;
        self.mysqlSingleTon();


        if (data.method == 'GET') {

            if (data.page == 'type' || data.page == 'class') {

                var sql = "SELECT id, name, status, is_delete, update_date FROM t_" + data.page + " WHERE `style_id`='" + data.style_id + "' AND `is_delete`=0 ORDER BY `create_date` DESC";

                self.mysql.execute(sql, function (err, data) {
                    if (err) {
                        callback(false);
                        return;
                    }
                    callback(data);
                });
            }

            if (data.page == 'style') {

                var sql = "SELECT id, name, status, is_delete, update_date FROM t_" + data.page + " WHERE `is_delete`=0 ORDER BY `create_date` DESC";

                self.mysql.execute(sql, function (err, data) {
                    if (err) {
                        callback(false);
                        return;
                    }
                    callback(data);
                });
            }


        } else if (data.method == 'UPDATE') {

            if (data.field == 'status' || data.field == 'is_delete' || data.field == 'name' || data.field == 'picture' || data.field == 'parametric' || data.field == 'option') {

                if (data.style_id) {
                    var sql = "UPDATE `t_" + data.name + "` SET `" + data.field + "` = '" + data.value + "' WHERE `id` = '" + data.id + "' AND `style_id`='" + data.style_id + "';";
                } else {

                    var sql = "UPDATE `t_" + data.name + "` SET `" + data.field + "` = '" + data.value + "' WHERE `id` = '" + data.id + "';";
                }

                self.mysql.execute(sql, function (err, data) {
                    if (err) {
                        callback(false);
                        return;
                    }
                    callback(data);
                });
            }

            if (data.field == 'active') {
                var sql = "SELECT id FROM t_object WHERE `style_id`='" + data.style_id + "' AND `type_id`='" + data.type_id + "' AND `class_id`='" + data.class_id + "' AND `key`='" + data.key + "' AND `active`=1 AND `is_delete`=0";

                self.mysql.execute(sql, function (err, getActive) {
                    if (err) {
                        callback(false);
                        return;
                    }

                    if (getActive.length > 0) {
                        const convertedIds = getActive.map((item, index) => `'${item.id}'`);
                        const formattedIds = convertedIds.join(', ');

                        sql = "UPDATE `t_object` SET `" + data.field + "` = '0' WHERE `id` IN (" + formattedIds + ");";

                        self.mysql.execute(sql, function (err, result) {
                            if (err) {
                                callback(false);
                                return;
                            }

                            sql = "UPDATE `t_object` SET `" + data.field + "` = '" + data.value + "' WHERE `id` = '" + data.id + "';";

                            self.mysql.execute(sql, function (err, active) {
                                if (err) {
                                    callback(false);
                                    return;
                                }
                                callback(active);
                            });
                        });

                    } else {

                        sql = "UPDATE `t_object` SET `" + data.field + "` = '" + data.value + "' WHERE `id` = '" + data.id + "';";

                        self.mysql.execute(sql, function (err, active) {
                            if (err) {
                                callback(false);
                                return;
                            }
                            callback(active);
                        });
                    }

                });
            }

        } else if (data.method == 'INSERT') {

            if (data.value) {

                let date = getCurrentDateTime();
                let newStyle_id = unique();

                if (data.style_id) {

                    var sqlCheck = "SELECT * FROM `t_" + data.name + "` WHERE `style_id`='" + data.style_id + "' AND `name`='" + data.value + "' AND `is_delete`=0;";

                    self.mysql.execute(sqlCheck, function (err, numRow) {
                        if (err) {
                            callback(false);
                            return;
                        }

                        if (numRow.length > 0) {

                            callback(false, {
                                error: true,
                                message: 'Duplicate ' + data.value + ' already.'
                            });

                        } else {

                            var sql = "INSERT INTO `t_" + data.name + "` (`id`, `style_id`, `name`, `update_date`, `create_date`) VALUES ('" + newStyle_id + "', '" + data.style_id + "', '" + data.value + "', '" + date + "', '" + date + "');";

                            self.mysql.execute(sql, function (err, result) {
                                if (err) {
                                    callback(false);
                                    return;
                                }
                                callback(result);
                            });
                        }
                    });

                } else {
                    var sql = "INSERT INTO `t_" + data.name + "` (`id`, `name`, `update_date`, `create_date`) VALUES ('" + newStyle_id + "', '" + data.value + "', '" + date + "', '" + date + "');";

                    self.mysql.execute(sql, function (err, result) {
                        if (err) {
                            callback(false);
                            return;
                        }

                        if (data.defaultStyle) {

                            sql = "SELECT * FROM `t_type` WHERE `style_id`='" + data.defaultStyle + "' AND `is_delete`=0;";

                            self.mysql.execute(sql, function (err, get_type) {

                                if (err) {
                                    callback(false);
                                    return;
                                }

                                let typeKeys = {};

                                get_type.map(function (item) {
                                    let typeID = unique();
                                    typeKeys[item.id] = typeID;
                                    let typeSQL = "INSERT INTO `t_type` (`id`, `style_id`, `name`, `update_date`, `create_date`) VALUES ('" + typeID + "', '" + newStyle_id + "', '" + item.name + "', '" + date + "', '" + date + "');";
                                    self.mysql.execute(typeSQL);
                                });

                                sql = "SELECT * FROM `t_class` WHERE `style_id`='" + data.defaultStyle + "' AND `is_delete`=0;";

                                self.mysql.execute(sql, function (err, get_class) {

                                    let classKeys = {};

                                    get_class.map(function (item) {
                                        let classID = unique();
                                        classKeys[item.id] = classID;
                                        let classSQL = "INSERT INTO `t_class` (`id`, `style_id`, `name`, `update_date`, `create_date`) VALUES ('" + classID + "', '" + newStyle_id + "', '" + item.name + "', '" + date + "', '" + date + "');";
                                        self.mysql.execute(classSQL);
                                    });

                                    sql = "SELECT * FROM `t_name` WHERE `style_id`='" + data.defaultStyle + "' AND `is_delete`=0;";

                                    self.mysql.execute(sql, function (err, get_name) {
                                        get_name.map(function (item, i) {
                                            let nameID = unique();
                                            let nameSQL = "INSERT INTO `t_name` (`id`, `style_id`, `class_id`, `name`, `key`, `sort`, `update_date`, `create_date`) VALUES ('" + nameID + "', '" + newStyle_id + "', '" + classKeys[item.class_id] + "', '" + item.name + "', '" + item.key + "', '" + item.sort + "', '" + date + "', '" + date + "');";
                                            self.mysql.execute(nameSQL);
                                        });

                                        sql = "SELECT * FROM `t_object` WHERE `style_id`='" + data.defaultStyle + "' AND `is_delete`=0;";

                                        self.mysql.execute(sql, function (err, get_object) {

                                            objectKeys = {}

                                            objectKeysPicture = {}

                                            get_object.map(function (item, i) {
                                                let objectID = unique();
                                                let objectPath = uuidv4() + '.' + item.fileType;
                                                objectKeys[item.path] = {
                                                    fileType: item.fileType,
                                                    path: objectPath
                                                }

                                                let objectPicture = '';
                                                if (item.picture && item.picture != 'false') {
                                                    objectPicture = uuidv4() + '.png';
                                                    objectKeysPicture[item.picture] = {
                                                        fileType: 'png',
                                                        picture: objectPicture
                                                    }
                                                }

                                                let objectSQL = "INSERT INTO `t_object` (`id`, `style_id`, `type_id`, `class_id`, `name`, `fileType`, `width`, `height`, `size`, `path`, `picture`, `key`, `sort`, `sort_key`, `active`, `update_date`, `create_date`) VALUES ('" + objectID + "', '" + newStyle_id + "', '" + typeKeys[item.type_id] + "', '" + classKeys[item.class_id] + "', '" + item.name + "', '" + item.fileType + "', '" + item.width + "', '" + item.height + "', '" + item.size + "', '" + objectPath + "', '" + objectPicture + "', '" + item.key + "', '" + item.sort + "', '" + item.sort_key + "', '" + item.active + "' ,'" + date + "' ,'" + date + "');";
                                                self.mysql.execute(objectSQL);
                                            });

                                            function loop(callback) {
                                                function process(index) {
                                                    if (index >= get_object.length) {
                                                        callback();
                                                        return;
                                                    }

                                                    let get = objectKeys[get_object[index].path];
                                                    let oldPath = path.join(__dirname, '../public/upload/' + get_object[index].fileType + '/' + get_object[index].path);
                                                    let newPath = path.join(__dirname, '../public/upload/' + get.fileType + '/' + get.path);

                                                    copyFile(oldPath, newPath, function () {

                                                        if (get_object[index].picture && get_object[index].picture != 'false') {

                                                            let getPic = objectKeysPicture[get_object[index].picture];
                                                            let oldPic = path.join(__dirname, '../public/upload/picture/' + get_object[index].picture);
                                                            let newPic = path.join(__dirname, '../public/upload/picture/' + getPic.picture);

                                                            copyFile(oldPic, newPic, function () {
                                                                process(index + 1);
                                                            });
                                                        }else{
                                                            process(index + 1);
                                                        }

                                                    });

                                                }

                                                process(0);
                                            }

                                            loop(function () {
                                                callback(result);
                                            });


                                        });

                                    });

                                });

                            })

                        } else {
                            callback(result);
                        }

                    });
                }


            }

        }
    },
    managerClassName: async function (data, callback) {
        var self = this;
        self.mysqlSingleTon();

        if (data.method == 'INSERT') {

            let date = getCurrentDateTime();

            var sql = "INSERT INTO `t_name` (`id`, `style_id`, `class_id`, `name`, `key`, `sort`, `update_date`, `create_date`) VALUES ('" + unique() + "', '" + data.style_id + "', '" + data.class_id + "', '" + data.name + "', '" + data.key + "', '" + (data.key.split("_")[1]) + "', '" + date + "', '" + date + "');";

            self.mysql.execute(sql, function (err, data) {
                if (err) {
                    callback(false);
                    return;
                }
                callback(data);
            });
        } else if (data.method == 'GET') {

            var sql = "SELECT `id`, `name`, `key`, `status`, `is_delete`, `update_date` FROM `t_name` WHERE `style_id`='" + data.style_id + "' AND `class_id`='" + data.class_id + "' AND `is_delete`=0 ORDER BY `sort` ASC";

            self.mysql.execute(sql, function (err, data) {
                if (err) {
                    callback(false);
                    return;
                }
                callback(data);
            });
        } else if (data.method == 'UPDATE') {

            if (data.field == 'edit') {

                var sql = "SELECT * FROM t_object WHERE `style_id`='" + data.style_id + "' AND `class_id`='" + data.class_id + "' AND `key`='" + data.value.key + "' AND `is_delete`=0";

                var num = await self.executeQuery(sql);

                if(num.length === 0){

                    if(data.value.name){
                        var sql = "UPDATE `t_name` SET `name` = '" + data.value.name + "', `key` = '" + data.value.key + "' WHERE `id` = '" + data.id + "';";
                        await self.executeQuery(sql);
                    }

                    if(data.value.key){
                        var sql = "UPDATE `t_object` SET `key` = '" + data.value.key + "' WHERE `style_id` = '" + data.style_id + "' AND `class_id` = '" + data.class_id + "' AND `key` = '" + data.key + "';";
                        await self.executeQuery(sql);
                    }

                }else{

                    if(data.value.name){
                        var sql = "UPDATE `t_name` SET `name` = '" + data.value.name + "' WHERE `id` = '" + data.id + "';";
                        await self.executeQuery(sql);
                    }

                }

                callback(true);
            }

            if(data.field == 'status' || data.field == 'is_delete'){
                var sql = "UPDATE `t_name` SET `" + data.field + "` = '" + data.value + "' WHERE `id` = '" + data.id + "';";
                await self.executeQuery(sql);
                callback(true);
            }
        }
    },
    listArray: function (style_id, type_id, data, callback) {
        var self = this;
        self.mysqlSingleTon();

        let array = data.map(item => `'${item}'`).join(', ');

        var sql = "SELECT `name`, `key`, `fileType`, `width`, `height`, `path`, `picture`, `option`, `parametric` FROM `t_object` WHERE `style_id`='" + style_id + "' AND `type_id`='" + type_id + "' AND `key` IN (" + array + ") AND `active`=1 AND `status`=0 AND `is_delete`=0;";
        self.mysql.execute(sql, function (err, result) {
            if (err) {
                callback(false);
                return;
            }

            callback(result)
        });
    },
    listClass: function (style_id, type_id, class_id, callback) {
        var self = this;
        self.mysqlSingleTon();

        var sql = "SELECT `name`, `key`, `fileType`, `width`, `height`, `path` FROM `t_object` WHERE `style_id`='" + style_id + "' AND `type_id`='" + type_id + "' AND `class_id`='" + class_id + "' AND `status`=0 AND `is_delete`=0 ORDER BY `sort` ASC;";

        self.mysql.execute(sql, function (err, result) {
            if (err) {
                callback(false);
                return;
            }

            callback(result)
        });
    },
    updateDoor: function (name, width, height, size, callback) {
        var self = this;
        self.mysqlSingleTon();

        var sql = "UPDATE `t_object` SET `width` = '" + width + "', `height` = '" + height + "', `size` = '" + size + "' WHERE `path` = '" + name + "';";

        self.mysql.execute(sql, function (err, data) {
            if (err) {
                callback(false);
                return;
            }
            callback(data);
        });

    }

}

module.exports = new Object(global.db_sketch_plans);