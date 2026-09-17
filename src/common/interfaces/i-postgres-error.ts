// The subset of node-postgres' DatabaseError this app reacts to
export interface IPostgresError {
  code: string;
  constraint?: string;
  detail?: string;
  column?: string;
  table?: string;
}
