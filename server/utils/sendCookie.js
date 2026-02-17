const sendCookie = (res, token, statusCode, user) => {
    
    const days = Number(process.env.COOKIE_EXPIRE)
    const options = {
        expires: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/'
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res.cookie('access_token', token, options);

    return res.status(statusCode).json(user);
};


export default sendCookie