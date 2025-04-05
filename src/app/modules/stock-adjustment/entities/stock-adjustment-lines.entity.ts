import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
  DeleteDateColumn,
  Unique,
} from "typeorm";

import { Services } from "../../services/entities/services.entity";
import { StockAdjustmentHeaders } from "./stock-adjustment-headers.entity";
import { ItemsStockTrack } from "../../purchase-items/entities/item-stock-track.entity";

@Entity("stock_adjustment_lines")
export class StockAdjustmentLines {
  @PrimaryGeneratedColumn({ type: "int" })
  id: number;

  @Column({ type: "int", nullable: true })
  txnHeaderId: number;

  @ManyToOne(() => StockAdjustmentHeaders, {
    onDelete: "CASCADE", // Automatically remove this line when the sale header is deleted
  })
  @JoinColumn()
  txnHeader: StockAdjustmentHeaders;

  @Column({ type: "int", nullable: true })
  serviceId: number;

  @ManyToOne(() => Services)
  @JoinColumn()
  service: Services;

  @Column({ type: "int", nullable: true })
  stockId: number;

  @ManyToOne(() => ItemsStockTrack)
  @JoinColumn()
  stock: ItemsStockTrack;
  // Original quantities
  @Column({ type: "int", nullable: true })
  quantityAdded: number;

  @Column({ type: "int", nullable: true })
  quantityUvailable: number;

  // New quantities and their variations
  @Column({ type: "int", nullable: true })
  quantityAddedNew: number;

  @Column({ type: "int", nullable: true })
  quantityAddedVariation: number;

  @Column({ type: "int", nullable: true })
  quantityUvailableNew: number;

  @Column({ type: "int", nullable: true })
  quantityUvailableVariation: number;

  // Final variation (for example, newQtyAdded - newQtyAvailable)
  @Column({ type: "int", nullable: true })
  finalVariation: number;

  // Reason for adjustment
  @Column({ type: "varchar", length: 255, nullable: true })
  reason: string;

  @CreateDateColumn({ type: "varchar", nullable: false })
  createdDate: string;

  @UpdateDateColumn({ type: "varchar", nullable: false })
  modifiedDate: string;

  @Column({ type: "int", default: 0 })
  isInactive: number;

  @Column({ type: "int", default: 0, nullable: false })
  isService: number;

  @DeleteDateColumn() // Automatically set when deleted
  deletedAt?: Date;
}
