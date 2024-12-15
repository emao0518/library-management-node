import express, { Request, Response, NextFunction } from 'express';
import { Book } from '../model';

var router = express.Router();

router.post('/', async (req: Request, res: Response) => {
  const bookModel = new Book(req.body);
  const book = await bookModel.save();

  return res.status(200).json({ message: 'Created successfully!' });
});

router.get('/', async (req: Request, res: Response) => {
  const { current = 1, pageSize = 10, name, author, category } = req.query;
  const total = await Book.countDocuments({
    ...(name && { name }),
    ...(author && { author }),
    ...(category && { category }),
  });

  const data = await Book.find({
    ...(name && { name }),
    ...(author && { author }),
    ...(category && { category }),
  })
    .populate('category')
    .sort({ updatedAt: -1 })
    .skip((Number(current) - 1) * Number(pageSize))
    .limit(Number(pageSize));

  return res.status(200).json({ data, total });
});

router.get('/:id', async (req: Request, res: Response) => {
  const book = await Book.findOne({ _id: req.params.id }).populate('category');
  if (book) {
    res.status(200).json({ data: book, success: true });
  } else {
    res.status(500).json({ message: 'This book does not exist!' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    await Book.findOneAndUpdate({ _id: req.params.id }, req.body);

    return res.status(200).json();
  } catch (error) {
    return res.status(500).json({ error });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  const book = await Book.findById(req.params.id);
  if (book) {
    await Book.deleteOne({ _id: req.params.id });

    res.status(200).json({ success: true });
  } else {
    res.status(500).json({ message: 'This book does not exist!' });
  }
});

export default router;
