// import { FindManyOptions, FindOneOptions, In } from "typeorm";

// import { generateCode } from "../../utils/get-object-code.util";
// import { handler } from "../../config/dbconfig";
// import { City, Country, States } from "../general-data/entities";
// import { SaleHeaders } from "./entities/sale-header.entity";
// import repository from "./sale-header.repo";
// import { InventoryLines } from "./entities/inventory-lines.entity";
// import invoiceMailer from "../../services/send-invoice-mail.service";
// import customerService from "../customer/customer.service";
// import { ItemAvailable } from "./entities/item-stocks.entity";
// import itemStocksService from "./item-stocks.service";
// import { Services } from "../services/entities/services.entity";
// import { ItemsStockTrack } from "../purchase-items/entities/item-stock-track.entity";
// import { Customer } from "../customer/entities/customer.entity";
// import { Contact } from "../contacts/entities/contact.entity";
// import contactService from "../contacts/contact.service";
// import { SaleLines } from "./entities/sale-lines.enity";

// //1. find multiple records
// const find = async (filter?: FindManyOptions<SaleHeaders>) => {
//   try {
//     const repo = await repository();
//     return repo.find(filter);
//   } catch (error) {
//     throw error;
//   }
// };
// //2. find single records
// const findById = async (
//   id: number,
//   filter?: FindOneOptions<SaleHeaders> | FindManyOptions<SaleHeaders>
// ) => {
//   try {
//     const repo = await repository();
//     const respo = await repo.findOneById(id, filter);
//     return respo;
//   } catch (error) {
//     throw error;
//   }
// };

// //3. create single record
// const create = async (data: SaleHeaders, isService: boolean = false) => {
//   try {
//     const dataSource = await handler();
//     const repo = await repository();
//     const customerRepo = dataSource.getRepository(Customer);
//     data = await generateCode(19, data);
//     const invoiceItems: {
//       name: string;
//       quantity: number;
//       unitPrice: number;
//       total: number;
//       tax: number;
//       taxName: string;
//     }[] = [];
//     if (data.saleLines.length) {
//       data.saleLines.forEach((value) => {
//         invoiceItems.push({
//           name: value.service.name,
//           quantity: value.quantity,
//           unitPrice: value.rate,
//           total: Number(value.amount),
//           tax: value.taxAmount,
//           taxName: value.tax.name,
//         });
//       });
//     }
//     const respo = await repo.create({
//       ...data,
//     });
//     const custmerRepo = dataSource.getRepository(Contact);
//     //get customer data custo
//     let customer = await contactService.findById(data.customer.id);

//     await custmerRepo.save({
//       ...customer,
//       lastVisitedDate: new Date().toISOString(),
//     });
//     await invoiceMailer({
//       customer: customer.name,
//       txnDate: new Date(data.txnDate).toLocaleDateString(),
//       txnId: data.code,
//       mobile: customer.mobile,
//       subTotal: data.subTotal,
//       grandTotal: data.grandTotal,
//       tax: data.totalTax,
//       discount: data.totalDiscount,
//       email: customer.email,
//       itemData: invoiceItems,
//     });
//     return respo;
//   } catch (error) {
//     throw error;
//   }
// };

// //4. update single record by id
// const updateById = async (
//   id: number,
//   data: SaleHeaders,
//   isService: boolean = false
// ) => {
//   try {
//     const repo = await repository();
//     data = await generateCode(19, data);
//     const inventory: InventoryLines[] = [];
//     if (!isService) {
//       data.saleLines.forEach((value) => {
//         const il = new InventoryLines();
//         (il.service = value.service),
//           (il.quantity = value.quantity),
//           (il.createdDate = value.createdDate),
//           (il.modifiedDate = value.modifiedDate);
//         inventory.push(il);
//       });
//       data.inventoryLines = inventory;
//     }
//     const respo = await repo.updateById(id, {
//       ...data,
//     });
//     return respo;
//   } catch (error) {
//     throw error;
//   }
// };

// //5. delete single record by id
// const deleteById = async (id: number) => {
//   try {
//     const repo = await repository();
//     await repo.deleteById(id);
//   } catch (error) {
//     throw error;
//   }
// };
// // //3. create single record
// // const createBulk = async (data: SaleHeaders, isService: boolean = false) => {
// //   try {
// //     const repo = await repository();
// //     const dataSource = await handler();
// //     const itemAvailableRepo = dataSource.getRepository(ItemAvailable);
// //     const itemStockTrack = dataSource.getRepository(ItemsStockTrack);
// //     data = await generateCode(19, data);
// //     let result: SaleHeaders = new SaleHeaders();
// //     const invoiceItems: {
// //       name: string;
// //       quantity: number;
// //       unitPrice: number;
// //       total: number;
// //       tax: number;
// //       taxName: string;
// //     }[] = [];

