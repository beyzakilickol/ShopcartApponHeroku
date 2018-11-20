'use strict';
module.exports = (sequelize, DataTypes) => {
  const store = sequelize.define('store', {
    name: DataTypes.STRING,
    street: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    userid: DataTypes.INTEGER
  }, {});
  store.associate = function(models) {
    store.hasMany(models.item, { as: 'items' , foreignKey : 'storeid', onDelete : 'cascade', hooks:true})
    store.belongsTo(models.user, { as: 'users' , foreignKey : 'userid'})
  };
  return store;
};
