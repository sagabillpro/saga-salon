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
import { SaleHeaders } from "./sale-header.entity";
import { Services } from "../../services/entities/services.entity";
import { Taxes } from "../../taxes/entities/taxes.entity";
import { PurchaseHeaders } from "../../purchase-items/entities/purchase-headers.entity";
import { ItemsStockTrack } from "../../purchase-items/entities/item-stock-track.entity";
import { StockAdjustmentHeaders } from "../../stock-adjustment/entities/stock-adjustment-headers.entity";

@Entity("inventory_lines")
export class InventoryLines {
  @PrimaryGeneratedColumn({ type: "int" })
  id: number;

  @Column({ type: "int", nullable: true })
  purchaseId: number;

  @ManyToOne(() => PurchaseHeaders, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  purchase: PurchaseHeaders;

  @Column({ type: "int", nullable: true })
  stockAdjustmentId: number;

  @ManyToOne(() => StockAdjustmentHeaders, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  stockAdjustment: StockAdjustmentHeaders;

  @Column({ type: "int", nullable: true })
  stockId: number;

  @ManyToOne(() => ItemsStockTrack)
  @JoinColumn()
  stock: ItemsStockTrack;

  @Column({ type: "int", nullable: true })
  serviceId: number;

  @ManyToOne(() => Services, { nullable: true })
  @JoinColumn()
  service: Services;

  @Column({ type: "int", nullable: true })
  saleId: number;

  @ManyToOne(() => SaleHeaders, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  sale: SaleHeaders;

  @Column({ type: "decimal", nullable: true })
  quantity: number;

  @CreateDateColumn({ type: "varchar", nullable: false })
  createdDate: string;

  @UpdateDateColumn({ type: "varchar", nullable: false })
  modifiedDate: string;

  @Column({ type: "int", default: 0 })
  isInactive: number;

  @DeleteDateColumn() // 👈 Automatically set when deleted
  deletedAt?: Date;
}
