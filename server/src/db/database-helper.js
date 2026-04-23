import {col, DataTypes, fn, Op, Sequelize, where} from "sequelize";
import {hashPassword} from "../utils/hashing.js";

// Check https://sequelize.org/ for the Getting Started
const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: `db/database.${process.env.NODE_ENV || "dev"}.sqlite`
});

const Car = sequelize.define("Car", {
    mark: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    model: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    imageUrl: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    pricePerDay: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 40
    },
    maxReservedAtATime: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 3
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: "Description is yet to be added."
    }
}, {
    tableName: "car"
});

const User = sequelize.define("User", {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "user"
    },
    isAccountDisabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    tableName: "user"
});

const Reservation = sequelize.define("Reservation", {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {model: User, key: "id"}
    },
    carId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {model: Car, key: "id"}
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    total: {
        type:DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: "reservation"
});

const RefreshToken = sequelize.define("RefreshToken", {
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {model: User, key: "id"}
    },
    token: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
    }
}, {
    tableName: "refresh_token"
});

Reservation.belongsTo(Car, {foreignKey: "carId"});
Reservation.belongsTo(User, {foreignKey: "userId"})
Car.hasMany(Reservation, {foreignKey: "carId"});
User.hasMany(Reservation, {foreignKey: "userId"});
RefreshToken.belongsTo(User, {foreignKey: "userId"});
User.hasOne(RefreshToken, {foreignKey: "userId"});

/* Refresh token functions */

export async function deleteRefreshToken(token) {
    return await RefreshToken.destroy({
        where: {
            token: token
        }
    })
}

export async function deleteRefreshTokenById(id) {
    return await RefreshToken.destroy({
        where: {
            id: id
        }
    })
}

export async function postRefreshToken(id, userId, token, expiresAt) {
    await RefreshToken.create({id, userId, token, expiresAt})
}

export async function getRefreshToken(token) {
    return await RefreshToken.findOne({
        where: {
            token: token,
            expiresAt: { [Op.gt]: new Date() }
        }
    })
}

export async function getRefreshTokenById(id) {
    return await RefreshToken.findByPk(id);
}

async function cleanupExpiredRefreshTokens() {
    try {
        const deleted = await RefreshToken.destroy({
            where: {
                expiresAt: { [Op.lt]: new Date() }
            }
        });
        console.log(`Deleted ${deleted} expired tokens`);
    } catch (err) {
        console.error("Error cleaning up expired tokens:", err);
    }
}

/* === Car functions === */

export async function getCars(marks, startDate, endDate, minPrice, maxPrice) {
    const whereClause = {
        pricePerDay: { [Op.between]: [minPrice, maxPrice] },
    };

    if (marks.length > 0) {
        whereClause.mark = { [Op.in]: marks };
    }

    return await Car.findAll({
        where: whereClause,
        include: [
            {
                model: Reservation,
                attributes: [],
                required: false
            }
        ],
        attributes: {
            include: [
                [sequelize.fn("COUNT", sequelize.col("Reservations.id")), "numReservedTotal"],
                [
                    sequelize.literal(`(
                    SELECT COUNT(*)
                    FROM reservation as r
                    WHERE
                        r."carId" = "Car"."id"
                        AND
                        (
                        r."startDate" < :endDate
                        AND
                        r."endDate" > :startDate
                        )
                )`),
                    "numReservedAtChosenDates",
                ]
            ]
        },
        group: ["Car.id"],
        having: {
            numReservedTotal: {
                [Op.lt]: sequelize.col("maxReservedAtATime")
            },
            numReservedAtChosenDates: 0
        },
        replacements: {
            startDate: formatDateForSQL(startDate),
            endDate: formatDateForSQL(endDate)
        }
    });
}

function formatDateForSQL(date) {
    const iso = date.toISOString(); // "2025-12-08T23:00:00.000Z"
    return iso.replace("T", " ").replace("Z", " +00:00");
}

export async function getCarById(id) {
    return await Car.findByPk(id);
}

export async function postCar(mark, model, imageUrl, pricePerDay, maxReservedAtATime, description) {
    return await Car.create({mark, model, imageUrl, pricePerDay, maxReservedAtATime, description});
}

export async function putCar(id, mark, model, imageUrl, pricePerDay, maxReservedAtATime, description) {
    return await Car.update(
        { mark, model, imageUrl, pricePerDay, maxReservedAtATime, description },
        {
            where: {
                id: id
            }
        })
}

export async function deleteCar(id) {
    await Reservation.destroy({
        where: {
            carId: id
        }
    })

    return await Car.destroy({
        where: {
            id: id
        }
    })
}

/* == car validation == */

export async function getCarMarks() {
    return (await Car.findAll()).map((car) => car.mark);
}

/* === User functions === */

export async function getUsers() {
    return await User.findAll({
        attributes: {
            exclude: ["password"]
        }
    });
}

export async function searchUsers(string) {
    return await User.findAll({
        attributes: {
            exclude: ["password"]
        },
        where: {
            [Op.or]: [
                { name: { [Op.like]: `%${string}%` } },
                { email: { [Op.like]: `%${string}%` } }
            ]
        }
    });
}

export async function getUserById(id) {
    return await User.findByPk(id);
}

export async function getUserByEmail(email) {
    return await User.findOne({
        where: {
            email: email
        }
    });
}

export async function postUser(name, email, password) {
    return await User.create({name, email, password});
}

// only used for tests
export async function postAdmin(name, email, password) {
    return await User.create({name, email, password, role: 'admin'});
}

