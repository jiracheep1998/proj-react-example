'use strict';
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const authorization = require('../config/authorization');

const user = require('../model/user.js');
const object = require('../model/object.js');

const api = require('../service/api.js');

const { v4: uuidv4 } = require('uuid');

router.post('/login', (req, res) => {
    
    let email = req.body.email;
    let password = req.body.password;
    let remember = req.body.remember;

    if (!req.session.user_id && !req.session.email) {
        user.login(email, password, remember, function (data) {
            if (data) {
                req.session.user_id = data.user_id;
                req.session.email = email;

                req.session.save();

                res.json(data);
            } else {
                res.status(200).json({
                    "status": "401",
                    "message": "Login Failed"
                });
            }
        });
    } else {
        res.status(200).json({
            "status": "401",
            "message": "IsLogined"
        });
    }
});

router.post('/logout', authorization, (req, res) => {
    req.session.destroy();
    res.status(200).json({
        "status": "200",
        "message": "logout successfully"
    });
});

router.post('/get/style/:classname', (req, res) => {
    object.get('style', 0, 0, (data) => {
        res.json(data);
    });
});

router.post('/get/type/:style_id', (req, res) => {
    const style_id = req.params.style_id;
    object.get('type', style_id, 0, (data) => {
        res.json(data);
    });
});

router.post('/get/class/:style_id', (req, res) => {
    const style_id = req.params.style_id;
    object.get('class', style_id, 0, (data) => {
        res.json(data);
    });
});

router.post('/get/name/:style_id/:name', (req, res) => {
    const style_id = req.params.style_id;
    const name = req.params.name;
    object.get('name', style_id, name, (data) => {
        res.json(data);
    });
});

router.post('/list/:style_id/:type_id/:class_id', authorization, (req, res) => {

    const style_id = req.params.style_id;
    const type_id = req.params.type_id;
    const class_id = req.params.class_id;

    object.list(style_id, type_id, class_id, (data) => {
        res.json(data);
    });
});

router.post('/upload', authorization, (req, res) => {

    const { style_id, type_id, class_id, id, name, file, fileType, width, height, size, picture } = req.body;

    const filename = uuidv4() + '.' + fileType;

    // const filePath = './public/upload/' + fileType + '/' + filename;

    const filePath = path.join(__dirname, '../public/upload/' + fileType + '/' + filename);

    const nameArray = name.split('::');

    const sort = parseInt(nameArray[0].replace(/\D/g, ''), 10);

    var pictureFilename = false;

    if (picture) {

        pictureFilename = uuidv4() + '.png';
        // const pictureFilePath = './public/upload/picture/' + pictureFilename;

        const pictureFilePath = path.join(__dirname, '../public/upload/picture/' + pictureFilename);

        try {
            fs.writeFile(pictureFilePath, picture, 'base64', (err) => {
                if (err) {
                    res.status(200).json({
                        "error": true,
                        "message": "Error saving the file:" + err
                    });
                } else {

                }
            });
        } catch (err) {
            res.status(200).json({
                "error": true,
                "message": "Error saving the file:" + err
            });
        }
    }

    try {
        fs.writeFile(filePath, file, 'base64', (err) => {
            if (err) {
                res.status(200).json({
                    "error": true,
                    "message": "Error saving the file:" + err
                });
            } else {
                object.insert(style_id, type_id, class_id, id, nameArray[1], filename, fileType, width, height, nameArray[0], sort, size, pictureFilename, result => {
                    if (result) {
                        res.status(200).json({
                            "error": false,
                            "message": "upload successfully"
                        });
                    }
                });
            }
        });
    } catch (err) {
        res.status(200).json({
            "error": true,
            "message": "Error saving the file:" + err
        });
    }
});

