import { Entity } from "../DDDPrimitive/Entity";
import { Identifier } from "../DDDPrimitive/Identifier";

/**
 * This class represents the aggregate root in DDD context.
 * Fundamentally, this class is the same as an entity.
 */
export abstract class AggregateRoot<T, K> extends Entity<T, K> {}