export async function putUser(id, name, email) {
    return await User.update(
        { name, email },
        {
            where: {
                id: id
            }
        }
    );
}

export async function deleteUser(id) {
    await Reservation.destroy({
        where: {
            userId: id
        }
    });

    await RefreshToken.destroy({
        where: {
            userId: id
        }
    });

    return await User.destroy({
        where: {
            id: id
        }
    });
}

export async function putUserStatus(id, isAccountDisabled) {
    return await User.update(
        { isAccountDisabled },
        {
            where: {
                id: id
            }
        }
    );
}

export async function putUserPassword(id, password) {
    return await User.update(
        { password },
        {
            where: {
                id: id
            }
        }
    );
}

/* === Reservation functions === */

export async function getReservationsOfCar(id) {
    return await Reservation.findAll({
        where: {
            carId: id
        }
    })
}

export async function searchReservationsOfCar(id, string) {
    return await Reservation.findAll({
        where: {
            carId: id
        },
        include: [
            {
                model: User,
                attributes: [],
                where: {
                    [Op.or]: [
                        { name: { [Op.like]: `%${string}%` } },
                        { email: { [Op.like]: `%${string}%` } }
                    ]
                }
            }
        ]
    });

}

export async function getReservationsOfUser(id) {
    return await Reservation.findAll({
        where: {
            userId: id
        }
    })
}

export async function searchReservationsOfUser(id, string) {
    return await Reservation.findAll({
        where: {
            userId: id
        },
        include: [
            {
                model: Car,
                attributes: [],
                where: where(
                    fn(
                        'concat',
                        col('Car.mark'),
                        ' ',
                        col('Car.model')
                    ),
                    {
                        [Op.like]: `%${string}%`
                    }
                )
            }
        ]
    })
}

export async function postReservation(userId, carId, startDate, endDate, total) {
    return await Reservation.create({userId, carId, startDate, endDate, total});
}

export async function deleteReservation(userId, reservationId) {
    return await Reservation.destroy({
        where: {
            id: reservationId,
            userId: userId
        }
    })
}

export async function overlappingReservations(carId, startDate, endDate) {
    return await Reservation.findOne({
        where: {
            carId: carId,
            [Op.and]: [
                { startDate: { [Op.lt]: endDate } },
                { endDate: { [Op.gt]: startDate } }
            ]
        }
    });
}

export async function countCarReservations(carId) {
    return await Reservation.count({
        where: {
            carId
        }
    });
}

export async function resetDb() {
    await sequelize.sync({ force: true });
}

try {
    await sequelize.authenticate();
    // eslint-disable-next-line no-console
    console.log("Connection has been established successfully.");
} catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
}

if (process.env.NODE_ENV === "test") {
    // Ensure tables exist for testing
    await sequelize.sync({ force: true });
} else {
    // Run every 10min in production/dev
    setInterval(cleanupExpiredRefreshTokens, 10 * 60 * 1000);
    await sequelize.sync();
}

// dev seed (2 users, 5 cars) (if you want to run then delete db first)
// await postAdmin("admin", "admin@admin.com", await hashPassword("password"));
// await postUser("user", "user@user.com", await hashPassword("password"));
// await postCar(
//     "Toyota",
//     "Corolla",
//     "https://upload.wikimedia.org/wikipedia/commons/f/fe/Toyota_Corolla_Hybrid_%28E210%29_IMG_4338.jpg",
//     50,
//     25,
//     "A compact sedan well known for its reliability, excellent fuel economy, and low ownership costs. It’s easy to drive, comfortable for daily commuting, and built to last for many years."
// );
// await postCar(
//     "BMW",
//     "3 Series",
//     "https://upload.wikimedia.org/wikipedia/commons/9/91/BMW_G20_%282022%29_IMG_7316_%282%29.jpg",
//     100,
//     20,
//     "A compact sedan well known for its reliability, excellent fuel economy, and low ownership costs. It’s easy to drive, comfortable for daily commuting, and built to last for many years."
// );
// await postCar(
//     "Ford",
//     "Mustang GT",
//     "https://upload.wikimedia.org/wikipedia/commons/1/1f/2019_Ford_Mustang_GT_5.0_facelift.jpg",
//     150,
//     15,
//     "A classic V8-powered Mustang that delivers strong performance, an aggressive exhaust note, and timeless muscle-car styling. It balances everyday usability with thrilling acceleration and is one of the most popular and recognizable Mustang models."
// );
// await postCar(
//     "Honda",
//     "CR-V",
//     "https://upload.wikimedia.org/wikipedia/commons/1/1b/Honda_CR-V_e-HEV_Elegance_AWD_%28VI%29_%E2%80%93_f_14072024.jpg",
//     200,
//     10,
//     "A highly practical and well-rounded compact SUV that’s popular with families and commuters alike. The CR-V offers a spacious and flexible interior with plenty of legroom and cargo space, making it easy to handle road trips, errands, or outdoor gear. It’s known for its smooth and comfortable ride, strong reliability record, and excellent safety features, including advanced driver-assistance systems. With good fuel efficiency and low long-term ownership costs, it’s a dependable choice for everyday driving."
// );
// await postCar(
//     "Ferrari",
//     "SF90 Stradale",
//     "https://upload.wikimedia.org/wikipedia/commons/1/13/Red_2019_Ferrari_SF90_Stradale_%2848264238897%29_%28cropped%29.jpg",
//     250,
//     5,
//     "A plug-in hybrid supercar that produces nearly 1,000 horsepower, making it one of Ferrari’s most powerful road cars ever. It blends advanced technology, all-wheel drive, and futuristic styling with mind-blowing performance."
// );