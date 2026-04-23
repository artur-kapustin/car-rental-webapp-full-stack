import bcrypt from "bcrypt";

const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;

export async function hashPassword(password) {
    return await bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
}