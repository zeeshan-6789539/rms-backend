export interface IDatabaseConfig {
  url: string;
  poolMax: number;
  ssl: boolean;
  logQueries: boolean;
}
