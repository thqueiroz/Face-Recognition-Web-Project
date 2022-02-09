import * as fs from 'fs';
import * as path from 'path';

const baseDir = path.resolve(__dirname, '../uploads');

// eslint-disable-next-line import/prefer-default-export
export function saveFile(fileName: string, buf: Buffer) {
    if (!fs.existsSync(baseDir)) {
        fs.mkdirSync(baseDir);
    }

    fs.writeFileSync(path.resolve(baseDir, fileName), buf);
}
