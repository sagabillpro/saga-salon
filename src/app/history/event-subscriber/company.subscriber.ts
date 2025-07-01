import {
  EntitySubscriberInterface,
  EventSubscriber,
  UpdateEvent,
} from "typeorm";
import { Company } from "../../modules/company/entities/company.entity";
import { CompanyHistory } from "../history-entities";

@EventSubscriber()
export class CompanySubscriber implements EntitySubscriberInterface<Company> {
  /**
   * Specifies that this subscriber only listens to Company events.
   */
  listenTo() {
    return Company;
  }

  /**
   * Before a Company entity is updated, capture its current state and insert it into the CompanyHistory table.
   *
   * @param event - The update event triggered by TypeORM.
   */
  async beforeUpdate(event: UpdateEvent<Company>): Promise<void> {
    //add modified by code by fetingg user details from req.user
    // const user = req.user;
    // history.createdBy = user.id; // add modified by id here
    console.log(event.databaseEntity.modifiedById);
    // Ensure we have the entity data. If it is not loaded, skip history recording.
    if (event.entity) {
      const history = new CompanyHistory();
      history.recordId = event.entity.id;
      history.name = event.entity.name;
      history.code = event.entity.code;
      history.addressLine1 = event.entity.addressLine1;
      history.addressLine2 = event.entity.addressLine2;
      history.cityId = event.entity.cityId;
      history.countryId = event.entity.countryId;
      history.createdById = event.entity.createdById;
      history.email = event.entity.email;
      history.industryType = event.entity.industryType;
      history.modifiedById = event.databaseEntity.modifiedById;
      history.phoneNumber = event.entity.phoneNumber;
      history.postalCode = event.entity.postalCode;
      history.registrationNumber = event.entity.registrationNumber;
      history.stateId = event.entity.stateId;
      history.taxId = event.entity.taxId;
      history.website = event.entity.website;
      history.createdById = event.entity.createdById;
      history.version = event.entity.version;
      history.annualRevenue = event.entity.annualRevenue;
      history.numberOfEmployees = event.entity.numberOfEmployees;

      // Copy any additional fields from the Company entity as needed.

      // Use event.manager to insert the history record within the same transaction.
      // This ensures that the history record will only be created if the update succeeds.
      await event.manager.insert(CompanyHistory, history);
    }
  }
}

//akshay
