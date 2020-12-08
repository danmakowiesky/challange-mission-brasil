import {Router}  from 'express';
import ZipImages from './ZipImages';
const routes = new Router();

routes.get('/download/zip', ZipImages.getImagesForDownload);
export default routes;
