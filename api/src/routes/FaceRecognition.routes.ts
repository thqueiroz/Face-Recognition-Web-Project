import { Router } from 'express';
import saveFile from '../config/imageConfig';

// import run from '../repositories/FaceRecognitionRepository';
import execute from '../repositories/bbtFaceRecognition';

const faceRecognitionRouter = Router();

faceRecognitionRouter.post('/', async (request, response) => {
    try {
        const { image } = request.body;
        const base64Image = image.split(';base64,').pop();
        await saveFile(base64Image);
        await execute();
        return response.json({
            imageResult: 'http://localhost:3333/files/queryImage.jpg',
        });
    } catch (err) {
        return response.status(400).json(err);
    }
});

export default faceRecognitionRouter;
