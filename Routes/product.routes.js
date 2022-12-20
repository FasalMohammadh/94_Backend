import express from 'express';
import multer from 'multer';
import fs from 'fs';

import Product from '../Models/product.js';

const router = express.Router();

// multer setting up storage
const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    // validates image types
    if (
      ['image/png', 'image/gif', 'image/jpg', 'image/jpeg'].includes(
        file.mimetype
      )
    ) {
      cb(null, 'Uploads');
      return;
    }
    cb(new Error('Image type is not supported'));
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(
      null,
      `${file.fieldname}-${uniqueSuffix}.${file.originalname.split('.').at(-1)}`
    );
  },
});

const upload = multer({ storage });

router.get('/', async (_req, res) => {
  try {
    const products = await Product.find();
    res.status(200).send(products);
  } catch (error) {
    res.status(500).send({ message: 'failed' });
  }
});

router.get('/search/*', async (req, res) => {
  try {
    const searchTextRegex = new RegExp(`^${req.query.q}`, 'gi');
    const products = await Product.find({
      productName: searchTextRegex,
    });
    res.send(products);
  } catch (error) {
    res.status(500).send({ message: 'failed' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    res.send(product);
  } catch {
    res.status(500).send({ message: 'failed' });
  }
});

router.post('/', upload.array('images'), async (req, res) => {
  try {
    const { name, sku, description, qty } = req.body;
    const imagesPaths = req.files.map(image => image.path);

    await Product.create({
      SKU: sku,
      image: imagesPaths,
      productDesc: description,
      productName: name,
      quantity: qty,
    });

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    if (error?.code === 11_000 && error.message.includes('SKU')) {
      res.status(400).send({ message: 'SKU id is already taken' });
      return;
    }
    if (error.message === 'Image type is not supported') {
      res.status(400).send({ message: error.message });
      return;
    }
    res.sendStatus(500);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Product.deleteOne({ _id: id });

    // deletes the relevant images
    deleteImages(await Product.findById(id));

    res.sendStatus(200);
  } catch (error) {
    res.status(500).send({ message: 'failed' });
  }
});

router.put('/:id', upload.array('images'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sku, description, qty } = req.body;
    const imagesPaths = req.files.map(image => image.path);

    const dataToBeUpdated = {
      SKU: sku,
      productDesc: description,
      productName: name,
      quantity: qty,
    };

    // add images only if images were changed and removes old images
    if (imagesPaths.length) {
      dataToBeUpdated.image = imagesPaths;
      deleteImages(await Product.findById(id));
    }

    await Product.findByIdAndUpdate(id, dataToBeUpdated);

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    if (error?.code === 11_000 && error.message.includes('SKU')) {
      res.status(400).send({ message: 'SKU id is already taken' });
      return;
    }
    if (error.message === 'Image type is not supported') {
      res.status(400).send({ message: error.message });
      return;
    }
    res.sendStatus(500);
  }
});

function deleteImages(product) {
  if (product?.image) {
    product.image.forEach(imagePath =>
      fs.unlink(imagePath, error => {
        if (error) throw err;
      })
    );
  }
}

export default router;
