import { Routes } from "./routes.types";
import itemRoute from "../modules/items/items.routes";
import generalRoute from "../modules/general-data/general-data.route";
import customerRoute from "../modules/customer/customer.routes";
import featureSettingRoutes from "../modules/fetaure-settings/feature-setting.routes";
import userRoutes from "../modules/auth/user.routes";
import servicesRoutes from "../modules/services/services.routes";
import saleHeaderRoutes from "../modules/sale-items/sale-header.routes";
import serviceSessionRoutes from "../modules/service-session/service-session.routes";
import taxesRoutes from "../modules/taxes/taxes.routes";
import purchaseRoutes from "../modules/purchase-items/purchase.routes";
import supplierRoutes from "../modules/suppliers/supplier.routes";
import contactRoutes from "../modules/contacts/contact.routes";
import dashboardRoute from "../modules/reportroutes/dashboard.route";
import stockReportRoute from "../modules/reportroutes/stock-report.route";
import profitlossRoute from "../modules/reportroutes/profitloss.route";
import saleReportRoute from "../modules/reportroutes/sale-report.route";
import itemSaleRevenue from "../modules/reportroutes/item-sale-revenue.route";
import serviceRevenueRoute from "../modules/reportroutes/service-revenue.route";
import branchesRoutes from "../modules/branches/branches.routes";
import companyRoutes from "../modules/company/company.routes";
import featuresRoutes from "../modules/features/features.routes";
import roleRoutes from "../modules/roles/role.routes";
import usermenufeaturemapRoute from "../modules/features/usermenufeaturemap.route";
import historyRoute from "../history/history.route";
import stockAdjustmentHeadersRoutes from "../modules/stock-adjustment/stock-adjustment-headers.routes";
import companyCouponsRoutes from "../modules/send-coupouns/company-coupons.routes";
import uomService from "../modules/uom/uom.service";
import uomRoutes from "../modules/uom/uom.routes";
import taxReportRoute from "../modules/reportroutes/tax-report.route";
import itemRemainRoute from "../modules/reportroutes/item-remain.route";

export const routes: Routes = [
  itemRoute,
  generalRoute,
  customerRoute,
  featureSettingRoutes,
  userRoutes,
  servicesRoutes,
  saleHeaderRoutes,
  serviceSessionRoutes,
  taxesRoutes,
  purchaseRoutes,
  supplierRoutes,
  contactRoutes,
  dashboardRoute,
  stockReportRoute,
  profitlossRoute,
  saleReportRoute,
  itemSaleRevenue,
  serviceRevenueRoute,
  branchesRoutes,
  companyRoutes,
  featuresRoutes,
  roleRoutes,
  usermenufeaturemapRoute,
  historyRoute,
  stockAdjustmentHeadersRoutes,
  companyCouponsRoutes,
  uomRoutes,
  taxReportRoute,
  itemRemainRoute
];
