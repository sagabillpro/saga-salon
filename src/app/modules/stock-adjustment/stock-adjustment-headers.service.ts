import { FindManyOptions, FindOneOptions, In, Not } from "typeorm";
import { generateCode } from "../../utils/get-object-code.util";
import repository from "./stock-adjustment-headers.repo";

import { StockAdjustmentHeaders } from "./entities/stock-adjustment-headers.entity";
import { handler } from "../../config/dbconfig";
import { ItemsStockTrack } from "../purchase-items/entities/item-stock-track.entity";
import { pipeline } from "stream";
import ExcelJS from "exceljs";
import { PassThrough } from "stream";

import { Request, Response } from "express";
import { getWorksheetColumnsFromSchema } from "../../utils/get-report-headers.util";
import { PurchaseHeaders } from "../purchase-items/entities/purchase-headers.entity";
import { AuthenticatedRequest } from "../../types";
import { StockAdjustmentLines } from "./entities/stock-adjustment-lines.entity";
import { InventoryLines } from "../sale-items/entities/inventory-lines.entity";
import { ItemAvailable } from "../sale-items/entities/item-stocks.entity";
//1. find multiple records
const find = async (filter?: FindManyOptions<StockAdjustmentHeaders>) => {
  try {
    const repo = await repository();
    return repo.find(filter);
  } catch (error) {
    throw error;
  }
};