// //     const inventory: InventoryLines[] = [];
// //     const itemIds: number[] = [];
// //     const errors: string[] = [];
// //     const itemToQauntityMap: {
// //       [key: number]: {
// //         quantity: number;
// //         name: string;
// //         idx: number;
// //       };
// //     } = {};
// //     //get customer data custo
// //     let customer = await contactService.findById(data.customer.id);

// //     data.saleLines.forEach((value) => {
// //       invoiceItems.push({
// //         name: value.service.name,
// //         quantity: value.quantity,
// //         unitPrice: value.rate,
// //         total: Number(value.amount),
// //         tax: value.taxAmount,
// //         taxName: value.tax.name,
// //       });
// //       itemIds.push(value.service.id);
// //     });
// //     // get items available as per item demand
// //     //! check if item  with isInavtive=0 is not present
// //     let itemsAvailable = await itemAvailableRepo.find({
// //       where: {
// //         service: {
// //           id: In(itemIds),
// //         },
// //       },
// //       relations: {
// //         service: true,
// //       },
// //       select: {
// //         id: true,
// //         quantity: true,
// //         service: {
// //           id: true,
// //           name: true,
// //         },
// //       },
// //     });
// //     //add data to map
// //     itemsAvailable.forEach((val, index) => {
// //       itemToQauntityMap[val.service.id] = {
// //         name: val.service.name,
// //         quantity: val.quantity,
// //         idx: index,
// //       };
// //     });
// //     //check availabilty
// //     data.saleLines.forEach((value) => {
// //       if (itemToQauntityMap[value.service.id]) {
// //         if (itemToQauntityMap[value.service.id]?.quantity < value.quantity) {
// //           errors.push(
// //             `${
// //               itemToQauntityMap[value.service.id].name
// //             } is out of stock : available stock is ${
// //               itemToQauntityMap[value.service.id]?.quantity
// //                 ? itemToQauntityMap[value.service.id]?.quantity
// //                 : 0
// //             }`
// //           );
// //         }
// //       } else {
// //         errors.push(
// //           `${value.service.name} is out of stock : available stock is ${0}`
// //         );
// //       }
// //     });
// //     //throw error if applicable
// //     if (errors.length) {
// //       throw { message: errors, statusCode: 409 };
// //     }
// //     //get related stock track records
// //     const stockMap: {
// //       [key: number]: {
// //         id: number;
// //         idx: number;
// //         aQuanity: number;
// //       };
// //     } = {};
// //     let stockTrack = await itemStockTrack.find({
// //       where: {
// //         service: {
// //           id: In(itemIds),
// //         },
// //       },
// //       order: {
// //         id: "ASC",
// //       },
// //       relations: {
// //         service: true,
// //       },
// //     });
// //     stockTrack.forEach((val, index) => {
// //       stockMap[val.id] = {
// //         id: val.id,
// //         idx: index,
// //         aQuanity: val?.quantityUvailable,
// //       };
// //     });

// //     data.saleLines.forEach((value) => {
// //       //1. filter out stock entries for each item
// //       let idx = 0;
// //       let itmRemain = value.quantity;
// //       let uvailableForItem = stockTrack.filter(
// //         (val) => val.service.id === value.service.id
// //       );
// //       while (itmRemain) {
// //         //1. update current entry
// //         let _uvailableForItem = uvailableForItem[idx];
// //         //create inventory records here
// //         const il = new InventoryLines();
// //         il.service = value.service;

// //         il.createdDate = value.createdDate;
// //         il.modifiedDate = value.modifiedDate;
// //         il.stock = _uvailableForItem;
// //         let sold = _uvailableForItem.quantityUvailable - itmRemain;
// //         _uvailableForItem = {
// //           ..._uvailableForItem,
// //           quantityUvailable: sold > 0 ? sold : 0,
// //         };
// //         if (stockMap[_uvailableForItem.id]) {
// //           stockTrack[stockMap[_uvailableForItem.id].idx] = _uvailableForItem;
// //         }
// //         if (sold < 0) {
// //           il.quantity = -Number(itmRemain + sold);
// //           inventory.push(il);
// //           itmRemain = Math.abs(sold);
// //         } else {
// //           il.quantity = -Number(itmRemain);
// //           inventory.push(il);
// //           itmRemain = 0;
// //         }
// //         idx++;
// //       }

