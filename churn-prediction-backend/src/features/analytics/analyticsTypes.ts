export interface ContractAggregate {
   contract: string;
   total: number;
   churned: number;
}

export interface ModelPerformance {
   modelName: string;
   threshold: number;
   auc: number;
   accuracy: number;
   precision: number;
   recall: number;
   f1Score: number;
   positiveClass: string;
   evaluatedRows: number;
   source: string;
}
