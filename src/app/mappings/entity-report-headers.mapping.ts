import { getWorksheetColumnsFromSchema } from "../utils/get-report-headers.util";

/* eslint-disable @typescript-eslint/no-explicit-any */
const FilterSchemaMapping: Record<string, any> = {
  10: {
    URL: "item-stock-report",
    tableHeader: [
      {
        header: "Stock Number",
        accessorKey: "stockNumber",
      },
      {
        header: "Item Name",
        accessorKey: "service.name",
      },
      {
        header: "Stock Added Date",
        accessorKey: "createdDate",
        type: "date",
      },
      {
        header: "Added Quantity",
        accessorKey: "quantityAdded",
      },
      {
        header: "Available Quantity",
        accessorKey: "quantityUvailable",
      },
    ],
  },
  11: {
    URL: "/profit-loss-report",

    tableHeader: [
      {
        header: "Stock Number",
        accessorKey: "stockNumber",
      },
      {
        header: "Sale Amount",
        accessorKey: "soldAmount",
      },
      {
        header: "Purchase Cost",
        accessorKey: "purchaseAmount",
      },
      {
        header: "Profit or Loss",
        accessorKey: "profit",
      },
    ],
  },
  12: {
    URL: "/sale-report",
    tableHeader: [
      {
        header: "Code",
        accessorKey: "code",
      },
      {
        header: "TXN Date",
        accessorKey: "txnDate",
      },
      {
        header: "Item Name",
        accessorKey: "serviceName",
      },
      {
        header: "Qauntity Sold",
        accessorKey: "totalQuantity",
      },
      {
        header: "Average Rate",
        accessorKey: "averageRate",
      },
      {
        header: "Unit Price",
        accessorKey: "averageUnitPrice",
      },
      {
        header: "Total Amount",
        accessorKey: "totalAmount",
      },
    ],
  },
  13: {
    URL: "/service-sale-revenue-report",
    tableHeader: [
      {
        header: "Service",
        accessorKey: "name",
      },
      {
        header: "Total Quantity",
        accessorKey: "totalQuantity",
      },
      {
        header: "Total Sale Amount",
        accessorKey: "totalSaleAmount",
      },
      {
        header: "Total Tax Amount",
        accessorKey: "totalTaxAmount",
      },
      {
        header: "Total Discount Amount",
        accessorKey: "totalDiscountAmount",
      },
      {
        header: "Grand Total",
        accessorKey: "grandTotal",
      },
    ],
  },
  14: {
    URL: "/item-sale-revenue-report",
    tableHeader: [
      {
        header: "Service",
        accessorKey: "name",
      },
      {
        header: "Total Quantity",
        accessorKey: "totalQuantity",
      },
      {
        header: "Total Sale Amount",
        accessorKey: "totalSaleAmount",
      },
      {
        header: "Total Tax Amount",
        accessorKey: "totalTaxAmount",
      },
      {
        header: "Total Discount Amount",
        accessorKey: "totalDiscountAmount",
      },
      {
        header: "Grand Total",
        accessorKey: "grandTotal",
      },
    ],
  },
  15: {
    URL: "item-remain-report",
    tableHeader: [
      {
        header: "Item Name",
        accessorKey: "service.name",
      },

      {
        header: "Available Quantity",
        accessorKey: "quantity",
      },
    ],
  },
};
export default FilterSchemaMapping;
