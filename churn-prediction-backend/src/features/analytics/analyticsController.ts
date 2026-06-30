import { Request, Response } from 'express';
import { analyticsService } from './analyticsService.js';

export const getModelPerformance = async (_req: Request, res: Response) => {
   const result = analyticsService.getModelPerformance();

   res.status(200).json(result);
};

export const getByContract = async (_req: Request, res: Response) => {
   const result = await analyticsService.getByContract();

   res.status(200).json(result);
};
