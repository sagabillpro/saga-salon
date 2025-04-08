import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
  DeleteDateColumn,
} from "typeorm";
import { Services } from "../../services/entities/services.entity";
import { Taxes } from "../../taxes/entities/taxes.entity";
import { PurchaseHeaders } from "./purchase-headers.entity";
import { UOM } from "../../uom/entities/uom.entity";
import { TaxNew } from "../../taxes/entities/taxes-new.entity";
import { TaxGroup } from "../../taxes/entities/tax-groups.entity";

@Entity("purchase_lines")
export class PurchaseLines {
  @PrimaryGeneratedColumn({ type: "int" })
  id: number;

  @Column({ type: "int", nullable: true })
  txnHeaderId: number;

  @ManyToOne(() => PurchaseHeaders, {
    onDelete: "CASCADE", // Automatically remove this line when the sale header is deleted
  })
  @JoinColumn()
  txnHeader: PurchaseHeaders;

  @Column({ type: "int", nullable: true })
  serviceId: number;

  @ManyToOne(() => Services)
  @JoinColumn()
  service: Services;

  @Column({ type: "int", nullable: true })
  taxGroupId: number;

  @ManyToOne(() => TaxGroup, { nullable: true })
  @JoinColumn()
  taxGroup: TaxGroup;

  @Column({ type: "jsonb", nullable: true })
  taxGroupComponents: any;

  @Column({ type: "jsonb", nullable: true })
  hallMarkDetails: any;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  rate: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  costPrice: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  unitPrice: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  quantity: number;
  
  @Column({ type: "int", nullable: true })
  uomId: number;

  @ManyToOne(() => UOM, { nullable: true })
  @JoinColumn()
  uom: UOM;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  amount: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  discountAmount: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  taxAmount: number;

  @CreateDateColumn({ type: "varchar", nullable: false })
  createdDate: string;

  @UpdateDateColumn({ type: "varchar", nullable: false })
  modifiedDate: string;

  @DeleteDateColumn() // 👈 Automatically set when deleted
  deletedAt?: Date;
  // JSONB column to store tax breakdown
  @Column({ type: "int", default: 0, nullable: true })
  isService: number;

  @Column({ type: "int", default: 0 })
  isInactive: number;
  @Column({ type: "varchar", nullable: true })
  huid: string; // HUID number for tracking precious metals
  @Column({ type: "varchar", nullable: true })
  karat: string; // Karat weight for tracking precious metals
  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  makingChargeRs: number; // Making charge amount for precious metals
  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  makingChargePercentage: number; // Making charge percentage for precious metals
}
