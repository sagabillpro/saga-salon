import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  JoinColumn,
  OneToOne,
  ManyToOne,
  DeleteDateColumn,
  BeforeInsert,
  Unique,
  VersionColumn,
} from "typeorm";
import { Users } from "../../auth/entities/user.entity";
import { Customer } from "../../customer/entities/customer.entity";
import {
  City,
  Country,
  DPaymentType,
  DTransactionStatus,
  States,
} from "../../general-data/entities";

import { PurchaseLines } from "./purchase-lines.entity";
import { InventoryLines } from "../../sale-items/entities/inventory-lines.entity";
import { Supplier } from "../../suppliers/entities/supplier.entity";
import { Contact } from "../../contacts/entities/contact.entity";
import { handler } from "../../../config/dbconfig";
import { Company } from "../../company/entities/company.entity";

@Entity("purchase_headers")
export class PurchaseHeaders {
  @PrimaryGeneratedColumn({ type: "int" })
  id: number;

  @Column({ type: "varchar", length: 255, nullable: true, unique: true })
  code: string;

  @Column({ type: "varchar", length: 600, nullable: true })
  description: string;

  @CreateDateColumn({ type: "varchar", nullable: false })
  txnDate: string;

  @CreateDateColumn({ type: "varchar", nullable: true })
  saleInvoiceNumber: string;

  @Column({ type: "int", nullable: true })
  companyId: number;

  @ManyToOne(() => Company, { nullable: true })
  @JoinColumn()
  company: Company;

  @Column({ type: "int", nullable: true })
  supplierId: number;

  @ManyToOne(() => Contact, { nullable: true })
  @JoinColumn()
  supplier: Contact;

  @Column({ type: "int", nullable: true })
  userId: number;

  @ManyToOne(() => Users)
  @JoinColumn()
  user: Users;

  @Column({ type: "int", nullable: true })
  paymentTypeId: number;

  @ManyToOne(() => DPaymentType)
  @JoinColumn()
  paymentType: DPaymentType;

  @ManyToOne(() => DTransactionStatus, { nullable: true })
  @JoinColumn()
  transactionStatus: DTransactionStatus;

  // Changed from integer to decimal (precision 10, scale 2)
  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  subTotal: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  grandTotal: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  totalDiscount: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  totalTax: number;
  
  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  totalCgst: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  totalSgst: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  totalIgst: number;

  @CreateDateColumn({ type: "varchar", nullable: false })
  createdDate: string;

  @UpdateDateColumn({ type: "varchar", nullable: false })
  modifiedDate: string;

  @OneToMany(() => PurchaseLines, (line) => line.txnHeader, {
    cascade: true,
    onDelete: "CASCADE",
  })
  purchaseLines: PurchaseLines[];

  @OneToMany(() => InventoryLines, (line) => line.purchase, {
    cascade: true,
    onDelete: "CASCADE",
  })
  inventoryLines: InventoryLines[];
  //************newly added columns
  @ManyToOne(() => Users)
  @JoinColumn()
  createdBy: Users;

  @ManyToOne(() => Users)
  @JoinColumn()
  modifiedBy: Users;
  @Column({ type: "int", nullable: true })
  createdById: number;

  @Column({ type: "int", nullable: true })
  modifiedById: number;

  @Column({ type: "int", default: 0 })
  isInactive: number;

  @DeleteDateColumn() // 👈 Automatically set when deleted
  deletedAt?: Date;

  @VersionColumn({ nullable: true })
  version: number;
}