// //       //decrease item availabilty
// //       if (itemToQauntityMap[value.service.id]) {
// //         let _itemsAvailable =
// //           itemsAvailable[itemToQauntityMap[value.service.id].idx];
// //         _itemsAvailable = {
// //           ..._itemsAvailable,
// //           id: _itemsAvailable.id,
// //           quantity: _itemsAvailable.quantity - value.quantity,
// //         };
// //         itemsAvailable[itemToQauntityMap[value.service.id].idx] =
// //           _itemsAvailable;
// //       }
// //     });
// //     data.inventoryLines = inventory;
// //     //3. start transaction
// //     await dataSource.manager.transaction(
// //       "SERIALIZABLE",
// //       async (transactionalEntityManager) => {
// //         //2. update items availability
// //         //2. update items availability
// //         await transactionalEntityManager.save(ItemsStockTrack, stockTrack);
// //         await transactionalEntityManager.save(ItemAvailable, itemsAvailable);
// //         const headerEntry = transactionalEntityManager.create(
// //           SaleHeaders,
// //           data
// //         );
// //         const headerEntryResult = await transactionalEntityManager.save(
// //           SaleHeaders,
// //           headerEntry
// //         );
// //         result = headerEntryResult;
// //       }
// //     );
// //     if (customer.email) {
// //       await invoiceMailer({
// //         customer: customer.name,
// //         txnDate: new Date(data.txnDate).toLocaleDateString(),
// //         txnId: data.code,
// //         mobile: customer.mobile,
// //         subTotal: data.subTotal,
// //         grandTotal: data.grandTotal,
// //         tax: data.totalTax,
// //         discount: data.totalDiscount,
// //         email: customer.email,
// //         itemData: invoiceItems,
// //       });
// //     }
// //     return result;
// //   } catch (error) {
// //     throw error;
// //   }
// // };
// // (""); // Function to create a single sale record with inventory tracking and stock management
// const createBulk = async (data: SaleHeaders, isService: boolean = false) => {
//   try {
//     const repo = await repository();
//     const dataSource = await handler();
//     const itemAvailableRepo = dataSource.getRepository(ItemAvailable);
//     const itemStockTrack = dataSource.getRepository(ItemsStockTrack);

//     // Generate unique sale code
//     data = await generateCode(19, data);
//     let result: SaleHeaders = new SaleHeaders();

//     const invoiceItems: {
//       name: string;
//       quantity: number;
//       unitPrice: number;
//       total: number;
//       tax: number;
//       taxName: string;
//     }[] = [];
//     const inventory: InventoryLines[] = [];
//     const itemIds: number[] = [];
//     const errors: string[] = [];
//     const itemToQuantityMap: Record<
//       number,
//       { quantity: number; name: string; idx: number }
//     > = {};

//     // Fetch customer data
//     const customer = await contactService.findById(data.customer.id);

//     // Prepare invoice items and collect item IDs
//     data.saleLines.forEach(
//       ({ service, quantity, rate, amount, taxAmount, tax }) => {
//         invoiceItems.push({
//           name: service.name,
//           quantity,
//           unitPrice: rate,
//           total: Number(amount),
//           tax: taxAmount,
//           taxName: tax.name,
//         });
//         itemIds.push(service.id);
//       }
//     );

//     // Fetch available stock for items
//     //!fetch only active records
//     const itemsAvailable = await itemAvailableRepo.find({
//       //take only active records for items
//       where: { service: { id: In(itemIds), isInactive: 0 }, isInactive: 0 },
//       relations: { service: true },
//       select: { id: true, quantity: true, service: { id: true, name: true } },
//     });

//     // Map item stock availability
//     itemsAvailable.forEach(({ service, quantity }, index) => {
//       itemToQuantityMap[service.id] = {
//         name: service.name,
//         quantity,
//         idx: index,
//       };
//     });

//     // Validate item availability
//     data.saleLines.forEach(({ service, quantity }) => {
//       if (itemToQuantityMap[service.id]) {
//         if (itemToQuantityMap[service.id].quantity < quantity) {
//           errors.push(
//             `${
//               itemToQuantityMap[service.id].name
//             } is out of stock: available stock is ${
//               itemToQuantityMap[service.id].quantity || 0
//             }`
//           );
//         }
//       } else {
//         errors.push(`${service.name} is out of stock: available stock is 0`);
//       }
//     });

//     if (errors.length) throw { message: errors, statusCode: 409 };
//     const itemRepo = dataSource.getRepository(Services);

//     // Fetch related (active) services with required fields
//     const relatedItems = await itemRepo.find({
//       where: { id: In(itemIds), isInactive: 0 },
//       select: { sku: true, id: true, recordId: true },
//     });

//     // Build mappings for latest service and SKU generation
//     const latestItemMap: Record<number, number> = {};
//     relatedItems.forEach((item) => {
//       latestItemMap[item.recordId] = item.id;
//     });
//     // Fetch stock tracking records
//     const stockMap: Record<
//       number,
//       { id: number; idx: number; availableQuantity: number }
//     > = {};
//     // Fetch stock tracking records for items in the sale, ordered by ID in ascending order
//     //!fetch only active records
//     let stockTrack = await itemStockTrack.find({
//       where: { service: { id: In(itemIds), isInactive: 0 } },
//       order: { id: "ASC" },
//       relations: { service: true },
//     });
//     //create map for stock track records
//     stockTrack.forEach(({ id, quantityUvailable }, index) => {
//       stockMap[id] = { id, idx: index, availableQuantity: quantityUvailable };
//     });

