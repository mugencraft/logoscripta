export type PoiAnalytics = {
  totalPOIs: number;
  typeDistribution: Record<string, number>;
  mostCommonType: {
    type: string;
    count: number;
  };
};
