import express,{Request, Response, Express} from 'express';
import users from '../routes/users';
import auth from "../routes/auth";
import songs from "../routes/songs"
import cors from "cors";

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT','PATCH', 'DELETE'],
}))

app.use((req: Request,res: Response, next)=>{
    next();
})

app.use('/api/users', users);
app.use('/api/auth',auth);
app.use('/api/songs',songs);

app.listen(port, ()=>{
    console.log('server running on port ' + port)
})