//     // Manage inventory and stock tracking
//     data.saleLines.forEach(
//       ({ service, quantity, createdDate, modifiedDate }) => {
//         let remainingQty = quantity;
//         //get the records only for specific item from stock track
//         let stockEntries = stockTrack.filter(
//           ({ service: stockService }) => stockService.id === service.id
//         );
//         let idx = 0;

//         while (remainingQty > 0) {
//           let stockEntry = stockEntries[idx];
//           let inventoryLine = new InventoryLines();
//           inventoryLine.service = service;
//           inventoryLine.serviceId = latestItemMap[service.recordId];
//           inventoryLine.serviceRecordId = service.id;
//           inventoryLine.createdDate = createdDate;
//           inventoryLine.modifiedDate = modifiedDate;
//           //!make changed here in future if required
//           inventoryLine.stock = stockEntry;

//           let updatedStockQty = stockEntry.quantityUvailable - remainingQty;
//           stockEntry.quantityUvailable = Math.max(updatedStockQty, 0);
//           // stockEntry.serviceId = latestItemMap[service.recordId];
//           // stockEntry.serviceRecordId = service.id;
//           //update the stokc track record at correct position
//           if (stockMap[stockEntry.id]) {
//             stockTrack[stockMap[stockEntry.id].idx] = stockEntry;
//           }

//           inventoryLine.quantity =
//             updatedStockQty < 0
//               ? -(remainingQty + updatedStockQty) // If stock is insufficient, store the fulfilled part.
//               : -remainingQty; // Otherwise, store the entire deducted quantity.
//           inventory.push(inventoryLine);
//           //set the remainig quanoty which will be used in next iteration, stock will be deducted in next iteration
//           remainingQty = updatedStockQty < 0 ? Math.abs(updatedStockQty) : 0;

//           idx++;
//         }

//         // Update available stock
//         if (itemToQuantityMap[service.id]) {
//           let itemIndex = itemToQuantityMap[service.id].idx;
//           itemsAvailable[itemIndex].quantity -= quantity;
//         }
//       }
//     );
//     //data for sale lines already included
//     //add data for inventory lines
//     data.inventoryLines = inventory;

//     // Start transaction
//     await dataSource.manager.transaction(
//       "SERIALIZABLE",
//       async (transactionalEntityManager) => {
//         await transactionalEntityManager.save(ItemsStockTrack, stockTrack);
//         await transactionalEntityManager.save(ItemAvailable, itemsAvailable);
//         const headerEntry = transactionalEntityManager.create(
//           SaleHeaders,
//           data
//         );
//         result = await transactionalEntityManager.save(
//           SaleHeaders,
//           headerEntry
//         );
//       }
//     );

//     // Send invoice email if customer has an email
//     if (customer.email) {
//       await invoiceMailer({
//         customer: customer.name,
//         txnDate: new Date(data.txnDate).toLocaleDateString(),
//         txnId: data.code,
//         mobile: customer.mobile,
//         subTotal: data.subTotal,
//         grandTotal: data.grandTotal,
//         tax: data.totalTax,
//         discount: data.totalDiscount,
//         email: customer.email,
//         itemData: invoiceItems,
//       });
//     }

//     return result;
//   } catch (error) {
//     throw error;
//   }
// };
// const editBulk = async (data: SaleHeaders, isService: boolean = false) => {
//   try {
//     const dataSource = await handler();

//     // Repositories for different entities
//     const headerRepo = dataSource.getRepository(SaleHeaders);
//     const saleLinesRepo = dataSource.getRepository(SaleLines);
//     const itemAvailableRepo = dataSource.getRepository(ItemAvailable);
//     const itemsStockTrackRepo = dataSource.getRepository(ItemsStockTrack);
//     const inventoryLinesRepo = dataSource.getRepository(InventoryLines);

//     // 1. Fetch the active sale header by recordId
//     let headerResponse = await headerRepo.findOne({
//       where: { recordId: data.recordId, isInactive: 0 },
//     });

//     // 2. Fetch all active sale lines for the sale header
//     const saleLines = await saleLinesRepo.find({
//       where: { txnHeaderRecordId: data.recordId, isInactive: 0 },
//     });

//     // 3. Fetch all active inventory lines for the sale header, including their stock details
//     const inventoryLines = await inventoryLinesRepo.find({
//       where: { saleRecordId: data.recordId, isInactive: 0 },
//       relations: { stock: true },
//     });

//     // 4. Build mapping objects for inventory and stock deductions:
//     const inventoryMap: Record<number, number> = {};
//     const stockMap: Record<number, number> = {};
//     inventoryLines.forEach((line) => {
//       // Accumulate deducted quantity per service
//       inventoryMap[line.serviceId] = (inventoryMap[line.serviceId] || 0) + line.quantity;
//       // Accumulate deducted quantity per stock entry
//       stockMap[line.stock.id] = (stockMap[line.stock.id] || 0) + line.quantity;
//     });

