import { NextFunction, Request, Response, Router } from "express";
import { Route } from "../../routes/routes.types";
import { validateFilter } from "../../utils/validate-filter.util";
import getQuery from "../../utils/get-query.util";

import saleHeaderService from "./sale-header.service";
import { SaleHeaders } from "./entities/sale-header.entity";
import { validateBodyManual } from "../../utils/validate-req-body.util";
import { SaleHeadersSchema } from "../../schema/sale-header.schema";
// import wkhtmltopdf from "wkhtmltopdf";
import path from "path";
import ejs from "ejs";
import getQuerySecure from "../../utils/get-query-secure.util";
import authenticateToken from "../../middlewares/authenticate.middleware";
const router = Router();

router.get(
  "/",
  authenticateToken,
  validateFilter(SaleHeaders),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await saleHeaderService.find(
        await getQuerySecure(req, SaleHeaders)
      );
      res.send(result);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/",
  authenticateToken,
  validateBodyManual(SaleHeadersSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await saleHeaderService.create(req.body);
      res.send(result);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/:id",
  authenticateToken,
  // validateFilter(SaleHeaders),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const result = await saleHeaderService.findById(
        id,
        await getQuery(req, SaleHeaders)
      );
      res.send(result);
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  "/:id",
  authenticateToken,
  validateBodyManual(SaleHeadersSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      await saleHeaderService.updateById(id, req.body);
      res.send();
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/:id",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      await saleHeaderService.deleteById(id);
      res.send();
    } catch (error) {
      next(error);
    }
  }
);
router.post(
  "/bulk",
  authenticateToken,
  validateBodyManual(SaleHeadersSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await saleHeaderService.createBulk(req, req.body);
      res.send(result);
    } catch (error) {
      next(error);
    }
  }
);
// router.put(
//   "bulk",
//   validateBodyManual(SaleHeadersSchema),
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const result = await saleHeaderService.editBulk(req.body);
//       res.send(result);
//     } catch (error) {
//       next(error);
//     }
//   }
// );

// router.get(
//   "/download/:id",
//   // validateFilter(SaleHeaders),
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const id = Number(req.params.id);
//       const reportData = await saleHeaderService.saleInvoiceData(id);
//       // Path to your EJS template file
//       const renderedPath = path.join(
//         process.cwd(),
//         "/dist/app/templates",
//         "sale-invoice.template.ejs"
//       );
//       console.log("renderedPath", renderedPath);

//       // Render the EJS template to HTML
//       const renderedHtml = await ejs.renderFile(renderedPath, reportData);

//       // Create a PDF stream from the HTML using html-pdf
//       const options = { format: "A4" };
//       pdf.create(renderedHtml, options).toStream((err, pdfStream) => {
//         if (err) {
//           console.error("PDF generation error:", err);
//           return res.status(500).send("Error generating PDF");
//         }

//         // Set HTTP headers for PDF download
//         res.setHeader("Content-Type", "application/pdf");
//         res.setHeader("Content-Disposition", "attachment; filename=report.pdf");

//         // Pipe the PDF stream to the response
//         pdfStream.pipe(res);
//       });
//     } catch (error) {
//       next(error);
//     }
//   }
// );

router.get(
  "/download/generate-invoice/:id",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const invoiceData = await saleHeaderService.saleInvoiceData(id);
      // Path to your EJS template file
      const renderedPath = path.join(
        process.cwd(),
        "/dist/app/templates/templates",
        "sale-invoice.template.ejs"
      );
      // Render the EJS template to HTML
      const renderedHtml = await ejs.renderFile(renderedPath, invoiceData);
      res.send(renderedHtml);
    } catch (error) {
      console.log(error);
      res.status(500).send("Error generating invoice");
    }
  }
);
export default new Route("/sale-headers", router);
