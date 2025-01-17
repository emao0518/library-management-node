import express, { Request, Response, NextFunction } from 'express';
import { Book, Borrow, User } from '../model';

var router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  const { current, pageSize, book, user, status } = req.query;
  const total = await Borrow.countDocuments({
    ...(book && { book }),
    ...(user && { user }),
    ...(status && { status }),
  });

  const session = req.session as any;
  let newUser = user;
  if (session.user && session.user.role === 'user') {
    newUser = session.user._id;
  }
  const data = await Borrow.find({
    ...(book && { book }),
    ...(newUser && { user: newUser }),
    ...(status && { status }),
  })
    .sort({ updatedAt: -1 })
    .skip((Number(current) - 1) * Number(pageSize))
    .populate(['user', 'book']);

  res.status(200).json({ message: true, data, total });
});

router.post('/', async (req: Request, res: Response) => {
  const { book, user } = req.body;
  const borrow = new Borrow(req.body);

  const bookData = await Book.findOne({ _id: book });

  if (bookData) {
    if (bookData.stock > 0) {
      await borrow.save();
      await Book.findByIdAndUpdate(bookData._id, { stock: bookData.stock - 1 });
      res.status(200).json({ success: true });
    } else {
      res.status(500).json({ message: 'Out of stock!' });
    }
  } else {
    res.status(500).json({ message: 'This book does not exist!' });
  }

  const obj = await borrow.save();
  res.status(200).json({ message: true });
});

router.get('/:id', async (req: Request, res: Response) => {
  const data = await Borrow.findOne({ _id: req.params.id });
  if (data) {
    res.status(200).json({ success: true, data });
  } else {
    res.status(500).json({ message: 'The issue record does not exist!' });
  }
});
router.put('/:id', async (req: Request, res: Response) => {});

router.delete('/:id', async (req: Request, res: Response) => {
  const borrow = await Borrow.findById(req.params.id);
  if (borrow) {
    await Borrow.deleteOne({ _id: req.params.id });
    res.status(200).json({ success: true });
  } else {
    res.status(500).json({ message: 'The issue record does not exist!' });
  }
});


router.put('/back/:id', async (req: Request, res: Response) => {
  const borrow = await Borrow.findOne({ _id: req.params.id });
  if (borrow) {
    if (borrow.status === 'off') {
      res.status(500).json({ message: 'This book is already returned!' });
    } else {
      borrow.status = 'off';
      borrow.backAt = Date.now();
      await borrow.save();
      const book = await Book.findOne({ _id: borrow.book });

      if (book) {
        book.stock += 1;
        await book.save();
      } else {
        res.status(500).json({ message: 'This book does not exist!' });
      }

      res.status(200).json({ success: true });
    }
  } else {
    res.status(500).json({ message: 'The issue record does not exist!' });
  }
});

export default router;