//     // 5. Restore available stock by fetching item available records for the affected services
//     const itemAvailable = await itemAvailableRepo.find({
//       where: { serviceId: In(Object.keys(inventoryMap)), isInactive: 0 },
//     });

//     // Build a mapping of available quantity by serviceId
//     const itemAvailableMap: Record<number, number> = {};
//     itemAvailable.forEach((item) => {
//       itemAvailableMap[item.serviceId] = item.quantity;
//     });

//     // For each service, add back the deducted inventory quantity to available stock
//     Object.keys(inventoryMap).forEach((key) => {
//       // Convert key to number if needed
//       const serviceId = Number(key);
//       itemAvailableMap[serviceId] = (itemAvailableMap[serviceId] || 0) + inventoryMap[serviceId];
//     });

//     // Update each item available record with the new quantity from the mapping
//     const itemAvailableUpdate = itemAvailable.map((item) => {
//       item.quantity = itemAvailableMap[item.serviceId];
//       return item;
//     });

//     // 6. Restore stock track records:
//     // Fetch active stock track records for the sale header
//     let itemStockTrack = await itemsStockTrackRepo.find({
//       where: { txnHeaderRecordId: data.recordId, isInactive: 0 },
//     });

//     // For each stock track record, add back the deducted quantity from stockMap
//     itemStockTrack = itemStockTrack.map((stock) => {
//       stock.quantityUvailable = stock.quantityUvailable + (stockMap[stock.id] || 0);
//       return stock;
//     });

//     // 7. Begin transaction to perform rollback and create new sale transaction
//     await dataSource.manager.transaction("SERIALIZABLE", async (manager) => {
//       // Update item available records (restoring stock)
//       await manager.save(ItemAvailable, itemAvailableUpdate);

//       // Mark all sale lines as inactive
//       await manager.save(
//         SaleLines,
//         saleLines.map((line) => {
//           line.isInactive = 1;
//           return line;
//         })
//       );

//       // Save updated stock track records (restoring available quantities)
//       await manager.save(ItemsStockTrack, itemStockTrack);

//       // Mark all inventory lines as inactive
//       await manager.save(
//         InventoryLines,
//         inventoryLines.map((line) => {
//           line.isInactive = 1;
//           return line;
//         })
//       );

//       // Mark the current sale header as inactive
//       headerResponse = await manager.save(SaleHeaders, {
//         ...headerResponse,
//         isInactive: 1,
//       });

//       // Create a new sale transaction by calling createBulk
//       const newSale = await createBulk(
//         {
//           ...data,
//           recordId: headerResponse.recordId,
//           code: headerResponse.code,
//         },
//         true
//       );
//       // Update data with the newly created sale transaction
//       data = newSale;
//     });

//     return data;
//   } catch (error) {
//     throw error;
//   }
// };

// export default { find, findById, create, deleteById, updateById, createBulk,editBulk };

import { FindManyOptions, FindOneOptions, In } from "typeorm";

import { generateCode } from "../../utils/get-object-code.util";
import { handler } from "../../config/dbconfig";
import { City, Country, States } from "../general-data/entities";
import { SaleHeaders } from "./entities/sale-header.entity";
import repository from "./sale-header.repo";
import { InventoryLines } from "./entities/inventory-lines.entity";
import invoiceMailer from "../../services/send-invoice-mail.service";
import customerService from "../customer/customer.service";
import { ItemAvailable } from "./entities/item-stocks.entity";
import itemStocksService from "./item-stocks.service";
import { Services } from "../services/entities/services.entity";
import { ItemsStockTrack } from "../purchase-items/entities/item-stock-track.entity";
import { Customer } from "../customer/entities/customer.entity";
import { Contact } from "../contacts/entities/contact.entity";
import contactService from "../contacts/contact.service";
import companyService from "../company/company.service";
import { dataSource } from "../../app";
import { Company } from "../company/entities/company.entity";
import { CoupounsList } from "../send-coupouns/entities/coupons-list.entity";
import { Request } from "express";
import { AuthenticatedRequest } from "../../types";
import { CustomerVisit } from "./entities/customer-visits.entity";
import { CompanyCredentials } from "../company/entities/company-credentials.entity";

//1. find multiple records
const find = async (filter?: FindManyOptions<SaleHeaders>) => {
  try {
    const repo = await repository();
    return repo.find(filter);
  } catch (error) {
    throw error;
  }
};
//2. find single records
const findById = async (
  id: number,
  filter?: FindOneOptions<SaleHeaders> | FindManyOptions<SaleHeaders>
) => {
  try {
    const repo = await repository();
    const respo = await repo.findOneById(id, filter);
    return respo;
  } catch (error) {
    throw error;
  }
};

