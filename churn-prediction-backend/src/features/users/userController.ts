import { Request, Response } from 'express';
import { userService } from './userService.js';

export const listAgents = async (_req: Request, res: Response) => {
   const result = await userService.listAgents();

   res.status(200).json({
      msg: 'success',
      data: result,
   });
};
