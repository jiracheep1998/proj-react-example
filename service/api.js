const express = require('express');
const router = express.Router();

const object = require('../model/object.js');


// const jwt = require('jsonwebtoken');
// const fs = require('fs');
// const privateKey = fs.readFileSync(__dirname + '/../config/private.key', 'utf8');

const authorization = require('../config/authorization');

router.post('/source', authorization, (req, res) => {

    let style_id = req.body.style_id;
    let type_id = req.body.type_id;
    let data = req.body.data;

    if(style_id && type_id && data){

        object.listArray(style_id, type_id, data, function(result){
            if (result) {

                let object = {};

                result.map((item) => {
                    object[item.key] = item;
                });

                res.status(200).json(object);

            } else {
                res.status(200).json({
                    "error": true,
                    "message": "Error query"
                });
            }
        });
    }else{
        res.status(200).json({
            "error": true,
            "message": "Error parameter"
        });
    }
});

// router.post('/list', authorization, (req, res) => {

//     object.get(false, function(result){
//         if (result) {

//             res.status(200).json(result);

//         } else {
//             res.status(200).json({
//                 "error": true,
//                 "message": "Error query"
//             });
//         }
//     });
    
// });

// router.post('/source/list/:style_id/:type_id/:class_id', authorization, (req, res) => {
//     let style_id = req.params.style_id;
//     let type_id = req.params.type_id;
//     let class_id = req.params.class_id;

//     if(style_id && type_id && class_id){

//         object.listClass(style_id, type_id, class_id, function(result){
//             if (result) {

//                 let object = {};

//                 result.map((item) => {
//                     object[item.key] = item;
//                 });

//                 res.status(200).json(object);

//             } else {
//                 res.status(200).json({
//                     "error": true,
//                     "message": "Error query"
//                 });
//             }
//         });
//     }else{
//         res.status(200).json({
//             "error": true,
//             "message": "Error parameter"
//         });
//     }
// });

// router.get('/get', (req, res) => {

//     const payload = {
//         app: 'bz sketch engine server',
//     };
//     const signOptions = {
//         algorithm: 'RS256',
//     };

//     const token = jwt.sign(payload, privateKey, signOptions);

//     res.send(token)
// })



module.exports = router;