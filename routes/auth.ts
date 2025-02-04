import express,{Request,Response} from 'express';
import connectDB from '../database/connect';
import * as bcrypt from 'bcrypt';
import { createSession, getCurrentUserId } from '../auth/session';
import { ObjectId } from 'mongodb';


const router = express.Router({mergeParams: true});

router.use(express.json());

type TLogin = {
    email: string,
    password: string
}


router.post('/register', async(req: Request, res: Response)=>{
    try {

        const {body}  = req;

        const db = await connectDB('decibel');
        const users = db.collection('users');

        const userExists = await users.findOne({
            email: body.email
        });

        if(userExists){
            return res.status(422).json({error: "user already exists"});
        }

        const hashedPassword = await bcrypt.hash(body.password,10);

        const lastInerted = await users.insertOne({
            name: body.name,
            email: body.email,
            password: hashedPassword
        });

        const lastInertedId = lastInerted.insertedId;

        const newUser = await users.findOne({
            _id: new ObjectId(lastInertedId)
        },{projection: {password: 0}})

        return res.status(201).json(newUser);
    } catch (error) {

    }
})


router.post('/login',async(req: Request, res: Response) => {

    const { body } = req;

    if(!body.email) return res.status(422).json({error: {email: 'email is required'}});
    if(!body.password) return res.status(422).json({error: {password: 'email is required'}});

    const db = await connectDB('decibel');
    const users = db.collection('users');
    const user = await users.findOne({email: body.email});

    if(!user){
        return res.status(422).json({error: 'Invalid credentials'})
    }

    const passwordMatched = await bcrypt.compare(body.password,user.password);

    if(!passwordMatched){
        return res.status(422).json({error: 'Invalid credentials'})
    }
    const userId = user._id as unknown as string;
    const sessionToken = await createSession(userId);

    return res.status(200).json({
        message: 'logged in successfully',
        sessionToken: sessionToken
    });
})


router.post('/logout', (req: Request, res: Response)=>{
    res.clearCookie('sessionToken');
    res.status(200).json({message: 'logged out successfully'})
})

router.get('/currentUser',async(req: Request, res:Response)=>{
    // Add middleware to verify sessionToken and get current user
    const header = req.headers.authorization;
    if(!header){
        return res.status(401).json({error: 'unauthorized'})
    }
    const token = header.split(' ')[1];
    const userId = await getCurrentUserId(token) as string;
    if(!userId){
        return res.status(401).json({error: 'unauthorized'})
    }
    const db = await connectDB('decibel');
    const users = db.collection('users');
    const user = await users.findOne({
        _id: new ObjectId(userId)
    },
    {
        projection: {password: 0}
    }
    );
    if(!user){
        return res.status(404).json({error: 'user not found'})
    }
    return res.json(user);
})

export default router;
