import { IEntity } from '../../contracts/db/entity';

export abstract class Entity implements IEntity {
  abstract createdAt: Date;
  abstract updatedAt: Date;
}