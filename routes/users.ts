import express, {Request,Response} from "express"
import connectDB from "../database/connect";
import { ObjectId } from "mongodb";
import { getCurrentUserId, verifySession } from "../auth/session.js";
import {param} from "express-validator";

const router = express.Router({ mergeParams: true })

router.use(async(req: Request, res:Response, next)=>{
    //check to see if the user is authenticated
    const header = req.headers.authorization;
    if(!header){
        return res.status(401).json({ error: 'unauthorized' })
    }
    const token = header.split(' ')[1]
    // verify the token
    if(!(await verifySession(token))){
        return res.status(401).json({ error: 'unauthorized' })
    }
    next();
})
router.use(express.json());


async function initDB(){
    const db = await connectDB('decibel');
    return db.collection('users');
}

// Route to get all users
router.get('/', async (req: Request, res: Response) => {
    try {

        const usersCollection = await initDB();
        // Fetch all users as an array excluding the password
        const users = await usersCollection.find({},{
            projection: {password: 0}
        }).toArray()

        res.json(users)
    } catch (error) {
        console.error("Error fetching users:", error)
        res.status(500).json({ message: 'Server error' })
    }
})

// Route to get a user by userId
router.get('/:userID', param().isString() ,async (req: Request, res: Response) => {
    try {
        const { userID } = req.params;
        if(!userID){
            return res.status(400).json({ message: 'Invalid userId' });
        }

        const usersCollection = await initDB();

        // Fetch a single user by userId
        const user = await usersCollection.findOne({ _id: new ObjectId(userID) })

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        res.json(user)
    } catch (error) {
        console.error("Error fetching user:", error)
        res.status(500).json({ message: 'Server error' })
    }
})


router.patch('/:userID', async(req: Request, res: Response) => {

    const { userID } = req.params;
    
    if(!userID){
        return res.status(422).json({message: 'Invalid user ID'});
    }

    const header = req.headers.authorization;
    if(!header){
        return res.status(401).json({ error: 'unauthorized' })
    }
    const token = header.split(' ')[1] as string;

    const currentUserID = await getCurrentUserId(token);

    if(currentUserID!== userID){
        return res.status(401).json({ error: 'unauthorized' })
    }

    const updatedFields = req.body;

    // Update the user in the database
    const usersCollection = await initDB();

    const userExists = await usersCollection.findOne({_id: new ObjectId(userID)});
    if (!userExists) {
        return res.status(404).json({ message: 'User not found' });
    }


    const result = await usersCollection.updateOne(
        { _id: new ObjectId(userID) },
        { $set: updatedFields }
    );

    if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User updated successfully' });
})

router.delete('/:userID', async(req: Request, res: Response) => {

    const { userID } = req.params;
    
    if(!userID){
        return res.status(422).json({message: 'Invalid user ID'});
    }

    if(userID.length < 24){
        return res.status(400).json({ message: 'Invalid user ID' });
    }

    const header = req.headers.authorization;
    if(!header){
        return res.status(401).json({ error: 'unauthorized' })
    }
    const token = header.split(' ')[1] as string;

    const currentUserID = await getCurrentUserId(token);

    if(currentUserID!== userID){
        return res.status(401).json({ error: 'unauthorized' })
    }

    // Delete the user from the database
    const usersCollection = await initDB();
    const result = await usersCollection.deleteOne({
        _id: new ObjectId(userID)
    })

    if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
})

export default router;
