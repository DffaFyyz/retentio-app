import { analyticsRepository } from './analyticsRepository.js';
import { ContractAggregate, ModelPerformance } from './analyticsTypes.js';

const contractOrder = ['Month-to-month', 'One year', 'Two year'];

class AnalyticsService {
   getModelPerformance(): ModelPerformance {
      return {
         modelName: 'XGBoost Classifier',
         threshold: Number(process.env.ML_RISK_THRESHOLD ?? 0.59),
         auc: 0.8304,
         accuracy: 0.77,
         precision: 0.55,
         recall: 0.71,
         f1Score: 0.62,
         positiveClass: 'Churn',
         evaluatedRows: 1407,
         source: 'churn-prediction_final_with_eda.ipynb',
      };
   }

   async getByContract(): Promise<ContractAggregate[]> {
      const [totals, churned] = await Promise.all([
         analyticsRepository.countByContract(),
         analyticsRepository.countChurnedByContract(),
      ]);

      const churnedByContract = new Map(
         churned.map((item) => [item.Contract, item._count._all]),
      );

      return totals
         .map((item) => ({
            contract: item.Contract,
            total: item._count._all,
            churned: churnedByContract.get(item.Contract) ?? 0,
         }))
         .sort(
            (a, b) =>
               contractOrder.indexOf(a.contract) -
               contractOrder.indexOf(b.contract),
         );
   }
}

export const analyticsService = new AnalyticsService();
