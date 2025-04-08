import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { Services } from "../../services/entities/services.entity";
import { PurchaseHeaders } from "./purchase-headers.entity";
import { Company } from "../../company/entities/company.entity";

@Entity("items_stock_track")
export class ItemsStockTrack {
  @PrimaryGeneratedColumn({ type: "int" })
  id: number;

  @Column({ type: "int", nullable: true })
  serviceId: number;

  @ManyToOne(() => Services)
  @JoinColumn()
  service: Services;
  
  @Column({ type: "int", nullable: true })
  txnHeaderId: number;

  @ManyToOne(() => PurchaseHeaders, {
    onDelete: "CASCADE", // Automatically remove this line when the sale header is deleted
  })
  @JoinColumn()
  txnHeader: PurchaseHeaders;

  @Column({ type: "decimal", nullable: true })
  unitPrice: number;

  @Column({ type: "varchar", nullable: true })
  stockNumber: string;

  @Column({ type: "decimal", nullable: false })
  quantityAdded: number;

  @Column({ type: "decimal", nullable: false })
  quantityUvailable: number;

  @CreateDateColumn({ type: "varchar", nullable: false })
  createdDate: string;

  @UpdateDateColumn({ type: "varchar", nullable: false })
  modifiedDate: string;
  
  @Column({ type: "int", nullable: true })
  companyId: number;

  @ManyToOne(() => Company)
  @JoinColumn()
  company: Company;
  @Column({ type: "int", default: 0 })
  isInactive: number;
}
