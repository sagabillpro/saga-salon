import { FindManyOptions, FindOneOptions, In } from "typeorm";

import { handler } from "../../../app/config/dbconfig";
import { UOM } from "./entities/uom.entity";

const repository = async () => {
  const dataSource = await handler();
  const repo = dataSource.getRepository(UOM);
  //1. find all records
  const find = async (option?: FindManyOptions<UOM>) => {
    try {
      option={
        ...option,
        where: {
          ...option?.where,
          id:In([1,3]), // Example of using In operator to filter by multiple IDs
        },
      }
      return await repo.find(option);
    } catch (error) {
      throw error;
    }
  };

  //2. find single record with options
  const findOne = async (option?: FindOneOptions<UOM>) => {
    try {
      return await repo.find(option);
    } catch (error) {
      throw error;
    }
  };

  //3. find single records by id
  const findOneById = async (id: number, filter?: FindOneOptions<UOM>) => {
    try {
      const item = await repo.findOne({
        select: {
          ...filter?.select,
        },
        where: {
          id: Number(id),
          ...filter?.where,
        },
        relations: {
          ...filter?.relations,
        },
      });
      if (!item) {
        throw { message: "Record not found with id: " + id, statusCode: 404 };
      }
      return item;
    } catch (error) {
      throw error;
    }
  };

  //4. create single record
  const create = async (data: UOM) => {
    try {
      const respo = repo.create(data);
      await repo.save(respo);
      return respo;
    } catch (error) {
      throw error;
    }
  };

  //4. update single records
  const updateById = async (id: number, data: UOM) => {
    try {
      // Find the existing record by ID and ensure it is not inactive
      const respo = await repo.findOneBy({
        id: id,
      });

      // If the record is not found, throw a 404 error
      if (!respo) {
        throw { message: "Record not found with id: " + id, statusCode: 404 };
      }

      // Mark the existing record as inactive
      await repo.save({
        ...respo,
        ...data,
      });
    } catch (error) {
      // If an error occurs, throw it to be handled by the caller
      throw error;
    }
  };

  //5. delete single record
  const deleteById = async (id: number): Promise<void> => {
    try {
      // Find the existing record by ID and ensure it is not inactive
      const respo = await repo.findOneBy({
        id: id,
      });

      // If the record is not found, throw a 404 error
      if (!respo) {
        throw { message: "Record not found with id: " + id, statusCode: 404 };
      } else {
        // Soft remove the record (mark it as deleted without physically removing it from the database)
        await repo.softRemove(respo);
      }
    } catch (error) {
      // If an error occurs, throw it to be handled by the caller
      throw error;
    }
  };

  //6. create multiple records
  const createAll = async (data: UOM[]) => {
    try {
      const respo = repo.create(data);
      await repo.save(respo);
      return respo;
    } catch (error) {
      throw error;
    }
  };

  return {
    find,
    findOne,
    findOneById,
    create,
    updateById,
    deleteById,
    createAll,
  };
};
// Exporting an async function that resolves to an object containing find and findOne
export default repository;
