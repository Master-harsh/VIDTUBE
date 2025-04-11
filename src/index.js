import dotenv from "dotenv";
import app from "./app.js";

dotenv.config({
    path: "./.env",
});

const PORT = process.env.PORT || 7000;

app.listen(7000, () => {
    console.log(`Server is running on port ${PORT}`);
});

