import express from 'express';
import { getEcho } from './get';

const router = express.Router();

/** Returns a body of just the param */
router.get('/:str', async (req, res) => {
  const str = req.params.str;
  const response = await getEcho(str);
  res.json(response);
});

export default router;
