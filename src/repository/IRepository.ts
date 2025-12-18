export interface IRepository<T, ID = string> {
  save(entity: T): void;
  getById(id: ID): T | undefined;
  delete(id: ID): void;
  getAll(): T[];
}
