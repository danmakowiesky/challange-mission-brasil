import {createWriteStream, mkdirSync, existsSync} from 'fs'
import {images} from './images/images.json';
import axios from 'axios';
import archiver from 'archiver'

class ZipImages {
    /**
     * Método inicial, que vai fazer a procura da lista de imagens a serem baixadas e zipadas
     * @param req
     * @param res
     * @return {Promise<void>}
     */
    async getImagesForDownload(req, res) {

        const directoryOfImages = './images'

        if (!existsSync(directoryOfImages)) {
            mkdirSync(directoryOfImages)
        }

        await Promise.all(images.map((imageUrl, index) => {
            return downloadImagesJson(`${directoryOfImages}/photo_${index + 1}.png`, imageUrl)
        }))

        const output = createWriteStream('src/images-mission-brasil.zip')

        output.on('close', function () {
            res.sendFile(`${__dirname.replace("./src", "")}/images-mission-brasil.zip`)
        })
        output.on('end', function () {
            console.info('Arquivo terminado');
        })
        await zipFolder('images/*.png', output);
    }
}

/**
 *  MÉTODO QUE ZIPA AS FOTOS
 * @param dirFiles
 * @param output
 * @return {Promise<Archiver>}
 */
async function zipFolder(dirFiles, output) {
    const archive = archiver('zip', {
        zlib: {level: 9}
    })

    archive.on('warning', function (err) {
        if (err.code === 'ENOENT') {
            console.log(err)
        } else {
            throw err
        }
    })

    archive.on('error', function (err) {
        throw err
    })

    archive.pipe(output)
    archive.glob(dirFiles)

    return archive.finalize()
}

/**
 * MÉTODO QUE PEGA TODA A LISTA DAS FOTOS E FAZ O DOWNLOAD DAS MESMAS
 * @param dest
 * @param url
 * @return {Promise<void>}
 */
async function downloadImagesJson(dest, url) {
    const file = createWriteStream(dest)
    return
    axios.get(url, function (response) {
        response.pipe(file)
        file.on('finish', function () {
            file.close()
        });
    });
}

export default new ZipImages();
