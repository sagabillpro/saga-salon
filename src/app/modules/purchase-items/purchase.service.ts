import { FindManyOptions, FindOneOptions, In } from "typeorm";

import { generateCode } from "../../utils/get-object-code.util";
import { handler } from "../../config/dbconfig";
import { City, Country, States } from "../general-data/entities";
import repository from "./purchase.repo";
import { PurchaseHeaders } from "./entities/purchase-headers.entity";
import { InventoryLines } from "../sale-items/entities/inventory-lines.entity";
import { ItemAvailable } from "../sale-items/entities/item-stocks.entity";
import itemStocksService from "../sale-items/item-stocks.service";
import { Services } from "../services/entities/services.entity";
import { ItemsStockTrack } from "./entities/item-stock-track.entity";
import generateUniqueNumber from "../../utils/getuniquenumber.util";
import { AuthenticatedRequest } from "../../types";
import { Company } from "../company/entities/company.entity";

//1. find multiple records
const find = async (filter?: FindManyOptions<PurchaseHeaders>) => {
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
  filter?: FindOneOptions<PurchaseHeaders> | FindManyOptions<PurchaseHeaders>
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
const create = async (data: PurchaseHeaders, isService: boolean = false) => {
  try {
    const repo = await repository();
    const dataSource = await handler();
    const itemStocksRepo = dataSource.getRepository(ItemAvailable);
    data = await generateCode(20, data);
    const itemIds: number[] = [];
    const inventory: InventoryLines[] = [];

    // check if lenght applicable
    if (data.purchaseLines.length) {
    }
    if (!isService) {
      data.purchaseLines.forEach((value) => {
        const il = new InventoryLines();
        (il.service = value.service),
          (il.quantity = -Number(value.quantity)),
          (il.createdDate = value.createdDate),
          (il.modifiedDate = value.modifiedDate);
        itemIds.push(value.service.id);
        inventory.push(il);
      });
      data.inventoryLines = inventory;
      // create stock elements
      const resultItemStock = await itemStocksService.create(
        inventory,
        itemIds
      );
      const itemStockResponse = itemStocksRepo.create(resultItemStock);
      await itemStocksRepo.save(itemStockResponse);
    }
    const respo = repo.create({
      ...data,
    });
    return respo;
  } catch (error) {
    throw error;
  }
};

//4. update single record by id
const updateById = async (
  id: number,
  data: PurchaseHeaders,
  isService: boolean = false
) => {
  try {
    const repo = await repository();
    data = await generateCode(20, data);
    const inventory: InventoryLines[] = [];
    if (!isService) {
      data.purchaseLines.forEach((value) => {
        const il = new InventoryLines();
        (il.service = value.service),
          (il.quantity = -Number(value.quantity)),
          (il.createdDate = value.createdDate),
          (il.modifiedDate = value.modifiedDate);
        inventory.push(il);
      });
      data.inventoryLines = inventory;
    }
    const respo = repo.updateById(id, {
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
const createBulk = async (req: AuthenticatedRequest, data: PurchaseHeaders) => {
  try {
    const user: any = req.user;
    const dataSource = await handler();
    data = await generateCode(20, data);
    const itemIds: number[] = [];
    const inventory: InventoryLines[] = [];
    const itemRepo = dataSource.getRepository(Services);

    data.purchaseLines.forEach((value) => {
      itemIds.push(value.service.id);
    });
    //. 1.create itemId and sku mapping
    const skuMap: {
      [key: number]: string;
    } = {};
    //2. get related items only
    const relatedItems = await itemRepo.find({
      where: {
        id: In(itemIds),
      },
      select: {
        sku: true,
        id: true,
      },
    });
    //3. create sku mapping for future
    relatedItems.forEach((val) => {
      skuMap[val.id] = val.sku + "-" + generateUniqueNumber();
    });
    //3. start transaction
    console.log("pass1 ");
    await dataSource.manager.transaction(
      "SERIALIZABLE",
      async (transactionalEntityManager) => {
        const headerEntry = transactionalEntityManager.create(PurchaseHeaders, {
          ...data,
          companyId: user.companyId,
        });
        console.log("pass2");
        console.log("headerEntry", headerEntry);
        // ************** A) stock logic start ************************************************************
        const stockEntries: ItemsStockTrack[] = [];
        //1. create Stock and save stock
        console.log("pass3 ");

        data.purchaseLines.forEach((value) => {
          const stockInstance = new ItemsStockTrack();
          stockInstance.createdDate = value.createdDate;
          stockInstance.modifiedDate = value.modifiedDate;
          stockInstance.quantityAdded = value.quantity;
          stockInstance.unitPrice = value.unitPrice;
          stockInstance.serviceId = value.service.id;
          stockInstance.quantityUvailable = value.quantity;
          stockInstance.txnHeaderId = headerEntry.id;
          stockInstance.stockNumber = skuMap[value.service.id];
          stockInstance.companyId = user.companyId;
          stockEntries.push(stockInstance);
        });
        const itemIdStockMap: {
          [key: number]: number;
        } = {};
        console.log("pass4");

        const stockTrackEntry = transactionalEntityManager.create(
          ItemsStockTrack,
          stockEntries
        );
        console.log("pass5");

        //2. update items availability
        const stockTrackResult = await transactionalEntityManager.save(
          ItemsStockTrack,
          stockTrackEntry
        );
        console.log("pass6");

        // add entries into mapping object
        stockTrackResult.forEach((val) => {
          itemIdStockMap[val.serviceId] = val.id;
        });
        //************** stock logic end ***********************************************************************/

        //**************** B) inventory lodic start **********************************************************
        //2. create inventory
        console.log("pass7");
        data.purchaseLines.forEach((value) => {
          const il = new InventoryLines();
          il.serviceId = value.service.id;
          il.quantity = Number(value.quantity);
          il.createdDate = value.createdDate;
          il.modifiedDate = value.modifiedDate;
          il.purchaseId = headerEntry.id;
          il.stockId = itemIdStockMap[value.service.id];
          inventory.push(il);
        });
        console.log("pass8");
        //attch the object to inventory
        headerEntry.inventoryLines = inventory;
        // *************** inventory lodic end  *********************************************************

        // *************** C) item available start ********************************************************
        //1. create stock elements
        console.log("pass9");
        const resultItemAvailable = await itemStocksService.create(
          inventory,
          itemIds
        );
        console.log("pass10");
        const itemAvailableEntry = transactionalEntityManager.create(
          ItemAvailable,
          resultItemAvailable
        );
        //2. update items availability
        await transactionalEntityManager.save(
          ItemAvailable,
          itemAvailableEntry
        );
        // *************** item available end ********************************************************

        //********** D) header entry save start ***************/
        const headerEntryResult = await transactionalEntityManager.save(
          PurchaseHeaders,
          headerEntry
        );
        //loop through stockTrackResult and update txnHeaderId
        stockTrackResult.forEach((val) => {
          val.txnHeaderId = headerEntryResult.id;
        });
        //update stockTrackResult with new txnHeaderId
        await transactionalEntityManager.save(
          ItemsStockTrack,
          stockTrackResult
        );
        //loop through itemAvailableEntry and update txnHeaderId
        //********** header entry save end *********************************************************************/
        data = headerEntryResult;
      }
    );
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

//create service which will get purchaseHeader information based on id also its lines
const purchaseInvoiceData = async (id: number) => {
  try {
    const data = await findById(id, {
      relations: {
        purchaseLines: {
          service: true,
          taxGroup: true,
        },
        supplier: {
          state: true,
          country: true,
          city: true,
        },
      },
    });

    const dataSource = await handler();
    const companyRepo = dataSource.getRepository(Company);
    const company = await companyRepo.findOne({
      where: {
        id: 40,
      },
      select: {
        id: true,
        name: true,
        addressLine1: true,
        email: true,
        phoneNumber: true,
        signature: true,
        logo: true,
      },
    });

    if (!company) {
      throw { message: "Company record not found", statusCode: 404 };
    }

    const invoiceItems = data.purchaseLines.map((line) => ({
      description: line?.service?.name,
      quantity: line?.quantity,
      unitCost: line.unitPrice,
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

    const supplierDetails = {
      supplierName: data.supplier.name,
      supplierAddress: data.supplier.address,
      supplierCity: data?.supplier?.city?.name,
      supplierState: data?.supplier?.state?.name,
      supplierZip: data?.supplier.zipCode,
      supplierEmail: data.supplier.email,
    };

    const finalData = {
      data: {
        ...companyDetails,
        ...invoiceDetails,
        ...supplierDetails,
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
  purchaseInvoiceData,
};
