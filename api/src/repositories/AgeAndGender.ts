import * as faceapi from 'face-api.js';
import path from 'path';

import {
    canvas,
    faceDetectionNet,
    faceDetectionOptions,
    saveFile,
} from '../commons';

const faceDetectionNetJson = path.join(__dirname, '..', '..', 'weights');
const faceLandmark68NetJson = path.join(__dirname, '..', '..', 'weights');
const ageGenderNetJson = path.join(__dirname, '..', '..', 'weights');

const QUERY_IMAGE = path.join(__dirname, '..', '..', 'image.png');
// const REFERENCE_IMAGE = path.join(__dirname, '..', 'assets', 'female.jpg');

async function run() {
    try {
        await faceDetectionNet.loadFromDisk(faceDetectionNetJson);
        await faceapi.nets.faceLandmark68Net.loadFromDisk(
            faceLandmark68NetJson,
        );
        await faceapi.nets.ageGenderNet.loadFromDisk(ageGenderNetJson);

        const img = await canvas.loadImage(QUERY_IMAGE);
        const results = await faceapi
            .detectAllFaces(img, faceDetectionOptions)
            .withFaceLandmarks()
            .withAgeAndGender();

        const out = faceapi.createCanvasFromMedia(img) as any;
        faceapi.draw.drawDetections(
            out,
            results.map(res => res.detection),
        );
        results.forEach(result => {
            const { age, gender, genderProbability } = result;
            new faceapi.draw.DrawTextField(
                [
                    `${faceapi.utils.round(age, 0)} years`,
                    `${gender} (${faceapi.utils.round(genderProbability)})`,
                ],
                result.detection.box.bottomLeft,
            ).draw(out);
        });

        saveFile('ageAndGenderRecognition.jpg', out.toBuffer('image/jpeg'));
        console.log('done, saved results to out/ageAndGenderRecognition.jpg');

        return true;
    } catch (e) {
        console.log(e.message);
    }
}

export default run;
