import * as faceapi from 'face-api.js';
import path from 'path';

import {
    canvas,
    faceDetectionNet,
    faceDetectionOptions,
    saveFile,
} from '../commons';

const QUERY_IMAGE = path.join(__dirname, '..', '..', 'image.png');

const faceDetectionNetJson = path.join(__dirname, '..', '..', 'weights');
const faceLandmark68NetJson = path.join(__dirname, '..', '..', 'weights');
const faceRecognitionNetJson = path.join(__dirname, '..', '..', 'weights');

let faceMatcher: any = null;

function getFaceImageUri(className: string, idx: number) {
    return path.join(
        __dirname,
        '..',
        '..',
        'images',
        `${className}`,
        `${className}${idx}.jpeg`,
    );
}

async function createBbtFaceMatcher(
    numImagesForTraining = 1,
    classes: Array<string>,
) {
    const maxAvailableImagesPerClass = 5;
    numImagesForTraining = Math.min(
        numImagesForTraining,
        maxAvailableImagesPerClass,
    );

    await Promise.all(
        classes.map(async className => {
            for (let i = 1; i < numImagesForTraining + 1; i++) {
                //get image class on the current position
                const findImage = getFaceImageUri(className, i);
                //load image 
                const img = await canvas.loadImage(findImage);
                // detect faces and calculate all face points and characteristics
                // it returns a mathematical matrix with all features extracted from the image
                const resultsRef = await faceapi
                    .detectAllFaces(img, faceDetectionOptions)
                    .withFaceLandmarks()
                    .withFaceDescriptors();

                // assigns all the results obtained to the variable
                faceMatcher = new faceapi.FaceMatcher(resultsRef);
                //  assigns the class name for the face matcher label
                faceMatcher.labeledDescriptors.map((ld: any) => {
                    ld._label = className;
                });
            }
        }),
    );
}

async function updateResults() {
    //load image 
    const queryImage = await canvas.loadImage(QUERY_IMAGE);
    // detect faces and calculate all face points and characteristics
    // it returns a mathematical matrix with all features extracted from the image
    const resultsQuery = await faceapi
        .detectAllFaces(queryImage, faceDetectionOptions)
        .withFaceLandmarks()
        .withFaceDescriptors();

    // it will make a best match between the face matcher variable and the result of image sended from the fron end
    const queryDrawBoxes = resultsQuery.map(res => {
        const bestMatch = faceMatcher.findBestMatch(res.descriptor);
        return new faceapi.draw.DrawBox(res.detection.box, {
            label: bestMatch.toString(),
        });
    });
    // after match, it will draw on the image sent the result containing the label of recognized and unrecognized faces
    const outQuery = faceapi.createCanvasFromMedia(queryImage);
    queryDrawBoxes.forEach(drawBox => drawBox.draw(outQuery));

    // save the result on the uploadas folder
    saveFile('queryImage.jpg', (outQuery as any).toBuffer('image/jpeg'));
    console.log('done, saved results to uploads/queryImage.jpg');
}

async function execute() {
    try {
        // load cnns
        await faceDetectionNet.loadFromDisk(faceDetectionNetJson);

        // load cnns
        await faceapi.nets.faceLandmark68Net.loadFromDisk(
            faceLandmark68NetJson,
        );
        // load cnns
        await faceapi.nets.faceRecognitionNet.loadFromDisk(
            faceRecognitionNetJson,
        );

        // initialize face matcher with 1 reference descriptor per character
        await createBbtFaceMatcher(5, ['tiago']);
        
        //  match face mather with the image sended
        await updateResults();
    } catch (e) {
        throw new Error(e.message);
    }
}

export default execute;
