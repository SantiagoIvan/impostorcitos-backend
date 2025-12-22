import {IRepository} from "./IRepository"

export abstract class InMemoryMapRepository<T extends { id: string }>
  implements IRepository<T> {

  protected items = new Map<string, T>();

  save(entity: T): void {
    this.items.set(entity.id, entity);
  }

  getById(id: string): T | undefined {
    return this.items.get(id);
  }

  delete(id: string): void {
    this.items.delete(id);
  }

  getAll(): T[] {
    return Array.from(this.items.values());
  }
}
