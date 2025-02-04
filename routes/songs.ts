import express,{Request, Response} from "express";
import {statSync,createReadStream} from 'fs'
import * as path from 'path'

const router = express.Router({mergeParams: true})


router.get('/:songName',(req: Request, res: Response)=>{

    const { songName } = req.params;

    if(!songName){
        return res.status(400).json({error: "Song name is required"});
    }

    const rootDir = process.cwd();

    const AUDIO_FILE = path.join(rootDir, songName);

    if(!AUDIO_FILE){
        return res.status(404).json({error: "Song not found"});
    }

    const stat = statSync(AUDIO_FILE);
    const fileSize = stat.size;
    const fileRange = req.headers.range;

    if(fileRange){
        const [start, end] = fileRange.replace(/bytes=/, "").split("-");
        const chunkSize = parseInt(end) - parseInt(start) + 1;

        res.writeHead(206, {
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": chunkSize,
            "Content-Type": "audio/mpeg"
        });

        createReadStream(AUDIO_FILE, { start: parseInt(start), end: parseInt(end) }).pipe(res);
    }
    else{
        res.setHeader('Content-Type', 'audio/mpeg');
        createReadStream(AUDIO_FILE).pipe(res);
    }



})












export default router;