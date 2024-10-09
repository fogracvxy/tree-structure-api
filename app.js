// app.js
const express = require("express");
const bodyParser = require("body-parser");
const { Sequelize } = require("sequelize");
const treeRoutes = require("./routes/treeRoutes");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const app = express();
app.use(bodyParser.json());

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite",
});

// Import the TreeNode model
const TreeNode = require("./models/TreeNode")(sequelize);

// Swagger configuration
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Tree Structure API",
      version: "1.0.0",
      description: "API for managing a tree structure",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./routes/*.js"], // Path to the API docs
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Ensure the root node exists
sequelize.sync().then(async () => {
  const rootNode = await TreeNode.findByPk(1);
  if (!rootNode) {
    await TreeNode.create({
      id: 1,
      title: "Root Node",
      parent_node_id: null,
      ordering: 0,
    });
    console.log("Root node created.");
  }
});

// Use treeRoutes
app.use("/nodes", treeRoutes(TreeNode));

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
