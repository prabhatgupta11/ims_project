// models/userlog.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const UserLog = sequelize.define('user_log', {
        id: {
            type: DataTypes.BIGINT(20),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        userFk: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        cType: {
            type: DataTypes.STRING,
        },
        pageUrl: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        ipAddress: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        currentDate: {
            type: DataTypes.DATEONLY,
            defaultValue: DataTypes.NOW,
        },
        currentTime: {
            type: DataTypes.TIME,
        },
    }, {
        timestamps: false, // Disable createdAt and updatedAt columns
        hooks: {
            beforeCreate: (instance, options) => {
                instance.currentTime = new Date();
                instance.currentTime.setMinutes(instance.currentTime.getMinutes() + 330); // Adding 5 hours 30 minutes offset
            },
        },
    });

    return UserLog;
};
