import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
  DeleteDateColumn,
  BeforeInsert,
  Unique,
} from "typeorm";
import { Services } from "../../services/entities/services.entity";
import { Users } from "../../auth/entities/user.entity";
import { handler } from "../../../config/dbconfig";

@Entity("item_available")
export class ItemAvailable {
  @PrimaryGeneratedColumn({ type: "int" })
  id: number;

  @Column({ type: "int", nullable: true })
  serviceId: number;

  @ManyToOne(() => Services, { nullable: true })
  @JoinColumn()
  service: Services;

  @Column({ type: "decimal", nullable: false })
  quantity: number;

  @UpdateDateColumn({ type: "varchar", nullable: false })
  modifiedDate: string;
  @ManyToOne(() => Users)
  @JoinColumn()
  createdBy: Users;

  @ManyToOne(() => Users)
  @JoinColumn()
  modifiedBy: Users;

  @CreateDateColumn({ type: "timestamp", nullable: false })
  createdDate: Date;

  @DeleteDateColumn() // 👈 Automatically set when deleted
  deletedAt?: Date;

  @Column({ type: "int", default: 0 })
  isInactive: number;
}