router.post('/update-door-stair', authorization, (req, res) => {

    const { name, file, fileType, width, height, size } = req.body;

    let filename = name;

    let check = name.split('?v');

    if(check.length > 1){
        filename = name.split('?v')[0];
    }

    // const filePath = './public/upload/' + fileType + '/' + filename;

    const filePath = path.join(__dirname, '../public/upload/' + fileType + '/' + filename)

    try {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                res.status(200).json({
                    "error": true,
                    "message": "Error reading file:" + err
                });
            } else {
                // Modify the content (for example, appending something)
                const updatedContent = Buffer.from(file, 'base64').toString('utf-8');

                // Write the updated content back to the file
                fs.writeFile(filePath, updatedContent, 'utf8', (err) => {
                    if (err) {
                        res.status(200).json({
                            "error": true,
                            "message": "Error writing to file:" + err
                        });
                    } else {

                        object.updateDoor(filename, width, height, size, result => {
                            if (result) {
                                res.status(200).json({
                                    "error": false,
                                    "message": "File content updated successfully!"
                                });
                            }
                        });
                    }
                });
            }
        });

    } catch (err) {
        res.status(200).json({
            "error": true,
            "message": "Error saving the file:" + err
        });
    }
});

router.post('/manager/:style_id/:page', authorization, (req, res) => {

    if (req.body.action == 'update') {

        let style_id = req.params.style_id;

        let name = req.body.name;
        let field = req.body.field;
        let id = req.body.id;
        let value = req.body.value;

        if (field == 'delete') {
            field = 'is_delete';
        }

        object.manager({
            method: 'UPDATE',
            style_id: style_id,
            name: name,
            field: field,
            id: id,
            value: value
        }, (data) => {
            if (data) {
                res.status(200).json({
                    "error": false,
                    "message": "Update success"
                });
            } else {
                res.status(200).json({
                    "error": true,
                    "message": "Update failed"
                });
            }
        });
    } else if (req.body.action == 'add') {

        let style_id = req.params.style_id;

        let name = req.body.name;
        let value = req.body.value;

        object.manager({
            method: 'INSERT',
            style_id: style_id,
            name: name,
            value: value
        }, (data, e) => {
            if (!e) {
                if (data) {
                    res.status(200).json({
                        "error": false,
                        "message": "Insert success"
                    });
                } else {
                    res.status(200).json({
                        "error": true,
                        "message": "Insert failed"
                    });
                }
            } else {
                res.status(200).json({
                    "error": e.error,
                    "message": e.message
                });
            }
        });
    } else {

        let style_id = req.params.style_id;
        let page = req.params.page;

        object.manager({
            method: 'GET',
            style_id: style_id,
            page: page
        }, (data) => {
            res.json(data);
        });

    }
});

