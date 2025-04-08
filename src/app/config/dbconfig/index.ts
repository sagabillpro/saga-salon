import "reflect-metadata";
import { DataSource } from "typeorm";

import dotenv from "dotenv";
import path from "path";
import { entities } from "../../mappings/entities.mapping";
import { CompanySubscriber } from "../../history/event-subscriber/company.subscriber";
import { ContactSubscriber } from "../../history/event-subscriber/contact.subscriber";
import { ServicesSubscriber } from "../../history/event-subscriber/services.subscriber";
import { UsersSubscriber } from "../../history/event-subscriber/user.subscriber";

// Load environment variables from .env file
dotenv.config();
let appDataSource: DataSource;

const initializeDataSource = async (): Promise<DataSource> => {
  if (!appDataSource) {
    appDataSource = new DataSource({
      type: "postgres",
      host: process.env.Host,
      port: Number(process.env.port),
      username: process.env.User_Name,
      password: process.env.Password,
      database: process.env.Database,
      entities: entities,
      subscribers: [
        CompanySubscriber,
        ContactSubscriber,
        ServicesSubscriber,
        UsersSubscriber,
      ],
      //   entities: [
      //     "../../../src/entities/index/**/*.{ts,js}",
      //     "../../../build/entities/**/*.{ts,js}",
      //   ],
   //  synchronize: true,
      /// logging: true,
      ssl: {
        rejectUnauthorized: false, // Disables SSL certificate verification
      },
    });
    await appDataSource.initialize();
  }
  return appDataSource;
};
export const handler = async (): Promise<DataSource> => {
  const dataSource = await initializeDataSource();
  return dataSource;
};
