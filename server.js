const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const authRoutes = require("./Routes/authRoutes");
const classRoutes = require("./Routes/classRoutes");
const studentRoutes = require("./Routes/studentRoutes");
const userRoutes = require("./Routes/userRoutes");

dotenv.config();
require("./db");

const options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "Library API",
			version: "1.0.0",
			description: "A simple Express Library API",
		},
    components: {
      securitySchemes: {
        jwt: {
          type: "apiKey",
          in: "header",
          name:"authorization"
        },
      }
    },
		servers: [
			{
				url: "http://localhost:1234",
			},
		],
	},
	apis: ["./Routes/*.js"],
};

const swaggerUiOptions = {
  swaggerOptions: {
    basicAuth: {
      name:   'Authorization',
      schema: {
        type: 'basic',
        in:   'header'
      },
      value:  'Basic <user:password>'
    }
  }
}

const specs = swaggerJsDoc(options);

const app = express();

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(authRoutes);


if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

app.use((error, req, res, next) => {
  if (error.message.includes("user validation failed"))
    error.message = error.message.slice(error.message.indexOf(":"));

  // console.log(error.message);
  return res.status(error.statusCode || 500).send({
    message: error.message,
  });
});

const PORT = process.env.PORT || 1234;

const server = app.listen(PORT, () => {
  // console.log(path.resolve(__dirname,"F.E","build","index.html"));

  console.log("Server is running at port " + PORT);
});

module.exports = server;