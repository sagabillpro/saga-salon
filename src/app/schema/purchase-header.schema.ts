export const PurchaseHeadersSchema: any = {
  type: "object",
  properties: {
    id: {
      type: "integer",
    },
    code: {
      type: "string",
    },
    description: {
      type: "string",
    },
    txnDate: {
      type: "string",
    },
    subTotal: {
      type: "number", // Changed to number for decimals
    },
    grandTotal: {
      type: "number", // Changed to number for decimals
    },
    totalDiscount: {
      type: "number", // Changed to number for decimals
    },
    totalTax: {
      type: "number", // Changed to number for decimals
    },
    totalCgst: {
      type: "number", // Changed to number for decimals
    },
    totalSgst: {
      type: "number", // Changed to number for decimals
    },
    totalIgst: {
      type: "number", // Changed to number for decimals
    },
    createdDate: {
      type: "string",
      format: "date-time",
    },
    modifiedDate: {
      type: "string",
      format: "date-time",
    },
    saleInvoiceNumber: {
      type: "string",
    },
    supplier: {
      type: "object",
      properties: {
        id: { type: "integer" },
        //  name: { type: "string" },
      },
      // required: ["id", "name"],
      additionalProperties: false,
    },
    supplierId: {
      type: "integer",
    },
    userId: {
      type: "integer",
    },
    paymentTypeId: {
      type: "integer",
    },
    purchaseLines: {
      type: "array",
      items: {
        type: "object",
        properties: {
          taxGroupComponents: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: {
                  type: "integer",
                  minimum: 1,
                },
                name: {
                  type: "string",
                  minLength: 1,
                },
                percentage: {
                  type: "number",
                  minimum: 0,
                  maximum: 100,
                },
                taxAmount: {
                  type: "number",
                  minimum: 0,
                },
              },
              required: ["id", "name", "percentage", "taxAmount"],
              additionalProperties: false,
            },
          },
          hallMarkDetails: {
            type: "object",
            properties: {
              rate: {
                type: "number",
              },
              taxGroupComponents: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: {
                      type: "integer",
                      minimum: 1,
                    },
                    name: {
                      type: "string",
                      minLength: 1,
                    },
                    percentage: {
                      type: "number",
                      minimum: 0,
                      maximum: 100,
                    },
                    taxAmount: {
                      type: "number",
                      minimum: 0,
                    },
                  },
                  required: ["id", "name", "percentage", "taxAmount"],
                  additionalProperties: false,
                },
              },
            },
            required: ["rate", "taxGroupComponents"],
          },
          txnHeader: {
            type: "object",
            properties: {
              id: {
                type: "integer",
              },
            },
            required: ["id"],
            additionalProperties: false,
          },
          service: {
            type: "object",
            properties: {
              id: {
                type: "integer",
              },
              name: {
                type: "string",
              },
            },
            required: ["id", "name"],
            additionalProperties: false,
          },
          taxGroup: {
            type: "object",
            properties: {
              id: {
                type: "integer",
              },
              name: {
                type: "string",
              },
              rate: {
                type: "number", // Changed to number for decimals (if needed)
              },
            },
            required: ["id", "name"],
            additionalProperties: false,
          },
          id: {
            type: "integer",
          },
          amount: {
            type: "number", // Changed to number for decimals
          },
          quantity: {
            type: "integer",
          },
          unitPrice: {
            type: "number",
          },
          costPrice: {
            type: "number", // Changed to number for decimals
          },
          huid: {
            type: "string", // Changed to number for decimals
          },
          karat: {
            type: "string", // Changed to number for decimals
          },
          makingChargeRs: {
            type: "number", // Changed to number for decimals
          },
          makingChargePercentage: {
            type: "number", // Changed to number for decimals
          },
          uom: {
            type: "object",
            properties: {
              id: { type: "integer" },
              name: { type: "string" },
            },
            required: ["id", "name"],
            additionalProperties: false,
          },
          uomId: { type: "number" },
          discountAmount: {
            type: "number", // Changed to number for decimals
          },
          taxAmount: {
            type: "number", // Changed to number for decimals
          },
          rate: {
            type: "number", // Changed to number for decimals
          },
          createdDate: {
            type: "string",
            format: "date-time",
          },
          modifiedDate: {
            type: "string",
            format: "date-time",
          },
          isService: { type: "integer" },
        },
        required: [
          "hallMarkDetails",
          "taxGroupComponents",
          "service",
          "amount",
          "createdDate",
          "modifiedDate",
          "taxGroup",
          "quantity",
          "rate",
        ],
        additionalProperties: false,
      },
    },
  },
  required: [
    "txnDate",
    "grandTotal",
    "createdDate",
    "modifiedDate",
    "supplier",
    "userId",
    "paymentTypeId",
    "purchaseLines",
    "subTotal",
    "totalDiscount",
    "totalTax",
  ],
  additionalProperties: false,
};
