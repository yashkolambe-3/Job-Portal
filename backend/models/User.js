const pool = require("../config/db");

const User = {

    // Find user by email
    async findByEmail(email) {
        const [rows] = await pool.execute(
            `
            SELECT
                u.id,
                u.name,
                u.email,
                u.password,
                u.role_id,
                r.name AS role
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.email = ?
            LIMIT 1
            `,
            [email]
        );

        return rows[0];
    },


    // Find user by ID
    async findById(id) {
        const [rows] = await pool.execute(
            `
            SELECT
                u.id,
                u.name,
                u.email,
                u.role_id,
                r.name AS role
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.id = ?
            LIMIT 1
            `,
            [id]
        );

        return rows[0];
    },


    // Find role ID by role name
    async findRoleId(roleName) {
        const [rows] = await pool.execute(
            `
            SELECT id
            FROM roles
            WHERE name = ?
            LIMIT 1
            `,
            [roleName]
        );

        return rows[0]?.id;
    },


    // Create a new user
    async create({ name, email, password, roleId }) {
        const [result] = await pool.execute(
            `
            INSERT INTO users
                (name, email, password, role_id)
            VALUES
                (?, ?, ?, ?)
            `,
            [name, email, password, roleId]
        );

        return result.insertId;
    }
};

module.exports = User;