router.post('/manager/:page', authorization, (req, res) => {

    if (req.params.page == 'update') {

        let name = req.body.name;
        let field = req.body.field;
        let id = req.body.id;
        let value = req.body.value;

        let style_id = req.body.style_id;
        let type_id = req.body.type_id;
        let class_id = req.body.class_id;

        let key = req.body.key;

        if (field == 'delete') {
            field = 'is_delete';
        }

        if (field == 'picture') {

            let pictureFilename = uuidv4() + '.png';
            // const pictureFilePath = './public/upload/picture/' + pictureFilename;
            const pictureFilePath = path.join(__dirname, '../public/upload/picture/' + pictureFilename);

            try {

                // fs.writeFile(pictureFilePath, value, 'base64', (err) => {
                //     if (err) {
                //         res.status(200).json({
                //             "error": true,
                //             "message": "Error saving the file:" + err
                //         });
                //     } else {
                //         object.manager({
                //             method: 'UPDATE',
                //             name: name,
                //             field: field,
                //             id: id,
                //             value: pictureFilename,
                //             key: key,
                //             style_id: style_id,
                //             type_id: type_id,
                //             class_id: class_id
                //         }, (data) => {
                //             if (data) {
                //                 res.status(200).json({
                //                     "error": false,
                //                     "message": "Update success"
                //                 });
                //             } else {
                //                 res.status(200).json({
                //                     "error": true,
                //                     "message": "Update failed"
                //                 });
                //             }
                //         });
                //     }
                // });

                const buffer = Buffer.from(value, 'base64');

                imagemin.buffer(buffer, {
                    use: [
                        imageminPngquant()
                    ]
                }).then((data) => {
                    console.log('opt success');
                    fs.writeFile(pictureFilePath, data, (err) => {
                        if (err) {
                            res.status(200).json({
                                "error": true,
                                "message": "Error saving the file:" + err
                            });
                        } else {
                            object.manager({
                                method: 'UPDATE',
                                name: name,
                                field: field,
                                id: id,
                                value: pictureFilename,
                                key: key,
                                style_id: style_id,
                                type_id: type_id,
                                class_id: class_id
                            }, (data) => {
                                if (data) {
                                    res.status(200).json({
                                        "error": false,
                                        "message": "Update success"
                                    });
                                } else {
                                    res.status(200).json({
                                        "error": true,
                                        "message": "Update failed"
                                    });
                                }
                            });
                        }
                    });
                });
            } catch (err) {
                res.status(200).json({
                    "error": true,
                    "message": "Error saving the file:" + err
                });
            }
        } else {

            object.manager({
                method: 'UPDATE',
                name: name,
                field: field,
                id: id,
                value: value,
                key: key,
                style_id: style_id,
                type_id: type_id,
                class_id: class_id
            }, (data) => {
                if (data) {
                    res.status(200).json({
                        "error": false,
                        "message": "Update success"
                    });
                } else {
                    res.status(200).json({
                        "error": true,
                        "message": "Update failed"
                    });
                }
            });
        }
    } else if (req.params.page == 'add') {

        let name = req.body.name;
        let value = req.body.value;
        let defaultStyle = req.body.defaultStyle;

        object.manager({
            method: 'INSERT',
            name: name,
            value: value,
            defaultStyle: defaultStyle
        }, (data) => {
            if (data) {
                res.status(200).json({
                    "error": false,
                    "message": "Insert success"
                });
            } else {
                res.status(200).json({
                    "error": true,
                    "message": "Insert failed"
                });
            }
        });
    } else {

        let page = req.params.page;
        object.manager({
            method: 'GET',
            page: page
        }, (data) => {
            res.json(data);
        });

    }
});

router.post('/manager/class/:style_id/:class_id', authorization, (req, res) => {

    let state = req.body.state;
    let id = req.body.id;

    if (state == 'add') {

        let style_id = req.params.style_id;
        let class_id = req.params.class_id;

        let key = req.body.key;
        let name = req.body.name;

        object.managerClassName({
            method: 'INSERT',
            style_id: style_id,
            class_id: class_id,
            id: id,
            key: key,
            name: name
        }, (data) => {
            if (data) {
                res.status(200).json({
                    "error": false,
                    "message": "Insert success"
                });
            } else {
                res.status(200).json({
                    "error": true,
                    "message": "Insert failed"
                });
            }
        });
    } else if (state == 'update') {

        let field = req.body.field;
        let value = req.body.value;
        let style_id = req.body.style_id;
        let class_id = req.body.class_id;
        let key = req.body.key;

        if (field == 'delete') {
            field = 'is_delete';
        }

        object.managerClassName({
            method: 'UPDATE',
            field: field,
            id: id,
            style_id: style_id,
            class_id: class_id,
            key: key,
            value: value
        }, (data) => {
            if (data) {
                res.status(200).json({
                    "error": false,
                    "message": "Update success"
                });
            } else {
                res.status(200).json({
                    "error": true,
                    "message": "Update failed"
                });
            }
        });
    } else if (state == 'get') {

        let style_id = req.params.style_id;
        let class_id = req.params.class_id;

        object.managerClassName({
            method: 'GET',
            style_id: style_id,
            class_id: class_id,
            id: id
        }, (data) => {
            res.json(data);
        });
    }
})

router.use('/api', api);

module.exports = router;