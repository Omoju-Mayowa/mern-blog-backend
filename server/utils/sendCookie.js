export default sendCookie = (res, token, statusCode, message) => {
    
    const days = Number(process.env.COOKIE_EXPIRE)
    const options = {
        expires: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res.cookie('access_token', token, options);

    return res.status(statusCode).json({ message });
};