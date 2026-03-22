import { app } from "./app.js";
// Start server
console.log("NODE_ENV:", process.env.NODE_ENV)
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server Started on port ${PORT}`));
