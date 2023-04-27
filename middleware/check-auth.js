const jwt = require('jsonwebtoken');

const autorizacion = (req, res, next) => {
try{
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
        throw new Error ('Fallo de autenticación')
    }
    decodedTOKEN = jwt.verify(token, 'clave_supermegasecreta');
    req.userData = {
        userId: decodedTOKEN.userId,
        username: decodedTOKEN.username,
        email: decodedTOKEN.email,
    };
    next()
} catch (err) {
    const error = new Error('Fallo de autenticación');
    error.code = 401;
    return next(err);
}

}

module.exports = autorizacion;