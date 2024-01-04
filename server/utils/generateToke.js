import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "7d"
    });

    res.cookie('userToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    return token;
} 

const generatAdminToken = (res, adminId) => {
    const token = jwt.sign({ adminId }, process.env.JWT_SECRET, {
        expiresIn: "7d"
    });

    res.cookie('adminToken', token, {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    return token;
}

const generatOwnerToken = (res, ownerId) => {

    const token = jwt.sign({ ownerId }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });

    res.cookie('ownerToken', token, {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    return token;
}

export default {
    generateToken,
    generatAdminToken,
    generatOwnerToken
};