import express from 'express';
import cors from 'cors';
import { router } from './routes/v1';

const port = 3000;
const app = express();

app.use(express.json());
app.use(cors({
    origin: '*',
}));

app.use("/api/v1", router);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})