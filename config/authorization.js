const jwt = require('jsonwebtoken')
const fs = require('fs')
const debug = require('debug')('app:Authorization');

const authorization = ((req, res, next) => {
    const authorization = req.headers['authorization']

    if (authorization === undefined) return res.status(401).json({
        "status": 401,
        "message": "Unauthorized"
    })
    const key = authorization.split(' ');

    if (key[0] != 'BZToken') return res.status(401).json({
        "status": 401,
        "message": "Unauthorized"
    })

    const token = key[1];

    const publicKey = fs.readFileSync(__dirname + '/../config/public.key', 'utf8')

    const verifyOptions = {
        algorithms: ['RS256']
    };

    jwt.verify(token, publicKey, verifyOptions, (error, decoded) => {
        if (error) {
            req.session.destroy();
            return res.status(401).json({
                "status": 401,
                "message": "Unauthorized"
            })
        }
        next()
    });
})

module.exports = authorization