import { FindManyOptions, FindOneOptions, Not } from "typeorm";

import { generateCode } from "../../utils/get-object-code.util";
import { handler } from "../../config/dbconfig";
import { City, Country, DUserType, States } from "../general-data/entities";
import repository from "./user.repo";
import { Users } from "./entities/user.entity";
import {
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  hashPassword,
  verifyToken,
} from "../../services";
import { UserSessions } from "./entities/user-sessions.entity";
import { UserMenusAndFeatures } from "../features/entities/usermenufeaturemap.entity";
import { NextFunction, Request, response, Response } from "express";

//1. find multiple records
const find = async (filter?: FindManyOptions<Users>) => {
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
  filter?: FindOneOptions<Users> | FindManyOptions<Users>
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
const create = async (data: Users) => {
  try {
    const dataSource = await handler();
    const userTypeRepo = dataSource.getRepository(DUserType);
    const userType = await userTypeRepo.findOne({
      where: {
        id: data.userType.id,
      },
    });
    if (!userType) {
      throw {
        message: "Record not found with id: " + data.userType.id,
        statusCode: 404,
      };
    }

    const repo = await repository();
    data = await generateCode(18, data);
    //hash your password here
    const hashedPassword = await hashPassword(data.password);
    const respo = repo.create({
      ...data,
      password: hashedPassword,
      userType,
    });
    return respo;
  } catch (error) {
    throw error;
  }
};
//4. create record in bulk
const createBulk = async (data: Users) => {
  try {
    let response = new Users();
    // 1. Get the database connection
    const dataSource = await handler();

    // 2. Get the repository for the Users entity
    const repo = await repository();

    // 3. Check if a user with the same userName already exists
    if (data.id) {
      const respo = await repo.find({
        where: {
          userName: data.userName,
          id: Not(data.id),
        },
      });

      // 4. If user already exists, throw an error with status code 409 (Conflict)
      if (respo.length) {
        throw {
          message: "User with this user name already exists.",
          statusCode: 409,
        };
      }
    } else {
      const respo = await repo.find({
        where: {
          userName: data.userName,
        },
      });

      // 4. If user already exists, throw an error with status code 409 (Conflict)
      if (respo.length) {
        throw {
          message: "User with this user name already exists.",
          statusCode: 409,
        };
      }
    }

    // 5. Get the repository for the UserType entity
    const userTypeRepo = dataSource.getRepository(DUserType);
    const userMenusAndFeaturesRepo =
      dataSource.getRepository(UserMenusAndFeatures);
    // 6. Check if the provided userType ID exists in the database
    const userType = await userTypeRepo.findOne({
      where: {
        id: data.userTypeId,
      },
    });

    // 7. If userType ID is invalid, throw an error with status code 404 (Not Found)
    if (!userType) {
      throw {
        message: "Record not found with id: " + data.userType.id,
        statusCode: 404,
      };
    }

    // 8. Start a database transaction with SERIALIZABLE isolation level
    await dataSource.manager.transaction(
      "SERIALIZABLE",
      async (transactionalEntityManager) => {
        // 9. Generate a unique code for the user
        if (!data.id) {
          data = await generateCode(18, data);
        }
        //   data = await generateCode(18, data);

        // 10. Hash the user's password before storing it

        let hashedPassword = "";
        if (!data.id) {
          hashedPassword = await hashPassword(data.password);
        }

        let { userMenusAndFeatures, ...headerWithoutLines } = data;
        // 11. Create a new user entry with the provided data
        //let headerEntry = new Users();
        if (!data.id) {
          headerWithoutLines = transactionalEntityManager.create(Users, {
            ...headerWithoutLines,
            password: hashedPassword,
            userType,
          });
        } else {
          // 6. Check if the provided userType ID exists in the database
          const currentUser = await repo.findOne({
            where: {
              id: data.id,
            },
          });

          // 7. If userType ID is invalid, throw an error with status code 404 (Not Found)
          if (!currentUser) {
            throw {
              message: "Record not found with id: " + data.id,
              statusCode: 404,
            };
          }
          if (data.password != "") {
            hashedPassword = await hashPassword(data.password);
          }
          headerWithoutLines = {
            ...headerWithoutLines,
            ...(data.password != ""
              ? { password: hashedPassword }
              : { password: currentUser.password }),
          };
        }

        // 12. Create an array to store user's menu and feature permissions
        const userMenusAndFeaturesNew: UserMenusAndFeatures[] = [];
        response = await transactionalEntityManager.save(
          Users,
          headerWithoutLines
        );
        // 13. Iterate over userMenusAndFeatures data and create instances
        userMenusAndFeatures?.forEach((value, index) => {
          let userMenusAndFeaturesInstance = new UserMenusAndFeatures();
          userMenusAndFeaturesInstance = {
            ...value,
            userId: response.id,
          };
          userMenusAndFeaturesNew.push(userMenusAndFeaturesInstance);
        });

        // 14. Assign the userMenusAndFeatures array to the user entry
        // 15. Save the new user entry into the database
        await transactionalEntityManager.save(
          UserMenusAndFeatures,
          userMenusAndFeaturesNew ? userMenusAndFeaturesNew : []
        );
      }
    );

    // 16. Return the created user data
    return data;
  } catch (error) {
    // 17. Throw the error to be handled by the caller
    throw error;
  }
};

//4. update single record by id
const updateById = async (id: number, data: Users) => {
  try {
    const dataSource = await handler();
    const userTypeRepo = dataSource.getRepository(DUserType);
    const userType = await userTypeRepo.findOne({
      where: {
        id: data.userType.id,
      },
    });
    if (!userType) {
      throw {
        message: "Record not found with id: " + data.userType.id,
        statusCode: 404,
      };
    }

    const repo = await repository();
    //   data = await generateCode(14, data);
    const respo = repo.updateById(id, {
      ...data,
      userType,
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

//6. user login
const login = async (data: {
  userName: string;
  password: string;
}): Promise<
  | {
      refreshTokenToken: string;
      accessToken: string;
    }
  | Error
> => {
  //1. find user with UserName
  const dataSource = await handler();
  const userSessionRepo = dataSource.getRepository(UserSessions);
  const repo = await repository();
  const foundUser = await repo.findOne({
    where: {
      userName: data.userName,
      isInactive: 0,
      company: {
        isInactive: 0,
      },
    },
    relations: {
      userType: true,
      company: true,
    },
    select: {
      company: {
        name: true,
        id: true,
        upiId: true,
        stateId: true,
        taxId: true,
        isInactive: true,
      },
    },
  });
  if (foundUser) {
    if (foundUser.isInactive) {
      throw { message: "Your account has been deactivated by the admin. Please contact support for assistance.", statusCode: 401 };
    }
    if (foundUser?.company?.isInactive) {
      throw { message: "Your company has been deactivated by the admin. Please contact support for assistance.", statusCode: 401 };
    }
    //2. check and compare password
    const verfied = await comparePassword(data.password, foundUser?.password);
    if (verfied) {
      //3. create jwt
      //a. create refresh token and store in db
      const accessToken = generateAccessToken({
        userId: foundUser.id,
        companyId: foundUser.companyId,
        companyName: foundUser.company.name,
        upiId: foundUser.company.upiId,
        stateId: foundUser.company.stateId,
        taxId: foundUser.company.taxId,
        userName: foundUser.userName,

        email: foundUser.email,
        userType: foundUser.userType,
      });
      //b. create accestoken
      const refreshTokenToken = generateRefreshToken({
        userId: foundUser.id,
        companyId: foundUser.companyId,
        companyName: foundUser.company.name,
        upiId: foundUser.company.upiId,
        stateId: foundUser.company.stateId,
        taxId: foundUser.company.taxId,
        userName: foundUser.userName,
        email: foundUser.email,
        userType: foundUser.userType,
      });
      const currentDate = new Date().toISOString();
      //4. store refresh token in db
      const userSession = userSessionRepo.create({
        user: foundUser,
        token: refreshTokenToken,
        createdDate: currentDate,
        isInactive: 0,
        modifiedDate: currentDate,
      });
      await userSessionRepo.save(userSession);
      //4. send accessToken and refreshToken in response
      return {
        refreshTokenToken,
        accessToken,
      };
    } else {
      throw { message: "Invalid password !", statusCode: 401 };
    }
  } else {
    throw { message: "User not found", statusCode: 404 };
  }
};

//6. user login
const logout = async (data: { token: string }) => {
  try {
    const dataSource = await handler();
    const userSessionRepo = dataSource.getRepository(UserSessions);
    //1. check if active refresh token is present decoded user
    const userData: {
      userId: number;
      userName: string;
      email: string;
      userType: {
        id: number;
        name: string;
      };
    } = verifyToken(data.token);
    if (userData) {
      const foundSession = await userSessionRepo.findOne({
        where: {
          token: data.token,
          isInactive: 0,
          user: {
            id: userData?.userId,
          },
        },
      });
      if (foundSession) {
        //make session inactive
        await userSessionRepo.save({
          ...foundSession,
          isInactive: 1,
        });
        return { status: 200, message: "user logged out succesfully..." };
      } else {
        throw {
          message: "Active Session not found for this user",
          statusCode: 404,
        };
      }
    }
  } catch (err) {
    throw err;
  }
};

//6. user login
const generateNewAccessToken = async (data: { token: string }) => {
  try {
    const dataSource = await handler();
    const userSessionRepo = dataSource.getRepository(UserSessions);
    //1. check if active refresh token is present decoded user
    const userData: {
      userId: number;
      companyId: number;
      companyName: string;
      upiId: string;
      stateId: number;
      taxId: number;
      userName: string;
      email: string;
      userType: {
        id: number;
        name: string;
      };
    } = verifyToken(data.token);
    if (userData) {
      const foundSession = await userSessionRepo.findOne({
        where: {
          token: data.token,
          isInactive: 0,
          user: {
            id: userData?.userId,
          },
        },
      });
      if (foundSession) {
        const accessToken = generateAccessToken({
          userId: userData.userId,
          companyId: userData.companyId,
          upiId: userData.upiId,
          stateId: userData.stateId,
          taxId: userData.taxId,
          companyName: userData.companyName,
          userName: userData.userName,
          email: userData.email,
          userType: userData.userType,
        });
        return { accessToken };
      } else {
        throw {
          message: "Active Session not found for this user",
          statusCode: 404,
        };
      }
    }
  } catch (err) {
    throw err;
  }
};
//6. user login
const decodedToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // const result = await userService.find(await getQuery(req, Users));
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Access Token Required" });
    }
    // res.send(result);
    const userData: {
      userId: number;
      userName: string;
      email: string;
      userType: {
        id: number;
        name: string;
      };
    } = await verifyToken(token,true);
    return userData;
  } catch (err) {
    throw err;
  }
};
export default {
  find,
  findById,
  create,
  deleteById,
  updateById,
  login,
  generateNewAccessToken,
  logout,
  createBulk,
  decodedToken,
};