//3. create single record
const create = async (data: SaleHeaders, isService: boolean = false) => {
  try {
    const dataSource = await handler();
    const repo = await repository();
    data = await generateCode(19, data);
    const invoiceItems: {
      name: string;
      quantity: number;
      unitPrice: number;
      total: number;
      tax: number;
      taxName: string;
    }[] = [];
    if (data.saleLines.length) {
      data.saleLines.forEach((value) => {
        invoiceItems.push({
          name: value.service.name,
          quantity: value.quantity,
          unitPrice: value.rate,
          total: Number(value.amount),
          tax: value.taxAmount,
          taxName: value.taxGroup.name,
        });
      });
    }
    const respo = await repo.create({
      ...data,
    });
    const custmerRepo = dataSource.getRepository(Contact);
    //get customer data custo
    let customer = await contactService.findById(data.customer.id);

    await custmerRepo.save({
      ...customer,
      lastVisitedDate: new Date().toISOString(),
    });
    if (customer.email) {
      // await invoiceMailer({
      //   customer: customer.name,
      //   txnDate: new Date(data.txnDate).toLocaleDateString(),
      //   txnId: data.code,
      //   mobile: customer.mobile,
      //   subTotal: data.subTotal,
      //   grandTotal: data.grandTotal,
      //   tax: data.totalTax,
      //   discount: data.totalDiscount,
      //   email: customer.email,
      //   itemData: invoiceItems,
      // });
    }

    return respo;
  } catch (error) {
    throw error;
  }
};

//4. update single record by id
const updateById = async (
  id: number,
  data: SaleHeaders,
  isService: boolean = false
) => {
  try {
    const repo = await repository();
    data = await generateCode(19, data);
    const inventory: InventoryLines[] = [];
    if (!isService) {
      data.saleLines.forEach((value) => {
        const il = new InventoryLines();
        (il.service = value.service),
          (il.quantity = value.quantity),
          (il.createdDate = value.createdDate),
          (il.modifiedDate = value.modifiedDate);
        inventory.push(il);
      });
      data.inventoryLines = inventory;
    }
    const respo = await repo.updateById(id, {
      ...data,
    });
    return respo;
  } catch (error) {
    throw error;
  }
};

