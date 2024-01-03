const ip = require('ip');
const db = require('../models');
const UserLog = db.userLog;

const ipAddress = ip.address();

module.exports = async (req, res, next) => {
    try {
        console.log(123456);
        console.log(req.session);

        // Check if userDetail is present in session
        if (req.session && req.session.userDetail && req.session.userDetail.id) {
            let cType;

            // Determine the cType based on the request
            if (req.originalUrl === '/login' || req.originalUrl === '/' ) {
                cType = 'login';
            } else if (req.originalUrl === '/logout') {
                cType = 'logout';
            } else {
                cType = 'page';
            }

            // Shorten the URL for logging (only if it's a DataTables URL)
            const shortUrl = isDataTablesUrl(req.originalUrl)

                console.log(shortUrl,123)

            const logData = {
                userFk: req.session.userDetail.id,
                cType: cType, // Assuming this middleware is used for page access
                pageUrl: shortUrl || req.originalUrl, // Use short URL if available, otherwise use the original URL
                ipAddress: ipAddress,
            };

            await UserLog.create(logData);
        }

        next();
    } catch (error) {
        console.error('Error logging user activity:', error);
        next(error); // Continue with the request even if logging fails
    }
};

function isDataTablesUrl(url) {
    const urlWithoutQuery = url.split('?')[0];
    return urlWithoutQuery
}




