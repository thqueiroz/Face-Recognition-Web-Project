import { Router } from 'express';
import saveFile from '../config/imageConfig';

import run from '../repositories/AgeAndGender';

const ageAndGenderRouter = Router();

ageAndGenderRouter.post('/', async (request, response) => {
    try {
        const { image } = request.body;
        const base64Image = image.split(';base64,').pop();
        await saveFile(base64Image);
        await run();
        return response.json({ message: 'Detection done successfully' });
    } catch (err) {
        return response.status(400).json(err);
    }
});

export default ageAndGenderRouter;
