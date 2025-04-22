const { DataTypes } = require('sequelize');
const sequelize = require('../../database');

const News = sequelize.define('News', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  noticia: {
    type: DataTypes.INTEGER,
    unique: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  link: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  pubDate: {
    type: DataTypes.DATE
  },
  imagen: {
    type: DataTypes.TEXT
  },
  audio: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'News',
  timestamps: true
});

module.exports = News; 