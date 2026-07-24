import app from "./app";
import { connectDatabase } from "@/config/database";
import { env } from "@/config/env";

await connectDatabase();

app.listen(env.PORT, () => {
  console.log(`Server is running on http://localhost:${env.PORT}`);
});
