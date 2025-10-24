import express from "express";
import routes from "./src/routes/index.js";
import errorHandler from "./src/middlewares/errorHandler.js";

const app = express();

app.use(express.json());
app.use("/api", routes);
app.use(errorHandler); // đặt cuối

export default app;
