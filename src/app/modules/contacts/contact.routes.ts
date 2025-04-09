import { NextFunction, Request, Response, Router } from "express";
import { Route } from "../../routes/routes.types";
import { validateFilter } from "../../utils/validate-filter.util";
import getQuery from "../../utils/get-query.util";
import { Contact } from "./entities/contact.entity";
import ContactService from "./contact.service";
import { validateRequestBody } from "../../utils/get-model-schema.util";
import getQuerySecure from "../../utils/get-query-secure.util";
import authenticateToken from "../../middlewares/authenticate.middleware";
import { AuthenticatedRequest } from "../../types";
import customerService from "../customer/customer.service";
const router = Router();

router.get(
  "/",
  authenticateToken,
  validateFilter(Contact),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await ContactService.find(await getQuerySecure(req, Contact));
      res.send(result);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/",
  authenticateToken,
  validateRequestBody(Contact),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await ContactService.create(req.body);
      res.send(result);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/:id",
  authenticateToken,
  validateFilter(Contact),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const result = await ContactService.findById(
        id,
        await getQuery(req, Contact)
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
  validateRequestBody(Contact),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      await ContactService.updateById(id, req.body);
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
      await ContactService.deleteById(id);
      res.send();
    } catch (error) {
      next(error);
    }
  }
);
router.get(
  "/customer-birthdays/get",
  validateFilter(Contact),
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user: any = req?.user;
      const result = await customerService.getCustomersWithBirthdays(
        user.companyId
      );
      res.send(result);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/customer-anniversery/get",
  validateFilter(Contact),
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user: any = req?.user;
      const result = await customerService.getCustomersWithAnniversery(
        user.companyId
      );
      res.send(result);
    } catch (error) {
      next(error);
    }
  }
);
export default new Route("/contacts", router);
