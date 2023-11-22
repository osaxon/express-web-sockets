import { server } from "./app";

const PORT = process.env.PORT || 9090;

server.listen(PORT, () => console.log(`app running on port ${PORT} 👾`));
