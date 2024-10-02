import { IEntity } from '../../contracts/db/entity';

export abstract class Entity implements IEntity {
  createdAt: Date;
  updatedAt: Date;
}