//1. find multiple records
const findStocks = async (id: number, companyId: number) => {
  try {
    const dataSource = await handler();
    const stockRepo = dataSource.getRepository(ItemsStockTrack);
    const stockResponse = await stockRepo.find({
      where: {
        ...(id ? { serviceId: id } : {}),
        isInactive: 0,
        companyId: companyId,
      },
      select: {
        id: true,
        createdDate: true,
        modifiedDate: true,
        quantityAdded: true,
        quantityUvailable: true,
        unitPrice: true,
        txnHeaderId:true,
        stockNumber: true,
        service: {
          name: true,
          id: true,
        },
        txnHeader: {
          id: true,
          code: true,
        },
      },
      relations: {
        service: true,
        txnHeader: true,
      },
    });

    const groupedData = stockResponse.reduce((acc: any, item: any) => {
      const serviceName = item.service.name;

      // Check if service name already exists
      const existingGroup: any = acc.find(
        (group: any) => group.name === serviceName
      );

      if (existingGroup) {
        existingGroup.items.push(item);
      } else {
        acc.push({
          name: serviceName,
          items: [item],
        });
      }

      return acc;
    }, []);
    return groupedData;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
const create = async (
  req: AuthenticatedRequest,
  adjustmentLinesData: StockAdjustmentLines[]
) => {
  try {
    // // Extract authenticated user
    const user: any = req.user;
    // // Get the data source instance
    const dataSource = await handler();
    let data = new StockAdjustmentHeaders();
    // Create a new header entry for the stock adjustment
    let headerEntry = new StockAdjustmentHeaders();
    headerEntry.txnDate = new Date().toLocaleDateString();
    headerEntry.createdById = user?.userId;
    headerEntry.modifiedById = user?.userId;
    headerEntry.transactionStatusId = 2;
    headerEntry.companyId = user?.companyId;
    // Repositories for item available and stock track records
    const itemAvailableRepo = dataSource.getRepository(ItemAvailable);
    const itemsStockTrackRepo = dataSource.getRepository(ItemsStockTrack);

    // Arrays to hold new inventory lines and final updated records
    const inventoryLines: InventoryLines[] = [];
    const finalItemAvailable: ItemAvailable[] = [];
    const finalItemStockTrack: ItemsStockTrack[] = [];

    // Create an array to store the service IDs from the adjustment lines
    const selectedServiceIds: number[] = [];

    // Loop through each adjustment line to create inventory line entries
    adjustmentLinesData.forEach((line) => {
      const inventory = new InventoryLines();
      // Collect service id for later queries
      selectedServiceIds.push(line.serviceId);
      // Set the inventory line's properties based on the adjustment line
      inventory.quantity = line.finalVariation;
      inventory.stockId = line.stockId;
      inventory.serviceId = line.serviceId;
      inventory.createdDate = new Date().toISOString();
      inventory.modifiedDate = new Date().toISOString();
      inventoryLines.push(inventory);
    });

    // Fetch the current available items for the selected service IDs
    const itemsAvailable = await itemAvailableRepo.find({
      where: { service: { id: In(selectedServiceIds) } },
      select: { id: true, quantity: true, serviceId: true },
    });

    // Fetch current stock tracking records for the selected service IDs
    const stockTracks = await itemsStockTrackRepo.find({
      where: { serviceId: In(selectedServiceIds) },
    });
    console.log("check1");
    // Create mapping from serviceId to itemAvailable record
    const itemAvailableMap: { [key: number]: ItemAvailable } = {};
    itemsAvailable.forEach((item) => {
      console.log("check2  inned", item);
      itemAvailableMap[item.serviceId] = item;
    });
    console.log("check2", itemAvailableMap);
    // Create mapping from stock track id to stock track record
    const stockTrackMap: { [key: number]: ItemsStockTrack } = {};
    stockTracks.forEach((track) => {
      stockTrackMap[track.id] = track;
    });
    console.log("check3");
    // Build a final mapping for each service: sum up the final variation
    // (there might be multiple adjustment lines per service)
    const finalMapping: { [key: number]: number } = {};
    adjustmentLinesData.forEach((line) => {
      const currentTotal = finalMapping[line.serviceId] || 0;
      finalMapping[line.serviceId] = currentTotal + line.finalVariation;
    });
    console.log("check4");
    // Update the quantity of each item available using the final mapping.
    for (const [serviceIdStr, totalFinalVariation] of Object.entries(
      finalMapping
    )) {
      const serviceId = Number(serviceIdStr);
      const itemAvailable = itemAvailableMap[serviceId];
      console.log("check5", itemAvailableMap);
      console.log("check6", itemAvailable);
      // Update quantity by adding the total variation from adjustments
      itemAvailable.quantity += totalFinalVariation;
      finalItemAvailable.push(itemAvailable);
    }

    // Update each stock track record with the new quantities from adjustment lines.
    // Assuming each adjustment line corresponds to a specific stock track entry (using record id).
    console.log("check7");
    adjustmentLinesData.forEach((line) => {
      const track = stockTrackMap[line.stockId];
      // Update the track record with new quantities (assumed to be provided in the adjustment line)
      track.quantityAdded = line.quantityAddedNew;
      track.quantityUvailable = line.quantityUvailableNew;
      finalItemStockTrack.push(track);
    });
    console.log("check8");
    // Start a transaction to save header and related updates
    await dataSource.manager.transaction(
      "SERIALIZABLE",
      async (transactionalEntityManager) => {
        // Optionally generate a code for the header (assumed generateCode returns a modified header)
        headerEntry = await generateCode(30, headerEntry);
        headerEntry.inventoryLines = inventoryLines;
        headerEntry.stockAdjustmentLines = adjustmentLinesData;
        // Create the header entry (here you might want to pass headerEntry, not adjustmentLines)
        const createdHeader = transactionalEntityManager.create(
          StockAdjustmentHeaders,
          headerEntry
        );
        // Save the header entry
        data = await transactionalEntityManager.save(
          StockAdjustmentHeaders,
          createdHeader
        );
        console.log("check9");
        transactionalEntityManager.save(ItemAvailable, finalItemAvailable);
        transactionalEntityManager.save(ItemsStockTrack, finalItemStockTrack);
      }
    );

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const exportUsersToExcel = async (req: Request, res: Response) => {
  try {
    const dataSource = await handler();
    const stockRepo = dataSource.getRepository(ItemsStockTrack);
    const stockResponse = await stockRepo.find({
      where: {
        isInactive: 0,
      },
      select: {
        id: true,
        createdDate: true,
        modifiedDate: true,
        quantityAdded: true,
        quantityUvailable: true,
        unitPrice: true,
        stockNumber: true,
        service: {
          name: true,
          id: true,
        },
      },
      relations: {
        service: true,
      },
    });
    // 2. Create a new Excel workbook and worksheet
    const workbook = new ExcelJS.Workbook();

    let worksheet = workbook.addWorksheet("Report");
    worksheet = getWorksheetColumnsFromSchema(10, worksheet, stockResponse);
    console.log("worksheet", worksheet);
    // 5. Stream the Excel file as a response
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Report_${Date.now()}.xlsx`
    );

    // 6. Use stream for better performance with large datasets
    const stream = new PassThrough();
    await workbook.xlsx.write(stream);

    // 7. Pipe the stream directly to the response
    stream.pipe(res);
  } catch (error) {
    console.error("Error exporting data to Excel:", error);
    res.status(500).json({ message: "Error generating Excel file" });
  }
};
//1. find multiple records
const findStockByPurchase = async (id: number) => {
  try {
    // const dataSource = await handler();
    // const repo = dataSource.getRepository(PurchaseHeaders);
    // const itemStockTrackRepo = dataSource.getRepository(ItemsStockTrack);
    // const item = await repo.findOne({
    //   where: {
    //     id: Number(id),
    //   },
    // });
    // if (!item) {
    //   throw { message: "Record not found with id: " + id, statusCode: 404 };
    // }
    // const foundStocks = await itemStockTrackRepo.find({
    //   where: {
    //     txnHeaderId: item.id,
    //   },
    //   relations: {
    //     service: true,
    //   },
    //   select: {
    //     id: true,
    //     stockNumber: true,
    //     service: {
    //       id: true,
    //       name: true,
    //     },
    //     txnHeader: {
    //       id: true,
    //       code: true,
    //       txnDate: true,
    //     },
    //   },
    // });
    // const finalData = foundStocks.map((found) => {
    //   return {
    //     stockNumber: found.stockNumber,
    //     item: found.service.name,
    //     purchaseDate: found.txnHeader.txnDate,
    //   };
    // });
    // return finalData;
    const data = [
      {
        stockNumber: "STK-001",
        purchaseDate: "2024-12-26",
        item: "ABC1 - Some very long item name that might overflow",
      },
      {
        stockNumber: "STK-002",
        purchaseDate: "2024-12-27",
        item: "ABC2 - Another long item description",
      },
      { stockNumber: "STK-003", purchaseDate: "2024-12-28", item: "ABC3" },
    ];

    return data;
  } catch (error) {
    throw error;
  }
};
export default {
  find,
  create,
  findStocks,
  exportUsersToExcel,
  findStockByPurchase,
};
