'use strict';
module.exports = (sequelize, DataTypes) => {
  const item = sequelize.define('item', {
    name: DataTypes.STRING,
    storeid: DataTypes.INTEGER
  }, {});
  item.associate = function(models) {
    // associations can be defined here

  };
  return item;
};