//5. delete single record by id
const deleteById = async (id: number) => {
  try {
    const repo = await repository();
    await repo.deleteById(id);
  } catch (error) {
    throw error;
  }
};
//3. create single record
const createBulk = async (
  req: AuthenticatedRequest,
  data: SaleHeaders,
  isService: boolean = false
) => {
  const user: any = req.user;
  data = { ...data, companyId: user.companyId };
  try {
    const dataSource = await handler();
    const companyRepo = dataSource.getRepository(Company);
    const couponListRepo = dataSource.getRepository(CoupounsList);
    const customerVisitsRepo = dataSource.getRepository(CustomerVisit);
    const customerVist = new CustomerVisit();
    let foundCoupons: any = new CoupounsList();
    if (data.couponId) {
      foundCoupons = await couponListRepo.findOneBy({
        id: data.couponId,
      });
      if (!foundCoupons) {
        throw { message: "Coupon not found with id: ", statusCode: 404 };
      }
    }
    if (data.paymentTypeId) {
      foundCoupons = await couponListRepo.findOneBy({
        id: data.couponId,
      });
      if (!foundCoupons) {
        throw { message: "Coupon not found with id: ", statusCode: 404 };
      }
    }
    const itemLines = data.saleLines.filter((line) => !line.isService);
    const company = await companyRepo.findOne({
      where: {
        id: user.companyId,
      },
      select: {
        id: true,
        name: true,
        addressLine1: true,
        email: true,
        phoneNumber: true,
        signature: true,
        logo: true,
        gstInNo: true,
      },
    });
    if (!company) {
      throw { message: "Record not found with id: ", statusCode: 404 };
    }
    const companyDetails = {
      companyName: company.name,
      companyAddress: company.addressLine1,
      companyEmail: company.email,
      companyPhone: company.phoneNumber,
      signatureUrl: company.signature,
      logoUrl: company.logo,
      gstNumber: company.gstInNo,
    };

    const itemAvailableRepo = dataSource.getRepository(ItemAvailable);
    const companyCredentialsRepo = dataSource.getRepository(CompanyCredentials);
    const credentials = await companyCredentialsRepo.findOne({
      where: {
        companyId: user.companyId,
        credentialTypeId: 1,
        isInactive: 0,
      },
    });
    const itemStockTrack = dataSource.getRepository(ItemsStockTrack);
    data = await generateCode(19, data);
    let result: SaleHeaders = new SaleHeaders();
    // const invoiceItems: {
    //   name: string;
    //   quantity: number;
    //   unitPrice: number;
    //   total: number;
    //   tax: number;
    //   taxName: string;
    // }[] = [];

    const invoiceDetails = {
      invoiceNumber: data.code,
      invoiceDate: data.txnDate,
      dueDate: data.txnDate,
      subtotal: data.subTotal,
      tax: data.totalTax,
      discount: data.totalDiscount,
      totalPayable: data.grandTotal,
    };

    const newInvoiceItems: {
      description: string;
      quantity: number;
      unitCost: number;
      taxPercentage: string;
      taxAmount: number;
      lineTotal: number;
    }[] = [];
    const inventory: InventoryLines[] = [];
    const itemIds: number[] = [];
    const errors: string[] = [];
    const itemToQauntityMap: {
      [key: number]: {
        quantity: number;
        name: string;
        idx: number;
      };
    } = {};
    //get customer data custo
    let customer = await contactService.findById(data.customer.id);

    const customerDetails = {
      clientName: customer.name,
      //add address onlater on
      clientAddress: customer.address,
      clientCity: customer?.city?.name,
      clientState: customer?.state?.name,
      //add zop code in customer
      clientZip: customer.zipCode,
      clientEmail: customer.email,
    };
    data.saleLines.forEach((value) => {
      newInvoiceItems.push({
        description: value?.service?.name,
        quantity: value?.quantity,
        unitCost: value.rate,
        taxPercentage: value?.taxGroup?.name,
        taxAmount: value.taxAmount,
        lineTotal: Number(value.amount),
      });
    });
    console.log("check 1");
    itemLines.forEach((value) => {
      // invoiceItems.push({
      //   name: value.service.name,
      //   quantity: value.quantity,
      //   unitPrice: value.rate,
      //   total: Number(value.amount),
      //   tax: value.taxAmount,
      //   taxName: value.tax.name,
      // });
      // newInvoiceItems.push({
      //   description: value?.service?.name,
      //   quantity: value?.quantity,
      //   unitCost: value.rate,
      //   taxPercentage: value?.tax?.name,
      //   taxAmount: value.taxAmount,
      //   lineTotal: Number(value.amount),
      // });
      itemIds.push(value.service.id);
    });
    console.log("check 2");
    // get items available as per item demand
    let itemsAvailable = await itemAvailableRepo.find({
      where: {
        service: {
          id: In(itemIds),
        },
      },
      relations: {
        service: true,
      },
      select: {
        id: true,
        quantity: true,
        service: {
          id: true,
          name: true,
        },
      },
    });
    //add data to map
    console.log("check 3");
    itemsAvailable.forEach((val, index) => {
      itemToQauntityMap[val.service.id] = {
        name: val.service.name,
        quantity: val.quantity,
        idx: index,
      };
    });
    //check availabilty
    console.log("check 4");
    itemLines.forEach((value) => {
      if (itemToQauntityMap[value.service.id]) {
        if (itemToQauntityMap[value.service.id]?.quantity < value.quantity) {
          errors.push(
            `${
              itemToQauntityMap[value.service.id].name
            } is out of stock : available stock is ${
              itemToQauntityMap[value.service.id]?.quantity
                ? itemToQauntityMap[value.service.id]?.quantity
                : 0
            }`
          );
        }
      } else {
        errors.push(
          `${value.service.name} is out of stock : available stock is ${0}`
        );
      }
    });
    //throw error if applicable
    if (errors.length) {
      throw { message: errors, statusCode: 409 };
    }
    //get related stock track records
    const stockMap: {
      [key: number]: {
        id: number;
        idx: number;
        aQuanity: number;
      };
    } = {};
    console.log("check 5");
    let stockTrack = await itemStockTrack.find({
      where: {
        service: {
          id: In(itemIds),
        },
      },
      order: {
        id: "ASC",
      },
      relations: {
        service: true,
      },
    });
    console.log("check 6");
    stockTrack.forEach((val, index) => {
      stockMap[val.id] = {
        id: val.id,
        idx: index,
        aQuanity: val?.quantityUvailable,
      };
    });
    console.log("check 7");
    itemLines.forEach((value) => {
      //1. filter out stock entries for each item
      let idx = 0;
      let itmRemain = value.quantity;
      let uvailableForItem = stockTrack.filter(
        (val) => val.service.id === value.service.id
      );
      while (itmRemain) {
        //1. update current entry
        let _uvailableForItem = uvailableForItem[idx];
        //create inventory records here
        const il = new InventoryLines();
        il.service = value.service;

        il.createdDate = value.createdDate;
        il.modifiedDate = value.modifiedDate;
        il.stock = _uvailableForItem;
        let sold = _uvailableForItem.quantityUvailable - itmRemain;
        _uvailableForItem = {
          ..._uvailableForItem,
          quantityUvailable: sold > 0 ? sold : 0,
        };
        if (stockMap[_uvailableForItem.id]) {
          stockTrack[stockMap[_uvailableForItem.id].idx] = _uvailableForItem;
        }
        if (sold < 0) {
          il.quantity = -Number(itmRemain + sold);
          inventory.push(il);
          itmRemain = Math.abs(sold);
        } else {
          il.quantity = -Number(itmRemain);
          inventory.push(il);
          itmRemain = 0;
        }
        idx++;
      }

      //decrease item availabilty
      if (itemToQauntityMap[value.service.id]) {
        let _itemsAvailable =
          itemsAvailable[itemToQauntityMap[value.service.id].idx];
        _itemsAvailable = {
          ..._itemsAvailable,
          id: _itemsAvailable.id,
          quantity: _itemsAvailable.quantity - value.quantity,
        };
        itemsAvailable[itemToQauntityMap[value.service.id].idx] =
          _itemsAvailable;
      }
    });
    console.log("check 8");
    data.inventoryLines = inventory;
    //3. start transaction
    await dataSource.manager.transaction(
      "SERIALIZABLE",
      async (transactionalEntityManager) => {
        //2. update items availability
        //2. update items availability
        console.log("check 9");
        await transactionalEntityManager.save(ItemsStockTrack, stockTrack);
        await transactionalEntityManager.save(ItemAvailable, itemsAvailable);
        //set last visited date
        await transactionalEntityManager.save(Contact, {
          ...customer,
          lastVisitedDate: new Date().toISOString(),
        });

        if (foundCoupons) {
          await transactionalEntityManager.save(CoupounsList, {
            ...foundCoupons,
            isUsed: 1,
          });
        }

        foundCoupons;
        const headerEntry = transactionalEntityManager.create(
          SaleHeaders,
          data
        );
        const headerEntryResult = await transactionalEntityManager.save(
          SaleHeaders,
          headerEntry
        );
        result = headerEntryResult;
      }
    );
    console.log("check 10");
    //get company credentials for company

    if (customer && credentials) {
      // await invoiceMailer({
      //   customer: customer.name,
      //   txnDate: new Date(data.txnDate).toLocaleDateString(),
      //   txnId: data.code,
      //   mobile: customer.mobile,
      //   subTotal: data.subTotal,
      //   grandTotal: data.grandTotal,
      //   tax: data.totalTax,
      //   discount: data.totalDiscount,
      //   email: customer.email,
      //   itemData: invoiceItems,
      // });
      await invoiceMailer({
        ...companyDetails,
        ...invoiceDetails,
        ...customerDetails,
        items: newInvoiceItems,
        credentials: {
          mailerHost: credentials.host,
          mailerPort: credentials.port,
          mailerUsername: credentials.userName,
          mailerPassword: credentials.password,
        },
      });
    }
    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
//create service which will get saleHeader information based on id also its lines

const saleInvoiceData = async (id: number) => {
  try {
    const data = await findById(id, {
      relations: {
        saleLines: {
          service: true,
          taxGroup: true,
        },
        customer: {
          state: true,
          country: true,
          city: true,
        },
      },
    });
    // //use company id from    const dataSource = await handler(); user req object later on
    const dataSource = await handler();
    const companyRepo = dataSource.getRepository(Company);
    const company = await companyRepo.findOne({
      where: {
        id: data.companyId,
      },
      select: {
        id: true,
        name: true,
        addressLine1: true,
        email: true,
        phoneNumber: true,
        signature: true,
        logo: true,
        gstInNo:true
      },
    });

    if (!company) {
      throw { message: "Record not found with id: " + id, statusCode: 404 };
    }
    const invoiceItems = data.saleLines.map((line) => ({
      description: line?.service?.name,
      quantity: line?.quantity,
      unitCost: line.rate,
      taxPercentage: line?.taxGroup?.name,
      taxAmount: line.taxAmount,
      lineTotal: Number(line.amount),
    }));

    const companyDetails = {
      companyName: company.name,
      companyAddress: company.addressLine1,
      companyEmail: company.email,
      companyPhone: company.phoneNumber,
      signatureUrl: company.signature,
      logoUrl: company.logo,
      gstNumber:company.gstInNo
    };
    const invoiceDetails = {
      invoiceNumber: data.code,
      invoiceDate: data.txnDate,
      dueDate: data.txnDate,
      subtotal: data.subTotal,
      tax: data.totalTax,
      discount: data.totalDiscount,
      totalPayable: data.grandTotal,
    };
    const customerDetails = {
      clientName: data.customer.name,
      //add address onlater on
      clientAddress: data.customer.address,
      clientCity: data?.customer?.city?.name,
      clientState: data?.customer?.state?.name,
      //add zop code in customer
      clientZip: data?.customer.zipCode,
      clientEmail: data.customer.email,
    };
    const finalData = {
      data: {
        ...companyDetails,
        ...invoiceDetails,
        ...customerDetails,
        items: invoiceItems,
      },
    };

    return finalData;
  } catch (error) {
    throw error;
  }
};

export default {
  find,
  findById,
  create,
  deleteById,
  updateById,
  createBulk,
  saleInvoiceData,
};
