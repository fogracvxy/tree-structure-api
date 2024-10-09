// models/TreeNode.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const TreeNode = sequelize.define(
    "TreeNode",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true, // Auto-increment for IDs other than root
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      parent_node_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      ordering: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      tableName: "tree_nodes",
    }
  );

  return TreeNode;
};
